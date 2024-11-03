// pages/api/proxy.ts

import type { NextApiRequest, NextApiResponse } from "next";
import fetch, { Response } from "node-fetch";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;

  // Hash parametresinin varlığını ve türünü kontrol etme
  if (!hash || typeof hash !== "string") {
    res.status(400).json({ error: "Missing or invalid hash parameter" });
    return;
  }

  const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;

  try {
    console.log("Proxying request to:", url);
    const response: Response = await fetch(url);

    // Yanıtın başarılı olup olmadığını kontrol etme
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    // Gerekli CORS başlıklarını ekleme
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Yanıt başlıklarını ayarlama
    response.headers.forEach((value, key) => {
      // Bazı başlıklar otomatik olarak eklenir, bunları atlayabilirsiniz
      if (
        key.toLowerCase() !== "content-encoding" &&
        key.toLowerCase() !== "transfer-encoding" &&
        key.toLowerCase() !== "content-length"
      ) {
        res.setHeader(key, value);
      }
    });

    // Yanıt gövdesini stream olarak aktar
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.status(500).json({ error: "No response body" });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
