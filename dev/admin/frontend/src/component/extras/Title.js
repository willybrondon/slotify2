import React from "react";
import { useNavigate } from "react-router-dom";
import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";

const Title = (props) => {
  const navigate = useNavigate();
  const { name, display, bottom } = props;

  const handleDashboardClick = () => {
    navigate("/admin/adminDashboard");
  };

  return (
    <div
      className="mainTitle d-flex align-items-center justify-content-between cursor-pointer"
      style={{ marginBottom: bottom }}
    >
      <div className="title text-capitalized">{name}</div>
      <div className="titlePath" style={{ display: display }}>
        <span onClick={handleDashboardClick}>
          {ui.breadcrumbHome} <i className="ri-arrow-right-s-line"></i>
        </span>
        <span className="text-second"> {name}</span>
      </div>
    </div>
  );
};

export default Title;
