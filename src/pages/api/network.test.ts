/**
 * Unit tests for /api/network endpoint
 * Tests data fetching, transformation, and error handling
 */

import { createMocks } from 'node-mocks-http';
import handler from './network';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('/api/network', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with nodes and edges arrays', async () => {
    // Mock database responses
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: 'PROT1_HUMAN',
        description: 'Test protein 1',
        gene_names: 'GENE1 ALIAS1',
        family: 'TM',
        expression_tissue: 'Brain\\Kidney\\Liver',
      },
      {
        protein: 'Q67890',
        entry_name: 'PROT2_HUMAN',
        description: 'Test protein 2',
        gene_names: 'GENE2',
        family: 'TF',
        expression_tissue: 'Brain',
      },
    ];

    const mockEdges = [
      {
        edge: 'P12345_Q67890',
        protein1: 'P12345',
        protein2: 'Q67890',
        fusion_pred_prob: 0.95,
        enriched_tissue: 'Brain',
        tissue_enriched_confidence: 'high confidence',
        positive_type: 'prediction',
      },
    ];

    // Mock Supabase client behavior
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockEdges,
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('edges');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
  });

  it('should transform snake_case to camelCase correctly', async () => {
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: 'PROT1_HUMAN',
        description: 'Test protein',
        gene_names: 'GENE1',
        family: 'TM',
        expression_tissue: 'Brain\\Kidney',
      },
    ];

    const mockEdges = [
      {
        edge: 'P12345_Q67890',
        protein1: 'P12345',
        protein2: 'Q67890',
        fusion_pred_prob: 0.85,
        enriched_tissue: 'Brain',
        tissue_enriched_confidence: 'high confidence',
        positive_type: 'prediction',
      },
    ];

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockEdges,
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    // Check node transformation
    expect(data.nodes[0]).toMatchObject({
      id: 'P12345',
      label: 'PROT1_HUMAN',
      geneNames: 'GENE1',
    });

    // Check edge transformation
    expect(data.edges[0]).toMatchObject({
      id: 'P12345_Q67890',
      source: 'P12345',
      target: 'Q67890',
      fusionPredProb: 0.85,
      enrichedTissue: 'Brain',
      tissueEnrichedConfidence: 'high confidence',
      positiveType: 'prediction',
    });
  });

  it('should parse tissue arrays correctly', async () => {
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: 'PROT1_HUMAN',
        description: 'Test protein',
        gene_names: 'GENE1',
        family: 'TM',
        expression_tissue: 'Brain\\Kidney\\Liver',
      },
    ];

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.nodes[0].expressionTissue).toEqual(['Brain', 'Kidney', 'Liver']);
  });

  it('should handle NA tissue values as empty array', async () => {
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: 'PROT1_HUMAN',
        description: 'Test protein',
        gene_names: 'GENE1',
        family: 'TM',
        expression_tissue: 'NA',
      },
    ];

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.nodes[0].expressionTissue).toEqual([]);
  });

  it('should return 500 on database error when fetching nodes', async () => {
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection failed'),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch nodes from database');
  });

  it('should return 500 on database error when fetching edges', async () => {
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: 'PROT1_HUMAN',
        description: 'Test protein',
        gene_names: 'GENE1',
        family: 'TM',
        expression_tissue: 'Brain',
      },
    ];

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection failed'),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch edges from database');
  });

  it('should handle null values in node fields gracefully', async () => {
    const mockNodes = [
      {
        protein: 'P12345',
        entry_name: null,
        description: null,
        gene_names: null,
        family: null,
        expression_tissue: null,
      },
    ];

    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            data: mockNodes,
            error: null,
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.nodes[0]).toMatchObject({
      id: 'P12345',
      label: 'P12345', // Falls back to protein ID when entry_name is null
      description: '',
      geneNames: '',
      family: '',
      expressionTissue: [],
    });
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });
});

