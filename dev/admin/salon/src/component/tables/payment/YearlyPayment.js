import { col } from "../../../constants/tableHeaders";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { yearlyPaymentHistory } from "../../../redux/slice/payoutSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Analytics from "../../extras/Analytics";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";

const YearlyPayment = () => {
  const { payout } = useSelector((state) => state.payout);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const currentYear = moment().format("YYYY");
  const [selectedDate, setSelectedDate] = useState(currentYear);
  const [year, setYear] = useState(currentYear)

  useEffect(() => {
    dispatch(yearlyPaymentHistory(year));
  }, [year]);

  useEffect(() => {
    setData(payout);
  }, [payout]);

  const dispatch = useDispatch();

  const mapData = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },

    {
      Header: col.month,
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
        >
          {row?.month}
        </span>
      ),
    },
    {
      Header: col.totalBookings,
      sorting: { type: "client" },
      body: "totalBookings",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalBookings}</span>
      ),
    },

    {
      Header: col.bonusPenalty,
      sorting: { type: "client" },
      body: "totalBonusPenalty",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.totalBonusPenalty?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.totalPaymentToExpert,
      sorting: { type: "client" },
      body: "serviceAmount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.totalAmount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.totalExperts,
      sorting: { type: "client" },
      body: "serviceAmount",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalExpert}</span>
      ),
    },

    {
      Header: col.details,
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-success text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() => handleEarning(row?.month)}
          >
            Details
          </button>
        </span>
      ),
      width: "300px",
    },
  ];

  const handleEarning = (month) => {
    navigate("/admin/paymentHistory", {
      state: {
        month,
      },
    });
  };

  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      setYear(selectedDate);
    }
  };

  return (
    <div className="mainCategory">
      <Title name={ui.labels.yearlyPayment} />
      <div>
        <div className="m40-bottom inputData col-lg-2 col-md-4 me-3">
          <label>{ui.labels.selectMonth}</label>
          <input
            type="year"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)
            }
            onKeyPress={handleKeyPress}
          />
        </div>
        <Table
          data={data}
          mapData={mapData}
        />
      </div>
    </div>
  );
};

export default YearlyPayment;
