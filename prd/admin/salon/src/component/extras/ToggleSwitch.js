import React from "react";

const ToggleSwitch = (props) => {
  return (
    <>
   
      <label class="switch">
        <input type="checkbox" checked={props.value} onClick={props.onClick} />
        <div class="slider"></div>
        <div class="slider-card">
          <div class="slider-card-face slider-card-front"></div>
          <div class="slider-card-face slider-card-back"></div>
        </div>
      </label>
    </>
  );
};

export default ToggleSwitch;
