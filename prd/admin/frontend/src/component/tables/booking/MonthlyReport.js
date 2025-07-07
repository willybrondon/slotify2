/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Table from "../../extras/Table";
import { monthlyState, payment } from "../../../redux/slice/salarySlice";
import { useNavigate } from "react-router-dom";

import Pagination from "../../extras/Pagination";
import moment from "moment";
import ReactDatePicker from "react-datepicker";

const MonthlyReport = () => {
  const { salary, total } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const thisYear = new Date();
  thisYear.setDate(1);

  const [selectedDate, setSelectedDate] = useState(thisYear);

  useEffect(() => {
    const formattedDate = moment(selectedDate, "YYYY").format("YYYY");
    dispatch(monthlyState(formattedDate));
  }, [selectedDate, dispatch]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: "Month",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">{row?.month}</span>
      ),
    },
    {
      Header: "Total Experts",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.experts}</span>
      ),
    },
    {
      Header: "Total Completed Bookings",
      body: "completedBookings",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.completedBookings}</span>
      ),
    },
    {
      Header: "Admin Earning",
      body: "adminEarning",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.platformFee
            ? row?.platformFee?.toFixed(2) + " " + setting?.currencySymbol
            : "-"}
        </span>
      ),
    },
    {
      Header: "+",
      thClass: "text-center fs-20 fw-bold",
    },
    {
      Header: "Salon Commission",
      body: "salonCommission",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.salonCommission
            ? row?.salonCommission?.toFixed(2) + " " + setting?.currencySymbol
            : "-"}
        </span>
      ),
    },
    {
      Header: "+",
      thClass: "text-center fs-20 fw-bold",
    },
    {
      Header: "Expert Earning",
      body: "expertEarning",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning
            ? row?.expertEarning?.toFixed(2) + " " + setting?.currencySymbol
            : "-"}
        </span>
      ),
    },
    {
      Header: "+",
      thClass: "text-center fs-20 fw-bold",
    },
    {
      Header: " Tax ",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.tax ? row?.tax.toFixed(2) + " " + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "=",
      thClass: "text-center fs-20 fw-bold",
    },
    {
      Header: "Total Revenue",
      body: "revenue",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount
            ? row?.amount?.toFixed(2) + " " + setting?.currencySymbol
            : "-"}
        </span>
      ),
    },
  ];

  const handleDateChange = (date) => {
    const selectedDateObject = moment(date, "YYYY").toDate();
    setSelectedDate(selectedDateObject);
  };


  return (
    <div className="mainCategory">
      <Title name="Month wise report" />
      <div className="inputData col-lg-2 col-md-4 me-3 mb-0">
        <label>Select year</label>
      </div>
      <ReactDatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy"
        showYearPicker
        className="mt-0"
      />

      <div className="mt-4">
        <Table data={data} mapData={mapData} />
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

export default MonthlyReport;
