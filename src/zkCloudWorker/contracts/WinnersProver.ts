import {
    Field,
    Struct,
    ZkProgram,
    Provable,
    PublicKey,
    Poseidon,
    MerkleMapWitness,
    SelfProof,
    Experimental,
    assert,
    UInt64
} from 'o1js';
import { ScoreCalculationLoop } from './ScoreCalculationLoop';
/**
 * The height of the metadata Merkle tree.
 */
const WINNER_HEIGHT = 15;
const IndexedMerkleMap = Experimental.IndexedMerkleMap;
type IndexedMerkleMap = Experimental.IndexedMerkleMap;

/**
 * A specialized IndexedMerkleMap for storing metadata.
 */
export class WinnerMap extends IndexedMerkleMap(WINNER_HEIGHT) {}
// Define the proof type from ScoreCalculationLoop
export class ScoreProof extends ZkProgram.Proof(ScoreCalculationLoop) { }

// Structure to hold winner data
export class Winner extends Struct({
    publicKey: PublicKey,
    reward: UInt64,
}) {
    hash(): Field {
        return Poseidon.hash(this.publicKey.toFields().concat([this.reward.value]));
    }
}

// Input for the winners proof
export class WinnerInput extends Struct({
    contractAddress: PublicKey,
    previousWinner: Winner,
    winner: Winner,
    totalPaidReward: UInt64,
    previousRoot: Field
}) { }

// Output after processing winners
export class WinnerOutput extends Struct({
    contractAddress: PublicKey,
    winner: Winner,
    totalPaidReward: UInt64,
    newRoot: Field
}) { }

export { WinnersProver };


const WinnersProver = ZkProgram({
    name: "winners-prover",
    publicInput: WinnerInput,
    publicOutput: WinnerOutput,
    methods: {
        init: {
            privateInputs: [PublicKey],
            auxiliaryOutput: WinnerMap,
            async method(emptyInput: WinnerInput, contractAddress: PublicKey): Promise<{
                publicOutput: WinnerOutput;
                auxiliaryOutput: WinnerMap;
            }> {
                const initialMap = new WinnerMap();
                return {
                    publicOutput: new WinnerOutput({
                        contractAddress: contractAddress,
                        winner: new Winner({
                            publicKey: PublicKey.empty(),
                            reward: UInt64.from(0),
                        }),
                        totalPaidReward: UInt64.from(0),
                        newRoot: initialMap.root
                    }),
                    auxiliaryOutput: initialMap
                }
            }
        },
        addWinner: {
            privateInputs: [WinnerMap, SelfProof],
            auxiliaryOutput: WinnerMap,
            async method(
                input: WinnerInput,
                previousMap: WinnerMap,
                previousProof: SelfProof<WinnerInput, WinnerOutput>
            ): Promise<{
                publicOutput: WinnerOutput;
                auxiliaryOutput: WinnerMap;
            }> {
                previousProof.verify();
                input.totalPaidReward.assertEquals(previousProof.publicOutput.totalPaidReward);
                previousProof.publicOutput.newRoot.assertEquals(input.previousRoot, "new root must be the same");
                assert(
                    previousProof.publicOutput.winner.publicKey.equals(input.winner.publicKey).not(),
                    "previous winner must be different"
                );
                previousMap.insert(input.winner.hash(), Field(1));
                return {
                    publicOutput: new WinnerOutput({
                        contractAddress: previousProof.publicOutput.contractAddress,
                        winner: input.winner,
                        totalPaidReward: input.totalPaidReward.add(input.winner.reward),
                        newRoot: previousMap.root
                    }),
                    auxiliaryOutput: previousMap
                };
            }
        },
        mergeProofs: {
            privateInputs: [WinnerMap, SelfProof, SelfProof],
            auxiliaryOutput: WinnerMap,
            async method(firstProofInput: WinnerInput, lastMap: WinnerMap, proof1: SelfProof<WinnerInput, WinnerOutput>, proof2: SelfProof<WinnerInput, WinnerOutput>) {
                proof1.verify();
                proof2.verify();
                firstProofInput.previousRoot.assertEquals(proof1.publicInput.previousRoot);
                proof1.publicOutput.newRoot.assertEquals(proof2.publicInput.previousRoot);
                lastMap.root.assertEquals(proof2.publicOutput.newRoot);
                return {
                    publicOutput: new WinnerOutput({
                        contractAddress: proof1.publicOutput.contractAddress,
                        winner: proof2.publicOutput.winner,
                        totalPaidReward: proof2.publicOutput.totalPaidReward,
                        newRoot: proof2.publicOutput.newRoot
                    }),
                    auxiliaryOutput: lastMap
                }
            }
        }
    }
});

export class WinnersProof extends ZkProgram.Proof(WinnersProver) { }
