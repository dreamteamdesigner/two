import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  IconLayoutSidebarLeftCollapse,
  IconBell,
  IconMenu,
  IconDeviceMobile,
  IconHeadphones,
  IconAdjustments,
  IconDoorExit,
  IconSettings,
  IconUser,
  IconChevronDown,
} from "@tabler/icons-react";

import { NavLink, useNavigate } from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";

import notificationData from "../data/dashboardNotifications.json";
import SiteInfo from "../data/SiteInfo";

const Navbar = ({ pageTitle, openOverlay }) => {
  const navigate = useNavigate();

  const notificationRef = useRef(null);
  const notificationListRef = useRef(null);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState(
    notificationData.notifications ?? [],
  );

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState("today");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  // Close dropdowns when clicking outside or pressing Escape.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset notification scroll position when opening or changing filters.
  useLayoutEffect(() => {
    if (isNotificationsOpen && notificationListRef.current) {
      notificationListRef.current.scrollTop = 0;
    }
  }, [isNotificationsOpen, activeFilter]);

  // Format notification timestamps.
  const formatNotificationDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();

    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());

    const today = startOfDay(now);
    const targetDay = startOfDay(date);

    const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (diffDays === 0) return `Today, ${time}`;

    if (diffDays === 1) return `Yesterday, ${time}`;

    if (diffDays >= 2 && diffDays <= 6) {
      return `${date.toLocaleDateString("en-US", {
        weekday: "short",
      })}, ${time}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Filter notifications by the selected timeline.
  const filteredNotifications = useMemo(() => {
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(today);

    // Monday is the beginning of the week.
    const dayOfWeek = (today.getDay() + 6) % 7;

    startOfWeek.setDate(today.getDate() - dayOfWeek);

    return [...notifications]
      .filter((notification) => {
        if (!notification.timestamp) return false;

        const date = new Date(notification.timestamp);

        if (Number.isNaN(date.getTime())) return false;

        switch (activeFilter) {
          case "today":
            return date >= today;

          case "week":
            return date >= startOfWeek && date < today;

          case "earlier":
            return date < startOfWeek;

          default:
            return true;
        }
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [notifications, activeFilter]);

  // Mark notification as read and navigate to its destination.
  const handleNotificationClick = (notification) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item,
      ),
    );

    setIsNotificationsOpen(false);

    if (notification.route) {
      navigate(notification.route);
    }
  };

  // Toggle profile dropdown.
  const toggleProfile = () => {
    setIsProfileOpen((previous) => !previous);
    setIsNotificationsOpen(false);
  };

  // Close profile dropdown after navigation.
  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  return (
    <div className="navbar-container">
      <div>
        <div className="iconic collapse">
          <IconLayoutSidebarLeftCollapse stroke={1.5} size={18} />
        </div>

        <button
          type="button"
          onClick={() => openOverlay("sidebar")}
          className="open-menu"
          aria-label="Open navigation"
        >
          <IconMenu stroke={1.5} size={18} />
        </button>

        <span>{pageTitle}</span>
      </div>

      <div>
        <div className="search">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search preview-icon"
            >
              <path d="m21 21-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Search devices, activity, messages..."
          />
        </div>

        {/* Notifications */}
        <div
          className={`klap ${isNotificationsOpen ? "open" : ""}`}
          ref={notificationRef}
        >
          <button
            type="button"
            className="iconic notification-trigger"
            onClick={() => {
              setIsNotificationsOpen((previous) => !previous);
              setIsProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <IconBell stroke={1.5} size={18} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="notif-dropdown" aria-hidden={!isNotificationsOpen}>
            <div className="top">
              <span>Notifications</span>
            </div>

            <div className="header">
              <div className="timeline two">
                <button
                  type="button"
                  className={activeFilter === "today" ? "activate" : ""}
                  onClick={() => setActiveFilter("today")}
                >
                  Today
                </button>

                <button
                  type="button"
                  className={activeFilter === "week" ? "activate" : ""}
                  onClick={() => setActiveFilter("week")}
                >
                  This week
                </button>

                <button
                  type="button"
                  className={activeFilter === "earlier" ? "activate" : ""}
                  onClick={() => setActiveFilter("earlier")}
                >
                  Earlier
                </button>
              </div>
            </div>

            <div className="contents" ref={notificationListRef}>
              {filteredNotifications.map((alert) => (
                <div
                  key={alert.id}
                  className={`notification-item ${
                    !alert.is_read ? "unread" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(alert)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleNotificationClick(alert);
                    }
                  }}
                >
                  <div className="icon">
                    <IconDeviceMobile stroke={1.5} size={18} />
                  </div>

                  <div className="infos">
                    <span>{alert.title}</span>

                    <p>{alert.message}</p>

                    <p className="time">
                      {formatNotificationDate(alert.timestamp)}
                    </p>
                  </div>

                  {!alert.is_read && <div className="unread-dot"></div>}
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="notification-empty">
                  <p>No notifications here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile dropdown */}
        <div className={`klap ${isProfileOpen ? "open" : ""}`} ref={profileRef}>
          <button
            type="button"
            className="prolific profile-trigger"
            onClick={toggleProfile}
            aria-label="Profile menu"
            aria-expanded={isProfileOpen}
          >
            <div className="iconic">
              <img src={SiteInfo.dp} alt="" />
            </div>

            <span>{SiteInfo.username}</span>
            <IconChevronDown stroke={2} size={14} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="profile-dropdown"
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.18,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="top">
                  <div className="icon">
                    <img src={SiteInfo.dp} alt="" />
                  </div>

                  <div className="contents">
                    <span>{SiteInfo.username}</span>
                    <p>{SiteInfo.email}</p>
                  </div>
                </div>

                <div className="set">
                  <NavLink to="/settings" onClick={closeProfile}>
                    <div className="icon">
                      <IconUser stroke={1.5} size={18} />
                    </div>

                    <span>Account</span>
                  </NavLink>

                  <NavLink to="/settings" onClick={closeProfile}>
                    <div className="icon">
                      <IconSettings stroke={1.5} size={18} />
                    </div>

                    <span>Security & privacy</span>
                  </NavLink>

                  <NavLink to="/settings" onClick={closeProfile}>
                    <div className="icon">
                      <IconAdjustments stroke={1.5} size={18} />
                    </div>

                    <span>Preferences</span>
                  </NavLink>
                </div>

                <div className="set">
                  <NavLink to="/support" onClick={closeProfile}>
                    <div className="icon">
                      <IconHeadphones stroke={1.5} size={18} />
                    </div>

                    <span>Help & support</span>
                  </NavLink>

                  <NavLink
                    to="https://www.google.com"
                    className="log-out"
                    onClick={closeProfile}
                  >
                    <div className="icon">
                      <IconDoorExit stroke={1.5} size={18} />
                    </div>

                    <span>Sign out</span>
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
