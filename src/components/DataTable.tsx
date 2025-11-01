interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: Array<Record<string, string | number | null | undefined>>;
  caption: string;
}

export default function DataTable({ columns, data, caption }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <caption className="bg-gray-50 px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-gray-500">
          {caption}
        </caption>
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-700"
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
                <td
                  key={col.key}
                  className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700"
                >
                  {row[col.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
