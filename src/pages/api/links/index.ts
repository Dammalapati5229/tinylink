// src/pages/api/links/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../lib/db";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function generateCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "DATABASE_URL not set" });
    }

    if (req.method === "POST") {
      const { targetUrl, code } = req.body || {};

      if (!targetUrl || typeof targetUrl !== "string" || !isValidUrl(targetUrl)) {
        return res.status(400).json({ error: "Invalid or missing URL" });
      }

      let finalCode: string;

      if (code) {
        if (typeof code !== "string" || !CODE_REGEX.test(code)) {
          return res
            .status(400)
            .json({ error: "Code must be 6–8 alphanumeric characters" });
        }

        const existing = await query("SELECT id FROM links WHERE code = $1", [
          code,
        ]);
        if (existing.rowCount && existing.rowCount > 0) {
          return res.status(409).json({ error: "Code already exists" });
        }
        finalCode = code;
      } else {
        while (true) {
          const candidate = generateCode(6);
          const existing = await query("SELECT id FROM links WHERE code = $1", [
            candidate,
          ]);
          if (!existing.rowCount || existing.rowCount === 0) {
            finalCode = candidate;
            break;
          }
        }
      }

      const result = await query(
        `INSERT INTO links (code, target_url)
         VALUES ($1, $2)
         RETURNING code, target_url, total_clicks, last_clicked_at, created_at`,
        [finalCode, targetUrl]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === "GET") {
      const result = await query(
        `SELECT code, target_url, total_clicks, last_clicked_at, created_at
         FROM links
         ORDER BY created_at DESC`
      );
      return res.status(200).json(result.rows);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (err: any) {
    console.error("Error in /api/links:", err);
    return res.status(500).json({
      error: err?.message || "Internal server error",
    });
  }
}
