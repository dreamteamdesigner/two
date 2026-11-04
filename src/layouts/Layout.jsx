import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLocation, Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OverlayManager from "../components/overlays/OverlayManager";

const Layout = () => {
  const { pathname } = useLocation();

  const pageContainerRef = useRef(null);

  useLayoutEffect(() => {
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const [activeOverlay, setActiveOverlay] = useState(null);

  const openOverlay = useCallback((overlay) => {
    setActiveOverlay(overlay);
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  useEffect(() => {
    closeOverlay();
  }, [pathname, closeOverlay]);

  const pageTitles = {
    "/": "Dashboard",

    "/monitoring/remote-camera": "Remote camera",
    "/monitoring/live-screen-streaming": "Live screen streaming",
    "/monitoring/surroundings-listening": "Surroundings listening",
    "/monitoring/call-reordings": "Call recordings",

    "/location-updates": "Location updates",

    "/messages/summary": "Summary",
    "/messages/whatsapp": "WhatsApp",
    "/messages/emails": "Emails",
    "/messages/instagram": "Instagram",
    "/messages/facebook": "Facebook",

    "/activity/all-activity": "All activity",
    "/activity/app-usage": "App usage",
    "/activity/call-history": "Call history",
    "/activity/browser-history": "Browser history",
    "/activity/gallery": "Gallery",
    "/activity/contacts": "Contacts",

    "/support": "Help & support",
    "/settings": "Settings",
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <>
      <Sidebar />

      <main>
        <div className="page-container" ref={pageContainerRef}>
          <Navbar pageTitle={pageTitle} openOverlay={openOverlay} />

          <Outlet />
        </div>
      </main>

      <OverlayManager
        activeOverlay={activeOverlay}
        onClose={closeOverlay}
        openOverlay={openOverlay}
      />
    </>
  );
};

export default Layout;
