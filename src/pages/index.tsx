import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { NetworkStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          <Sidebar stats={stats} />
        ) : null}

        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg border border-gray-200 h-[calc(100vh-64px-48px)] flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <circle cx="6" cy="6" r="2" strokeWidth="2" />
                <circle cx="18" cy="6" r="2" strokeWidth="2" />
                <circle cx="6" cy="18" r="2" strokeWidth="2" />
                <circle cx="18" cy="18" r="2" strokeWidth="2" />
                <line x1="12" y1="12" x2="6" y2="6" strokeWidth="1.5" />
                <line x1="12" y1="12" x2="18" y2="6" strokeWidth="1.5" />
                <line x1="12" y1="12" x2="6" y2="18" strokeWidth="1.5" />
                <line x1="12" y1="12" x2="18" y2="18" strokeWidth="1.5" />
              </svg>
              <p className="text-lg font-semibold mb-2">Network Visualization</p>
              <p className="text-sm">
                Interactive network graph will be displayed here in a future milestone
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
