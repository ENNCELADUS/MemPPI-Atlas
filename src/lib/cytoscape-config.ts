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
    selector: 'node[?isQuery]',
    style: {
      'background-color': '#1E3A8A',
      'width': 12,
      'height': 12,
      'label': 'data(id)',
      'font-size': 11,
      'color': '#0F172A',
      'text-background-color': '#FFFFFF',
      'text-background-opacity': 1,
      'text-background-padding': 4,
      'text-background-shape': 'roundrectangle',
      'text-outline-width': 2,
      'text-outline-color': '#FFFFFF',
      'text-wrap': 'none',
      'text-margin-y': -26,
      'text-halign': 'center',
      'text-valign': 'top',
      'border-width': 1.5,
      'border-color': '#1E40AF',
      'z-index-compare': 'manual',
      'z-index': 1000,
    },
  },
  {
    selector: 'node[?isQuery]:selected',
    style: {
      'label': 'data(id)',
      'font-size': 12,
      'border-width': 2,
      'border-color': '#1D4ED8',
      'width': 14,
      'height': 14,
      'z-index': 1001,
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

export const coseLayout: cytoscape.LayoutOptions = {
  name: 'cose',
  animate: false,
  nodeDimensionsIncludeLabels: false,
  fit: true,
  padding: 50,
  nodeRepulsion: 8000,
  idealEdgeLength: 80,
  gravity: 0.5,
  numIter: 1000,
  randomize: false,
};

export const rendererOptions: cytoscape.CytoscapeOptions['renderer'] = {
  name: 'canvas',
};
