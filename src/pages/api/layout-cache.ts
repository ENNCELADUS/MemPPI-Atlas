import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { CURRENT_LAYOUT_VERSION } from "@/lib/layoutCache";

type PositionPayload = {
  id: string;
  x: number;
  y: number;
};

type LayoutCacheRequestBody = {
  graphKey?: string;
  layoutVersion?: string;
  positions?: PositionPayload[];
};

// Graph keys are sha256 hex digests from buildGraphKey; the full network has ~4,300 nodes.
const GRAPH_KEY_PATTERN = /^[0-9a-f]{64}$/;
const MAX_POSITIONS = 10_000;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as LayoutCacheRequestBody | undefined;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { graphKey, layoutVersion, positions } = body;

  if (typeof graphKey !== "string" || !GRAPH_KEY_PATTERN.test(graphKey)) {
    return res
      .status(400)
      .json({ error: "graphKey must be a sha256 hex digest" });
  }

  if (!layoutVersion || layoutVersion !== CURRENT_LAYOUT_VERSION) {
    return res.status(400).json({ error: "Unsupported layout version" });
  }

  if (
    !Array.isArray(positions) ||
    positions.length === 0 ||
    positions.length > MAX_POSITIONS
  ) {
    return res.status(400).json({
      error: `positions must be a non-empty array of at most ${MAX_POSITIONS} items`,
    });
  }

  const records = positions
    .map((position) => {
      if (!position || typeof position !== "object") return null;
      if (!position.id || typeof position.id !== "string") return null;
      if (!isFiniteNumber(position.x) || !isFiniteNumber(position.y))
        return null;
      return {
        graph_key: graphKey,
        node_id: position.id,
        x: position.x,
        y: position.y,
        layout_version: layoutVersion,
      };
    })
    .filter(
      (
        value
      ): value is {
        graph_key: string;
        node_id: string;
        x: number;
        y: number;
        layout_version: string;
      } => value !== null
    );

  if (records.length === 0) {
    return res.status(400).json({ error: "No valid positions provided" });
  }

  try {
    const { error } = await supabase
      .from("graph_layout_cache")
      .upsert(records, { onConflict: "graph_key,node_id" });

    if (error) {
      console.error("Layout cache write error:", error);
      return res.status(500).json({ error: "Failed to persist layout cache" });
    }

    console.info(
      `[layout-cache] stored ${records.length} positions for graph=${graphKey}`
    );

    return res.status(204).end();
  } catch (err) {
    console.error("Unexpected layout cache write error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
