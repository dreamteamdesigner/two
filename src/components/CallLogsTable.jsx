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

const TIME_ZONE = "America/New_York";

// Format call duration.
const formatDuration = (seconds) => {
  const duration = Number(seconds) || 0;

  if (duration <= 0) return "—";

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const remainingSeconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

// Get a date key using the call log's timezone.
const getDateKey = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

// Format timestamps using Today, Yesterday, weekday or full date.
const formatCallDate = (timestamp) => {
  if (!timestamp) return "Unknown date";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  const now = new Date();

  const [year, month, day] = getDateKey(date).split("-").map(Number);
  const [currentYear, currentMonth, currentDay] = getDateKey(now)
    .split("-")
    .map(Number);

  const targetDate = Date.UTC(year, month - 1, day);
  const currentDate = Date.UTC(currentYear, currentMonth - 1, currentDay);

  const difference = Math.round((currentDate - targetDate) / 86400000);

  const time = date.toLocaleTimeString("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });

  if (difference === 0) return time;

  if (difference === 1) return `Yesterday · ${time}`;

  if (difference === 2) {
    const weekday = date.toLocaleDateString("en-US", {
      timeZone: TIME_ZONE,
      weekday: "long",
    });

    return `${weekday} · ${time}`;
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formattedDate} · ${time}`;
};

// Make call types and statuses readable.
const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const CallLogsTable = ({ data = [] }) => {
  // Support both an array and the { call_logs: [] } JSON structure.
  const callLogs = Array.isArray(data)
    ? data
    : Array.isArray(data.call_logs)
      ? data.call_logs
      : [];

  const [searchQuery, setSearchQuery] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "contact_name",
        header: "Contact",
        cell: ({ row }) => {
          const call = row.original;

          return (
            <div className="call-contact">
              <div className="icon">{call.contact_name[0]}</div>
              <div>
                <div className="call-contact-name">
                  <span>{call.contact_name || "Unknown Caller"}</span>

                  {call.is_favorite && (
                    <span className="favorite-indicator" title="Favorite">
                      ★
                    </span>
                  )}
                </div>

                <span className="call-contact-subtitle">
                  {call.app_name || "Unknown app"}
                  {call.sim_label ? ` · ${call.sim_label}` : ""}
                </span>
              </div>
            </div>
          );
        },
        size: 220,
      },
      {
        accessorKey: "phone_number",
        header: "Phone number",
        cell: ({ row }) => (
          <div className="call-phone">
            <span>{row.original.phone_number || "—"}</span>

            {row.original.is_blocked_number && (
              <span className="blocked-indicator">Blocked</span>
            )}
          </div>
        ),
        size: 190,
      },
      {
        accessorKey: "call_type",
        header: "Call type",
        cell: ({ getValue }) => {
          const type = getValue();

          return (
            <span className={`call-type-badge ${type || ""}`}>
              {formatLabel(type)}
            </span>
          );
        },
        size: 140,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();

          return (
            <span className={`call-status-badge ${status || ""}`}>
              {formatLabel(status)}
            </span>
          );
        },
        size: 140,
      },
      {
        id: "timestamp",
        accessorFn: (row) => {
          const timestamp = new Date(row.timestamp).getTime();
          return Number.isNaN(timestamp) ? 0 : timestamp;
        },
        header: "Date & time",
        cell: ({ row }) => formatCallDate(row.original.timestamp),
        size: 220,
      },
      {
        accessorKey: "duration_seconds",
        header: "Duration",
        cell: ({ getValue }) => formatDuration(getValue()),
        size: 120,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: callLogs,
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

      const call = row.original;

      const searchableValues = [
        call.contact_name,
        call.phone_number,
        call.call_type,
        call.status,
        call.timestamp,
        formatCallDate(call.timestamp),
        call.app_name,
        call.sim_label,
        call.duration_seconds,
        call.is_favorite ? "favorite" : "",
        call.is_blocked_number ? "blocked" : "",
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
          <span>Call history</span>

          <div className="search">
            <input
              type="search"
              placeholder="Search call logs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search call logs"
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
                    <td
                      key={cell.id}
                      className={
                        cell.column.id === "contact_name"
                          ? "truncate-contact"
                          : cell.column.id === "phone_number"
                            ? "truncate-phone"
                            : cell.column.id === "timestamp"
                              ? "call-date-cell"
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
                    ? "No matching call logs found."
                    : "No call logs found."}
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

export default CallLogsTable;
