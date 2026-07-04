import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";

const ORDER_STATUS = [
  { value: "All", labelKey: "all" },
  { value: "Pending", labelKey: "pending" },
  { value: "Confirmed", labelKey: "confirmed" },
  { value: "Out Of Delivery", labelKey: "outOfDelivery" },
  { value: "Delivered", labelKey: "delivered" },
  { value: "Cancelled", labelKey: "cancelled" },
];

const PageOrderStatusFilters = ({ type, setType }) => {
  const labels = ui.orderStatus;

  return (
    <div className="sq-filter-toolbar card-sq sq-page-filters sq-page-filters--stacked">
      <div className="sq-page-filters__secondary">
        <span className="sq-page-filters__secondary-label">{labels.filterLabel}</span>
        <div className="sq-segmented sq-page-filters__status sq-segmented--scroll" role="tablist">
          {ORDER_STATUS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={type === tab.value}
              className={type === tab.value ? "is-active" : ""}
              onClick={() => {
                setType(tab.value);
              }}
            >
              {labels[tab.labelKey]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageOrderStatusFilters;
