import React from "react";
import { IconArrowUpRight } from "@tabler/icons-react";

const SupportCards = ({ title, subtext, icon }) => {
  return (
    <div className="support-card">
      <div className="top">
        <div className="icon">{icon}</div>
        <IconArrowUpRight stroke={1.5} size={16} />
      </div>
      <div className="contents">
        <span>{title}</span>
        <p>{subtext}</p>
      </div>
    </div>
  );
};

export default SupportCards;
