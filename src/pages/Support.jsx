import SupportCards from "../components/SupportCards";
import {
  IconSparklesFilled,
  IconGpsFilled,
  IconMessageFilled,
  IconClockHour4Filled,
  IconUserFilled,
  IconPhotoFilled,
  IconPhoneCallFilled,
  IconHeadsetFilled,
} from "@tabler/icons-react";
import SiteInfo from "../data/SiteInfo";

const Support = () => {
  const supportCards = [
    {
      id: 1,
      icon: <IconSparklesFilled stroke={1.5} size={18} />,
      title: "Getting Started",
      subtext:
        "Learn your way around the dashboard, understand its features, and get started with device monitoring.",
    },
    {
      id: 2,
      icon: <IconGpsFilled stroke={1.5} size={18} />,
      title: "Location Updates",
      subtext:
        "Learn how to view recent locations, understand location updates, and explore location history.",
    },
    {
      id: 3,
      icon: <IconMessageFilled stroke={1.5} size={18} />,
      title: "Messages & Communication",
      subtext:
        "Find and understand message records across WhatsApp, Instagram, Facebook, and email.",
    },
    {
      id: 4,
      icon: <IconClockHour4Filled stroke={1.5} size={18} />,
      title: "App Usage & Screen Time",
      subtext:
        "Explore app activity, screen time, usage patterns, and application statistics.",
    },
    {
      id: 5,
      icon: <IconPhoneCallFilled stroke={1.5} size={18} />,
      title: "Calls & Browsing History",
      subtext:
        "Learn how to review call records, visited websites, and browsing activity.",
    },
    {
      id: 6,
      icon: <IconPhotoFilled stroke={1.5} size={18} />,
      title: "Gallery & Contacts",
      subtext:
        "Find out how to view saved media, browse gallery records, and access contact information.",
    },
    {
      id: 7,
      icon: <IconUserFilled stroke={1.5} size={18} />,
      title: "Account & Settings",
      subtext:
        "Manage your account, security settings, profile details, and dashboard preferences.",
    },
  ];

  return (
    <>
      <section>
        <div className="header">
          <div className="heads">
            <span>Help & support</span>
          </div>
        </div>
        <div className="support-widget">
          <div className="icon">
            <IconHeadsetFilled />
          </div>
          <div className="contents">
            <span>
              <p>How can we help you? {SiteInfo.username}</p>
            </span>
            <p>
              Search our guides, FAQs, and helpful resources to find answers and
              learn more about using your dashboard.
            </p>
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Search for guides, FAQs, or a specific issue..."
            />
          </div>
        </div>
      </section>
      <section>
        <div className="header">
          <div className="heads">
            <span>Quick actions</span>
          </div>
        </div>
        <div className="supporting">
          {supportCards.map((card) => {
            return <SupportCards key={card.id} {...card} />;
          })}
        </div>
      </section>
    </>
  );
};

export default Support;
