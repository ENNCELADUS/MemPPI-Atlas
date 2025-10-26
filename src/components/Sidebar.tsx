import { NetworkStats } from '@/lib/types';
import StatCard from './StatCard';

interface SidebarProps {
  stats: NetworkStats;
}

export default function Sidebar({ stats }: SidebarProps) {
  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 p-6 space-y-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-900">Network Statistics</h2>
      
      <StatCard label="Total Nodes" value={stats.totalNodes} />
      <StatCard label="Total Edges" value={stats.totalEdges} />
      <StatCard 
        label="Enriched Edges" 
        value={stats.enrichedEdgeCount} 
        color="text-red-600" 
      />
      
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Family Distribution
        </h3>
        {Object.keys(stats.familyCounts).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(stats.familyCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([family, count]) => (
                <div 
                  key={family} 
                  className="flex justify-between text-sm text-gray-700"
                >
                  <span>{family}</span>
                  <span className="font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No family data available</p>
        )}
      </div>
    </aside>
  );
}

