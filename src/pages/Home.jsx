import React, { useEffect, useMemo, useState } from "react";

import DeviceInfo from "../data/DeviceDetails";
import locationData from "../data/locataionData.json";
import galleryData from "../data/gallery.json";
import activityData from "../data/activityData.json";
import messageLogs from "../data/messageLogs.json";
import callLogs from "../data/callLogs.json";
import AppLogData from "../data/appUsage.json";

import {
  IconArrowUpRight,
  IconHourglass,
  IconMapPin,
  IconMessage,
  IconPhone,
} from "@tabler/icons-react";

import { Vibrant } from "node-vibrant/browser";

import WeeklyNavigation from "../components/WeeklyNavigation";
import AppUsageStackedChart from "../components/AppUsageStackedChart";
import DistributionChart from "../components/MessageDistributionChart";
import LocationMap from "../components/LocationMap";
import DataCard from "../components/DataCard";
import { NavLink } from "react-router-dom";
import SiteInfo from "../data/SiteInfo";

// Distribution fallback colors.
const distributionColors = ["#8000FF", "#A855F7", "#390F64", "#6B6474"];

// Format screen time into hours and minutes.
const formatScreenTime = (minutes) => {
  const totalMinutes = Math.round(Number(minutes) || 0);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${remainingMinutes}m`;
};

// Calculate usage statistics for a collection of daily records.
const calculateUsageStats = (records, periodDays) => {
  let totalScreenTime = 0;
  let totalNotifications = 0;

  const appTotals = {};
  const appIconPaths = {};

  records.forEach((day) => {
    day.apps?.forEach((app) => {
      const appName = app.app_name?.trim() || "Unknown";

      const screenTime = Number(app.screen_time_minutes) || 0;
      const notifications = Number(app.notifications) || 0;

      totalScreenTime += screenTime;
      totalNotifications += notifications;

      appTotals[appName] = (appTotals[appName] || 0) + screenTime;

      // Store the application's icon path from the JSON.
      if (!appIconPaths[appName] && app.app_icon) {
        appIconPaths[appName] = app.app_icon;
      }
    });
  });

  // Rank applications by accumulated screen time.
  const rankedApps = Object.entries(appTotals)
    .map(([name, value]) => ({
      name,
      value,
      app_icon: appIconPaths[name] || null,
    }))
    .sort((a, b) => b.value - a.value);

  const mostUsedApp = rankedApps[0] || null;

  const mostUsedPercentage = totalScreenTime
    ? Math.round(((mostUsedApp?.value || 0) / totalScreenTime) * 100)
    : 0;

  // Get the top three applications.
  const topThree = rankedApps.slice(0, 3).map((item, index) => ({
    ...item,
    color: distributionColors[index],
  }));

  // Combine all remaining applications into Others.
  const othersTotal = rankedApps
    .slice(3)
    .reduce((total, item) => total + item.value, 0);

  if (othersTotal > 0) {
    topThree.push({
      name: "Others",
      value: othersTotal,
      app_icon: null,
      color: distributionColors[3],
    });
  }

  return {
    totalScreenTime,
    totalNotifications,
    dailyAverage: Math.round(totalScreenTime / periodDays),
    mostUsedApp,
    mostUsedPercentage,
    appTotals,
    distributionData: topThree,
  };
};

// Convert a timestamp into a calendar date in the reporting timezone.
const getTimestampDateKey = (timestamp, timeZone) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

// Calculate the four Home dashboard metrics.
const calculateHomeStats = ({
  dailyUsage,
  messages,
  calls,
  locations,
  startKey,
  endKey,
  timeZone,
}) => {
  const isInRange = (dateKey) => {
    if (!dateKey) return false;

    return (!startKey || dateKey >= startKey) && (!endKey || dateKey <= endKey);
  };

  // Total screen time.
  const screenTime = dailyUsage.reduce((total, day) => {
    if (!isInRange(day.date)) return total;

    const dailyTotal = (day.apps || []).reduce(
      (sum, app) => sum + (Number(app.screen_time_minutes) || 0),
      0,
    );

    return total + dailyTotal;
  }, 0);

  // Total sent and received messages.
  const messageCount = messages.filter((message) => {
    const direction = message.direction?.toLowerCase();

    return (
      (direction === "sent" || direction === "received") &&
      isInRange(getTimestampDateKey(message.timestamp, timeZone))
    );
  }).length;

  // Total call records.
  const callCount = calls.filter((call) =>
    isInRange(getTimestampDateKey(call.timestamp, timeZone)),
  ).length;

  // Total location updates.
  const locationCount = locations.filter((location) =>
    isInRange(getTimestampDateKey(location.timestamp, timeZone)),
  ).length;

  return {
    screenTime,
    messages: messageCount,
    calls: callCount,
    locations: locationCount,
  };
};

const Home = () => {
  const locations = locationData.locations ?? [];
  const gallery = galleryData.gallery ?? [];
  const activity = activityData.recent_app_activity ?? [];
  const messages = messageLogs.messages ?? [];
  const calls = callLogs.call_logs ?? [];

  const dailyUsage = Array.isArray(AppLogData.daily_usage)
    ? AppLogData.daily_usage
    : [];

  const TIME_ZONE = AppLogData.meta?.timezone || "Africa/Lagos";

  // Home overview timeline.
  const [selectedPeriod, setSelectedPeriod] = useState("All time");

  const timelinePeriods = ["All time", "30d", "7d", "Today"];

  // Get today's calendar date in the reporting timezone.
  const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );

    return new Date(
      Date.UTC(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
      ),
    );
  };

  // Get Monday of a given week.
  const getMonday = (date) => {
    const result = new Date(date);
    const day = result.getUTCDay();

    result.setUTCDate(result.getUTCDate() - ((day + 6) % 7));

    return result;
  };

  // Add or subtract calendar days.
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);

    return result;
  };

  // Convert a date into YYYY-MM-DD.
  const getUTCDateKey = (date) => {
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
  };

  // Current reporting date.
  const today = useMemo(() => getToday(), []);

  // Calculate the selected and previous reporting periods.
  const dateRanges = useMemo(() => {
    if (selectedPeriod === "All time") {
      return {
        currentStart: null,
        currentEnd: null,
        previousStart: null,
        previousEnd: null,
        label: "all time",
      };
    }

    const days =
      selectedPeriod === "Today" ? 1 : selectedPeriod === "7d" ? 7 : 30;

    const currentStart = addDays(today, -(days - 1));
    const previousEnd = addDays(currentStart, -1);
    const previousStart = addDays(previousEnd, -(days - 1));

    return {
      currentStart: getUTCDateKey(currentStart),
      currentEnd: getUTCDateKey(today),
      previousStart: getUTCDateKey(previousStart),
      previousEnd: getUTCDateKey(previousEnd),
      label:
        selectedPeriod === "Today" ? "previous day" : `previous ${days} days`,
    };
  }, [selectedPeriod, today]);

  // Calculate current and previous Home statistics.
  const homeStats = useMemo(() => {
    const current = calculateHomeStats({
      dailyUsage,
      messages,
      calls,
      locations,
      startKey: dateRanges.currentStart,
      endKey: dateRanges.currentEnd,
      timeZone: TIME_ZONE,
    });

    const previous =
      selectedPeriod === "All time"
        ? null
        : calculateHomeStats({
            dailyUsage,
            messages,
            calls,
            locations,
            startKey: dateRanges.previousStart,
            endKey: dateRanges.previousEnd,
            timeZone: TIME_ZONE,
          });

    return { current, previous };
  }, [
    dailyUsage,
    messages,
    calls,
    locations,
    dateRanges,
    selectedPeriod,
    TIME_ZONE,
  ]);

  // Calculate percentage changes.
  const getChange = (currentValue, previousValue) => {
    if (selectedPeriod === "All time" || previousValue === null) {
      return null;
    }

    if (previousValue === 0) {
      return currentValue === 0 ? 0 : null;
    }

    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  // Home overview data cards.
  const summaryWidgets = [
    {
      icon: <IconHourglass size={16} />,
      title: "Screen Time",
      value: formatScreenTime(homeStats.current.screenTime),
      change: getChange(
        homeStats.current.screenTime,
        homeStats.previous?.screenTime ?? null,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconMessage size={16} />,
      title: "Messages",
      value: homeStats.current.messages.toLocaleString(),
      change: getChange(
        homeStats.current.messages,
        homeStats.previous?.messages ?? null,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconPhone size={16} />,
      title: "Calls",
      value: homeStats.current.calls.toLocaleString(),
      change: getChange(
        homeStats.current.calls,
        homeStats.previous?.calls ?? null,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconMapPin size={16} />,
      title: "Location Updates",
      value: homeStats.current.locations.toLocaleString(),
      change: getChange(
        homeStats.current.locations,
        homeStats.previous?.locations ?? null,
      ),
      period: dateRanges.label,
    },
  ];

  // Weekly chart navigation.
  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  const currentWeekStart = getMonday(today);

  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  const goToPreviousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
  };

  const goToNextWeek = () => {
    setWeekStart((current) => {
      const nextWeek = addDays(current, 7);

      return nextWeek > currentWeekStart ? current : nextWeek;
    });
  };

  // Calculate screen time for the currently selected week.
  const weeklyScreenTime = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);

    const startKey = getUTCDateKey(weekStart);
    const endKey = getUTCDateKey(weekEnd);

    return dailyUsage.reduce((total, day) => {
      if (day.date < startKey || day.date > endKey) {
        return total;
      }

      const dailyTotal = (day.apps || []).reduce(
        (sum, app) => sum + (Number(app.screen_time_minutes) || 0),
        0,
      );

      return total + dailyTotal;
    }, 0);
  }, [dailyUsage, weekStart]);

  // Calculate screen time for the previous week.
  const previousWeekScreenTime = useMemo(() => {
    const previousWeekStart = addDays(weekStart, -7);
    const previousWeekEnd = addDays(weekStart, -1);

    const startKey = getUTCDateKey(previousWeekStart);
    const endKey = getUTCDateKey(previousWeekEnd);

    return dailyUsage.reduce((total, day) => {
      if (day.date < startKey || day.date > endKey) {
        return total;
      }

      const dailyTotal = (day.apps || []).reduce(
        (sum, app) => sum + (Number(app.screen_time_minutes) || 0),
        0,
      );

      return total + dailyTotal;
    }, 0);
  }, [dailyUsage, weekStart]);

  // Calculate weekly screen time percentage change.
  const weeklyChange = useMemo(() => {
    if (previousWeekScreenTime === 0) {
      return weeklyScreenTime === 0 ? 0 : null;
    }

    return Math.round(
      ((weeklyScreenTime - previousWeekScreenTime) / previousWeekScreenTime) *
        100,
    );
  }, [weeklyScreenTime, previousWeekScreenTime]);

  // Format timestamps using the browser's local timezone.
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();

    const startOfDay = (value) =>
      new Date(value.getFullYear(), value.getMonth(), value.getDate());

    const todayDate = startOfDay(now);
    const targetDay = startOfDay(date);

    const diffDays = Math.round(
      (todayDate - targetDay) / (1000 * 60 * 60 * 24),
    );

    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (diffDays === 0) {
      return time;
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

  const formatDuration = (seconds) => {
    const totalSeconds = Number(seconds) || 0;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
      return `${h}h ${m}m`;
    }

    return `${m}m ${s}s`;
  };

  // Calculate app usage statistics for the Home distribution.
  const appUsageStats = useMemo(
    () => calculateUsageStats(dailyUsage, Math.max(1, dailyUsage.length)),
    [dailyUsage],
  );

  const { distributionData } = appUsageStats;

  // Selected distribution application.
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // Store extracted colours for each application.
  const [distributionColorsByApp, setDistributionColorsByApp] = useState({});

  // Extract a representative colour palette from each app icon.
  useEffect(() => {
    let cancelled = false;

    const extractColors = async () => {
      const results = await Promise.all(
        distributionData.map(async (item) => {
          if (!item.app_icon) {
            return [item.name, item.color];
          }

          try {
            const palette = await Vibrant.from(item.app_icon).getPalette();

            const extractedColor =
              palette.Vibrant?.hex ||
              palette.DarkVibrant?.hex ||
              palette.LightVibrant?.hex ||
              palette.Muted?.hex ||
              palette.DarkMuted?.hex ||
              palette.LightMuted?.hex;

            return [item.name, extractedColor || item.color];
          } catch (error) {
            console.error(`Could not extract colour for ${item.name}:`, error);

            return [item.name, item.color];
          }
        }),
      );

      if (!cancelled) {
        setDistributionColorsByApp(Object.fromEntries(results));
      }
    };

    extractColors();

    return () => {
      cancelled = true;
    };
  }, [distributionData]);

  // Apply extracted colours to the distribution data.
  const coloredDistributionData = useMemo(
    () =>
      distributionData.map((item) => ({
        ...item,
        color: distributionColorsByApp[item.name] || item.color,
      })),
    [distributionData, distributionColorsByApp],
  );

  // Total screen time represented in the distribution.
  const distributionTotal = useMemo(
    () => distributionData.reduce((total, item) => total + item.value, 0),
    [distributionData],
  );

  // Toggle selected distribution application.
  const handleDistributionSelect = (name) => {
    setSelectedDistribution((current) => (current === name ? null : name));
  };

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Home overview</span>
            <div className="timeline">
              {timelinePeriods.map((period) => (
                <button
                  type="button"
                  key={period}
                  className={selectedPeriod === period ? "active" : ""}
                  aria-pressed={selectedPeriod === period}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row data">
          {summaryWidgets.map((widget) => (
            <DataCard key={widget.title} {...widget} />
          ))}
        </div>
      </section>

      <section>
        <div className="header">
          <div className="heads">
            <span>Device info</span>

            <NavLink to={"/activity/all-activity"} className="link-out">
              <IconArrowUpRight stroke={1.5} size={16} />
            </NavLink>
          </div>
        </div>

        <div className="row">
          <div className="device-info-widget">
            <div className="top">
              <div className="device-image">
                <img src={DeviceInfo.deviceImage} alt="" />
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
                <span>Tracking ID</span>
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
                    <span>{formatDuration(item.duration_seconds)}</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="header">
          <div className="heads">
            <span>Location updates</span>

            <NavLink to={"/location-updates"} className="link-out">
              <IconArrowUpRight stroke={1.5} size={16} />
            </NavLink>
          </div>
        </div>

        <div className="row">
          <div className="map-widget">
            <LocationMap />
          </div>

          <div className="recent-location-widget max-forty">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Recent locations</span>
              <div className="icon"></div>
            </div>

            <div className="info">
              {locations.slice(0, 8).map((location) => (
                <div key={location.id}>
                  <div className="icon">
                    <IconMapPin size={18} stroke={1.5} />
                  </div>

                  <div className="contents">
                    <p>{location.address}</p>
                    <span>{formatDate(location.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="row">
        <section className="six-widget">
          <div className="header">
            <div className="heads">
              <span>Screen Time Activity</span>
              <NavLink
                to={"/activity/app-usage"}
                className="link-out"
              ></NavLink>
            </div>

            <WeeklyNavigation
              weekStart={weekStart}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              isCurrentWeek={isCurrentWeek}
            />
          </div>

          <div className="message-activity-widget">
            <div className="head">
              <div>
                <p>Total Screen Time</p>

                <div className="info">
                  <span>{formatScreenTime(weeklyScreenTime)}</span>

                  <div
                    className={`tag ${
                      weeklyChange !== null && weeklyChange < 0
                        ? "negative"
                        : "positive"
                    }`}
                  >
                    {weeklyChange === null
                      ? "New"
                      : `${weeklyChange > 0 ? "+" : ""}${weeklyChange}%`}
                  </div>
                </div>
              </div>

              <div className="sep">
                <div>
                  <div
                    className="dot"
                    style={{ backgroundColor: "#8000FF" }}
                  ></div>

                  <span>Sent Messages</span>
                </div>

                <div>
                  <div
                    className="dot"
                    style={{ backgroundColor: "#390F64" }}
                  ></div>

                  <span>Received Messages</span>
                </div>
              </div>
            </div>

            <AppUsageStackedChart data={AppLogData} weekStart={weekStart} />
          </div>
        </section>

        <section className="max-forty">
          <div className="header">
            <div className="heads">
              <span>App distribution</span>
              <NavLink
                to={"/activity/app-usage"}
                className="link-out"
              ></NavLink>
            </div>
          </div>

          <div className="message-distribution-widget">
            <div className="ring-chart">
              <div className="total">
                <span>{formatScreenTime(distributionTotal)}</span>
                <p>Total</p>
              </div>

              <DistributionChart
                data={coloredDistributionData}
                selectedName={selectedDistribution}
                onSelect={handleDistributionSelect}
                valueFormatter={formatScreenTime}
              />
            </div>

            <div className="message-distribution">
              {coloredDistributionData.map((item) => {
                const percentage = distributionTotal
                  ? (item.value / distributionTotal) * 100
                  : 0;

                const isSelected =
                  selectedDistribution === null ||
                  selectedDistribution === item.name;

                return (
                  <div
                    key={item.name}
                    className="distribution-row"
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedDistribution === item.name}
                    onClick={() => handleDistributionSelect(item.name)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleDistributionSelect(item.name);
                      }
                    }}
                    style={{
                      opacity: isSelected ? 1 : 0.3,
                      cursor: "pointer",
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <div className="app">
                      <div
                        className="icon"
                        style={{
                          backgroundColor: item.app_icon
                            ? "transparent"
                            : item.color,
                        }}
                      >
                        {item.app_icon ? (
                          <img src={item.app_icon} alt="" />
                        ) : (
                          <span>
                            {item.name === "Others" ? "•••" : item.name[0]}
                          </span>
                        )}
                      </div>

                      <span>{item.name}</span>
                    </div>

                    <div className="app-stats">
                      <span className="count">
                        {formatScreenTime(item.value)}
                      </span>

                      <div className="bar-container">
                        <div
                          className="bar"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>

                      <span className="percentage">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <section>
        <div className="header">
          <div className="heads">
            <span>Gallery</span>
            <NavLink to={"/activity/gallery"} className="link-out">
              <IconArrowUpRight stroke={1.5} size={16} />
            </NavLink>
          </div>
        </div>

        <div className="row">
          <div className="gallery-widget">
            {gallery.slice(0, 5).map((media, index) => (
              <div key={media.id ?? media.filename ?? index}>
                <div className="image">
                  <img src={media.thumbnail} alt={media.filename || ""} />
                </div>

                <div className="info">
                  <span>{media.filename}</span>
                  <p>Saved from {media.source}</p>
                  <p>{formatDate(media.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="row">
        <section>
          <div className="header">
            <div className="heads">
              <span>Message logs</span>

              <NavLink to={"/messages/summary"} className="link-out">
                <IconArrowUpRight stroke={1.5} size={16} />
              </NavLink>
            </div>
          </div>

          <div className="row">
            <div className="message-logs-widget">
              {messages.slice(0, 6).map((log) => (
                <div key={log.id}>
                  <div className="icon">
                    {log.conversation_avatar ? (
                      <img
                        className="dp"
                        src={log.conversation_avatar}
                        alt=""
                      />
                    ) : (
                      log.conversation_name?.[0]
                    )}

                    <div className="app-image">
                      <img src={log.app_icon} alt="" />
                    </div>
                  </div>

                  <div className="contents">
                    <div className="lom">
                      <span>{log.conversation_name}</span>
                    </div>

                    <p className="message">{log.message}</p>
                  </div>

                  <span>{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="header">
            <div className="heads">
              <span>Call logs</span>

              <NavLink to={"/activity/call-history"} className="link-out">
                <IconArrowUpRight stroke={1.5} size={16} />
              </NavLink>
            </div>
          </div>

          <div className="row">
            <div className="recent-activity-widget">
              <div className="info">
                {calls.slice(0, 6).map((call, index) => (
                  <div
                    className="calls"
                    key={
                      call.id ??
                      `${call.phone_number}-${call.timestamp}-${index}`
                    }
                  >
                    <div className="contents">
                      <div className="icon">
                        {call.contact_name?.[0]?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <span>{call.contact_name}</span>

                        <div className="lom">
                          <p>{call.phone_number}</p>
                          <div className="dot"></div>
                          <p>{formatDuration(call.duration_seconds)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hik">
                      <span>{formatDate(call.timestamp)}</span>
                      <div className="icon"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
