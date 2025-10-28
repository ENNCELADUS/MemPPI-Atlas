import React, { useCallback, useEffect, useRef, useState } from 'react';
import type cytoscapeType from 'cytoscape';
import type { EdgeDefinition, ElementDefinition, EventObject, LayoutOptions, NodeDefinition } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { cyStyles, fcoseLayout, rendererOptions } from '@/lib/cytoscape-config';
import type { CytoscapeElements } from '@/lib/graphUtils';

type CytoscapeWithExtensions = cytoscapeType & {
  use: (extension: unknown) => void;
};

const isEdgeElement = (element: ElementDefinition): element is EdgeDefinition => {
  const data = element.data as EdgeDefinition['data'] | undefined;
  return Boolean(data && 'source' in data && 'target' in data);
};

const isNodeElement = (element: ElementDefinition): element is NodeDefinition => {
  const data = element.data as NodeDefinition['data'] | undefined;
  return Boolean(data && !('source' in data));
};

interface NetworkGraphProps {
  elements: CytoscapeElements;
  isLoading?: boolean;
  progress?: { nodesLoaded: boolean; edgesLoaded: number; edgesTotal: number } | null;
  onError?: (err: unknown) => void;
  layout?: LayoutOptions;
}

export default function NetworkGraph({ elements, isLoading, progress, onError, layout = fcoseLayout }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscapeType.Core | null>(null);
  const [ready, setReady] = useState(false);

  const ensureQueryPriority = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      const queryNodes = cy.nodes('[?isQuery]');
      if (queryNodes.length === 0) return;
      queryNodes.style({ 'z-index': 1000 });
      queryNodes.connectedEdges().style({ 'z-index': 900 });
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cytoscapeModule = await import('cytoscape');
        const cytoscapeFactory = cytoscapeModule.default as unknown as CytoscapeWithExtensions;
        cytoscapeFactory.use(fcose);
        if (!containerRef.current) return;
        const instance = cytoscapeFactory({
          container: containerRef.current,
          elements: [],
          style: cyStyles,
          layout: { name: 'preset' },
          textureOnViewport: true,
          wheelSensitivity: 0.2,
          selectionType: 'single',
          boxSelectionEnabled: false,
          autoungrabify: false,
          autounselectify: false,
          userZoomingEnabled: true,
          userPanningEnabled: true,
          minZoom: 0.05,
          maxZoom: 6,
          renderer: rendererOptions,
        });
        const handleTapNode = (event: EventObject) => {
          const node = event.target;
          if (node?.isNode?.()) {
            if (node.selected()) {
              node.unselect();
              return;
            }
            instance.$('node:selected').unselect();
            node.select();
          }
        };
        const handleTapBackground = (event: EventObject) => {
          if (event.target === instance) {
            instance.$('node:selected').unselect();
          }
        };
        instance.on('tap', 'node', handleTapNode);
        instance.on('tap', handleTapBackground);
        cyRef.current = instance;
        setReady(true);
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => {
      const current = cyRef.current;
      if (current) {
        current.off('tap');
        current.destroy();
      }
      cyRef.current = null;
    };
  }, [onError]);

  // apply elements and run layout (progressive: nodes + seed edges first)
  useEffect(() => {
    if (!ready || !cyRef.current) return;
    const cy = cyRef.current;
    const nodeElements = elements.filter(isNodeElement);
    const edgeElements = elements.filter(isEdgeElement);

    const seedEdges = 20000; // quick initial layout
    cy.startBatch();
    cy.elements().remove();
    cy.add(nodeElements);
    cy.add(edgeElements.slice(0, Math.min(seedEdges, edgeElements.length)));
    cy.endBatch();
    ensureQueryPriority();
    cy.resize();

    try {
      const layoutInstance = cy.layout(layout);
      layoutInstance.one?.('layoutstop', ensureQueryPriority);
      layoutInstance.run();
    } catch {
      // fallback to built-in cose if layout fails
      const fallbackLayout: LayoutOptions = { name: 'cose', animate: false, fit: true, padding: 30 };
      const fallbackInstance = cy.layout(fallbackLayout);
      fallbackInstance.one?.('layoutstop', ensureQueryPriority);
      fallbackInstance.run();
    }
    cy.fit(undefined, 30);

    // batch in remaining edges without relayout
    let added = Math.min(seedEdges, edgeElements.length);
    const batchSize = 10000;
    function addMore() {
      if (!cyRef.current) return;
      if (added >= edgeElements.length) return;
      const end = Math.min(added + batchSize, edgeElements.length);
      cyRef.current.add(edgeElements.slice(added, end));
      added = end;
      ensureQueryPriority();
      if (added < edgeElements.length) setTimeout(addMore, 0);
    }
    setTimeout(addMore, 0);
  }, [elements, ready, layout, ensureQueryPriority]);

  useEffect(() => {
    if (!ready || !cyRef.current) return;
    const handleResize = () => {
      cyRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ready]);

  return (
    <div className="relative w-full h-full bg-white rounded-lg" aria-label="Network graph">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-white/80 rounded-lg border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-700 mb-2">Loading network data...</p>
            {progress && (
              <div className="w-64">
                <div className="w-full bg-gray-200 rounded h-2 overflow-hidden mb-2">
                  <div
                    className="h-2 bg-blue-600"
                    style={{ width: `${Math.min(100, Math.round((progress.edgesLoaded / Math.max(1, progress.edgesTotal)) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">Nodes: {progress.nodesLoaded ? '✓' : 'loading'} | Edges: {progress.edgesLoaded.toLocaleString()} / {progress.edgesTotal.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" data-testid="network-graph" />
    </div>
  );
}
