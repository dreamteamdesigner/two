import { IconGripVertical } from "@tabler/icons-react";

const DataCard = ({ icon, title, value, change, period }) => {
  const hasChange = Number.isFinite(change);

  const changeClass = !hasChange
    ? "neutral"
    : change > 0
      ? "positive"
      : change < 0
        ? "negative"
        : "neutral";

  const changeText = hasChange ? `${change > 0 ? "+" : ""}${change}%` : "—";

  return (
    <div className="data-card">
      <div className="tag-top">
        {icon}
        <span>{title}</span>
        <IconGripVertical stroke={2} size={12} />
      </div>

      <div className="info">
        <span>{value}</span>

        <p>
          <span className={changeClass}>{changeText}</span>{" "}
          <span>vs {period || "previous period"}</span>
        </p>
      </div>
    </div>
  );
};

export default DataCard;