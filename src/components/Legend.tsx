import React from 'react';
import { familyColorMap, edgeColors } from '@/lib/graphUtils';

interface LegendItem { color: string; label: string }

export default function Legend() {
  const nodeItems: LegendItem[] = [
    { color: familyColorMap.TM, label: 'TM' },
    { color: familyColorMap.TF, label: 'TF' },
    { color: familyColorMap.Kinase, label: 'Kinase' },
    { color: familyColorMap.Receptor, label: 'Receptor' },
    { color: familyColorMap.Other, label: 'Other' },
  ];
  const edgeItems: LegendItem[] = [
    { color: edgeColors.experimental, label: 'Experimental' },
    { color: edgeColors.enriched, label: 'Enriched' },
    { color: edgeColors.predicted, label: 'Predicted/Other' },
  ];

  return (
    <div className="bg-white/95 rounded-lg border border-gray-200 p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Nodes</p>
          <div className="space-y-2">
            {nodeItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Edges</p>
          <div className="space-y-2">
            {edgeItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-6 h-[2px]" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


