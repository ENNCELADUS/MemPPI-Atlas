### UI Development Plan

The goal is to build a clean, intuitive, and data-centric interface. We'll follow these steps:
1.  **Establish a Design System:** Define the core visual identity.
2.  **Build Reusable Components:** Create a library of common UI elements.
3.  **Design Page Layouts:** Assemble the components into cohesive page designs.

You can also search https://21st.dev/community/components; it has a ton of components with their AI prompts, you just copy-paste the prompt, it is great!

---

### 1. The Design System

Sticking to a design system ensures a consistent look and feel across your application.

*   **Color Palette:**
    *   **Primary:** A professional blue for interactive elements (`#2563EB`).
    *   **Background:** A light, neutral gray for the main background (`#F8FAFC`).
    *   **Surface:** White for cards and sidebars (`#FFFFFF`).
    *   **Text (Headings):** Dark gray (`#1F2937`).
    *   **Text (Body):** Medium gray (`#4B5563`).
    *   **Borders:** Light gray (`#E5E7EB`).
    *   **Accent/Data Viz:** A set of distinct colors for protein families and network elements (e.g., red for enriched, green, orange, purple).

*   **Typography:**
    *   **Font:** `Inter` or `Lato`. They are clean, modern, and highly legible for data-heavy applications.
    *   **Headings:** `font-semibold` or `font-bold`.
    *   **Body Text:** `font-normal`.

*   **Spacing:**
    *   Use an 8-point grid system. Set spacing and sizing in multiples of 8px (e.g., `p-4` for 16px padding, `gap-6` for 24px gap). This creates visual rhythm.

---

### 2. Reusable Components (with AI Prompts)

Use a tool like `v0.dev` or browse `21st.dev/community/components` for inspiration. Here are prompts you can copy-paste to generate these components.

#### **a. Site Header**

A simple, clean header with the site title and logo.

**AI Prompt:**
```
Create a responsive site header using Tailwind CSS. On the left, include a simple SVG logo of a network graph and the title "TMP-TMP PPI Networks" in a bold, dark gray font. The header should have a white background with a subtle bottom border. It should have horizontal padding.```

#### **b. Statistic Card**

To display network size numbers in the sidebar.

**AI Prompt:**```
Create a simple statistic card component using Tailwind CSS. It should have a white background, rounded corners, and a light border. Inside, display a title like "Total Nodes" in a medium gray font, and below it, a large, bold number like "1,845". Use a flexbox layout to align the content.
```

#### **c. Search Bar**

The fixed search bar at the bottom of the first page.

**AI Prompt:**
```
Create a search bar component that is fixed to the bottom center of the page. It should be a wide input field with rounded corners and a light gray border. Inside the input field, show placeholder text: "Search by protein ID, e.g., #P12345 or #P12345,#Q67890". To the right of the input, add a primary blue search button with a search icon. The entire component should have a subtle shadow to lift it off the page.
```

#### **d. Data Table**

For displaying node and edge information on the second page.

**AI Prompt:**
```
Create a clean, modern data table using Tailwind CSS. The table should have a header row with a light gray background and bold, centered text. The table rows should have alternating background colors (zebra striping) for readability. Add a light border around the table and between rows. Make the table responsive so it scrolls horizontally on small screens.
```

#### **e. Legend**

For explaining the graph's color-coding.

**AI Prompt:**
```
Create a legend component for a network graph. It should be a small card with a title "Legend". Below the title, list items vertically. Each item should have a colored circle on the left and a text label on the right, like "● TM Family" or "● TF Family". Use a flexbox layout for alignment.
```

---

### 3. Page Layouts (with AI Prompts)

Now, let's assemble the components into full-page layouts.

#### **Page 1: Global Network View**

**Layout Description:**
*   A two-column layout.
*   **Left Sidebar (25% width):** Contains the site header, statistics cards, and the network legend.
*   **Main Content (75% width):** A large area dedicated to the interactive network plot.
*   **Bottom Bar:** The fixed search bar is overlaid at the bottom.

**AI Prompt for Page 1 Layout:**
```
Create a full-page dashboard layout for a bioinformatics tool using Tailwind CSS.
The page should have a main header at the top with a logo and the title "TMP-TMP PPI Networks".
Below the header, the layout should be split into two vertical columns.
The left column should be a fixed-width sidebar (around 25% of the page width). Inside this sidebar, add a section title "Network Statistics" followed by three statistic cards in a vertical stack. The cards should display a title and a number. Below the cards, add a "Legend" card with a list of color-coded items.
The right column (taking the remaining 75% width) is the main content area. Place a large placeholder box here with a light gray background and a label "Interactive Network Visualization Area". This area should fill all available vertical and horizontal space.
Finally, add a search bar component fixed to the bottom center of the viewport.
```

#### **Page 2: Subgraph View**

**Layout Description:**
*   A single-column layout focused on search results.
*   **Header:** The same reusable site header.
*   **Main Content Area:**
    *   A title indicating the search query (e.g., "Results for #P12345").
    *   The subgraph visualization area, with its legend placed beside or below it.
    *   Two data tables stacked vertically: "Node Information (Top 10)" and "Edge Information (Top 10)".

**AI Prompt for Page 2 Layout:**
```
Create a results page layout for a bioinformatics tool using Tailwind CSS.
Start with the same responsive site header component from the main page.
Below the header, in the main content area, add a main heading like "Subgraph for Query: #P12345".
Under the heading, create a section for the graph visualization. This section should contain a large placeholder box for the "Subgraph Visualization" and, to its right, a smaller "Legend" card.
Below this visualization section, add a sub-heading "Node Information (Top 10)" followed by a clean, responsive data table with columns like "Protein", "Description", and "Family".
Finally, add another sub-heading "Edge Information (Top 10)" followed by a similar data table with columns like "Edge", "Protein1", "Protein2", and "Score".
The entire layout should have comfortable padding.
```

### Workflow

1.  **Generate Components:** Use the prompts in `v0.dev` to generate each reusable component first. Tweak the AI's output until it matches your vision.
2.  **Assemble Pages:** Use the page layout prompts. You can even copy the code from your generated components and paste it into the page prompt to ensure consistency.
3.  **Get the Code:** Once you are happy with the visual design, `v0` will provide you with the HTML/CSS or React/Vue code.
4.  **Integrate and Animate:** Integrate this frontend code with your backend data and add interactivity with JavaScript libraries (like Cytoscape.js for the graphs).