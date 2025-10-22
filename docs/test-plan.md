# Test Plan

This document outlines the testing strategy for the MemPPI-Atlas web application, following the Product Vision requirements.

---

## Testing Philosophy

- **Write tests for critical paths:** API routes, data transformations, graph rendering
- **Mock external dependencies:** Supabase, Cytoscape.js rendering
- **Co-locate tests with source:** `Component.test.tsx` next to `Component.tsx`
- **Test user behavior, not implementation:** Focus on what users see and interact with

---

## Test Frameworks & Tools

- **Unit & Integration Tests:** Jest
- **Component Tests:** React Testing Library (@testing-library/react)
- **API Tests:** Jest with mock Supabase client
- **E2E Tests:** Playwright (optional for MVP, recommended for production)
- **Coverage Tool:** Jest built-in coverage (target: >80% for critical paths)

---

## Unit Tests

### 1. Utility Functions (`/lib`)

#### `lib/graphUtils.ts`
- **Test:** Transform Supabase node data to Cytoscape.js format
  - Input: Array of node objects from API
  - Output: Cytoscape.js node array with `{ data: { id, label, ... } }`
  - Edge cases: Empty array, missing fields, null values

- **Test:** Transform edge data to Cytoscape.js format
  - Input: Array of edge objects from API
  - Output: Cytoscape.js edge array with `{ data: { id, source, target, ... } }`
  - Edge cases: Self-loops, duplicate edges

- **Test:** Parse backslash-delimited tissue strings
  - Input: `"Brain\\Kidney\\Liver"`
  - Output: `["Brain", "Kidney", "Liver"]`
  - Edge cases: Empty string, single tissue, `NA` value

- **Test:** Calculate network statistics
  - Input: Array of nodes and edges
  - Output: `{ totalNodes, totalEdges, familyCounts, ... }`
  - Edge cases: Empty network, nodes with no edges

**File:** `lib/graphUtils.test.ts`

```typescript
describe('graphUtils', () => {
  describe('transformNodesToCytoscape', () => {
    it('should transform API nodes to Cytoscape format', () => {
      // Test implementation
    });
    
    it('should handle empty array', () => {
      // Test implementation
    });
  });
});
```

---

### 2. Cytoscape Configuration (`lib/cytoscape-config.ts`)

- **Test:** Node style based on family
  - Input: Node with `family: "TM"`
  - Output: Style object with correct color
  
- **Test:** Edge style based on enrichment
  - Input: Edge with `enrichedTissue: "Brain"`
  - Output: Red color, width based on probability

- **Test:** Layout configuration for global network
  - Output: fcose layout with correct parameters

**File:** `lib/cytoscape-config.test.ts`

---

## Integration Tests (API Routes)

Mock Supabase client using `@supabase/supabase-js` manual mocks.

### 1. `/api/network`

- **Test:** Returns all nodes and edges
  - Mock Supabase to return sample data
  - Assert response has `nodes` and `edges` arrays
  - Assert HTTP 200 status

- **Test:** Handles database errors gracefully
  - Mock Supabase to throw error
  - Assert HTTP 500 and error message

**File:** `pages/api/network.test.ts`

```typescript
import { createMocks } from 'node-mocks-http';
import handler from './network';

jest.mock('../../lib/supabase');

describe('/api/network', () => {
  it('should return nodes and edges', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('edges');
  });
});
```

---

### 2. `/api/network/stats`

- **Test:** Returns correct statistics
  - Mock Supabase to return 100 nodes, 250 edges
  - Assert `totalNodes: 100`, `totalEdges: 250`
  
- **Test:** Calculates family counts correctly
  - Mock nodes with families: 50 TM, 30 TF, 20 Other
  - Assert `familyCounts: { TM: 50, TF: 30, Other: 20 }`

**File:** `pages/api/network/stats.test.ts`

---

### 3. `/api/subgraph`

- **Test:** Returns subgraph for single protein
  - Mock Supabase to return protein + 3 neighbors
  - Assert response has 4 nodes, 3 edges
  
