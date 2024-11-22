// pages/api/key.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { buildDeployQuiz } from "../../zkCloudWorker/QuizWorker";
import { blockchain } from "zkcloudworker";
import { initBlockchain } from "zkcloudworker";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  try {
    const { sender, args } = JSON.parse(req.body);
    await initBlockchain("devnet" as blockchain);
    const [tx, contractAddress, nonce] = await buildDeployQuiz(sender, args);
    return res.status(200).json({ tx, contractAddress, nonce });
  } catch (error) {
    console.error("Error creating API Key:", error);
    return res.status(500).json({ message: "Failed to create API Key" });
  }
}