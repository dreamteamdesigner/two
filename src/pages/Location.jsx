import React, { useMemo, useState } from "react";

import { IconMapPin, IconRoute, IconCrosshair } from "@tabler/icons-react";

import locationData from "../data/locataionData.json";
import DataCard from "../components/DataCard";
import LocationTable from "../components/LocationTable";

const Location = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("All time");

  const locations = locationData.locations ?? [];

  const { current, previous, label } = useMemo(() => {
    const now = new Date();
    const end = now.getTime();

    if (selectedPeriod === "All time") {
      const currentRecords = locations.filter(
        (item) => new Date(item.timestamp).getTime() <= end,
      );

      const sorted = [...currentRecords].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );

      return {
        previous: [],
        current: sorted,
        label: "all time",
      };
    }

    if (selectedPeriod === "Today") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();

      const yesterdayStart = start - 24 * 60 * 60 * 1000;

      return {
        current: locations.filter((item) => {
          const time = new Date(item.timestamp).getTime();
          return time >= start && time <= end;
        }),
        previous: locations.filter((item) => {
          const time = new Date(item.timestamp).getTime();
          return time >= yesterdayStart && time < start;
        }),
        label: "yesterday",
      };
    }

    const days = selectedPeriod === "7d" ? 7 : 30;
    const duration = days * 24 * 60 * 60 * 1000;
    const start = end - duration;
    const previousStart = start - duration;

    return {
      current: locations.filter((item) => {
        const time = new Date(item.timestamp).getTime();
        return time >= start && time <= end;
      }),
      previous: locations.filter((item) => {
        const time = new Date(item.timestamp).getTime();
        return time >= previousStart && time < start;
      }),
      label: `last ${days} days`,
    };
  }, [locations, selectedPeriod]);

  const getStats = (records) => {
    const sorted = [...records].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const getDistance = (a, b) => {
      const earthRadiusKm = 6371;

      const lat1 = toRadians(a.latitude);
      const lat2 = toRadians(b.latitude);
      const deltaLat = toRadians(b.latitude - a.latitude);
      const deltaLon = toRadians(b.longitude - a.longitude);

      const h =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

      return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    };

    let distance = 0;

    for (let i = 1; i < sorted.length; i++) {
      distance += getDistance(sorted[i - 1], sorted[i]);
    }

    const accuracies = records
      .map((item) => item.accuracy_meters)
      .filter((value) => Number.isFinite(value) && value >= 0);

    return {
      total: records.length,
      distance,
      accuracy: accuracies.length
        ? accuracies.reduce((sum, value) => sum + value, 0) / accuracies.length
        : null,
      latest: sorted.at(-1)?.timestamp ?? null,
    };
  };

  const currentStats = useMemo(() => getStats(current), [current]);

  const previousStats = useMemo(() => getStats(previous), [previous]);

  const currentCities = new Set(
    current.map((item) => item.city).filter(Boolean),
  ).size;

  const previousCities = new Set(
    previous.map((item) => item.city).filter(Boolean),
  ).size;

  const getChange = (currentValue, previousValue) => {
    if (currentValue === null || previousValue === null) {
      return null;
    }

    if (previousValue === 0) {
      return currentValue === 0 ? 0 : null;
    }

    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  };

  const locationWidgets = [
    {
      icon: <IconMapPin size={16} />,
      title: "Locations pinged",
      value: currentStats.total.toLocaleString(),
      change: getChange(currentStats.total, previousStats.total),
      period: label,
    },
    {
      icon: <IconMapPin size={16} />,
      title: "Cities Recorded",
      value: currentCities.toLocaleString(),
      change: getChange(currentCities, previousCities),
      period: label,
    },
    {
      icon: <IconRoute size={16} />,
      title: "Distance Travelled",
      value: `${currentStats.distance.toLocaleString("en-US", {
        maximumFractionDigits: 1,
      })} km`,
      change: getChange(currentStats.distance, previousStats.distance),
      period: label,
    },
    {
      icon: <IconCrosshair size={16} />,
      title: "Avg GPS Accuracy",
      value:
        currentStats.accuracy === null
          ? "N/A"
          : `${currentStats.accuracy.toFixed(1)} m`,
      change: getChange(currentStats.accuracy, previousStats.accuracy),
      period: label,
    },
  ];

  const timelinePeriods = ["All time", "30d", "7d", "Today"];

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Location overview</span>
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
          {locationWidgets.map((widget) => (
            <DataCard key={widget.title} {...widget} />
          ))}
        </div>
      </section>

      <LocationTable data={locationData} />
    </>
  );
};

export default Location;
