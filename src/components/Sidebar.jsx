import React from "react";
import SiteInfo from "../data/SiteInfo";
import SidebarData from "../data/SidebarData";
import NavLinkTab from "./NavLinkTab";

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="top">
          <div className="logo"><img src={SiteInfo.logo} alt="" /></div>
          <span>{SiteInfo.name}</span>
        </div>

        <div className="sidebar-links">
          {SidebarData.map((group, groupIndex) => (
            <div className="sidebar-group" key={groupIndex}>
              {group.map((item) => (
                <NavLinkTab
                  key={item.destination}
                  title={item.title}
                  destination={item.destination}
                  dropdownLinks={item.sublinks}
                  icon={item.icon}
                  activeIcon={item.activeIcon}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
