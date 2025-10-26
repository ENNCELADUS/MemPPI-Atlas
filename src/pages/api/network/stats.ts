// API endpoint for network statistics
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { NetworkStats } from '@/lib/types';

/**
 * GET /api/network/stats
 * Returns aggregate statistics about the network:
 * - Total node and edge counts
 * - Family distribution (count per family type)
 * - Enriched edge count (edges with non-null enriched_tissue)
 * - Predicted edge count (edges with positive_type = 'prediction')
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NetworkStats | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Count total nodes
    const { count: nodeCount, error: nodeError } = await supabase
      .from('nodes')
      .select('*', { count: 'exact', head: true });

    if (nodeError) {
      console.error('Database error counting nodes:', nodeError);
      return res.status(500).json({ error: 'Failed to count nodes' });
    }

    // Count total edges
    const { count: edgeCount, error: edgeError } = await supabase
      .from('edges')
      .select('*', { count: 'exact', head: true });

    if (edgeError) {
      console.error('Database error counting edges:', edgeError);
      return res.status(500).json({ error: 'Failed to count edges' });
    }

    // Fetch all family values for aggregation (only ~2K rows, fetch family column only)
    const { data: familyData, error: familyError } = await supabase
      .from('nodes')
      .select('family');

    if (familyError) {
      console.error('Database error fetching families:', familyError);
      return res.status(500).json({ error: 'Failed to fetch family data' });
    }

    // Aggregate family counts (exclude null/empty values)
    const familyCounts: Record<string, number> = {};
    familyData?.forEach((node) => {
      const family = node.family;
      if (family && family.trim() !== '') {
        familyCounts[family] = (familyCounts[family] || 0) + 1;
      }
    });

    // Count enriched edges (enriched_tissue IS NOT NULL)
    const enrichedQuery = supabase
      .from('edges')
      .select('*', { count: 'exact', head: true })
      .not('enriched_tissue', 'is', null);
    
    const { count: enrichedEdgeCount, error: enrichedError } = await enrichedQuery;

    if (enrichedError) {
      console.error('Database error counting enriched edges:', enrichedError);
      return res.status(500).json({ error: 'Failed to count enriched edges' });
    }

    // Count predicted edges (positive_type = 'prediction')
    const predictedQuery = supabase
      .from('edges')
      .select('*', { count: 'exact', head: true })
      .eq('positive_type', 'prediction');
    
    const { count: predictedEdgeCount, error: predictedError } = await predictedQuery;

    if (predictedError) {
      console.error('Database error counting predicted edges:', predictedError);
      return res.status(500).json({ error: 'Failed to count predicted edges' });
    }

    const stats: NetworkStats = {
      totalNodes: nodeCount || 0,
      totalEdges: edgeCount || 0,
      familyCounts,
      enrichedEdgeCount: enrichedEdgeCount || 0,
      predictedEdgeCount: predictedEdgeCount || 0,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Unexpected error in /api/network/stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

