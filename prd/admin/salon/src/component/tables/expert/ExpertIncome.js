/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { openDialog } from "../../../redux/slice/dialogueSlice";
import { getPayout } from "../../../redux/slice/payoutSlice";
import { warning } from "../../../util/Alert";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { expertRevenue } from "../../../redux/slice/salarySlice";
import BonusPenaltyDialog from "../BonusPenaltyDialog";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";
import Analytics from "../../extras/Analytics";

const ExpertIncome = () => {
  const { salary, total } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  console.log("state", state);

  useEffect(() => {
    const payload = {
      expertId: state?.id,
      startDate,
      endDate,
      start: page,
      limit: rowsPerPage,
    };
    dispatch(expertRevenue(payload));
  }, [state, startDate, endDate, page, rowsPerPage]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

  const dispatch = useDispatch();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  console.log("state++++++++++++++", state);

  const navigate = useNavigate();

  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },

    {
      Header: "Date",
      Cell: ({ row }) => <span className="text-capitalize">{row?.date}</span>,
    },
    {
      Header: "Booking Count",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.bookingId.length}</span>
      ),
    },
    {
      Header: "Expert Earnings +",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.expertEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Bonus =",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bonus + " " + setting?.currencySymbol}
        </span>
      ),
    },

    {
      Header: "Final Amount ",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.finalAmount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Payment Status",
      Cell: ({ row }) => (
        <span>
          {row?.statusOfTransaction === 0 && (
            <button className="bg-danger text-light p10-x p4-y fs-12 br-5">
              Pending
            </button>
          )}
          {row?.statusOfTransaction === 1 && (
            <button className="bg-success text-light p10-x p4-y fs-12 br-5">
              Paid
            </button>
          )}
        </span>
      ),
    },
    {
      Header: "Payment Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.paymentDate ? row?.paymentDate : "Pending"}
        </span>
      ),
    },
  ];

  const types = [
    { name: "Pending", value: 1 },
    { name: "Paid", value: 2 },
  ];
  return (
    <div className="mainCategory">
      <Title
        name={`${
          data[0]?.expert?.fname
            ? data[0]?.expert?.fname +
              " " +
              data[0]?.expert?.lname +
              "'s Earning History"
            : "Salon Expert Earning History"
        }`}
      />
      <div className="col-md-9 ">
        <div className="inputData">
          <label>Analytic</label>
        </div>
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
          allAllow={false}
        />
      </div>
      <div>
        <Table
          data={data}
          mapData={mapData}
          serverPerPage={rowsPerPage}
          Page={page}
        />
      </div>
      <Pagination
        type={"server"}
        serverPage={page}
        setServerPage={setPage}
        serverPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalData={total}
      />
    </div>
  );
};

export default ExpertIncome;
