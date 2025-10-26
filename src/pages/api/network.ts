// API endpoint for fetching complete PPI network data
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { Node, Edge, NetworkData } from '@/lib/types';
import { transformNodeToResponse, transformEdgeToResponse } from '@/lib/transforms';

/**
 * GET /api/network
 * Returns all nodes and edges from the database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NetworkData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Default filtering (Option A)
    const minProb = parseFloat((req.query.minProb as string) || '0.8');
    const preferExperimental = (req.query.preferExperimental as string) !== 'false';
    const maxEdges = parseInt((req.query.maxEdges as string) || '60000', 10);
    const edgeSelect = 'edge,protein1,protein2,fusion_pred_prob,enriched_tissue,tissue_enriched_confidence,positive_type';

    // Fetch all nodes from database (always include all nodes for full-node hairball)
    const { data: nodesData, error: nodesError } = await supabase
      .from('nodes')
      .select('*');

    if (nodesError) {
      console.error('Database error fetching nodes:', nodesError);
      return res.status(500).json({ error: 'Failed to fetch nodes from database' });
    }

    // Edges filtered for performance
    // 1) Start with experimental
    let edges: Edge[] = [];
    if (preferExperimental) {
      const { data: expEdges, error: expErr } = await supabase
        .from('edges')
        .select(edgeSelect)
        .eq('positive_type', 'experimental')
        .limit(maxEdges);
      if (expErr) {
        console.error('Database error fetching experimental edges:', expErr);
        return res.status(500).json({ error: 'Failed to fetch edges from database' });
      }
      edges = (expEdges ?? []) as Edge[];
    }

    // 2) Add high-probability predicted edges until reaching maxEdges
    const remaining = Math.max(0, maxEdges - edges.length);
    if (remaining > 0) {
      const { data: predEdges, error: predErr } = await supabase
        .from('edges')
        .select(edgeSelect)
        .gte('fusion_pred_prob', minProb)
        .order('fusion_pred_prob', { ascending: false })
        .limit(remaining);
      if (predErr) {
        console.warn('Predicted edges query timed out, returning experimental edges only:', predErr);
      } else {
        const typedPredEdges = (predEdges ?? []) as Edge[];
        edges = edges.concat(typedPredEdges);
      }
    }

    // Transform data to API response format
    const nodes = (nodesData as Node[]).map(transformNodeToResponse);
    const edgesResp = edges.map(transformEdgeToResponse);

    return res.status(200).json({ nodes, edges: edgesResp });
  } catch (error) {
    console.error('Unexpected error in /api/network:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Disable Next.js API response size limit for this heavy endpoint
export const config = {
  api: {
    responseLimit: false,
  },
};
