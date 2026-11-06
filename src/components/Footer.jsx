import React from "react";
import SiteInfo from "../data/SiteInfo";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div>© 2026 {SiteInfo.name}</div>
      <div>
        <NavLink to={"https://www.instagram.com"}>About us</NavLink>
        <NavLink to={"/support"}>Support</NavLink>
      </div>
    </footer>
  );
};

export default Footer;
