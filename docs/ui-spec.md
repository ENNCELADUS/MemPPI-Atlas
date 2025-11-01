# UI Specification

This document defines the design system, reusable components, and page layouts for the MemPPI-Atlas web application, based on the Product Vision.

---

## Design System

### Color Palette

#### Base Colors

- **Primary:** `#2563EB` (Blue) - Interactive elements, buttons, links
- **Background:** `#F8FAFC` (Light Gray) - Page background
- **Surface:** `#FFFFFF` (White) - Cards, sidebars, tables
- **Border:** `#E5E7EB` (Light Gray) - Dividers, table borders

#### Text Colors

- **Heading:** `#1F2937` (Dark Gray) - Titles, headers
- **Body:** `#4B5563` (Medium Gray) - Body text, labels
- **Muted:** `#9CA3AF` (Light Medium Gray) - Secondary text, placeholders

#### Data Visualization (Protein Families)

- **TM (Transmembrane):** `#3B82F6` (Blue)
- **TF (Transcription Factor):** `#10B981` (Green)
- **Kinase:** `#F59E0B` (Amber)
- **Receptor:** `#8B5CF6` (Purple)
- **Other/Unknown:** `#6B7280` (Gray)

#### Network Enrichment

- **Enriched Edge:** `#EF4444` (Red) - Tissue-enriched interactions
- **Non-Enriched Edge:** `#9CA3AF` (Gray) - Standard interactions
- **Experimental Positive:** `#059669` (Dark Green) - Validated interactions

---

### Typography

- **Font Family:** `Inter` (Google Fonts)
- **Fallback:** `system-ui, -apple-system, sans-serif`

#### Sizes (Tailwind Classes)

- **Headings:**
  - H1: `text-3xl font-bold` (30px)
  - H2: `text-2xl font-semibold` (24px)
  - H3: `text-xl font-semibold` (20px)
- **Body:**
  - Large: `text-lg` (18px)
  - Regular: `text-base` (16px)
  - Small: `text-sm` (14px)
  - Tiny: `text-xs` (12px)

---

### Spacing & Layout

- **Grid System:** 8px base unit
- **Container Max Width:** `1440px`
- **Common Spacing:**
  - Extra small: `gap-2` (8px)
  - Small: `gap-4` (16px)
  - Medium: `gap-6` (24px)
  - Large: `gap-8` (32px)

---

## Reusable Components

### 1. Site Header

**Purpose:** Branding and navigation bar at the top of every page.

**Design:**

- White background with subtle bottom border
- Logo (SVG network icon) + "MemPPI-Atlas" title on the left
- Height: 64px
- Horizontal padding: 24px

**Props:**

```typescript
interface HeaderProps {
  title?: string; // Default: "MemPPI-Atlas"
}
```

**Tailwind Implementation:**

```jsx
<header className="bg-white border-b border-gray-200 px-6 py-4">
  <div className="flex items-center gap-3">
    {/* Logo SVG */}
    <NetworkIcon className="w-8 h-8 text-blue-600" />
    <h1 className="text-2xl font-bold text-gray-900">MemPPI-Atlas</h1>
  </div>
</header>
```

---

### 2. Statistic Card

**Purpose:** Display individual metrics in the sidebar (e.g., "Total Nodes: 1,845").

**Design:**

- White background, rounded corners (`rounded-lg`)
- Light border
- Padding: 16px
- Title (muted gray) + large bold number (dark gray)

**Props:**

```typescript
interface StatCardProps {
  label: string; // e.g., "Total Nodes"
  value: number; // e.g., 1845
  color?: string; // Optional accent color for value
}
```

**Tailwind Implementation:**

```jsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <p className="text-sm text-gray-500 mb-1">{label}</p>
  <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
</div>
```

---

### 3. Search Bar

**Purpose:** Fixed search input at the bottom of Page 1 for protein queries.

**Design:**

- Fixed to bottom center of viewport
- Wide input field (max-width: 600px)
- Rounded corners, light border
- Placeholder: "Search by protein ID, e.g., P12345 or P12345,Q67890"
- Blue search button on the right
- Subtle shadow for elevation

**Props:**

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Tailwind Implementation:**

```jsx
<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
  <div className="bg-white rounded-full shadow-lg border border-gray-300 flex items-center px-4 py-3 w-[600px]">
    <input
      type="text"
      placeholder="Search by protein ID, e.g., P12345 or P12345,Q67890"
      className="flex-1 outline-none text-gray-700"
    />
    <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
      Search
    </button>
  </div>
</div>
```

---

### 4. Data Table

**Purpose:** Display tabular data for nodes and edges on Page 2.

**Design:**

- Header row: light gray background, bold text, centered
- Zebra striping: alternating row colors for readability
- Light borders around table and between rows
- Responsive: horizontal scroll on small screens
- Show "Top 10" results

