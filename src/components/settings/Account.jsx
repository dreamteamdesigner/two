import React from 'react'
import {
  IconUser,
} from "@tabler/icons-react";

import SiteInfo from "../../data/SiteInfo";

const Account = () => {
  return (
    <div className="container">
      <div className="head">
        <div className="icon">
          <IconUser stroke={1.5} size={18} />
        </div>
        <span>Account Information</span>
      </div>

      <div className="sec">
        <span>Profile Details</span>
        <div className="part one">
          <div className="contents">
            <span>Profile picture</span>
          </div>
          <div className="profile-input">
            <div className="pfp"></div>
            <button className="update-btn">Replace photo</button>
          </div>
        </div>
        <div className="part one">
          <div className="contents">
            <span>Username</span>
          </div>
          <div className="profile-input">
            <input type="text" placeholder={SiteInfo.username} name="" id="" />
          </div>
        </div>
        <div className="part one">
          <div className="contents">
            <span>Email address</span>
          </div>
          <div className="profile-input">
            <input
              type="text"
              placeholder={SiteInfo.email || "Email"}
              name=""
              id=""
            />
          </div>
        </div>
        <div className="part one">
          <div className="contents">
            <span>Phone number</span>
          </div>
          <div className="profile-input">
            <input type="text" name="" id="" />
          </div>
        </div>
      </div>
      <div className="sec">
        <span>Account Information</span>
        <div className="part">
          <div className="contents">
            <span>Account type</span>
            <p>Get notified when new location information is available.</p>
          </div>
          <span>Admin</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Account creation date</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>today</span>
        </div>
      </div>
      <div className="sec">
        <span>Account Status</span>
        <div className="part">
          <div className="contents">
            <span>Current account status</span>
            <p>Get notified when new location information is available.</p>
          </div>
          <span>Admin</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Account type</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>today</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Current plan</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>today</span>
        </div>
      </div>

      <div className="sec">
        <span>Account Actions</span>
        <div className="part">
          <div className="contents">
            <span>Export account data</span>
            <p>Get notified when new location information is available.</p>
          </div>
          <span>Admin</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Sign out of all devices</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>today</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Deactivate account</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>today</span>
        </div>
      </div>

      <div className="sec">
        <span>Danger Zone</span>
        <div className="part">
          <div className="contents">
            <span>Delete Account</span>
            <p>
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <span>Delete</span>
        </div>
      </div>
    </div>
  );
}

export default Account