import React from "react";
import { useNavigate } from "react-router-dom";

const Title = (props) => {
  const navigate = useNavigate();
  const { name,display,bottom } = props;

  const handleDashboardClick = () => {
    navigate("/salonPanel/salonDashboard");
  };
  return (
    <div
      className="mainTitle d-flex align-items-center justify-content-between cursor-pointer"
      style={{ marginBottom: bottom }}
    >
      <div
        className="title text-capitalized fw-600 "
        style={{ color: "#686B71", fontSize: "20px" }}
      >
        {name}
      </div>
      <div className="titlePath" style={{ display: display }}>
        <span onClick={handleDashboardClick}>
          Dashboard <i className="ri-arrow-right-s-line"></i>
        </span>
        <span className="text-second"> {name}</span>
      </div>
    </div>
  );
};

export default Title;
