import { useState } from "react";
import { IconSettings } from "@tabler/icons-react";

const General = () => {
  return (
    <div className="container">
      <div className="head">
        <div className="icon">
          <IconSettings stroke={1.5} size={18} />
        </div>
        <span>General</span>
      </div>
      <div className="sec">
        <span>Appearance</span>
        <div className="part">
          <div className="contents">
            <span>Theme</span>
            <p>Override your browser's preferred theme settings</p>
          </div>
          <div className="customize">System</div>
        </div>
        <div className="part">
          <div className="contents">
            <span>Accent colour</span>
            <p>Choose the dashboard's primary accent colour.</p>
          </div>
          <div className="customize">System</div>
        </div>
        <div className="part">
          <div className="contents">
            <span>Interface density</span>
            <p>Comfortable or Compact.</p>
          </div>
          <div className="customize">System</div>
        </div>
      </div>
      <div className="sec">
        <span>Regional Preferences</span>
        <div className="part">
          <div className="contents">
            <span>Time format</span>
            <p>12-hour or 24-hour.</p>
          </div>
          <div className="customize">System</div>
        </div>
        <div className="part">
          <div className="contents">
            <span>Date format</span>
            <p>DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD.</p>
          </div>
          <div className="customize">System</div>
        </div>
        <div className="part">
          <div className="contents">
            <span>Language</span>
          </div>
          <div className="customize">System</div>
        </div>
      </div>
    </div>
  );
}

export default General