- **Test:** Returns subgraph for multiple proteins
  - Query: `P12345,Q67890`
  - Assert both are marked `isQuery: true`
  
- **Test:** Returns 404 if protein not found
  - Query: `INVALID123`
  - Assert HTTP 404 and error message
  
- **Test:** Returns 400 if proteins parameter missing
  - No query params
  - Assert HTTP 400

**File:** `pages/api/subgraph.test.ts`

---

### 4. `/api/nodes`

- **Test:** Returns paginated results
  - Query: `limit=10&offset=0`
  - Assert 10 results returned
  
- **Test:** Filters by family
  - Query: `family=TM`
  - Assert all results have `family: "TM"`
  
- **Test:** Search by gene name
  - Query: `search=BRCA`
  - Assert results contain "BRCA" in protein, entry_name, or gene_names

**File:** `pages/api/nodes.test.ts`

---

### 5. `/api/edges`

- **Test:** Filters by minimum probability
  - Query: `minProbability=0.8`
  - Assert all edges have `fusionPredProb >= 0.8`
  
- **Test:** Filters by protein
  - Query: `protein=P12345`
  - Assert all edges have `protein1: "P12345"` OR `protein2: "P12345"`

**File:** `pages/api/edges.test.ts`

---

## Component Tests

Use React Testing Library to test component rendering and user interactions. Mock Cytoscape.js rendering.

### 1. `components/NetworkGraph.tsx`

- **Test:** Renders Cytoscape container
  - Render with sample nodes/edges
  - Assert canvas element exists
  
- **Test:** Shows loading state
  - Render with `isLoading={true}`
  - Assert loading spinner displayed
  
- **Test:** Handles empty network
  - Render with empty nodes/edges
  - Assert "No data" message displayed

**File:** `components/NetworkGraph.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import NetworkGraph from './NetworkGraph';

jest.mock('cytoscape', () => jest.fn(() => ({
  layout: jest.fn(() => ({ run: jest.fn() })),
  destroy: jest.fn(),
})));

describe('NetworkGraph', () => {
  it('renders without crashing', () => {
    render(<NetworkGraph nodes={[]} edges={[]} />);
    expect(screen.getByTestId('network-graph')).toBeInTheDocument();
  });
});
```

---

### 2. `components/SearchBar.tsx`

- **Test:** Accepts user input
  - Type "P12345" into input
  - Assert input value is "P12345"
  
- **Test:** Submits search on Enter key
  - Type "P12345" and press Enter
  - Assert navigation to `/subgraph?proteins=P12345`
  
- **Test:** Handles comma-separated proteins
  - Type "P12345,Q67890"
  - Assert navigation includes both proteins

**File:** `components/SearchBar.test.tsx`

---

### 3. `components/DataTable.tsx`

- **Test:** Renders table with data
  - Pass array of 10 rows
  - Assert 10 rows displayed
  
- **Test:** Displays column headers
  - Pass columns: `['protein', 'family']`
  - Assert headers rendered correctly
  
- **Test:** Handles empty data
  - Pass empty array
  - Assert "No results" message

**File:** `components/DataTable.test.tsx`

---

### 4. `components/Sidebar.tsx`

- **Test:** Displays statistics
  - Pass stats: `{ totalNodes: 100, totalEdges: 250 }`
  - Assert "100" and "250" displayed
  
- **Test:** Shows family distribution
  - Pass `familyCounts: { TM: 50, TF: 30 }`
  - Assert "TM: 50" and "TF: 30" displayed

**File:** `components/Sidebar.test.tsx`

---

### 5. `components/Legend.tsx`

- **Test:** Renders color swatches
  - Assert TM family has blue color swatch
  - Assert TF family has green color swatch
  
- **Test:** Displays enrichment indicator
  - Assert "Red = Enriched" label exists

**File:** `components/Legend.test.tsx`

---

## Page Tests

### 1. `pages/index.tsx` (Global Network View)