**Props:**

```typescript
interface DataTableProps {
  columns: { key: string; label: string }[];
  data: Record<string, any>[];
  caption?: string; // e.g., "Node Information (Top 10)"
}
```

**Tailwind Implementation:**

```jsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table className="w-full">
    <caption className="text-left px-4 py-3 text-lg font-semibold text-gray-900 bg-gray-50">
      {caption}
    </caption>
    <thead className="bg-gray-100">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.slice(0, 10).map((row, idx) => (
        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
              {row[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 5. Legend

**Purpose:** Explain color-coding for protein families and enrichment status.

**Design:**

- Small card with title "Legend"
- Vertical list of items
- Each item: colored circle + label
- Padding: 16px
- White background, rounded corners

**Props:**

```typescript
interface LegendItem {
  color: string;
  label: string;
}

interface LegendProps {
  items: LegendItem[];
}
```

**Tailwind Implementation:**

```jsx
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
  <div className="space-y-2">
    {items.map((item, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm text-gray-700">{item.label}</span>
      </div>
    ))}
  </div>
</div>
```

---

### 6. Network Graph Container

**Purpose:** Wrapper for Cytoscape.js visualization with loading states.

**Design:**

- Full width/height container
- Light gray background when loading
- Loading spinner centered
- Border for visual separation

**Props:**

```typescript
interface NetworkGraphProps {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
  isLoading?: boolean;
  layoutName?: "fcose" | "cose" | "circle";
}
```

**Tailwind Implementation:**

```jsx
<div className="relative w-full h-full bg-gray-50 rounded-lg border border-gray-200">
  {isLoading ? (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  ) : (
    <div ref={cyRef} className="w-full h-full" data-testid="network-graph" />
  )}
</div>
```

---

### 7. Sidebar

**Purpose:** Statistics panel on the left side of Page 1.

**Design:**

- Fixed width: 320px
- White background
- Vertical stack of StatCards
- Padding: 24px
- Sticky positioning

**Props:**

```typescript
interface SidebarProps {
  stats: {
    totalNodes: number;
    totalEdges: number;
    familyCounts: Record<string, number>;
    enrichedEdgeCount: number;
  };
}
```

**Tailwind Implementation:**

```jsx
<aside className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 sticky top-0 h-screen overflow-y-auto">
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
    {Object.entries(stats.familyCounts).map(([family, count]) => (
      <div
        key={family}
        className="flex justify-between text-sm text-gray-700 mb-2"
      >
        <span>{family}</span>
        <span className="font-semibold">{count}</span>
      </div>
    ))}
  </div>
</aside>
```

---

## Page Layouts

### Page 1: Global Network View

**URL:** `/`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo + Title)                                  │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Network Visualization Area                 │
│ (320px)  │  (Cytoscape.js full network)                │
│          │                                              │
│ - Stats  │                                              │
│ - Legend │                                              │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│            Search Bar (fixed bottom center)             │
└─────────────────────────────────────────────────────────┘
```

**Components Used:**

- `Header`
- `Sidebar` with `StatCard` components
- `Legend`
- `NetworkGraph` (Cytoscape.js)
- `SearchBar` (fixed position)

**Responsive Behavior:**

- Desktop (>1024px): Two-column layout as shown
- Tablet (768px-1024px): Sidebar collapses to top, network below
- Mobile (<768px): Vertical stack, search bar full width

**Tailwind Implementation:**

```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <div className="flex">
    <Sidebar stats={networkStats} />
    <main className="flex-1 p-6">
      <div className="h-[calc(100vh-64px-48px)]">
        <NetworkGraph nodes={nodes} edges={edges} layoutName="fcose" />
      </div>
    </main>
  </div>
  <SearchBar onSearch={handleSearch} />
</div>
```

---

### Page 2: Subgraph View

**URL:** `/subgraph?proteins=P12345,Q67890`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo + Title)                                  │
├─────────────────────────────────────────────────────────┤
│  Page Title: "Subgraph for Query: P12345, Q67890"      │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│  Subgraph Visualization      │  Legend                  │
│  (Cytoscape.js focused)      │                          │
│                              │                          │
├──────────────────────────────┴──────────────────────────┤
│  Node Information (Top 10)                              │
│  [Table with columns: protein, entry_name, ...]         │
├─────────────────────────────────────────────────────────┤
│  Edge Information (Top 10)                              │
│  [Table with columns: edge, protein1, protein2, ...]    │
└─────────────────────────────────────────────────────────┘
```

**Components Used:**

- `Header`
- `NetworkGraph` (subgraph with focused layout)
- `Legend`
- `DataTable` (nodes)
- `DataTable` (edges)

**Responsive Behavior:**

- Desktop: Visualization + legend side-by-side
- Mobile: Vertical stack (visualization, legend, tables)

**Tailwind Implementation:**

```jsx
<div className="min-h-screen bg-gray-50">
  <Header />
  <main className="container mx-auto px-6 py-8 space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">
      Subgraph for Query: {queryProteins.join(", ")}
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 h-[500px]">
        <NetworkGraph
          nodes={subgraphNodes}
          edges={subgraphEdges}
          layoutName="cose"
        />
      </div>
      <div>
        <Legend items={legendItems} />
      </div>
    </div>

    <DataTable
      caption="Node Information (Top 10)"
      columns={nodeColumns}
      data={nodes}
    />

    <DataTable
      caption="Edge Information (Top 10)"
      columns={edgeColumns}
      data={edges}
    />
  </main>
