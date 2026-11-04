import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Location from "./pages/Location";

import AllActivity from "./pages/activity/AllActivity";
import Contacts from "./pages/activity/Contacts";
import Gallery from "./pages/activity/Gallery";
import BrowserHistory from "./pages/activity/BrowserHistory";
import CallHistory from "./pages/activity/CallHistory";
import AppUsage from "./pages/activity/AppUsage";

import Emails from "./pages/messages/emails/Emails";
import Whatsapp from "./pages/messages/whatsapp/Whatsapp";
import Instagram from "./pages/messages/instagram/Instagram";
import Summary from "./pages/messages/Summary";
import Facebook from "./pages/messages/facebook/Facebook";

import RemoteCamera from "./pages/monitoring/RemoteCamera";
import LiveScreenStreaming from "./pages/monitoring/LiveScreenStreaming";
import CallRecordings from "./pages/monitoring/CallRecordings";
import SurroundListening from "./pages/monitoring/SurroundListening";

import Support from "./pages/Support";
import Settings from "./pages/Settings";
import ChatHistory from "./pages/messages/chat/ChatHistory";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/location-updates" element={<Location />} />

          <Route path="/activity/all-activity" element={<AllActivity />} />
          <Route path="/activity/app-usage" element={<AppUsage />} />
          <Route path="/activity/call-history" element={<CallHistory />} />
          <Route
            path="/activity/browser-history"
            element={<BrowserHistory />}
          />
          <Route path="/activity/gallery" element={<Gallery />} />
          <Route path="/activity/contacts" element={<Contacts />} />

          <Route path="/messages/summary" element={<Summary />} />
          <Route path="/messages/whatsapp" element={<Whatsapp />} />

          <Route path="/messages/:platform/:slug" element={<ChatHistory />} />

          <Route path="/messages/emails" element={<Emails />} />
          <Route path="/messages/instagram" element={<Instagram />} />
          <Route path="/messages/facebook" element={<Facebook />} />

          <Route path="/monitoring/remote-camera" element={<RemoteCamera />} />
          <Route
            path="/monitoring/live-screen-streaming"
            element={<LiveScreenStreaming />}
          />
          <Route
            path="/monitoring/surroundings-listening"
            element={<SurroundListening />}
          />
          <Route
            path="/monitoring/call-reordings"
            element={<CallRecordings />}
          />

          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <div></div>
    </>
  );
}

export default App;
