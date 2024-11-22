import { blockchain, fetchMinaAccount, initBlockchain, serializeTransaction, zkCloudWorkerClient } from "zkcloudworker";
import { AccountUpdate, Mina, PrivateKey, PublicKey, Field, UInt64 } from "o1js";
import { Quiz } from "./contracts/Quiz";
import { QUIZ_VERIFICATION_KEY, QUIZ_VERIFICATION_KEY_HASH } from "./contracts/verificationKeys";

interface BuildQuizArgs {
  secretKey: string;
  startDate: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
  duration: string;
}
export async function buildDeployQuiz(sender: string, args: BuildQuizArgs): Promise<[string, string, number]> {
  const mina = await initBlockchain("devnet" as blockchain);
  Mina.setActiveInstance(Mina.activeInstance);
  await fetchMinaAccount({ publicKey: sender });
  const nonce = Number(Mina.getAccount(PublicKey.fromBase58(sender)).nonce.toBigint());
  const privateKeyRandom = PrivateKey.random();
  console.log("privateKeyRandom", privateKeyRandom.toBase58());
  console.log("contractAddress", privateKeyRandom.toPublicKey().toBase58());
  const zkApp = new Quiz(PublicKey.fromBase58(privateKeyRandom.toPublicKey().toBase58()));
  const tx = await Mina.transaction(
    { sender: PublicKey.fromBase58(sender), fee: 1e8, memo: "deploy quizbu", nonce: nonce },
    async () => {
      AccountUpdate.fundNewAccount(PublicKey.fromBase58(sender));
      await zkApp.deploy({ verificationKey: { data: QUIZ_VERIFICATION_KEY as string, hash: QUIZ_VERIFICATION_KEY_HASH as string } });
      await zkApp.initQuizState(Field(args.secretKey), UInt64.from(args.duration), UInt64.from(args.startDate), UInt64.from(args.totalRewardPoolAmount), UInt64.from(args.rewardPerWinner));
    }
  );
  // Serialized transaction and contract address that will be deployed use it on DeployQuizArgs
  return [serializeTransaction(tx), privateKeyRandom.toBase58(), nonce];
}
interface DeployQuizArgs {
  contractAddress: string;
  serializedTransaction: string;
  signedData: string;
  secretKey: string;
  startDate: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
  duration: string;
}
export async function deployQuiz(JWT: string, transaction: string, args: DeployQuizArgs) {
  await initBlockchain("devnet" as blockchain);
  Mina.setActiveInstance(Mina.activeInstance);

  const client = new zkCloudWorkerClient({
    jwt: JWT,
    chain: "devnet" as blockchain,
  });
  const txJSON = JSON.parse(transaction);
  let signedData = JSON.stringify({ zkappCommand: txJSON });
  console.log("signedAuroData", signedData);
  const proveAndSendDeployQuizResponse = await client.execute({
    developer: "BlocksOnChain",
    repo: "QuizWorker",
    transactions: [],
    task: "proveAndSendDeployQuizTx",
    args: JSON.stringify(args),
    metadata: "prove and send deploy quiz tx test",
  });
  const deployQuizTxResult = await client.waitForJobResult({
    jobId: proveAndSendDeployQuizResponse.jobId!,
    printLogs: true,
  });
  return deployQuizTxResult;
}

