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
    // Fetch all nodes from database
    const { data: nodesData, error: nodesError } = await supabase
      .from('nodes')
      .select('*');

    if (nodesError) {
      console.error('Database error fetching nodes:', nodesError);
      return res.status(500).json({ error: 'Failed to fetch nodes from database' });
    }

    // Fetch all edges from database
    const { data: edgesData, error: edgesError } = await supabase
      .from('edges')
      .select('*');

    if (edgesError) {
      console.error('Database error fetching edges:', edgesError);
      return res.status(500).json({ error: 'Failed to fetch edges from database' });
    }

    // Transform data to API response format
    const nodes = (nodesData as Node[]).map(transformNodeToResponse);
    const edges = (edgesData as Edge[]).map(transformEdgeToResponse);

    return res.status(200).json({ nodes, edges });
  } catch (error) {
    console.error('Unexpected error in /api/network:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

