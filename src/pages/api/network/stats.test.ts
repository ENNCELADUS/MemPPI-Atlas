/**
 * Unit tests for /api/network/stats endpoint
 * Tests aggregate statistics calculation and error handling
 */

import { createMocks } from 'node-mocks-http';
import handler from './stats';
import { supabase } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('/api/network/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with correct stats structure', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              // First call: count nodes
              return Promise.resolve({ count: 100, error: null });
            } else {
              // Second call: fetch families
              return Promise.resolve({
                data: [
                  { family: 'TM' },
                  { family: 'TM' },
                  { family: 'TF' },
                ],
                error: null,
              });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            const selectResult = Promise.resolve({ count: opts?.count === 'exact' ? 500 : 500, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 50, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 300, error: null }),
              then: selectResult.then.bind(selectResult),
            };
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
    
    expect(data).toHaveProperty('totalNodes');
    expect(data).toHaveProperty('totalEdges');
    expect(data).toHaveProperty('familyCounts');
    expect(data).toHaveProperty('enrichedEdgeCount');
    expect(data).toHaveProperty('predictedEdgeCount');
    
    expect(typeof data.totalNodes).toBe('number');
    expect(typeof data.totalEdges).toBe('number');
    expect(typeof data.familyCounts).toBe('object');
    expect(typeof data.enrichedEdgeCount).toBe('number');
    expect(typeof data.predictedEdgeCount).toBe('number');
  });

  it('should correctly calculate family counts with multiple families', async () => {
    const mockFamilies = [
      { family: 'TM' },
      { family: 'TM' },
      { family: 'TM' },
      { family: 'TF' },
      { family: 'TF' },
      { family: 'TM(IC)' },
      { family: 'Other' },
    ];

    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 7, error: null });
            } else {
              return Promise.resolve({ data: mockFamilies, error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 100, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 10, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 80, error: null }),
              then: selectResult.then.bind(selectResult),
            };
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    expect(data.familyCounts).toEqual({
      'TM': 3,
      'TF': 2,
      'TM(IC)': 1,
      'Other': 1,
    });
  });

  it('should exclude null and empty family values from counts', async () => {
    const mockFamilies = [
      { family: 'TM' },
      { family: 'TM' },
      { family: null },
      { family: '' },
      { family: '   ' }, // whitespace only
      { family: 'TF' },
    ];

    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 6, error: null });
            } else {
              return Promise.resolve({ data: mockFamilies, error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 100, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 10, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 80, error: null }),
              then: selectResult.then.bind(selectResult),
            };
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    // Only TM and TF should be counted
    expect(data.familyCounts).toEqual({
      'TM': 2,
      'TF': 1,
    });
  });

  it('should correctly count enriched edges (non-null enriched_tissue)', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({ data: [{ family: 'TM' }], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 1000, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 250, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 800, error: null }),
              then: selectResult.then.bind(selectResult),
            };
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    expect(data.enrichedEdgeCount).toBe(250);
    expect(data.totalEdges).toBe(1000);
  });

  it('should correctly count predicted edges', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({ data: [{ family: 'TM' }], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 1000, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 250, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 750, error: null }),
              then: selectResult.then.bind(selectResult),
            };
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    expect(data.predictedEdgeCount).toBe(750);
  });

  it('should return 500 on database error when counting nodes', async () => {
    const mockFrom = supabase.from as jest.Mock;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockResolvedValue({
            count: null,
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
    expect(data.error).toBe('Failed to count nodes');
  });

  it('should return 500 on database error when counting edges', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({ data: [{ family: 'TM' }], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({
            count: null,
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
    expect(data.error).toBe('Failed to count edges');
  });

  it('should return 500 on database error when fetching families', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({
                data: null,
                error: new Error('Database connection failed'),
              });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockResolvedValue({ count: 500, error: null }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to fetch family data');
  });

  it('should return 500 on database error when counting enriched edges', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({ data: [{ family: 'TM' }], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 500, error: null });
            return {
              not: jest.fn().mockResolvedValue({
                count: null,
                error: new Error('Database connection failed'),
              }),
              eq: jest.fn().mockResolvedValue({ count: 400, error: null }),
              then: selectResult.then.bind(selectResult),
            };
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
    expect(data.error).toBe('Failed to count enriched edges');
  });

  it('should return 500 on database error when counting predicted edges', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 100, error: null });
            } else {
              return Promise.resolve({ data: [{ family: 'TM' }], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 500, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 50, error: null }),
              eq: jest.fn().mockResolvedValue({
                count: null,
                error: new Error('Database connection failed'),
              }),
              then: selectResult.then.bind(selectResult),
            };
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
    expect(data.error).toBe('Failed to count predicted edges');
  });

  it('should handle empty family data gracefully', async () => {
    const mockFrom = supabase.from as jest.Mock;
    
    mockFrom.mockImplementation((table: string) => {
      if (table === 'nodes') {
        return {
          select: jest.fn().mockImplementation((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return Promise.resolve({ count: 0, error: null });
            } else {
              return Promise.resolve({ data: [], error: null });
            }
          }),
        };
      }
      if (table === 'edges') {
        return {
          select: jest.fn().mockImplementation(() => {
            const selectResult = Promise.resolve({ count: 0, error: null });
            return {
              not: jest.fn().mockResolvedValue({ count: 0, error: null }),
              eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
              then: selectResult.then.bind(selectResult),
            };
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    
    expect(data.familyCounts).toEqual({});
    expect(data.totalNodes).toBe(0);
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });
});
