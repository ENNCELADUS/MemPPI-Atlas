import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/pages/index";

jest.mock("@/components/Header", () => () => (
  <div data-testid="header">Header</div>
));
jest.mock("@/components/Legend", () => () => (
  <div data-testid="legend">Legend</div>
));
jest.mock("@/components/SearchBar", () => () => (
  <div data-testid="search">Search</div>
));
jest.mock("@/components/NetworkGraph", () => () => (
  <div data-testid="network-graph">Graph</div>
));
jest.mock("@/components/Sidebar", () => ({ stats }: { stats: any }) => (
  <div data-testid="sidebar">Sidebar {stats.totalNodes}</div>
));

const mockFetch = jest.fn();

const createJsonResponse = (data: unknown, ok = true) => ({
  ok,
  status: ok ? 200 : 500,
  statusText: ok ? "OK" : "Internal Error",
  json: async () => data,
});

beforeEach(() => {
  mockFetch.mockReset();
  // @ts-expect-error override fetch for tests
  global.fetch = mockFetch;
});

describe("Home page", () => {
  it("renders sidebar after successful data fetch", async () => {
    mockFetch
      .mockResolvedValueOnce(
        createJsonResponse({
          totalNodes: 10,
          totalEdges: 20,
          familyCounts: {},
          enrichedEdgeCount: 5,
          predictedEdgeCount: 7,
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          nodes: [],
          edges: [],
          meta: { totalNodes: 10, totalEdges: 20, filteredEdges: 0 },
        })
      );

    render(<Home />);

    expect(
      screen.getByText("Loading network statistics...")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("sidebar")).toHaveTextContent("Sidebar 10");
      expect(screen.getByTestId("network-graph")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("shows error message when stats request fails", async () => {
    mockFetch
      .mockResolvedValueOnce(createJsonResponse({}, false))
      .mockResolvedValueOnce(createJsonResponse({ nodes: [], edges: [] }));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
