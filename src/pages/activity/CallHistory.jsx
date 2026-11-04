import React from "react";

import CallHistoryTable from "../../components/CallLogsTable";
import CallLogData from "../../data/callLogs.json";

import {
  IconPhone,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconPhoneX,
} from "@tabler/icons-react";

import DataCard from "../../components/DataCard";

const CallHistory = () => {
  const callLogs = CallLogData.call_logs ?? [];

  const totalCalls = callLogs.length;

  const incomingCalls = callLogs.filter(
    (call) => call.call_type === "incoming",
  ).length;

  const outgoingCalls = callLogs.filter(
    (call) => call.call_type === "outgoing",
  ).length;

  const missedCalls = callLogs.filter(
    (call) => call.status === "missed",
  ).length;

  const callWidgets = [
    {
      icon: <IconPhone size={16} />,
      title: "Total calls",
      value: totalCalls.toLocaleString(),
      change: "All recorded calls",
    },
    {
      icon: <IconPhoneIncoming size={16} />,
      title: "Incoming calls",
      value: incomingCalls.toLocaleString(),
      change: "Calls received",
    },
    {
      icon: <IconPhoneOutgoing size={16} />,
      title: "Outgoing calls",
      value: outgoingCalls.toLocaleString(),
      change: "Calls made",
    },
    {
      icon: <IconPhoneX size={16} />,
      title: "Missed calls",
      value: missedCalls.toLocaleString(),
      change: "Unanswered incoming calls",
    },
  ];

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Overview</span>
          </div>
        </div>

        <div className="row data">
          {callWidgets.map((widget) => (
            <DataCard key={widget.title} {...widget} />
          ))}
        </div>
      </section>

      <CallHistoryTable data={CallLogData} />
    </>
  );
};

export default CallHistory;
