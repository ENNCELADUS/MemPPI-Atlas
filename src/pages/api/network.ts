// API endpoint for fetching complete PPI network data
import type { NextApiRequest, NextApiResponse } from 'next';
import { performance } from 'perf_hooks';
import { supabase } from '@/lib/supabase';
import type { Edge, NetworkData, NetworkMeta, NetworkTimings, Node } from '@/lib/types';
import { transformEdgeToResponse, transformNodeToResponse } from '@/lib/transforms';
import type { CytoscapeElements } from '@/lib/graphUtils';
import { toCytoscapeElements } from '@/lib/graphUtils';

/**
 * GET /api/network
 * Returns all nodes and edges from the database
 */
type NetworkElementsResponse = {
  elements: CytoscapeElements;
  meta?: NetworkMeta;
};

type NetworkResponseBody = NetworkData | NetworkElementsResponse | { error: string };

type PositiveType = 'experiment' | 'prediction';

type EdgeFilters = {
  minProb: number;
  nodeIds: string[];
};

const ALLOWED_POSITIVE_TYPES = new Set<PositiveType>(['experiment', 'prediction']);
const DEFAULT_POSITIVE_TYPES: PositiveType[] = ['experiment'];
const DEFAULT_MAX_EDGES = 50_000;
const HARD_MAX_EDGES = 100_000;
const EDGE_PAGE_LIMIT = 10_000;

const CACHE_CONTROL_HEADER = 'public, s-maxage=60, stale-while-revalidate=300';

const edgeSelect =
  'edge,protein1,protein2,fusion_pred_prob,enriched_tissue,tissue_enriched_confidence,positive_type';

const toMs = (value: number) => Math.round(value * 100) / 100;

const parseBoolean = (value: string | string[] | undefined, defaultValue: boolean): boolean => {
  if (typeof value === 'undefined') return defaultValue;
  if (Array.isArray(value)) return parseBoolean(value[0], defaultValue);
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
};

const parseNumber = (value: string | string[] | undefined, defaultValue: number): number => {
  if (typeof value === 'undefined') return defaultValue;
  const str = Array.isArray(value) ? value[0] : value;
  const parsed = Number(str);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const parseFormat = (value: string | string[] | undefined): 'json' | 'cyto' => {
  if (typeof value === 'undefined') return 'json';
  const str = (Array.isArray(value) ? value[0] : value).toLowerCase();
  return str === 'cyto' ? 'cyto' : 'json';
};

const parsePositiveTypes = (
  value: string | string[] | undefined,
  preferExperimental: boolean,
): PositiveType[] => {
  const rawValues: string[] = [];
  if (typeof value === 'string') {
    rawValues.push(...value.split(',').map((item) => item.trim()));
  } else if (Array.isArray(value)) {
    value.forEach((item) => rawValues.push(...item.split(',').map((sub) => sub.trim())));
  }

  const normalized = rawValues
    .map((item) => item.toLowerCase())
    .map((item) => (item === 'experimental' ? 'experiment' : item))
    .filter((item): item is PositiveType => ALLOWED_POSITIVE_TYPES.has(item as PositiveType));

  if (normalized.length > 0) {
    return Array.from(new Set(normalized));
  }

  if (!preferExperimental) {
    return Array.from(ALLOWED_POSITIVE_TYPES);
  }

  return DEFAULT_POSITIVE_TYPES;
};

const parseNodeIds = (value: string | string[] | undefined): string[] => {
  if (typeof value === 'undefined') return [];
  const raw = Array.isArray(value) ? value : value.split(',');
  const ids = raw
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toUpperCase());
  return Array.from(new Set(ids));
};

const clampMaxEdges = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_MAX_EDGES;
  return Math.min(Math.max(1, Math.floor(value)), HARD_MAX_EDGES);
};

const applyNodeFilter = <T>(query: T, nodeIds: string[]): T => {
  if (nodeIds.length === 0) return query;
  // @ts-expect-error Supabase builder chaining at runtime
  return query.in('protein1', nodeIds).in('protein2', nodeIds);
};

const countEdgesByType = async (
  type: PositiveType,
  filters: EdgeFilters,
): Promise<{ count: number; error: Error | null }> => {
  let query = supabase
    .from('edges')
    .select('edge', { count: 'exact', head: true })
    .eq('positive_type', type === 'experiment' ? 'experiment' : 'prediction');

  if (type === 'prediction') {
    // @ts-expect-error Supabase builder chaining at runtime
    query = query.gte('fusion_pred_prob', filters.minProb);
  }

  query = applyNodeFilter(query, filters.nodeIds);

  const { count, error } = await query;
  return { count: count ?? 0, error };
};

