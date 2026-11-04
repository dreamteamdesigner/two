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

// Format birthdays.
const formatBirthday = (dateString) => {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Combine optional contact details.
const getOtherDetails = (contact) => {
  const details = [
    contact.company,
    contact.job_title,
    formatBirthday(contact.birthday),
    contact.location,
    contact.notes,
  ].filter(Boolean);

  return details.length ? details.join(" · ") : "—";
};

const ContactsTable = ({ data = [] }) => {
  // Support both an array and the { contacts: [] } JSON structure.
  const contacts = Array.isArray(data)
    ? data
    : Array.isArray(data.contacts)
      ? data.contacts
      : [];

  const [searchQuery, setSearchQuery] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Contact",
        cell: ({ row }) => {
          const contact = row.original;

          return contact.nickname || contact.name || "Unknown";
        },
        size: 240,
      },
      {
        accessorKey: "phone",
        header: "Phone number",
        cell: ({ getValue }) => getValue() || "—",
        size: 190,
      },
      {
        accessorKey: "alternate_phone",
        header: "Alternate number",
        cell: ({ getValue }) => getValue() || "—",
        size: 190,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => getValue() || "—",
        size: 280,
      },
      {
        id: "other_details",
        accessorFn: (row) => getOtherDetails(row),
        header: "Other details",
        cell: ({ row }) => getOtherDetails(row.original),
        size: 380,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: contacts,
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

      const contact = row.original;

      const searchableValues = [
        contact.name,
        contact.nickname,
        contact.phone,
        contact.alternate_phone,
        contact.email,
        contact.country,
        contact.company,
        contact.job_title,
        contact.birthday,
        contact.location,
        contact.notes,
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
      sorting: [{ id: "name", desc: false }],
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
          <span>Contacts overview</span>

          <div className="search">
            <input
              type="search"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search contacts"
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
                        cell.column.id === "email"
                          ? "truncate-email"
                          : cell.column.id === "other_details"
                            ? "contact-details"
                            : ""
                      }
                      style={{ width: cell.column.getSize() }}
                    >
                      {cell.column.id === "name" ? (
                        <div className="truncate-contact">
                          <div className="icon">
                            {row.original.name
                              ?.trim()
                              .charAt(0)
                              .toUpperCase() || "?"}
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
                    ? "No matching contacts found."
                    : "No contacts found."}
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

export default ContactsTable;
