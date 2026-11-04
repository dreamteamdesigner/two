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

// Format minutes into hours and minutes.
const formatScreenTime = (minutes) => {
  const totalMinutes = Math.round(Number(minutes) || 0);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${remainingMinutes}m`;
};

// Calculate the number of days in the reporting period, inclusive.
const getPeriodDays = (startDate, endDate, fallbackDays) => {
  if (!startDate || !endDate) {
    return Math.max(fallbackDays, 1);
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return Math.max(fallbackDays, 1);
  }

  const difference = Math.round((end.getTime() - start.getTime()) / 86400000);

  return Math.max(difference + 1, 1);
};

const AppUsageTable = ({ data = {} }) => {
  // Support both an array and the { daily_usage: [] } JSON structure.
  const dailyUsage = Array.isArray(data)
    ? data
    : Array.isArray(data.daily_usage)
      ? data.daily_usage
      : [];

  const [searchQuery, setSearchQuery] = useState("");

  const periodDays = getPeriodDays(
    data?.meta?.period_start,
    data?.meta?.period_end,
    dailyUsage.length,
  );

  // Combine individual daily records into one record per application.
  const applications = useMemo(() => {
    const appTotals = new Map();

    dailyUsage.forEach((day) => {
      day.apps?.forEach((app) => {
        const name = app.app_name;

        if (!name) return;

        if (!appTotals.has(name)) {
          appTotals.set(name, {
            app_name: name,
            app_icon: app.app_icon || "",
            category: app.category || "Other",
            total_screen_time: 0,
            opens: 0,
            notifications: 0,
          });
        }

        const current = appTotals.get(name);

        // Keep the app icon if it appears in any daily record.
        if (!current.app_icon && app.app_icon) {
          current.app_icon = app.app_icon;
        }

        current.total_screen_time += Number(app.screen_time_minutes) || 0;

        current.opens += Number(app.opens) || 0;

        current.notifications += Number(app.notifications) || 0;
      });
    });

    return Array.from(appTotals.values()).map((app) => ({
      ...app,
      daily_average: Math.round(app.total_screen_time / periodDays),
    }));
  }, [dailyUsage, periodDays]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "app_name",
        header: "Application",
        cell: ({ getValue }) => getValue() || "Unknown app",
        size: 220,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => getValue() || "Other",
        size: 190,
      },
      {
        accessorKey: "total_screen_time",
        header: "Total Screen Time",
        cell: ({ getValue }) => formatScreenTime(getValue()),
        size: 220,
      },
      {
        accessorKey: "daily_average",
        header: "Daily avg.",
        cell: ({ getValue }) => formatScreenTime(getValue()),
        size: 190,
      },
      {
        accessorKey: "opens",
        header: "Opens",
        cell: ({ getValue }) => (Number(getValue()) || 0).toLocaleString(),
        size: 120,
      },
      {
        accessorKey: "notifications",
        header: "Notifications",
        cell: ({ getValue }) => (Number(getValue()) || 0).toLocaleString(),
        size: 160,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: applications,
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

      const app = row.original;

      const searchableValues = [
        app.app_name,
        app.category,
        app.total_screen_time,
        app.daily_average,
        app.opens,
        app.notifications,
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
      sorting: [{ id: "total_screen_time", desc: true }],
      pagination: {
        pageIndex: 0,
        pageSize: 15,
      },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <section>
      <div className="header">
        <div className="heads">
          <span>App usage</span>

          <div className="search">
            <input
              type="search"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search applications"
            />
          </div>
        </div>
      </div>

      <div className="contacts-table-wrapper">
        <table className="contacts-table">
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
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {cell.column.id === "app_name" ? (
                        <div className="truncate-contact">
                          <div className="icon two">
                            {row.original.app_icon ? (
                              <img
                                src={row.original.app_icon}
                                alt={`${row.original.app_name} icon`}
                              />
                            ) : (
                              <span>
                                {row.original.app_name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  {searchQuery
                    ? "No matching applications found."
                    : "No application usage found."}
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

export default AppUsageTable;
