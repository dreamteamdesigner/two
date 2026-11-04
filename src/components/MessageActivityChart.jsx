import { useMemo } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import messageData from "../data/messageLogs.json";

// Use the timezone declared in the JSON metadata.
const TIME_ZONE = messageData.meta?.timezone || "Africa/Lagos";

// Get a date key in the reporting timezone.
const getDateKey = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return null;

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

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);

  return result;
};

const formatDate = (date, options) =>
  date.toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const fullDay = payload[0].payload.fullDay;
  const dateLabel = payload[0].payload.dateLabel;

  return (
    <div className="message-tooltip">
      <p className="tooltip-title">
        {fullDay}, {dateLabel}
      </p>

      {payload.map((item) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span
            className="tooltip-indicator"
            style={{ backgroundColor: item.color || item.fill }}
          />

          <span className="tooltip-name">{item.name}</span>

          <span className="tooltip-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const MessageActivityChart = ({ weekStart }) => {
  // Calculate daily sent and received totals.
  const dailyTotals = useMemo(() => {
    const totals = new Map();
    const messages = messageData.messages ?? [];

    messages.forEach((message) => {
      const dateKey = getDateKey(message.timestamp);

      if (!dateKey) return;

      const direction = message.direction?.toLowerCase();

      if (direction !== "sent" && direction !== "received") {
        return;
      }

      const current = totals.get(dateKey) ?? {
        sent: 0,
        received: 0,
      };

      current[direction] += 1;

      totals.set(dateKey, current);
    });

    return totals;
  }, []);

  // Build the seven days for the selected week.
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);

      const dateKey = [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0"),
      ].join("-");

      const totals = dailyTotals.get(dateKey) ?? {
        sent: 0,
        received: 0,
      };

      return {
        day: formatDate(date, { weekday: "short" }),
        fullDay: formatDate(date, { weekday: "long" }),
        dateLabel: formatDate(date, {
          month: "short",
          day: "numeric",
        }),
        sent: totals.sent,
        received: totals.received,
      };
    });
  }, [weekStart, dailyTotals]);

  return (
    <div className="message-activity-chart">
      <div className="message-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 12,
              right: 4,
              left: -20,
              bottom: 4,
            }}
            barGap={8}
          >
            <CartesianGrid vertical={false} horizontal={false} />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a6a1ad", fontSize: 12 }}
              dy={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a6a1ad", fontSize: 12 }}
              allowDecimals={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(255, 255, 255, 0.02)",
              }}
            />

            <Bar
              dataKey="sent"
              name="Sent Messages"
              fill="#8000ff"
              radius={[100, 100, 100, 100]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease"
              animationBegin={100}
            />

            <Bar
              dataKey="received"
              name="Received Messages"
              fill="#390F64"
              radius={[100, 100, 100, 100]}
              maxBarSize={32}
              isAnimationActive={true}
              animationDuration={400}
              animationEasing="ease"
              animationBegin={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MessageActivityChart;
