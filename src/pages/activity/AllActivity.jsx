import React from "react";
import DeviceInfo from "../../data/DeviceDetails";
import activityData from "../../data/activityData.json";
import { IconArrowUpRight } from "@tabler/icons-react";
import AllActivityTable from "../../components/AllActivityTable";

const AllActivity = () => {
  const activity = activityData.recent_app_activity;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());

    const today = startOfDay(now);
    const targetDay = startOfDay(date);

    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (diffDays === 0) {
      return `${time}`;
    }

    if (diffDays === 1) {
      return `Yesterday, ${time}`;
    }

    if (diffDays === 2) {
      return `${date.toLocaleDateString("en-US", {
        weekday: "long",
      })}, ${time}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Device info</span>

            <div className="link-out">
              <IconArrowUpRight stroke={1.5} size={16} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="device-info-widget">
            <div className="top">
              <div className="device-image">
                <img src="" alt="" />
              </div>
              <div className="contents">
                <span>{DeviceInfo.deviceName}</span>
                <span>{DeviceInfo.deviceModel}</span>
                <div className="tag">
                  <div className="dot"></div>
                  <>{DeviceInfo.deviceStatus ? "Active" : "Offline"}</>
                </div>
              </div>
            </div>
            <div className="info">
              <div>
                <span>Platform</span>
                <span>{DeviceInfo.platform}</span>
              </div>
              <div>
                <span>Device model</span>
                <span>{DeviceInfo.deviceModel}</span>
              </div>
              <div>
                <span>Phone No.</span>
                <span>{DeviceInfo.phoneNo}</span>
              </div>
              <div>
                <span>IMEI</span>
                <span>{DeviceInfo.imei}</span>
              </div>
              <div>
                <span>Platform</span>
                <span>{DeviceInfo.trackingID}</span>
              </div>
              <div>
                <span>Platform</span>
                <span>iOS</span>
              </div>
            </div>
          </div>

          <div className="recent-activity-widget max-forty">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Recent activity</span>
              <div className="icon"></div>
            </div>
            <div className="info">
              {activity.slice(0, 5).map((item, index) => (
                <div
                  key={item.id ?? `${item.app_name}-${item.timestamp}-${index}`}
                >
                  <div className="contents">
                    <div className="icon">
                      <img src={item.icon} alt="" />
                    </div>

                    <div>
                      <span>{item.app_name}</span>
                      <p>{item.activity}</p>
                    </div>
                  </div>

                  <div className="rexc">
                    <span>{item.duration_seconds}</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AllActivityTable data={activityData} />
    </>
  );
};

export default AllActivity;
