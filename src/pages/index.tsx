import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Legend from '@/components/Legend';
import NetworkGraph from '@/components/NetworkGraph';
import SearchBar from '@/components/SearchBar';
import type { NetworkData, NetworkMeta, NetworkStats } from '@/lib/types';
import type { CytoscapeElements } from '@/lib/graphUtils';
import { toCytoscapeElements } from '@/lib/graphUtils';

export default function Home() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [graphElements, setGraphElements] = useState<CytoscapeElements>([]);
  const [graphLoading, setGraphLoading] = useState<boolean>(true);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [graphMeta, setGraphMeta] = useState<NetworkMeta | null>(null);
  const [filters, setFilters] = useState({
    positiveTypes: ['experiment'],
    maxEdges: 50_000,
    onlyVisibleEdges: false,
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('maxEdges', String(filters.maxEdges));
    if (filters.positiveTypes.length > 0) {
      params.set('positiveType', filters.positiveTypes.join(','));
    }
    return params.toString();
  }, [filters.maxEdges, filters.positiveTypes]);

  const handleGraphError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'Failed to initialise network viewer';
    setGraphError(message);
    console.error('Error initialising Cytoscape:', err);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/network/stats');
        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.statusText}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching network stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchNetwork() {
      try {
        setGraphLoading(true);
        setGraphError(null);
        const response = await fetch(`/api/network${queryString ? `?${queryString}` : ''}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch network: ${response.statusText}`);
        }
        const data = (await response.json()) as NetworkData;
        if (cancelled) return;
        setGraphElements(toCytoscapeElements(data));
        const meta = data.meta ?? null;
        setGraphMeta(meta);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch network';
        setGraphError(message);
        console.error('Error fetching network:', err);
      } finally {
        if (!cancelled) {
          setGraphLoading(false);
        }
      }
    }

    fetchNetwork();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col lg:flex-row">
        {loading ? (
          <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full lg:w-80 bg-white border-r border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Network Statistics</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          </div>
        ) : stats ? (
          <Sidebar
            stats={stats}
            meta={graphMeta}
            filters={filters}
            onChange={setFilters}
          />
        ) : null}

        <main className="flex-1 p-6">
          <div className="relative h-[calc(100vh-64px-48px)]">
            <NetworkGraph
              elements={graphElements}
              isLoading={graphLoading}
              onError={handleGraphError}
            />
            <div className="pointer-events-auto absolute top-4 right-4 z-20">
              <Legend />
            </div>
            {graphError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="max-w-sm rounded-lg border border-red-200 bg-white/90 p-4 text-center shadow">
                  <p className="text-sm font-semibold text-red-600">Unable to load network</p>
                  <p className="mt-2 text-xs text-red-500">{graphError}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <SearchBar />
    </div>
  );
}
