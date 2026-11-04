import { useMemo, useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import Pagination from "../components/Pagination";

import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

const LocationTable = ({ data = [] }) => {
  const locations = Array.isArray(data) ? data : (data.locations ?? []);

  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());

    const today = startOfDay(now);
    const targetDay = startOfDay(date);

    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (diffDays === 0) return `Today, ${time}`;

    if (diffDays === 1) return `Yesterday, ${time}`;

    if (diffDays === 2) {
      return `${date.toLocaleDateString("en-US", {
        weekday: "short",
      })}, ${time}`;
    }

    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}, ${time}`;
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: "Date & Time",
        cell: ({ getValue }) => formatDate(getValue()),
        size: 180,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ getValue }) => getValue() || "Unknown",
        size: 250,
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ getValue }) => getValue() || "Unknown",
      },
      {
        accessorKey: "latitude",
        header: "Latitude",
        cell: ({ getValue }) => Number(getValue()).toFixed(5),
      },
      {
        accessorKey: "longitude",
        header: "Longitude",
        cell: ({ getValue }) => Number(getValue()).toFixed(5),
      },
      // {
      //   accessorKey: "accuracy_meters",
      //   header: "Acc.",
      //   cell: ({ getValue }) => `${getValue()} m`,
      // },
    ],
    [],
  );

  const table = useReactTable({
    data: locations,
    columns,

    state: {
      globalFilter: searchQuery,
    },

    onGlobalFilterChange: setSearchQuery,

    globalFilterFn: (row, columnId, filterValue) => {
      const query = String(filterValue ?? "")
        .trim()
        .toLowerCase();

      if (!query) return true;

      const location = row.original;

      const searchableValues = [
        location.timestamp,
        location.timestamp
          ? new Date(location.timestamp).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
        location.address,
        location.city,
        location.state,
        location.country,
        location.latitude,
        location.longitude,
        location.accuracy_meters,
        location.source,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    initialState: {
      sorting: [{ id: "timestamp", desc: true }],
      pagination: {
        pageIndex: 0,
        pageSize: 16,
      },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <section>
      <div className="header">
        <div className="heads">
          <span>Location overview</span>
          <div className="search">
            <input
              type="search"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search location records"
            />
          </div>
        </div>
      </div>

      <div className="location-table-wrapper">
        <table className="location-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort() ? "sortable-column" : ""
                    }
                    style={{ width: header.getSize() }}
                  >
                    <div className="table-header-content">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      <span className="sort-icon">
                        {{
                          asc: <IconCaretUpFilled size={12} />,
                          desc: <IconCaretDownFilled size={12} />,
                        }[header.column.getIsSorted()] ?? ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={
                        cell.column.id === "address"
                          ? "truncate-address"
                          : cell.column.id === "timestamp"
                            ? "truncate-date"
                            : ""
                      }
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  {searchQuery
                    ? "No matching location records found."
                    : "No location records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        pageCount={pageCount}
        currentPage={currentPage + 1}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </section>
  );
};

export default LocationTable;
