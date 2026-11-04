// import { useEffect, useState } from "react";
// import SiteInfo from "../data/SiteInfo";

// const WelcomeMessage = ({ user }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     if (!user?.id) return;

//     const storageKey = `welcome-seen-${user.id}`;
//     const hasSeenWelcome = localStorage.getItem(storageKey);

//     if (!hasSeenWelcome) {
//       setIsOpen(true);
//     }
//   }, [user?.id]);

//   const closeWelcome = () => {
//     localStorage.setItem(`welcome-seen-${user.id}`, "true");
//     setIsOpen(false);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="welcome-overlay">
//       <div className="welcome-modal">
//         <div className="lhs">
//           <img src="" alt="" />
//         </div>
//         <div className="rhs">
//           <div className="top">
//             <div className="logo-cont">
//               <div className="icon"></div>
//               <span>{SiteInfo.name}</span>
//             </div>
//             <h2>
//               The World's Most Powerful Monitoring Software for Computers,
//               Mobile Phones and Tablets
//             </h2>
//             <p>
//               Know Everything That Happens on A Computer or Smartphone, No
//               Matter Where You Are
//             </p>
//           </div>

//           <div className="middle">
//             <ul>
//               <li>
//                 Monitor all Android and iPhone digital and audio communications
//               </li>
//               <li>The only monitoring app that can be hidden</li>
//               <li>Monitor everything that happens on a PC or Mac</li>
//               <li>No Hassle Remote Installation Service</li>
//               <li>Used for Parental Control and Employee Monitoring</li>
//               <li>Used for Partner Monitoring</li>
//             </ul>
//           </div>

//           <button onClick={closeWelcome}>Get started</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WelcomeMessage;

// import { useEffect, useState } from "react";
// import SiteInfo from "../data/SiteInfo";

// const WelcomeMessage = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const storageKey = "welcome-seen";
//     const hasSeenWelcome = localStorage.getItem(storageKey);

//     if (!hasSeenWelcome) {
//       setIsOpen(true);
//     }
//   }, []);

//   const closeWelcome = () => {
//     localStorage.setItem("welcome-seen", "true");
//     setIsOpen(false);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="welcome-overlay">
//       <div className="welcome-modal">

//     </div>
//   );
// };

// export default WelcomeMessage;

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SiteInfo from "../data/SiteInfo";

const WelcomeMessage = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storageKey = "welcome-seen";
    const hasSeenWelcome = localStorage.getItem(storageKey);

    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem("welcome-seen", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: "linear" }}
        >
          <motion.div
            className="welcome-modal"
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3,
            }}
          >
            <div className="lhs">
              <img src="" alt="" />
            </div>
            <div className="rhs">
              <div className="top">
                <div className="logo-cont">
                  <div className="icon">
                    <img src={SiteInfo.logo} alt="" />
                  </div>
                  <span>{SiteInfo.name}</span>
                </div>
                <h2 style={{ lineHeight: "1.4em" }}>
                  Advanced Monitoring Software for Computers, Mobile Phones and
                  Tablets
                </h2>
                <p>
                  Know Everything That Happens on A Computer or Smartphone, No
                  Matter Where You Are
                </p>
              </div>

              <div className="middle">
                <ul>
                  <li>Stay updated with real-time location information.</li>
                  <li>Keep track of messages and communication activity.</li>
                  <li>
                    Review device activity, app usage and browsing history.
                  </li>
                  <li>
                    Monitor all Android and iPhone digital and audio
                    communications
                  </li>
                  <li>The only monitoring app that can be hidden</li>
                  <li>Monitor everything that happens on a PC or Mac</li>
                </ul>
              </div>

              <button onClick={closeWelcome}>Get started</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeMessage;
