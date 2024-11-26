import {
  Cloud,
  zkCloudWorker,
  initBlockchain,
  VerificationData,
  blockchain,
  zkCloudWorkerClient,
} from "zkcloudworker";
import { initializeBindings } from "o1js";
import { QuizWorker } from "./QuizWorker";

export async function zkcloudworker(cloud: Cloud): Promise<zkCloudWorker> {
  await initializeBindings();
  await initBlockchain(cloud.chain);
  return new QuizWorker(cloud);
}
