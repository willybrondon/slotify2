/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../extras/Title";
import Table from "../extras/Table";
import { monthlyState, payment } from "../../redux/slice/salarySlice";
import { useNavigate } from "react-router-dom";

import Pagination from "../extras/Pagination";

const MonthlyReport = () => {
  const { salary ,total} = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  console.log('setting', setting)

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(monthlyState());
  }, []);

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
      body: 'completedBookings',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.completedBookings}</span>
      ),
    },

   
    {
      Header: "Service Amount",
      body: 'without Tax',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.withoutTax ? row?.withoutTax + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "Admin Earning",
      body: 'adminEarning',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.adminEarning ? row?.adminEarning + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "+",
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: "Expert Earning",
      body: 'expertEarning',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning ? row?.expertEarning + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "+",
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: "Tax",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.taxAmount ? row?.taxAmount?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "=",
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: "Total Revenue",
      body: 'revenue',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.revenue ? row?.revenue + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Month wise report" />

      <div>
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
