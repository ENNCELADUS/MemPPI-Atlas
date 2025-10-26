// Cytoscape styling and layout configs for Milestone 6

import type cytoscape from 'cytoscape';

export const cyStyles: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'width': 8,
      'height': 8,
      'label': '',
      'overlay-opacity': 0,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'label': 'data(label)',
      'font-size': 10,
      'color': '#1F2937',
      'text-background-color': '#FFFFFF',
      'text-background-opacity': 0.9,
      'text-background-shape': 'roundrectangle',
      'text-background-padding': 2,
      'border-width': 1,
      'border-color': '#64748B',
      'width': 10,
      'height': 10,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 'mapData(fusionPredProb, 0, 1, 0.5, 1.5)',
      'line-color': 'data(color)',
      'curve-style': 'straight',
      'opacity': 0.35,
      'line-cap': 'round',
      'target-arrow-shape': 'none',
      'source-arrow-shape': 'none',
    },
  },
];

export const fcoseLayout: cytoscape.LayoutOptions = {
  name: 'fcose',
  quality: 'draft',
  randomize: false,
  animate: false,
  nodeDimensionsIncludeLabels: false,
  fit: true,
  padding: 30,
  nodeRepulsion: 6500,
  idealEdgeLength: 45,
  gravity: 0.35,
  numIter: 1200,
};

export const rendererOptions: cytoscape.CytoscapeOptions['renderer'] = {
  name: 'canvas',
};
