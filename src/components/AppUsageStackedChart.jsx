import { useMemo } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Category colours.
const CATEGORY_COLORS = {
  Social: "#8000FF",
  Entertainment: "#A855F7",
  Communication: "#390F64",
  Productivity: "#6B6474",
  Utilities: "#C084FC",
  Travel: "#BCA4D7",
  Other: "#9CA3AF",
};

// Gap between stacked category segments, in pixels.
const SEGMENT_GAP = 4;

// Custom shape that creates gaps and supports corner radius.
const SegmentWithGap = (props) => {
  const { x, y, width, height, fill, radius = 0 } = props;

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const inset = Math.min(SEGMENT_GAP / 2, Math.max(0, (height - 1) / 2));

  const adjustedY = y + inset;
  const adjustedHeight = Math.max(1, height - inset * 2);

  const radiusValues = Array.isArray(radius)
    ? radius
    : [radius, radius, radius, radius];

  const [topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0] =
    radiusValues;

  const limit = Math.min(width / 2, adjustedHeight / 2);

  const tl = Math.min(Math.max(0, Number(topLeft) || 0), limit);
  const tr = Math.min(Math.max(0, Number(topRight) || 0), limit);
  const br = Math.min(Math.max(0, Number(bottomRight) || 0), limit);
  const bl = Math.min(Math.max(0, Number(bottomLeft) || 0), limit);

  const right = x + width;
  const bottom = adjustedY + adjustedHeight;

  return (
    <path
      d={`
        M ${x + tl} ${adjustedY}
        H ${right - tr}
        Q ${right} ${adjustedY} ${right} ${adjustedY + tr}
        V ${bottom - br}
        Q ${right} ${bottom} ${right - br} ${bottom}
        H ${x + bl}
        Q ${x} ${bottom} ${x} ${bottom - bl}
        V ${adjustedY + tl}
        Q ${x} ${adjustedY} ${x + tl} ${adjustedY}
        Z
      `}
      fill={fill}
    />
  );
};

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

// Format Y-axis values in hours only.
const formatAxisTime = (minutes) => {
  const hours = Number(minutes) / 60;

  return `${Number(hours.toFixed(1))}h`;
};

// Format date labels without timezone shifting.
const formatDate = (date, options) => {
  return date.toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
};

// Add or subtract calendar days.
const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);

  return result;
};

// Convert date into YYYY-MM-DD.
const getDateKey = (date) => {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

// Custom tooltip.
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="message-tooltip">
      <p className="tooltip-title">{data.fullDate}</p>

      <div className="tooltip-row">
        <span className="tooltip-name">Total screen time</span>
        <span className="tooltip-value">{formatScreenTime(data.total)}</span>
      </div>

      {payload
        .filter((item) => Number(item.value) > 0)
        .map((item) => (
          <div className="tooltip-row" key={item.dataKey}>
            <span
              className="tooltip-indicator"
              style={{
                backgroundColor: item.color || item.fill,
              }}
            />

            <span className="tooltip-name">{item.name}</span>

            <span className="tooltip-value">
              {formatScreenTime(item.value)}
            </span>
          </div>
        ))}
    </div>
  );
};

const AppUsageStackedChart = ({ data = {}, weekStart }) => {
  const dailyUsage = Array.isArray(data.daily_usage) ? data.daily_usage : [];

  // Discover all categories in the dataset.
  const categories = useMemo(() => {
    const found = new Set();

    dailyUsage.forEach((day) => {
      day.apps?.forEach((app) => {
        found.add(app.category || "Other");
      });
    });

    const preferredOrder = [
      "Social",
      "Entertainment",
      "Communication",
      "Productivity",
      "Utilities",
      "Travel",
      "Other",
    ];

    return [
      ...preferredOrder.filter((category) => found.has(category)),
      ...Array.from(found).filter(
        (category) => !preferredOrder.includes(category),
      ),
    ];
  }, [dailyUsage]);

  // Build the seven days for the selected week.
  const chartData = useMemo(() => {
    if (!(weekStart instanceof Date) || Number.isNaN(weekStart.getTime())) {
      return [];
    }

    // Create a lookup for the daily usage records.
    const dailyRecords = new Map(dailyUsage.map((day) => [day.date, day]));

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const dateKey = getDateKey(date);

      // Find the usage record for this particular day.
      const dayRecord = dailyRecords.get(dateKey);

      const categoryTotals = Object.fromEntries(
        categories.map((category) => [category, 0]),
      );

      // Calculate screen time for each category.
      dayRecord?.apps?.forEach((app) => {
        const category = app.category || "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          (Number(app.screen_time_minutes) || 0);
      });

      const total = Object.values(categoryTotals).reduce(
        (sum, value) => sum + value,
        0,
      );

      return {
        date: dateKey,

        day: formatDate(date, {
          weekday: "short",
        }),

        fullDate: formatDate(date, {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),

        total,
        ...categoryTotals,
      };
    });
  }, [dailyUsage, categories, weekStart]);

  return (
    <div
      className="app-usage-stacked-chart"
      style={{ width: "100%", height: 320 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 12,
            right: 8,
            left: -12,
            bottom: 8,
          }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            vertical={false}
            horizontal={false}
            stroke="#39343F"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a6a6a6", fontSize: 11 }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a6a6a6", fontSize: 11 }}
            allowDecimals={false}
            tickFormatter={formatAxisTime}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: "rgba(255, 255, 255, 0.03)",
            }}
          />

          {categories.map((category) => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              stackId="screen-time"
              fill={CATEGORY_COLORS[category] || "#9CA3AF"}
              maxBarSize={70}
              radius={[8, 8, 8, 8]}
              shape={SegmentWithGap}
              isAnimationActive={true}
              animationDuration={500}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppUsageStackedChart;
