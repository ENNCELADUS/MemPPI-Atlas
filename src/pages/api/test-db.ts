// Test API route to verify Supabase connection
// Access at: http://localhost:3000/api/test-db
// Remove this file after verifying Milestone 2 is complete

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type TestResponse = {
  success: boolean;
  nodeCount: number | null;
  edgeCount: number | null;
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  try {
    // Count nodes
    const { count: nodeCount, error: nodesError } = await supabase
      .from("nodes")
      .select("*", { count: "exact", head: true });

    if (nodesError) {
      throw new Error(`Nodes query failed: ${nodesError.message}`);
    }

    // Count edges
    const { count: edgeCount, error: edgesError } = await supabase
      .from("edges")
      .select("*", { count: "exact", head: true });

    if (edgesError) {
      throw new Error(`Edges query failed: ${edgesError.message}`);
    }

    // Sample query to verify data quality
    const { data: sampleNodes, error: sampleError } = await supabase
      .from("nodes")
      .select("protein, entry_name, family")
      .limit(3);

    if (sampleError) {
      throw new Error(`Sample query failed: ${sampleError.message}`);
    }

    console.log("Sample nodes:", sampleNodes);

    return res.status(200).json({
      success: true,
      nodeCount,
      edgeCount,
      message: `✅ Database connection successful! Found ${nodeCount} nodes and ${edgeCount} edges.`,
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return res.status(500).json({
      success: false,
      nodeCount: null,
      edgeCount: null,
      message: "❌ Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