</div>
```

---

## Cytoscape.js Styling

### Node Styles

```javascript
{
  selector: 'node',
  style: {
    'background-color': 'data(color)', // Determined by family
    'label': 'data(label)',
    'width': 30,
    'height': 30,
    'font-size': 12,
    'text-valign': 'bottom',
    'text-halign': 'center',
    'text-margin-y': 5,
    'color': '#1F2937',
    'overlay-opacity': 0
  }
}

// Query nodes (highlighted)
{
  selector: 'node[isQuery]',
  style: {
    'border-width': 3,
    'border-color': '#EF4444',
    'width': 40,
    'height': 40
  }
}

// Family-specific colors
{
  selector: 'node[family="TM"]',
  style: { 'background-color': '#3B82F6' }
}
{
  selector: 'node[family="TF"]',
  style: { 'background-color': '#10B981' }
}
```

### Edge Styles

```javascript
{
  selector: 'edge',
  style: {
    'width': 'mapData(fusionPredProb, 0, 1, 1, 5)', // 1-5px based on probability
    'line-color': '#9CA3AF', // Default gray
    'target-arrow-shape': 'none',
    'curve-style': 'bezier',
    'opacity': 0.6
  }
}

// Enriched edges (red)
{
  selector: 'edge[enrichedTissue]',
  style: {
    'line-color': '#EF4444',
    'opacity': 0.8
  }
}

// Experimental positives (green)
{
  selector: 'edge[positiveType="experimental"]',
  style: {
    'line-color': '#059669',
    'width': 4,
    'opacity': 1
  }
}
```

### Layout Configurations

#### Global Network (Page 1)

```javascript
{
  name: 'fcose',
  quality: 'default',
  randomize: false,
  animate: false,
  fit: true,
  padding: 30,
  nodeDimensionsIncludeLabels: true,
  idealEdgeLength: 100,
  nodeRepulsion: 4500
}
```

#### Subgraph (Page 2)

```javascript
{
  name: 'cose',
  animate: true,
  animationDuration: 1000,
  fit: true,
  padding: 50,
  nodeRepulsion: 800000,
  idealEdgeLength: 80,
  edgeElasticity: 100
}
```

---

## Interaction Patterns

### Global Network (Page 1)

- **Zoom:** Mouse wheel or pinch gesture
- **Pan:** Click and drag on background
- **Node Click:** Show tooltip with protein name and family
- **Node Hover:** Highlight node and connected edges
- **Search Submit:** Navigate to `/subgraph?proteins=...`

### Subgraph (Page 2)

- **Node Click:** Highlight row in node table
- **Edge Click:** Highlight row in edge table
- **Table Row Click:** Highlight corresponding node/edge in graph

---

## Accessibility

- **Color Contrast:** All text meets WCAG AA standards (4.5:1 ratio)
- **Keyboard Navigation:** Tab through search bar, buttons, table rows
- **Screen Readers:**
  - ARIA labels on graph containers
  - Table headers with proper scope
  - Alt text for logo
- **Focus Indicators:** Visible outline on all interactive elements

---

## Responsive Breakpoints

- **Mobile:** `< 768px` (sm)
- **Tablet:** `768px - 1024px` (md)
- **Desktop:** `> 1024px` (lg)
- **Large Desktop:** `> 1440px` (xl)

### Responsive Adjustments

- **Mobile:** Single column, stacked components, search bar full width
- **Tablet:** Sidebar above main content, reduced graph height
- **Desktop:** Two-column layout as designed

---

## Animation & Transitions

- **Button Hover:** `transition-colors duration-200`
- **Graph Layout:** Animate layout changes over 1 second
- **Loading States:** Spinner with `animate-spin`
- **Table Row Hover:** Light background highlight with `hover:bg-gray-100`

---

## Future UI Enhancements (Out of Scope for MVP)

- Dark mode toggle
- Customizable color schemes for families
- Advanced filter UI with sliders and multi-select dropdowns
- Export graph as PNG/SVG button
- Protein detail modal on node click
- Breadcrumb navigation
- Toast notifications for errors/success messages
