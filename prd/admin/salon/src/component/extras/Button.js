import React from 'react';

const Button = ({ onClick, text, aIcon, bIcon, className, type ,style}) => {
  return (
    <button type={type} className={`themeButton ${className}`} style={style} onClick={onClick}>
      {bIcon && <span><i className={`${bIcon} m5-right`}></i></span>}
      <span>{text}</span>
      {aIcon && <span><i className={`${aIcon} m5-left`}></i></span>}
    </button>
  );
}

export default Button;
