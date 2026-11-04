import { NavLink, useLocation } from "react-router-dom";
import { IconChevronDown } from "@tabler/icons-react";
import NavlinkDropdown from "./NavlinkDropdown";

const NavLinkTab = ({
  title,
  icon: Icon,
  activeIcon: ActiveIcon,
  dropdownLinks,
  destination,
}) => {
  const { pathname } = useLocation();

  const isParentActive = dropdownLinks?.some(
    (link) => pathname === link.path || pathname.startsWith(`${link.path}/`),
  );

  return (
    <div className="nav-link-container">
      <NavLink
        to={destination}
        end={!dropdownLinks}
        className={({ isActive }) =>
          `nav-link ${isParentActive || isActive ? "active" : ""}`
        }
      >
        {({ isActive }) => {
          const active = isParentActive || isActive;
          const CurrentIcon = active && ActiveIcon ? ActiveIcon : Icon;

          return (
            <>
              <div className="icon">
                {CurrentIcon && <CurrentIcon size={20} stroke={1.5} />}
              </div>

              <span>{title}</span>

              {dropdownLinks && <IconChevronDown stroke={1.5} size={14} />}
            </>
          );
        }}
      </NavLink>

      {dropdownLinks && <NavlinkDropdown links={dropdownLinks} />}
    </div>
  );
};

export default NavLinkTab;
