import React from "react";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

const WeeklyNavigation = ({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  isCurrentWeek,
}) => {
  const weekEnd = new Date(weekStart);

  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const formatDate = (date, options) =>
    date.toLocaleDateString("en-US", {
      ...options,
      timeZone: "UTC",
    });

  const sameYear = weekStart.getUTCFullYear() === weekEnd.getUTCFullYear();

  const startLabel = formatDate(weekStart, {
    day: "numeric",
    month: "short",
  });

  const endLabel = formatDate(weekEnd, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return (
    <div className="week-control">
      <button
        type="button"
        className="icon"
        onClick={onPreviousWeek}
        aria-label="Previous week"
      >
        <IconChevronLeft size={16} />
      </button>

      <div className="range">
        <span>
          {isCurrentWeek ? "This week" : `${startLabel} - ${endLabel}`}
        </span>
      </div>

      <button
        type="button"
        className="icon"
        onClick={onNextWeek}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
};

export default WeeklyNavigation;
