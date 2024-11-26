"use server";
import { blockchain, fetchMinaAccount, initBlockchain, serializeTransaction, zkCloudWorkerClient } from "zkcloudworker";
import { AccountUpdate, Mina, PrivateKey, PublicKey, Field, UInt64 } from "o1js";
import { Quiz } from "./contracts/Quiz";
import { QUIZ_VERIFICATION_KEY, QUIZ_VERIFICATION_KEY_HASH } from "./contracts/verificationKeys";
import { zkcloudworker } from "./cloudWorker";
import { SendTransactionArgs } from "../../types/global";

interface BuildQuizArgs {
  secretKey: string;
  startDate: string;
  totalRewardPoolAmount: string;
  rewardPerWinner: string;
  duration: string;
}
interface SignPayload {
  zkappCommand: string;
  onlySign: boolean;
  feePayer: {
    feePayer: string;
    fee: number;
    nonce: number;
    memo: string;
  };
}
export async function buildDeployQuiz(sender: string, args: BuildQuizArgs): Promise<[SendTransactionArgs, string, string, number]> {
  const Network = Mina.Network(
    'https://api.minascan.io/node/devnet/v1/graphql'
  );
  const mina = await initBlockchain("devnet" as blockchain);
  Mina.setActiveInstance(Network);
  const account = await fetchMinaAccount({ publicKey: sender });
  const nonce = Number(account.account?.nonce);
  const privateKeyRandom = PrivateKey.random();
  console.log("privateKeyRandom", privateKeyRandom.toBase58());
  console.log("contractAddress", privateKeyRandom.toPublicKey().toBase58());
  const zkApp = new Quiz(PublicKey.fromBase58(privateKeyRandom.toPublicKey().toBase58()));
  console.log("All the args of the transaction", args);
  console.log("nonce", nonce);
  console.log("sender", sender);
  console.log("fee", 1e8);
  console.log("memo", "deploy quizbu");
  console.log("verificationKey", QUIZ_VERIFICATION_KEY);
  console.log("hash", QUIZ_VERIFICATION_KEY_HASH);
  const tx = await Mina.transaction(
    { sender: PublicKey.fromBase58(sender), fee: 1e8, memo: "deploy quizbu", nonce: nonce },
    async () => {
      AccountUpdate.fundNewAccount(PublicKey.fromBase58(sender));
      await zkApp.deploy({ verificationKey: { data: QUIZ_VERIFICATION_KEY as string, hash: QUIZ_VERIFICATION_KEY_HASH as string } });
      await zkApp.initQuizState(Field(args.secretKey), UInt64.from(args.duration), UInt64.from(args.startDate), UInt64.from(args.totalRewardPoolAmount), UInt64.from(args.rewardPerWinner));
    }
  );
  tx.sign([privateKeyRandom]);
  const serializedTransaction = serializeTransaction(tx);
  const mina_signer_payload = {
    transaction: tx.toJSON(),
    onlySign: true,
    nonce: nonce,
    feePayer: {
      fee: 1e8,
      memo: "deploy quizbu",
    },
  } satisfies SendTransactionArgs;

  /*   const mina_signer_payload = {
    transaction: tx.toJSON(),
    onlySign: true,
    feePayer: {
      fee: 1e8,
      memo: "deploy quizbu",
    },
  }; */

  // Serialized transaction and contract address that will be deployed use it on DeployQuizArgs
  return [mina_signer_payload, serializedTransaction, privateKeyRandom.toPublicKey().toBase58(), nonce];
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
export async function deployQuiz(JWT: string, args: DeployQuizArgs) {
  const Network = Mina.Network(
    'https://api.minascan.io/node/devnet/v1/graphql'
  );
  const mina = await initBlockchain("devnet" as blockchain);
  Mina.setActiveInstance(Network);
  const client = new zkCloudWorkerClient({
    jwt: JWT,
    chain: process.env.CHAIN as blockchain,
    zkcloudworker
  });
  console.log("args", args);
  const proveAndSendDeployQuizResponse = await client.execute({
    developer: "BlocksOnChain",
    repo: "choz-worker",
    transactions: [],
    task: "proveAndSendDeployQuizTx",
    args: JSON.stringify(args),
    metadata: "prove and send deploy quiz tx test",
  });
  console.log("proveAndSendDeployQuizResponse", proveAndSendDeployQuizResponse);
  return proveAndSendDeployQuizResponse;
}

