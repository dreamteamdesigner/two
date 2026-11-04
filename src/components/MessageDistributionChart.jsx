import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Default tooltip.
const CustomTooltip = ({
  active,
  payload,
  dataKey,
  nameKey,
  colorKey,
  valueFormatter,
  fallbackColor,
}) => {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="distribution-tooltip">
      <div
        className="dot"
        style={{
          backgroundColor: item[colorKey] || fallbackColor,
        }}
      />

      <span>{item[nameKey]}</span>

      <strong>{valueFormatter(item[dataKey])}</strong>
    </div>
  );
};

const DistributionChart = ({
  // Data
  data = [],
  dataKey = "value",
  nameKey = "name",
  colorKey = "color",
  fallbackColor = "#9CA3AF",

  // Selection
  selectedName = null,
  onSelect,
  inactiveOpacity = 0.2,

  // Chart appearance
  innerRadius = "85%",
  outerRadius = "100%",
  cornerRadius = "7%",
  paddingAngle = 3,
  stroke = "none",

  // Tooltip
  showTooltip = true,
  tooltipContent,
  valueFormatter = (value) => Number(value ?? 0).toLocaleString(),

  // Animation
  isAnimationActive = true,
  animationDuration = 800,
  animationBegin = 200,
  animationEasing = "ease",

  // Container
  className = "distribution-chart",
}) => {
  const hasSelection = selectedName !== null;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            cornerRadius={cornerRadius}
            paddingAngle={paddingAngle}
            stroke={stroke}
            isAnimationActive={isAnimationActive}
            animationDuration={animationDuration}
            animationBegin={animationBegin}
            animationEasing={animationEasing}
          >
            {data.map((entry, index) => {
              const isSelected =
                !hasSelection || selectedName === entry[nameKey];

              return (
                <Cell
                  key={entry.id ?? `${entry[nameKey]}-${index}`}
                  fill={entry[colorKey] || fallbackColor}
                  opacity={isSelected ? 1 : inactiveOpacity}
                  onClick={() => onSelect?.(entry[nameKey], entry, index)}
                  style={{
                    cursor: onSelect ? "pointer" : "default",
                    transition: "opacity 0.3s ease",
                  }}
                />
              );
            })}
          </Pie>

          {showTooltip && (
            <Tooltip
              content={
                tooltipContent || (
                  <CustomTooltip
                    dataKey={dataKey}
                    nameKey={nameKey}
                    colorKey={colorKey}
                    valueFormatter={valueFormatter}
                    fallbackColor={fallbackColor}
                  />
                )
              }
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
