import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";

const STATUS_TABS = [
  { value: 2, labelKey: "all" },
  { value: 0, labelKey: "pending" },
  { value: 1, labelKey: "solved" },
];

const PageComplainFilters = ({ person, setPerson, type, setType }) => {
  const labels = ui.complaints;

  return (
    <div className="sq-filter-toolbar card-sq sq-page-filters sq-page-filters--stacked">
      <div className="sq-page-filters__row">
        <span className="sq-page-filters__row-label">{labels.sourceLabel}</span>
        <div className="sq-segmented sq-page-filters__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={person === 1}
            className={person === 1 ? "is-active" : ""}
            onClick={() => setPerson(1)}
          >
            {labels.clientTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={person === 0}
            className={person === 0 ? "is-active" : ""}
            onClick={() => setPerson(0)}
          >
            {labels.expertTab}
          </button>
        </div>
      </div>
      <div className="sq-page-filters__secondary">
        <span className="sq-page-filters__secondary-label">{labels.statusLabel}</span>
        <div className="sq-segmented sq-page-filters__status sq-segmented--scroll" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={Number(type) === tab.value}
              className={Number(type) === tab.value ? "is-active" : ""}
              onClick={() => setType(tab.value)}
            >
              {labels[tab.labelKey]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageComplainFilters;
