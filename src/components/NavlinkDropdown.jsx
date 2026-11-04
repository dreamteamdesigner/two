import React from "react";
import { NavLink } from "react-router-dom";

const NavlinkDropdown = ({ links }) => {
  return (
    <div className="navlink-dropdown">
      {links.map((link) => (
        <NavLink
          key={link.path}
          className={({ isActive }) =>
            `dropdown-navlink ${isActive ? "active" : ""}`
          }
          to={link.path}
        >
          <div className="indicator"></div>
          {link.name}
        </NavLink>
      ))}

      <div className="line"></div>
    </div>
  );
};

export default NavlinkDropdown;
