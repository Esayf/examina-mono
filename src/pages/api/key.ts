// pages/api/key.ts

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { pinata } from "@/utils/config";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Use axios directly with the same cookie
    const sessionResponse = await axios.get(`${process.env.API_URL || "https://api.choz.io"}/users/session`, {
      headers: {
        Cookie: req.headers.cookie || '',
        "Content-Type": "application/json",
      },
      withCredentials: true
    });

    const sessionData = sessionResponse.data;

    if (!sessionData?.session?.walletAddress) {
      return res.status(401).json({ message: "Unauthorized - Please connect your wallet first" });
    }

    const uuid = crypto.randomUUID();
    const keyData = await pinata.keys.create({
      keyName: `${uuid}-${sessionData.session.walletAddress}`,
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });

    // Return the API key and secret - these are temporary credentials without any user info
    return res.status(200).json({
      pinata_api_key: keyData.pinata_api_key,
      pinata_api_secret: keyData.pinata_api_secret
    });
  } catch (error) {
    console.error("Error creating API Key:", error);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Unauthorized - Please connect your wallet first" });
    }
    return res.status(500).json({ message: "Failed to create API Key" });
  }
}
