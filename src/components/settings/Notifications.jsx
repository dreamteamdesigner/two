import React from 'react'
import {
  IconBell,
} from "@tabler/icons-react";

import Toggle from "../Toggle";

const Notifications = () => {
  return (
    <div className="container">
      <div className="head">
        <div className="icon">
          <IconBell stroke={1.5} size={18} />
        </div>
        <span>Notifications</span>
      </div>

      <div className="sec">
        <span>Notification Channels</span>
        <div className="part">
          <div className="contents">
            <span>In-app notifications</span>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Email notifications</span>
          </div>
          <Toggle type={true} isActive={true} />
        </div>
      </div>
      <div className="sec">
        <span>Activity Notifications</span>
        <div className="part">
          <div className="contents">
            <span>Location updates</span>
            <p>Get notified when new location information is available.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Messages</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>App activity</span>
            <p>Get updates about application usage and activity.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Call history</span>
            <p>Receive notifications about new call records.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Browser history</span>
            <p>Get updates when new browsing records are available.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Gallery updates</span>
            <p>Receive alerts when new media is available.</p>
          </div>
          <Toggle type={true} />
        </div>
      </div>
    </div>
  );
}

export default Notifications