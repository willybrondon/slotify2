import React from "react";

const SqSegmentTabs = ({ tabs, value, onChange, className = "" }) => (
  <div
    className={`sq-segmented sq-settings-tabs ${className}`.trim()}
    role="tablist"
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={value === tab.id}
        className={value === tab.id ? "is-active" : ""}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default SqSegmentTabs;