const fetchEdgeSlice = async (
  type: PositiveType,
  start: number,
  end: number,
  filters: EdgeFilters,
): Promise<{ data: Edge[]; error: Error | null }> => {
  if (end < start) {
    return { data: [], error: null };
  }

  let query = supabase
    .from('edges')
    .select(edgeSelect)
    .eq('positive_type', type === 'experiment' ? 'experiment' : 'prediction');

  if (type === 'prediction') {
    // @ts-expect-error Supabase builder chaining at runtime
    query = query.gte('fusion_pred_prob', filters.minProb).order('fusion_pred_prob', {
      ascending: false,
      nullsLast: true,
    });
  } else {
    // Stable ordering for experimental edges
    // @ts-expect-error Supabase builder chaining at runtime
    query = query.order('edge', { ascending: true });
  }

  query = applyNodeFilter(query, filters.nodeIds);

  // @ts-expect-error Supabase builder chaining at runtime
  query = query.range(start, end);

  const { data, error } = await query;
  return { data: (data ?? []) as Edge[], error };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NetworkResponseBody>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const overallStart = performance.now();

    const preferExperimental = (req.query.preferExperimental as string | undefined) !== 'false';
    const positiveTypes = parsePositiveTypes(req.query.positiveType, preferExperimental);
    const minProb = Math.min(Math.max(parseNumber(req.query.minProb, 0.8), 0), 1);
    const includeEdges = parseBoolean(req.query.edges, true);
    const format = parseFormat(req.query.format);
    const nodeIds = parseNodeIds(req.query.nodes);
    const maxEdges = clampMaxEdges(parseNumber(req.query.maxEdges, DEFAULT_MAX_EDGES));

    const edgeFilters: EdgeFilters = {
      minProb,
      nodeIds,
    };

    const nodesStart = performance.now();
    let nodesQuery = supabase.from('nodes').select('*', { count: 'exact' });
    if (nodeIds.length > 0) {
      nodesQuery = nodesQuery.in('protein', nodeIds);
    }

    const { data: nodesData, error: nodesError, count: totalNodesCount } = await nodesQuery;

    if (nodesError) {
      console.error('Database error fetching nodes:', nodesError);
      return res.status(500).json({ error: 'Failed to fetch nodes from database' });
    }

    const fetchNodesMs = performance.now() - nodesStart;

    const totalNodes = totalNodesCount ?? (nodesData?.length ?? 0);

    const totalEdgesMetric = await supabase
      .from('edges')
      .select('edge', { count: 'exact', head: true });

    if (totalEdgesMetric.error) {
      console.error('Database error counting edges:', totalEdgesMetric.error);
      return res.status(500).json({ error: 'Failed to fetch edges from database' });
    }

    const totalEdgesCount = totalEdgesMetric.count ?? 0;

    const wantsExperiment = positiveTypes.includes('experiment');
    const wantsPrediction = positiveTypes.includes('prediction');

    const countRequests: { type: PositiveType }[] = [];

    if (wantsExperiment) {
      countRequests.push({ type: 'experiment' });
    }

    if (wantsPrediction) {
      countRequests.push({ type: 'prediction' });
    }

    const countResults = await Promise.all(
      countRequests.map((request) => countEdgesByType(request.type, edgeFilters)),
    );

    const countsByType: Partial<Record<PositiveType, number>> = {};

    countResults.forEach((result, index) => {
      const request = countRequests[index];
      if (result.error) {
        console.error('Database error counting filtered edges:', result.error);
        throw result.error;
      }
      countsByType[request.type] = result.count;
    });

    const totalEdges = totalEdgesCount;

    const edges: Edge[] = [];
    const seenEdgeIds = new Set<string>();
    let fetchEdgesMs = 0;

    if (includeEdges) {
      const edgesStart = performance.now();

      let remaining = maxEdges;

      const fetchSlices = async (type: PositiveType) => {
        const totalForType = countsByType[type] ?? 0;
        if (totalForType === 0) return;

        const limitForType = Math.min(remaining, totalForType);
        let fetched = 0;

        while (fetched < limitForType && remaining > 0) {
          const sliceStart = fetched;
          const sliceEnd = Math.min(sliceStart + EDGE_PAGE_LIMIT - 1, limitForType - 1);
          const { data: sliceData, error: sliceError } = await fetchEdgeSlice(
            type,
            sliceStart,
            sliceEnd,
            edgeFilters,
          );

          if (sliceError) {
            console.error('Database error fetching edges:', sliceError);
            throw new Error('Failed to fetch edges from database');
          }

          for (const edge of sliceData) {
            if (!seenEdgeIds.has(edge.edge) && edges.length < maxEdges) {
              edges.push(edge);
              seenEdgeIds.add(edge.edge);
            }
          }

          fetched += sliceData.length;
          remaining = Math.max(0, maxEdges - edges.length);

          if (sliceData.length < EDGE_PAGE_LIMIT) break;
        }
      };

      if (wantsExperiment && remaining > 0) {
        await fetchSlices('experiment');
      }

      if (wantsPrediction && remaining > 0) {
        await fetchSlices('prediction');
      }

      fetchEdgesMs = performance.now() - edgesStart;
    }

    const transformStart = performance.now();
    const nodes = (nodesData as Node[]).map(transformNodeToResponse);
    const edgesResp = includeEdges ? edges.map(transformEdgeToResponse) : [];
    const transformMs = performance.now() - transformStart;

    const timings: NetworkTimings = {
      fetchNodesMs: toMs(fetchNodesMs),
      fetchEdgesMs: includeEdges ? toMs(fetchEdgesMs) : undefined,
      transformMs: toMs(transformMs),
      totalMs: toMs(performance.now() - overallStart),
    };

    const filteredEdges = includeEdges ? edgesResp.length : 0;

    const meta: NetworkMeta = {
      totalNodes,
      totalEdges,
      filteredEdges,
      timings,
    };

    res.setHeader('Cache-Control', CACHE_CONTROL_HEADER);

    if (format === 'cyto') {
      const elements = toCytoscapeElements({ nodes, edges: edgesResp });
      return res.status(200).json({ elements, meta });
    }

    return res.status(200).json({ nodes, edges: edgesResp, meta });
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
