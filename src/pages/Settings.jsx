import {
  IconSettings,
  IconUser,
  IconBell,
  IconLock,
  IconCloudUpload,
  IconSettingsFilled,
  IconBellFilled,
  IconUserFilled,
  IconLockFilled,
  IconCloudFilled,
  IconArrowNarrowLeftDashed,
} from "@tabler/icons-react";

import { useState } from "react";

import General from "../components/settings/General";
import Account from "../components/settings/Account";
import DataSync from "../components/settings/DataSync";
import Notifications from "../components/settings/Notifications";
import Security from "../components/settings/Security";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Controls the mobile navigation/content view.
  const [mobileContentOpen, setMobileContentOpen] = useState(false);

  const tabContent = {
    general: <General />,
    notifications: <Notifications />,
    account: <Account />,
    security: <Security />,
    data: <DataSync />,
  };

  const settingsGroups = [
    {
      label: "Preferences",
      items: [
        {
          id: "general",
          icon: <IconSettings stroke={1.5} size={18} />,
          activeIcon: <IconSettingsFilled size={18} />,
          title: "General",
          description: "Manage your dashboard preferences.",
        },
        {
          id: "notifications",
          icon: <IconBell stroke={1.5} size={18} />,
          activeIcon: <IconBellFilled size={18} />,
          title: "Notifications",
          description: "Manage your notification preferences.",
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          id: "account",
          icon: <IconUser stroke={1.5} size={18} />,
          activeIcon: <IconUserFilled size={18} />,
          title: "Account Information",
          description: "Manage your personal information.",
        },
        {
          id: "security",
          icon: <IconLock stroke={1.5} size={18} />,
          activeIcon: <IconLockFilled size={18} />,
          title: "Security & Privacy",
          description: "Manage your password and account security.",
        },
      ],
    },
    {
      label: "Data",
      items: [
        {
          id: "data",
          icon: <IconCloudUpload stroke={1.5} size={18} />,
          activeIcon: <IconCloudFilled size={18} />,
          title: "Data & Synchronization",
          description: "Manage your data and synchronization preferences.",
        },
      ],
    },
  ];

  return (
    <section className="control">
      <div
        className={`settings-widget ${
          mobileContentOpen ? "mobile-content-open" : ""
        }`}
      >
        <div className="panel">
          <div className="top">
            <span>Settings</span>

            <div className="search">
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <div className="details">
            {settingsGroups.map((group) => (
              <div className="settings-group" key={group.label}>
                <span className="group-label">{group.label}</span>

                <div>
                  {group.items.map((tab) => (
                    <button
                      type="button"
                      className={activeTab === tab.id ? "active" : ""}
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileContentOpen(true);
                      }}
                    >
                      {activeTab === tab.id ? tab.activeIcon : tab.icon}

                      <span>{tab.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-placeholder">
          <button
            type="button"
            className="mobile-settings-back"
            onClick={() => setMobileContentOpen(false)}
          >
            <IconArrowNarrowLeftDashed size={18} stroke={1.5} />
            <span>Settings</span>
          </button>

          {tabContent[activeTab]}
        </div>
      </div>
    </section>
  );
};

export default Settings;