- **Test:** Fetches and displays network data
  - Mock `/api/network` and `/api/network/stats`
  - Assert NetworkGraph receives data
  - Assert Sidebar receives stats
  
- **Test:** Renders search bar
  - Assert SearchBar component exists at bottom

**File:** `pages/index.test.tsx`

---

### 2. `pages/subgraph.tsx` (Subgraph View)

- **Test:** Fetches subgraph based on URL params
  - URL: `/subgraph?proteins=P12345`
  - Mock `/api/subgraph`
  - Assert SubgraphView receives data
  
- **Test:** Displays data tables
  - Mock API with 5 nodes, 3 edges
  - Assert node table has 5 rows
  - Assert edge table has 3 rows
  
- **Test:** Shows error for invalid protein
  - Mock 404 response
  - Assert error message displayed

**File:** `pages/subgraph.test.tsx`

---

## E2E Tests (Playwright - Optional for MVP)

End-to-end tests simulate real user workflows in a browser.

### Setup
```bash
npm install -D @playwright/test
npx playwright install
```

### Test Scenarios

#### 1. Global Network Navigation
```typescript
test('user can view global network', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="network-graph"]')).toBeVisible();
  await expect(page.locator('text=Total Nodes')).toBeVisible();
});
```

#### 2. Search Workflow
```typescript
test('user can search for protein and view subgraph', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder*="Search"]', 'P12345');
  await page.press('input[placeholder*="Search"]', 'Enter');
  
  await expect(page).toHaveURL('/subgraph?proteins=P12345');
  await expect(page.locator('[data-testid="subgraph-view"]')).toBeVisible();
  await expect(page.locator('table')).toHaveCount(2); // Node and edge tables
});
```

#### 3. Multi-Protein Search
```typescript
test('user can search for multiple proteins', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder*="Search"]', 'P12345,Q67890');
  await page.press('input[placeholder*="Search"]', 'Enter');
  
  await expect(page).toHaveURL('/subgraph?proteins=P12345,Q67890');
  // Assert both proteins appear in subgraph
});
```

**File:** `e2e/navigation.spec.ts`

---

## Mock Strategy

### Supabase Client Mock

Create a manual mock for `@supabase/supabase-js`:

**File:** `__mocks__/@supabase/supabase-js.ts`
```typescript
export const createClient = jest.fn(() => ({
  from: jest.fn((table) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    // Add more methods as needed
  })),
}));
```

### Cytoscape.js Mock

**File:** `__mocks__/cytoscape.ts`
```typescript
export default jest.fn(() => ({
  add: jest.fn(),
  remove: jest.fn(),
  layout: jest.fn(() => ({ run: jest.fn() })),
  on: jest.fn(),
  off: jest.fn(),
  destroy: jest.fn(),
}));
```

---

## Coverage Goals

- **API Routes:** >90% (critical for data correctness)
- **Components:** >80% (focus on user-facing logic)
- **Utilities:** >85% (data transformations must be reliable)
- **Pages:** >70% (integration-level coverage)

### Run Coverage
```bash
npm test -- --coverage
```

---

## Continuous Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint
```

---

## Test Execution Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- NetworkGraph.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run E2E tests (if implemented)
npx playwright test
```

---

## Testing Best Practices

1. **Arrange, Act, Assert:** Structure tests clearly
2. **One assertion per test:** Keep tests focused
3. **Descriptive test names:** `it('should return 404 when protein not found')`
4. **Mock external dependencies:** Don't hit real database or APIs
5. **Test user behavior:** Use `screen.getByRole()` over `getByTestId()` when possible
6. **Clean up:** Ensure tests don't leak state between runs
7. **Avoid testing implementation details:** Test what users see, not internal state

---

## Future Enhancements

- **Visual regression testing:** Percy or Chromatic for UI screenshots
- **Performance testing:** Lighthouse CI for load times
- **Accessibility testing:** axe-core integration
- **Load testing:** Artillery or k6 for API stress tests
