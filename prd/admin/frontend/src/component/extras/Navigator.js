import { Link, useLocation } from "react-router-dom";
import { Tooltip } from "@mui/material";

const Navigator = (props) => {
  const location = useLocation();

  const { name, path, navIcon, onClick ,navSVG,navIconImg} = props;

  return (
    <li onClick={onClick} key={`navHade`}>
      <Tooltip title={name} placement="right" >
        <Link
          to={{ pathname: path }}
          className={`${location.pathname === path && "activeMenu"} betBox`}
        >
          <div>
            {navIconImg ? (
                <>
                  <img src={navIconImg} alt=""/>
                </>
              ) : navIcon ? (
                <>
                  <i className={navIcon}></i>
                </>
              ) : (
                <>{navSVG}</>
              )}
            <span className="text-capitalize ms-3 my-auto">{name}</span>
          </div>
          {props?.children && <i className="ri-arrow-right-s-line fs-18"></i>}
        </Link>
      </Tooltip>
      {/* If Submenu */}
      <Tooltip title={name} placement="right">
        {props.children}
      </Tooltip>
    </li>
  );
};

export default Navigator;
