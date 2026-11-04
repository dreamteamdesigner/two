import React from 'react'
import {
  IconCloudUpload,
  IconDatabase,
} from "@tabler/icons-react";

import Toggle from "../Toggle";

const DataSync = () => {
  return (
    <div className="container">
      <div className="head">
        <div className="icon">
          <IconCloudUpload stroke={1.5} size={18} />
        </div>
        <span>Data & Synchronization</span>
      </div>

      <div className="sec">
        <span>Synchronization Status</span>
        <div className="part">
          <div className="contents">
            <span>Current sync status</span>
          </div>
          <span>Not synced</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Last successful synchronization</span>
          </div>
          <span>Yesterday, 08:09 AM</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Manual synchronization</span>
          </div>
          <span>Synchronize</span>
        </div>
      </div>
      <div className="sec">
        <span>Automatic Synchronization</span>
        <div className="part">
          <div className="contents">
            <span>Automatic syncing</span>
            <p>Add an extra layer of security when you sign in.</p>
          </div>
          <Toggle type={true} />
        </div>
        <div className="part">
          <div className="contents">
            <span>Synchronization frequency.</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>Every week</span>
        </div>
      </div>
      <div className="sec">
        <span>Data Management</span>
        <div className="part">
          <div className="wraping">
            <div className="icon">
              <IconDatabase stroke={1.5} />
            </div>
            <div className="contents">
              <span>12/16 GB</span>
              <p>Action required</p>
            </div>
          </div>
          <span>Upgrade plan</span>
        </div>
        <div className="part">
          <div className="contents">
            <span>Export dashboard data</span>
            <p>Receive alerts when new messages are recorded.</p>
          </div>
          <span>Export</span>
        </div>
      </div>
    </div>
  );
}

export default DataSync