import React from "react";
import { render, screen } from "@testing-library/react";
import DataTable from "@/components/DataTable";

const columns = [
  { key: "id", label: "ID" },
  { key: "value", label: "Value" },
];

describe("DataTable", () => {
  it("renders up to 10 rows and preserves empty values", () => {
    const data = Array.from({ length: 12 }, (_, index) => ({
      id: `row-${index + 1}`,
      value: index === 2 ? null : `value-${index + 1}`,
    }));

    const { container, getByText } = render(
      <DataTable caption="Test Table" columns={columns} data={data} />
    );

    expect(getByText("Test Table")).toBeInTheDocument();

    const renderedRows = container.querySelectorAll("tbody tr");
    expect(renderedRows).toHaveLength(10);
    expect(getByText("row-1")).toBeInTheDocument();
    expect(getByText("value-1")).toBeInTheDocument();

    // Ensure null is rendered as empty string (cell exists but without text)
    const thirdRowCells = renderedRows[2].querySelectorAll("td");
    expect(thirdRowCells[1].textContent).toBe("");
  });

  it("renders column-level custom cells while keeping the raw value in data", () => {
    render(
      <DataTable
        caption="Edge Information"
        columns={[
          { key: "edge", label: "Edge" },
          {
            key: "structureStatus",
            label: "Structure",
            render: (row) =>
              row.structureModelId ? (
                <a href={`/structures/${row.structureModelId}`}>View model</a>
              ) : (
                <span>-</span>
              ),
          },
        ]}
        data={[
          {
            edge: "P12345_Q67890",
            structureStatus: "Available",
            structureModelId: "p12345-q67890",
          },
        ]}
      />
    );

    expect(screen.getByText("P12345_Q67890")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View model" })).toHaveAttribute(
      "href",
      "/structures/p12345-q67890"
    );
  });
});
