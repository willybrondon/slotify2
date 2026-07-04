import Analytics from "./Analytics";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";

const TABS = [
  { key: "pending", status: "1", labelKey: "pending" },
  { key: "accepted", status: "2", labelKey: "accepted" },
  { key: "declined", status: "3", labelKey: "declined" },
];

const PageStatusDateFilters = ({
  type,
  setType,
  setStatus,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const labels = ui.statusTabs;

  return (
    <div className="sq-filter-toolbar card-sq sq-page-filters">
      <div className="sq-segmented sq-page-filters__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={type === tab.key}
            className={type === tab.key ? "is-active" : ""}
            onClick={() => {
              setType(tab.key);
              setStatus(tab.status);
            }}
          >
            {labels[tab.labelKey]}
          </button>
        ))}
      </div>
      <div className="sq-page-filters__date">
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
        />
      </div>
    </div>
  );
};

export default PageStatusDateFilters;
