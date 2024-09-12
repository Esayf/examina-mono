// pages/api/key.ts

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { pinata } from "@/utils/config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const uuid = crypto.randomUUID();
    const keyData = await pinata.keys.create({
      keyName: uuid.toString(),
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });
    return res.status(200).json(keyData);
  } catch (error) {
    console.error("Error creating API Key:", error);
    return res.status(500).json({ message: "Failed to create API Key" });
  }
}
