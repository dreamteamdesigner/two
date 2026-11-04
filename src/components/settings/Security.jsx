import React from 'react'
import {
  IconLock,
  IconDeviceLaptop,
  IconDeviceMobile,
} from "@tabler/icons-react";

import Toggle from "../Toggle";
import SiteInfo from "../../data/SiteInfo";

const Security = () => {
  return (
    <div className="container">
      <div className="head">
        <div className="icon">
          <IconLock stroke={1.5} size={18} />
        </div>
        <span>Security & Privacy</span>
      </div>

      <div className="sec">
        <span>Password & Authentication</span>
        <div className="part one">
          <div className="contents">
            <span>Current password</span>
          </div>
          <div className="profile-input">
            <input type="password" name="" id="" />
          </div>
        </div>
        <div className="part one">
          <div className="contents">
            <span>New password</span>
          </div>
          <div className="profile-input">
            <input type="password" name="" id="" />
          </div>
        </div>
        <div className="part one">
          <div className="contents">
            <span>Confirm new password</span>
          </div>
          <div className="profile-input">
            <input type="password" name="" id="" />
          </div>
        </div>
      </div>
      <div className="sec">
        <span>Additional Security</span>
        <div className="part">
          <div className="contents">
            <span>Two-factor authentication</span>
            <p>Add an extra layer of security when you sign in.</p>
          </div>
          <span>Set up</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Login alerts</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Password change notifications</span>
            <p>Get updates about application usage and activity.</p>
          </div>
          <Toggle type={true} />
        </div>
      </div>
      <div className="sec">
        <span>Active Sessions</span>
        <div className="session">
          <div className="c-session">
            <div className="icon">
              <IconDeviceLaptop stroke={1.5} />
            </div>
            <div className="contents">
              <div>
                <span>MacBook Pro 16"</span>
                <div className="this-device-tag">This device</div>
              </div>
              <div className="location">San francisco, California</div>
              <div className="browser-machine">
                <span className="last-active active">Active now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sec">
        <span>Other Sessions</span>
        <div className="session">
          <div className="c-session">
            <div className="icon">
              <IconDeviceMobile stroke={1.5} />
            </div>
            <div className="contents">
              <div>
                <span>iPhone 14 Plus</span>
              </div>
              <div className="location">San francisco, California</div>
              <div className="browser-machine">
                <span className="last-active">19 hours ago</span>
              </div>
            </div>
            <div className="terminate">Terminate</div>
          </div>
          <div className="c-session">
            <div className="icon">
              <IconDeviceMobile stroke={1.5} />
            </div>
            <div className="contents">
              <div>
                <span>iPhone 17 Pro</span>
              </div>
              <div className="location">San francisco, California</div>
              <div className="browser-machine">
                <span className="last-active">on October 20 at 4:33 AM</span>
              </div>
            </div>
            <div className="terminate">Terminate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security