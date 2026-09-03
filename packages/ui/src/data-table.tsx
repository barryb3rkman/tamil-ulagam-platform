import type { ReactNode } from "react";

import { cx } from "./utils";

export interface DataTableColumn<Row> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: Row) => ReactNode;
  readonly mobileLabel?: string;
  readonly className?: string;
}

export interface DataTableProps<Row> {
  readonly caption: string;
  readonly columns: readonly DataTableColumn<Row>[];
  readonly rows: readonly Row[];
  readonly rowKey: (row: Row) => string;
  readonly className?: string;
}

export function DataTable<Row>({
  caption,
  className,
  columns,
  rowKey,
  rows,
}: DataTableProps<Row>) {
  return (
    <div
      className={cx(
        "rounded-card border-global-navy/12 shadow-card overflow-hidden border bg-white",
        className,
      )}
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-global-navy/4 text-slate border-global-navy/10 border-b text-xs font-bold tracking-[0.08em] uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cx("px-4 py-3.5", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-global-navy/10 divide-y">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-warm-ivory/45 align-top"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx("px-4 py-4", column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul
        className="divide-global-navy/10 divide-y md:hidden"
        aria-label={caption}
      >
        {rows.map((row) => (
          <li key={rowKey(row)} className="grid gap-4 p-5">
            {columns.map((column) => (
              <div key={column.key} className="min-w-0">
                <p className="text-slate mb-1 text-[0.68rem] font-bold tracking-[0.08em] uppercase">
                  {column.mobileLabel ?? column.header}
                </p>
                <div className="min-w-0">{column.render(row)}</div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
