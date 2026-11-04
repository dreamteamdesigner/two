import { useMemo, useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

import Pagination from "../components/Pagination";

// Format seconds into hours, minutes and seconds.
const formatDuration = (seconds) => {
  const totalSeconds = Math.round(Number(seconds) || 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

// Format timestamps using the dataset's reporting timezone.
const formatTimestamp = (timestamp, timeZone) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "—";

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  } catch {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
};

// Application icon with a fallback for missing image files.
const AppIcon = ({ icon, appName }) => {
  const extensions = ["webp", "png", "jpg", "jpeg", "svg"];

  const [extensionIndex, setExtensionIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(!icon);

  const iconHasExtension = /\.(webp|png|jpg|jpeg|svg)$/i.test(icon || "");

  const iconSrc = iconHasExtension
    ? icon
    : `/assets/app-icons/${icon}.${extensions[extensionIndex]}`;

  const handleImageError = () => {
    if (iconHasExtension || extensionIndex >= extensions.length - 1) {
      setImageFailed(true);
      return;
    }

    setExtensionIndex((current) => current + 1);
  };

  return (
    <div className="icon two">
      {!imageFailed ? (
        <img src={iconSrc} alt={`${appName} icon`} onError={handleImageError} />
      ) : (
        <span>{appName?.[0]?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
};

const AllActivityTable = ({ data = {} }) => {
  // Support both an array and the { recent_app_activity: [] } JSON structure.
  const activities = Array.isArray(data)
    ? data
    : Array.isArray(data?.recent_app_activity)
      ? data.recent_app_activity
      : [];

  const timeZone = Array.isArray(data) ? undefined : data?.meta?.timezone;

  const [searchQuery, setSearchQuery] = useState("");

  // Define table columns.
  const columns = useMemo(
    () => [
      {
        accessorKey: "app_name",
        header: "Application",
        cell: ({ row }) => (
          <div className="truncate-contact">
            <AppIcon icon={row.original.icon} appName={row.original.app_name} />

            <span>{row.original.app_name || "Unknown app"}</span>
          </div>
        ),
        size: 190,
      },
      {
        accessorKey: "activity",
        header: "Activity",
        cell: ({ getValue }) => getValue() || "—",
        size: 220,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => getValue() || "Other",
        size: 150,
      },
      {
        accessorKey: "duration_seconds",
        header: "Duration",
        cell: ({ getValue }) => formatDuration(getValue()),
        size: 125,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue()?.toLowerCase();

          return (
            <span className={`activity-status ${status || "unknown"}`}>
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "Unknown"}
            </span>
          );
        },
        size: 135,
      },
      {
        id: "timestamp",
        accessorFn: (row) => {
          const timestamp = new Date(row.timestamp).getTime();

          return Number.isNaN(timestamp) ? 0 : timestamp;
        },
        header: "Date & Time",
        cell: ({ row }) => formatTimestamp(row.original.timestamp, timeZone),
        size: 190,
      },
    ],
    [timeZone],
  );

  const table = useReactTable({
    data: activities,
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

      const activity = row.original;

      const searchableValues = [
        activity.app_name,
        activity.activity,
        activity.category,
        activity.status,
        activity.device,
        activity.icon,
        activity.timestamp,
        formatTimestamp(activity.timestamp, timeZone),
        formatDuration(activity.duration_seconds),
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
          <span>Recent App Activity</span>

          <div className="search">
            <input
              type="search"
              placeholder="Search applications or activities..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search application activity"
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
                    ? "No matching activities found."
                    : "No application activity found."}
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

export default AllActivityTable;
