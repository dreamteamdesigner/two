import React from "react";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
import { useState } from "react";
import DeviceInfo from "../../data/DeviceDetails";
import Toggle from "../../components/Toggle";

const SurroundListening = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggle = () => {
    setIsEnabled((prev) => !prev);
  };
  return (
    <>
      <section className="control">
        <div className="header">
          <div className="heads">
            <span>Toggle Device Camera</span>
            <Toggle isActive={isEnabled} onToggle={toggle} />
          </div>
        </div>
        <div className="control-widget">
          {isEnabled ? (
            <div className="control-panel"></div>
          ) : (
            <div className="notf">
              {DeviceInfo.deviceStatus ? (
                <IconWifi stroke={1.5} color="hsla(161, 100%, 52%)" />
              ) : (
                <IconWifiOff stroke={1.5} color="#a6a6a6" />
              )}
              <span>
                The target device is {DeviceInfo ? "online" : "offline"}.
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default SurroundListening;
