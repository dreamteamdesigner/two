import {
  IconLayoutGrid,
  IconMapPin,
  IconMessage,
  IconActivity,
  IconDeviceRemote,
  IconDeviceRemoteFilled,
  IconHeadset,
  IconSettings,
  IconLayoutGridFilled,
  IconMapPinFilled,
  IconHeadsetFilled,
  IconSettingsFilled,
  IconMessage2Filled,
} from "@tabler/icons-react";

const SidebarData = [
  [
    {
      title: "dashboard",
      destination: "/",
      icon: IconLayoutGrid,
      activeIcon: IconLayoutGridFilled,
    },
    {
      title: "monitoring",
      destination: "/monitoring/remote-camera",
      icon: IconDeviceRemote,
      activeIcon: IconDeviceRemoteFilled,
      sublinks: [
        { name: "remote camera", path: "/monitoring/remote-camera" },
        {
          name: "live screen streaming",
          path: "/monitoring/live-screen-streaming",
        },
        {
          name: "Surroundings listening",
          path: "/monitoring/surroundings-listening",
        },
        { name: "Call reordings", path: "/monitoring/call-reordings" },
      ],
    },
    {
      title: "location updates",
      destination: "/location-updates",
      icon: IconMapPin,
      activeIcon: IconMapPinFilled,
    },
    {
      title: "messages",
      destination: "/messages/summary",
      icon: IconMessage,
      activeIcon: IconMessage2Filled,
      sublinks: [
        { name: "summary", path: "/messages/summary" },
        { name: "WhatsApp", path: "/messages/whatsapp" },
        { name: "emails", path: "/messages/emails" },
        { name: "instagram", path: "/messages/instagram" },
        { name: "facebook", path: "/messages/facebook" },
      ],
    },
    {
      title: "activity",
      destination: "/activity/all-activity",
      icon: IconActivity,
      activeIcon: "",
      sublinks: [
        { name: "all activity", path: "/activity/all-activity" },
        { name: "app usage", path: "/activity/app-usage" },
        { name: "call history", path: "/activity/call-history" },
        { name: "gallery", path: "/activity/gallery" },
        { name: "contacts", path: "/activity/contacts" },
        { name: "browser history", path: "/activity/browser-history" },
      ],
    },
  ],
  [
    {
      title: "help & support",
      destination: "/support",
      icon: IconHeadset,
      activeIcon: IconHeadsetFilled,
    },
    {
      title: "settings",
      destination: "/settings",
      icon: IconSettings,
      activeIcon: IconSettingsFilled,
    },
  ],
];

export default SidebarData;
