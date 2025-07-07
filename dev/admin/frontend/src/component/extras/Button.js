import React from 'react';

const Button = ({ onClick, disabled, text, aIcon, bIcon, className, type ,style}) => {
  return (
    <button type={type} disabled={disabled} className={`themeButton ${className}`} style={style} onClick={onClick}>
      {bIcon && <span><i className={`${bIcon} m5-right`}></i></span>}
      <span>{text}</span>
      {aIcon && <span><i className={`${aIcon} m5-left`}></i></span>}
    </button>
  );
}

export default Button;
