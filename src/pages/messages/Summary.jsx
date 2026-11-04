import React, { useEffect, useMemo, useState } from "react";

import {
  IconMessage,
  IconBell,
  IconMailDown,
  IconMailUp,
} from "@tabler/icons-react";

import { Vibrant } from "node-vibrant/browser";

import messageData from "../../data/messageLogs.json";

import DataCard from "../../components/DataCard";
import MessageActivityChart from "../../components/MessageActivityChart";
import MessageDistributionChart from "../../components/MessageDistributionChart";
import WeeklyNavigation from "../../components/WeeklyNavigation";
import Pagination from "../../components/Pagination";

// Message distribution fallback colors
const distributionColors = ["#8000FF", "#A855F7", "#390F64", "#6B6474"];

// Get today's calendar date using the browser's local timezone.
const getToday = () => {
  const now = new Date();

  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
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

// Get a message's calendar date using the browser's local timezone.
const getMessageDateKey = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return null;

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// Filter messages between two calendar dates.
// Only sent and received messages are counted.
const getMessagesBetween = (records, startDate, endDate) => {
  const startKey = getUTCDateKey(startDate);
  const endKey = getUTCDateKey(endDate);

  return records.filter((message) => {
    const dateKey = getMessageDateKey(message.timestamp);
    const direction = message.direction?.toLowerCase();

    if (!dateKey) return false;

    if (direction !== "sent" && direction !== "received") {
      return false;
    }

    return dateKey >= startKey && dateKey <= endKey;
  });
};

const Summary = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("All time");

  // Selected distribution platform
  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // Store extracted colours for each app
  const [distributionColorsByApp, setDistributionColorsByApp] = useState({});

  // Message logs pagination
  const [messagePageIndex, setMessagePageIndex] = useState(0);
  const messagePageSize = 10;

  // Weekly chart navigation
  const [weekStart, setWeekStart] = useState(() => getMonday(getToday()));

  const currentWeekStart = getMonday(getToday());

  const goToPreviousWeek = () => {
    setWeekStart((current) => addDays(current, -7));
  };

  const goToNextWeek = () => {
    setWeekStart((current) => {
      const nextWeek = addDays(current, 7);

      return nextWeek > currentWeekStart ? current : nextWeek;
    });
  };

  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();

  // Format message timestamps using the browser's local timezone.
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    const targetKey = getMessageDateKey(dateString);
    const todayKey = getUTCDateKey(getToday());

    const targetDate = new Date(`${targetKey}T00:00:00Z`);
    const todayDate = new Date(`${todayKey}T00:00:00Z`);

    const diffDays = Math.round(
      (todayDate - targetDate) / (1000 * 60 * 60 * 24),
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
      const weekday = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      return `${weekday}, ${time}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const messages = messageData.messages ?? [];

  // Sort messages by date (newest first).
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      ),
    [messages],
  );

  // Calculate message log pagination.
  const messagePageCount = Math.ceil(sortedMessages.length / messagePageSize);

  const paginatedMessages = sortedMessages.slice(
    messagePageIndex * messagePageSize,
    (messagePageIndex + 1) * messagePageSize,
  );

  // Calculate message distribution by platform.
  const distributionData = useMemo(() => {
    const platformCounts = messages.reduce((acc, message) => {
      const appName = message.app_name?.trim() || "Unknown";

      if (!acc[appName]) {
        acc[appName] = {
          value: 0,
          app_icon: null,
        };
      }

      acc[appName].value += 1;

      // Store the platform's icon path.
      if (!acc[appName].app_icon && message.app_icon) {
        acc[appName].app_icon = message.app_icon;
      }

      return acc;
    }, {});

    // Rank platforms by message count.
    const rankedPlatforms = Object.entries(platformCounts)
      .map(([name, platform]) => ({
        name,
        value: platform.value,
        app_icon: platform.app_icon,
      }))
      .sort((a, b) => b.value - a.value);

    // Get the top three platforms.
    const topThree = rankedPlatforms.slice(0, 3).map((item, index) => ({
      ...item,
      color: distributionColors[index],
    }));

    // Combine all remaining platforms into Others.
    const othersTotal = rankedPlatforms
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

    return topThree;
  }, [messages]);

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

            // Prefer vivid colours, then fall back to softer palette colours.
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

  // Apply the extracted colours to the distribution data.
  const coloredDistributionData = useMemo(
    () =>
      distributionData.map((item) => ({
        ...item,
        color: distributionColorsByApp[item.name] || item.color,
      })),
    [distributionData, distributionColorsByApp],
  );

  // Total messages represented in the distribution.
  const distributionTotal = useMemo(
    () => distributionData.reduce((total, item) => total + item.value, 0),
    [distributionData],
  );

  // Toggle selected distribution platform.
  const handleDistributionSelect = (name) => {
    setSelectedDistribution((current) => (current === name ? null : name));
  };

  // Calculate the total messages for the selected calendar week.
  const weeklyTotalMessages = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);

    return getMessagesBetween(messages, weekStart, weekEnd).length;
  }, [messages, weekStart]);

  // Calculate the previous week's total.
  const previousWeekTotalMessages = useMemo(() => {
    const previousWeekStart = addDays(weekStart, -7);
    const previousWeekEnd = addDays(weekStart, -1);

    return getMessagesBetween(messages, previousWeekStart, previousWeekEnd)
      .length;
  }, [messages, weekStart]);

  // Calculate the weekly percentage change.
  const weeklyChange = useMemo(() => {
    if (previousWeekTotalMessages === 0) {
      return weeklyTotalMessages === 0 ? 0 : null;
    }

    return Math.round(
      ((weeklyTotalMessages - previousWeekTotalMessages) /
        previousWeekTotalMessages) *
        100,
    );
  }, [weeklyTotalMessages, previousWeekTotalMessages]);

  // Calculate message statistics for the selected timeline period.
  const { current, previous, label } = useMemo(() => {
    const today = getToday();

    if (selectedPeriod === "All time") {
      return {
        current: messages.filter((item) => {
          const direction = item.direction?.toLowerCase();

          return (
            Number.isFinite(new Date(item.timestamp).getTime()) &&
            (direction === "sent" || direction === "received")
          );
        }),
        previous: [],
        label: "all time",
      };
    }

    // Today compared with yesterday.
    if (selectedPeriod === "Today") {
      const yesterday = addDays(today, -1);

      return {
        current: getMessagesBetween(messages, today, today),
        previous: getMessagesBetween(messages, yesterday, yesterday),
        label: "yesterday",
      };
    }

    // When 7d is selected, use the exact week selected
    // by the Message Activity navigation.
    if (selectedPeriod === "7d") {
      const weekEnd = addDays(weekStart, 6);

      const previousWeekStart = addDays(weekStart, -7);
      const previousWeekEnd = addDays(weekStart, -1);

      return {
        current: getMessagesBetween(messages, weekStart, weekEnd),

        previous: getMessagesBetween(
          messages,
          previousWeekStart,
          previousWeekEnd,
        ),

        label: "previous week",
      };
    }

    // Last 30 days compared with the preceding 30 days.
    const days = 30;

    const currentStart = addDays(today, -(days - 1));
    const previousEnd = addDays(currentStart, -1);
    const previousStart = addDays(previousEnd, -(days - 1));

    return {
      current: getMessagesBetween(messages, currentStart, today),

      previous: getMessagesBetween(messages, previousStart, previousEnd),

      label: "last 30 days",
    };
  }, [messages, selectedPeriod, weekStart]);

  // Calculate statistics.
  const getStats = (records) => ({
    total: records.length,

    unread: records.filter((item) => item.is_read === false).length,

    received: records.filter(
      (item) => item.direction?.toLowerCase() === "received",
    ).length,

    sent: records.filter((item) => item.direction?.toLowerCase() === "sent")
      .length,
  });

  const currentStats = useMemo(() => getStats(current), [current]);

  const previousStats = useMemo(() => getStats(previous), [previous]);

  // Calculate percentage changes.
  const getChange = (currentValue, previousValue) => {
    if (selectedPeriod === "All time") {
      return null;
    }

    if (previousValue === 0) {
      return currentValue === 0 ? 0 : null;
    }

    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  const summaryWidgets = [
    {
      icon: <IconMessage size={16} />,
      title: "Total messages",
      value: currentStats.total.toLocaleString(),
      change: getChange(currentStats.total, previousStats.total),
      period: label,
    },
    {
      icon: <IconBell size={16} />,
      title: "Unread messages",
      value: currentStats.unread.toLocaleString(),
      change: getChange(currentStats.unread, previousStats.unread),
      period: label,
    },
    {
      icon: <IconMailDown size={16} />,
      title: "Received messages",
      value: currentStats.received.toLocaleString(),
      change: getChange(currentStats.received, previousStats.received),
      period: label,
    },
    {
      icon: <IconMailUp size={16} />,
      title: "Sent messages",
      value: currentStats.sent.toLocaleString(),
      change: getChange(currentStats.sent, previousStats.sent),
      period: label,
    },
  ];

  const timelinePeriods = ["All time", "30d", "7d", "Today"];

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Message logs</span>
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

      <div className="row">
        <section className="six-widget">
          <div className="header">
            <div className="heads">
              <span>Message Activity</span>
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
                <p>Total messages</p>

                <div className="info">
                  <span>{weeklyTotalMessages.toLocaleString()}</span>

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

            <MessageActivityChart weekStart={weekStart} />
          </div>
        </section>

        <section className="max-forty">
          <div className="header">
            <div className="heads">
              <span>Message distribution</span>
            </div>
          </div>

          <div className="message-distribution-widget">
            <div className="ring-chart">
              <div className="total">
                <span>{distributionTotal.toLocaleString()}</span>
                <p>Total</p>
              </div>

              <MessageDistributionChart
                data={coloredDistributionData}
                selectedName={selectedDistribution}
                onSelect={handleDistributionSelect}
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
                        {item.app_icon && <img src={item.app_icon} alt="" />}
                      </div>

                      <span>{item.name}</span>
                    </div>

                    <div className="app-stats">
                      <span className="count">
                        {item.value.toLocaleString()}
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

      <div className="row">
        <section>
          <div className="header">
            <div className="heads">
              <span>Message logs</span>

              <div className="link-out"></div>
            </div>
          </div>

          <div className="row">
            <div className="message-logs-widget">
              {paginatedMessages.map((log) => (
                <div key={log.id}>
                  <div className="icon">
                    {log.conversation_avatar ? (
                      <img
                        className="dp"
                        src={log.conversation_avatar}
                        alt=""
                      />
                    ) : (
                      log.conversation_name[0]
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

          <Pagination
            pageCount={messagePageCount}
            currentPage={messagePageIndex + 1}
            onPageChange={(page) => setMessagePageIndex(page - 1)}
          />
        </section>
      </div>
    </>
  );
};

export default Summary;
