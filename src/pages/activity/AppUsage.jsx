import React, { useEffect, useMemo, useState } from "react";

import {
  IconClock,
  IconChartBar,
  IconDeviceMobile,
  IconBell,
} from "@tabler/icons-react";

import { Vibrant } from "node-vibrant/browser";

import AppHistoryTable from "../../components/AppUsageTable";
import DataCard from "../../components/DataCard";
import WeeklyNavigation from "../../components/WeeklyNavigation";
import DistributionChart from "../../components/MessageDistributionChart";
import AppLogData from "../../data/appUsage.json";
import AppUsageStackedChart from "../../components/AppUsageStackedChart";

// Reporting timezone.
const TIME_ZONE = AppLogData.meta?.timezone || "Africa/Lagos";

// Distribution fallback colors.
const distributionColors = ["#8000FF", "#A855F7", "#390F64", "#6B6474"];

// Timeline periods.
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
    Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)),
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

// Convert a date string into a Date object without timezone shifting.
const parseDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00Z`);

  return Number.isNaN(date.getTime()) ? null : date;
};

// Calculate the number of calendar days between two dates.
const getRangeDays = (start, end) => {
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
};

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

// Calculate percentage change.
const getChange = (currentValue, previousValue, selectedPeriod) => {
  if (selectedPeriod === "All time") {
    return null;
  }

  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 100);
};

const AppUsage = () => {
  const dailyUsage = Array.isArray(AppLogData.daily_usage)
    ? AppLogData.daily_usage
    : [];

  // Keep date references stable between renders.
  const today = useMemo(() => getToday(), []);

  const reportingStart = useMemo(
    () =>
      parseDate(AppLogData.meta?.period_start) ||
      parseDate(
        [...dailyUsage]
          .map((day) => day.date)
          .filter(Boolean)
          .sort()[0],
      ) ||
      getToday(),
    [],
  );

  const reportingEnd = useMemo(
    () =>
      parseDate(AppLogData.meta?.period_end) ||
      parseDate(
        [...dailyUsage]
          .map((day) => day.date)
          .filter(Boolean)
          .sort()
          .at(-1),
      ) ||
      getToday(),
    [],
  );

  const [selectedPeriod, setSelectedPeriod] = useState("All time");

  const [selectedDistribution, setSelectedDistribution] = useState(null);

  // Store extracted colours for each application.
  const [distributionColorsByApp, setDistributionColorsByApp] = useState({});

  // Start with the latest week containing actual data.
  // const [weekStart, setWeekStart] = useState(() => {
  //   const latestDateString = [...dailyUsage]
  //     .map((day) => day.date)
  //     .filter(Boolean)
  //     .sort()
  //     .at(-1);

  //   const latestDate = parseDate(latestDateString);

  //   const initialDate =
  //     latestDate && latestDate.getTime() < today.getTime() ? latestDate : today;

  //   return getMonday(initialDate);
  // });

  // Always start with the current calendar week.
  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  const currentWeekStart = getMonday(today);

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

  // Get the selected period's date range.
  const dateRanges = useMemo(() => {
    if (selectedPeriod === "All time") {
      return {
        currentStart: reportingStart,
        currentEnd: reportingEnd,
        previousStart: null,
        previousEnd: null,
        periodDays: getRangeDays(reportingStart, reportingEnd),
        label: "all time",
      };
    }

    if (selectedPeriod === "Today") {
      const yesterday = addDays(today, -1);

      return {
        currentStart: today,
        currentEnd: today,
        previousStart: yesterday,
        previousEnd: yesterday,
        periodDays: 1,
        label: "yesterday",
      };
    }

    if (selectedPeriod === "7d") {
      const previousWeekStart = addDays(weekStart, -7);
      const previousWeekEnd = addDays(weekStart, -1);
      const weekEnd = addDays(weekStart, 6);

      return {
        currentStart: weekStart,
        currentEnd: weekEnd,
        previousStart: previousWeekStart,
        previousEnd: previousWeekEnd,
        periodDays: 7,
        label: "previous week",
      };
    }

    // Last 30 days compared with the preceding 30 days.
    const currentStart = addDays(today, -29);
    const previousEnd = addDays(currentStart, -1);
    const previousStart = addDays(previousEnd, -29);

    return {
      currentStart,
      currentEnd: today,
      previousStart,
      previousEnd,
      periodDays: 30,
      label: "previous 30 days",
    };
  }, [selectedPeriod, reportingStart, reportingEnd, today, weekStart]);

  // Filter daily records for the selected period.
  const currentRecords = useMemo(() => {
    const startKey = getUTCDateKey(dateRanges.currentStart);
    const endKey = getUTCDateKey(dateRanges.currentEnd);

    return dailyUsage.filter(
      (day) => day.date >= startKey && day.date <= endKey,
    );
  }, [dailyUsage, dateRanges]);

  // Filter records for the preceding period.
  const previousRecords = useMemo(() => {
    if (!dateRanges.previousStart || !dateRanges.previousEnd) {
      return [];
    }

    const startKey = getUTCDateKey(dateRanges.previousStart);
    const endKey = getUTCDateKey(dateRanges.previousEnd);

    return dailyUsage.filter(
      (day) => day.date >= startKey && day.date <= endKey,
    );
  }, [dailyUsage, dateRanges]);

  // Calculate current-period statistics.
  const currentStats = useMemo(
    () => calculateUsageStats(currentRecords, dateRanges.periodDays),
    [currentRecords, dateRanges.periodDays],
  );

  // Calculate previous-period statistics.
  const previousStats = useMemo(
    () => calculateUsageStats(previousRecords, dateRanges.periodDays),
    [previousRecords, dateRanges.periodDays],
  );

  const {
    totalScreenTime,
    totalNotifications,
    dailyAverage,
    mostUsedApp,
    mostUsedPercentage,
    distributionData,
    appTotals,
  } = currentStats;

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

  // Compare the current top app against the same app in the previous period.
  const previousMostUsedAppTime = mostUsedApp
    ? previousStats.appTotals[mostUsedApp.name] || 0
    : 0;

  // Data cards.
  const summaryWidgets = [
    {
      icon: <IconClock size={16} />,
      title: "Total screen time",
      value: formatScreenTime(totalScreenTime),
      change: getChange(
        totalScreenTime,
        previousStats.totalScreenTime,
        selectedPeriod,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconChartBar size={16} />,
      title: "Daily avg",
      value: formatScreenTime(dailyAverage),
      change: getChange(
        dailyAverage,
        previousStats.dailyAverage,
        selectedPeriod,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconDeviceMobile size={16} />,
      title: "Most used app",
      value: mostUsedApp?.name || "—",
      change: getChange(
        mostUsedApp?.value || 0,
        previousMostUsedAppTime,
        selectedPeriod,
      ),
      period: dateRanges.label,
    },
    {
      icon: <IconBell size={16} />,
      title: "Notifications",
      value: totalNotifications.toLocaleString(),
      change: getChange(
        totalNotifications,
        previousStats.totalNotifications,
        selectedPeriod,
      ),
      period: dateRanges.label,
    },
  ];

  // Total screen time represented in the distribution.
  const distributionTotal = useMemo(
    () => distributionData.reduce((total, item) => total + item.value, 0),
    [distributionData],
  );

  // Toggle selected distribution application.
  const handleDistributionSelect = (name) => {
    setSelectedDistribution((current) => (current === name ? null : name));
  };

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

  // Change timeline period and clear the selected app.
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setSelectedDistribution(null);
  };

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Overview</span>
          </div>

          <div className="options">
            <div className="timeline">
              {timelinePeriods.map((period) => (
                <button
                  type="button"
                  key={period}
                  className={selectedPeriod === period ? "active" : ""}
                  aria-pressed={selectedPeriod === period}
                  onClick={() => handlePeriodChange(period)}
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="customize">
              <span>customize</span>
              <div className="icon"></div>
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
              <span>Screen Time Activity</span>
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

      <AppHistoryTable data={AppLogData} />
    </>
  );
};;

export default AppUsage;
