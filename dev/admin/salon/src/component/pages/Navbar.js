/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { getAdmin } from "../../redux/slice/authSlice";
import Male from "../../../src/assets/images/male.png";
import { openDialog } from "../../redux/slice/dialogueSlice";
import NotificationDialog from "../tables/User/NotificationDialog";
import male from "../../assets/images/male.png";
import { getSetting } from "../../redux/slice/settingSlice";
const Navbar = () => {
  const { admin } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAdmin());
    dispatch(getSetting());
  }, [dispatch]);

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/salonPanel/profile");
  };
  const enterFullscreen = () => {
    document.body.requestFullscreen();
  };

  return (
    <>
      <div className="mainNavbar">
      
        <div className="navBar">
          <div className="innerNavbar betBox">
            <div className="leftNav d-flex">
              <i
                className={`${`ri-bar-chart-horizontal-line`} cursor-pointer fs-20 navToggle`}
              ></i>
              <a onClick={enterFullscreen} className="ms-4 text-white cursor">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-maximize"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              </a>
            </div>
            <div className="rightNav">
              <div className="adminProfile betBox  cursor-pointer ">
                <div
                  className="adminPic m20-right "
                  onClick={() => handleNavigate()}
                >
                  <img
                    src={admin ? admin?.mainImage : Male}
                    alt="admin"
                    onError={(e) => {
                      e.currentTarget.src = male;
                    }}
                  />
                </div>
                <div
                  className="adminDetails me-2"
                  onClick={() => handleNavigate()}
                >
                  <h6 className="m0 text-capitalize">{admin?.name}</h6>
                  <p className="m0">Salon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
