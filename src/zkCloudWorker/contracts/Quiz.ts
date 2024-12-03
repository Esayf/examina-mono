
import {
    AccountUpdate, assert, Bool, Experimental, Field, method, PrivateKey, PublicKey, SmartContract, state, State, Struct, UInt32, UInt64
} from 'o1js';
import { WinnersProof, WinnersProver } from './WinnersProver';
export class WinnerState extends Struct({
    amount: UInt64,
    isPaid: Bool,
    finishDate: UInt64
}) { }

export class QuizState extends Struct({
    duration: UInt64,
    startDate: UInt64,
    secretKey: Field,
    totalRewardPoolAmount: UInt64,
    rewardPerWinner: UInt64
}) { }
export class Quiz extends SmartContract {
    @state(QuizState) quizState = State<QuizState>();
    @state(Field) winnersRoot = State<Field>(Field(0));
    init() {
        super.init();
    }

    getAdmin() {
        return PrivateKey.fromBase58(process.env.ADMIN_PRIVATE_KEY!).toPublicKey()
    }


    @method async initQuizState(
        secretKey: Field,
        duration: UInt64,
        startDate: UInt64,
        totalRewardPoolAmount: UInt64, // This is the total reward pool
        rewardPerWinner: UInt64 // This is the reward per winner
    ) {
        this.account.nonce.requireEquals(UInt32.from(1))
        this.quizState.set({
            duration,
            startDate,
            secretKey,
            totalRewardPoolAmount,
            rewardPerWinner
        });
        await this.deposit(this.sender.getAndRequireSignature(), totalRewardPoolAmount);
    }

    @method async setWinnersRoot(root: Field) {
        this.sender.getAndRequireSignature().assertEquals(this.getAdmin())
        this.winnersRoot.set(root);
    }

    private async deposit(user: PublicKey, amount: UInt64) {
        // add your deposit logic circuit here
        // that will adjust the amount

        const payerUpdate = AccountUpdate.createSigned(user);
        payerUpdate.send({ to: this.address, amount: amount });
    }

    async checkIsOver() {
        const quizState = this.quizState.getAndRequireEquals()
        const durations = quizState.duration
        const startDate = quizState.startDate
        const endDate = startDate.add(durations)

        const timestamps = this.network.timestamp.getAndRequireEquals()

        timestamps.assertGreaterThanOrEqual(endDate)
    }

    async checkIsContinue() {
        const quizState = this.quizState.getAndRequireEquals()
        const durations = quizState.duration
        const startDate = quizState.startDate
        const endDate = startDate.add(durations)

        this.network.timestamp.requireBetween(startDate, endDate)
    }

    @method async payoutByOne(
        winnersProof: WinnersProof
    ) {
        winnersProof.verify()
        this.sender.getAndRequireSignature().assertEquals(this.getAdmin())
        winnersProof.publicInput.previousRoot.assertEquals(this.winnersRoot.getAndRequireEquals());
        this.winnersRoot.set(winnersProof.publicOutput.newRoot);
        this.send({ to: winnersProof.publicOutput.winner.publicKey, amount: winnersProof.publicOutput.winner.reward });
    }

    @method async payoutByTwo(
        winnersProof1: WinnersProof,
        winnersProof2: WinnersProof
    ) {
        //await this.checkIsOver();
        winnersProof1.verify()
        winnersProof2.verify()
        winnersProof1.publicInput.previousRoot.assertEquals(this.winnersRoot.getAndRequireEquals());
        winnersProof2.publicInput.previousRoot.assertEquals(winnersProof1.publicOutput.newRoot);
        assert(winnersProof1.publicOutput.winner.publicKey.equals(winnersProof2.publicInput.winner.publicKey).not(), "winner2 and winner3 must be different");
        this.sender.getAndRequireSignature().assertEquals(this.getAdmin())
        // finally, we send the payouts
        this.send({ to: winnersProof1.publicOutput.winner.publicKey, amount: winnersProof1.publicOutput.winner.reward });
        this.send({ to: winnersProof2.publicOutput.winner.publicKey, amount: winnersProof2.publicOutput.winner.reward });
        this.winnersRoot.set(winnersProof2.publicOutput.newRoot);
    }

    @method.returns(QuizState)
    async getQuizState() {
        return this.quizState.getAndRequireEquals();
    }

    @method.returns(UInt64)
    async getDuration() {
        return this.quizState.getAndRequireEquals().duration
    }
}