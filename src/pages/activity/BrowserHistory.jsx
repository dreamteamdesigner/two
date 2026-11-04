import React from 'react'
import BrowserHistoryData from "../../data/BrowserHistory.json"

const BrowserHistory = () => {
  return (
    <>
      <section>
        <div className="header">
          <span>Overview</span>
          <div className="options">
            <div className="timeline">
              <div>All time</div>
              <div>30d</div>
              <div>7d</div>
              <div>Today</div>
            </div>
            <div className="customize">
              <span>customize</span>
              <div className="icon"></div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="data-card">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Total activities</span>
              <div className="icon"></div>
            </div>
            <div className="info">
              <span>258</span>
              <p>
                <span>+12%</span> vs last month
              </p>
            </div>
          </div>
          <div className="data-card">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Total activities</span>
              <div className="icon"></div>
            </div>
            <div className="info">
              <span>258</span>
              <p>
                <span>+12%</span> vs last month
              </p>
            </div>
          </div>
          <div className="data-card">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Total activities</span>
              <div className="icon"></div>
            </div>
            <div className="info">
              <span>258</span>
              <p>
                <span>+12%</span> vs last month
              </p>
            </div>
          </div>
          <div className="data-card">
            <div className="tag-top">
              <div className="icon"></div>
              <span>Total activities</span>
              <div className="icon"></div>
            </div>
            <div className="info">
              <span>258</span>
              <p>
                <span>+12%</span> vs last month
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BrowserHistory