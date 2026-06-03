/* eslint-disable no-mixed-operators */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import moment from "moment";
import dayjs from "dayjs";
import $ from "jquery";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";

const Analytics = (props) => {
  const a = ui.analytics;
  const {
    analyticsStartDate,
    analyticsStartEnd,
    analyticsStartDateSet,
    direction,
    analyticsStartEndSet,
    allAllow,
  } = props;

  const handleApply = (event, picker) => {
    let start = dayjs(picker.startDate).format("YYYY-MM-DD");
    let end = dayjs(picker.endDate).format("YYYY-MM-DD");

    if (
      picker.chosenLabel === a.selectDate ||
      picker.chosenLabel?.toLowerCase() === "select date"
    ) {
      start = "ALL";
      end = "ALL";
    }

    analyticsStartDateSet(start);
    analyticsStartEndSet(end);
  };
  const [isDateRangePickerVisible, setDateRangePickerVisible] = useState(false);
  const [state, setState] = useState({
    start: moment().subtract(29, "days"),
    end: moment(),
  });
  const { start, end } = state;

  const handleCallback = (start, end) => {
    setState({ start, end });
  };

  const { color, bgcolor } = props;

  const startAllDate = "1970-01-01";
  const endAllDate = moment().format("YYYY-MM-DD");

  $(document).ready(function () {
    $("data-range-key").removeClass("active");
  });

  const handleInputClick = () => {
    setDateRangePickerVisible(!isDateRangePickerVisible);
  };

  const ranges = {
    ...(allAllow !== false && {
      [a.all]: [new Date("1970-01-01"), moment().toDate()],
    }),
    [a.today]: [moment().toDate(), moment().toDate()],
    [a.yesterday]: [
      moment().subtract(1, "days").toDate(),
      moment().subtract(1, "days").toDate(),
    ],
    [a.last7]: [moment().subtract(6, "days").toDate(), moment().toDate()],
    [a.last30]: [moment().subtract(29, "days").toDate(), moment().toDate()],
    [a.thisMonth]: [
      moment().startOf("month").toDate(),
      moment().endOf("month").toDate(),
    ],
    [a.lastMonth]: [
      moment().subtract(1, "month").startOf("month").toDate(),
      moment().subtract(1, "month").endOf("month").toDate(),
    ],
  };

  const displayValue =
    (analyticsStartDate === startAllDate && analyticsStartEnd === endAllDate) ||
    (String(analyticsStartDate).toUpperCase() === "ALL" &&
      String(analyticsStartEnd).toUpperCase() === "ALL")
      ? a.all
      : `${moment(analyticsStartDate).format("YYYY-MM-DD")} ${a.rangeTo} ${moment(
          analyticsStartEnd
        ).format("YYYY-MM-DD")}`;

  return (
    <div
      className="d-flex my-2"
      style={{ width: "285px", justifyContent: direction }}
    >
      <DateRangePicker
        initialSettings={{ ranges }}
        onCallback={handleCallback}
        onApply={handleApply}
      >
        <input
          type="text"
          bgcolor={bgcolor}
          color={color}
          readOnly
          onClick={handleInputClick}
          className={`daterange float-right mr-4 text-center ${bgcolor} ${color}`}
          value={displayValue}
          style={{
            width: "85%",
            fontWeight: 600,
            cursor: "pointer",
            border: "1px solid white",
            display: "flex",
            justifyContent: "center",
            fontSize: "14px",
            padding: "10px",
            borderRadius: "6px",
            height: "48px !important",
            color: "#000",
            background: "white",
            boxShadow:
              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        />
      </DateRangePicker>
    </div>
  );
};

export default Analytics;
