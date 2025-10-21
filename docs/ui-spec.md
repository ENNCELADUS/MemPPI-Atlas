# UI Specification (Website)

## Pages
- Home: overview and entry points to search and browse
- Search: search box, result list with pagination
- Protein Detail: header summary (name, accession, family), tissues, interactions table
- Interaction Detail (optional): edge-level view

## Components
- SearchBar (debounced input)
- ProteinCard / ProteinSummary
- InteractionsTable (sortable, paginated)
- FiltersPanel (tissue selector, min probability slider)
- DownloadButton (respects current filters)

## States
- Loading skeletons for tables and cards
- Empty state (no results)
- Error banners for network/API errors

## Design System
- Tokens: colors, typography, spacing (TBD)
- Accessibility: keyboard navigation, aria labels for tables and filters
- Responsive: tables collapse/scroll on mobile
