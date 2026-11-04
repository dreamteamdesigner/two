import {
  IconArrowNarrowLeftDashed,
  IconArrowNarrowRightDashed,
} from "@tabler/icons-react";

const Pagination = ({ pageCount = 0, currentPage = 1, onPageChange }) => {
  // Dynamically generate page numbers.
  const getPageNumbers = () => {
    // Show every page when there are seven or fewer.
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    // Near the beginning.
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", pageCount];
    }

    // Near the end.
    if (currentPage >= pageCount - 3) {
      return [
        1,
        "...",
        pageCount - 4,
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ];
    }

    // In the middle.
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      pageCount,
    ];
  };

  if (pageCount <= 0) return null;

  return (
    <div className="location-pagination">
      {/* Previous */}
      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <IconArrowNarrowLeftDashed stroke={1.5} size={16} />
        <span>Previous</span>
      </button>

      {/* Page numbers */}
      <div className="pagination-pages">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              type="button"
              key={page}
              className={`pagination-page ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {String(page).padStart(2, "0")}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= pageCount}
      >
        <span>Next</span>
        <IconArrowNarrowRightDashed stroke={1.5} size={16} />
      </button>
    </div>
  );
};

export default Pagination;
