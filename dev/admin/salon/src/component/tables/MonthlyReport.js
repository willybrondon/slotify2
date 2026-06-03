import { col } from "../../constants/tableHeaders";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";
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
      Header: col.no,
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: col.month,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">{row?.month}</span>
      ),
    },
    {
      Header: col.totalExperts,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.experts}</span>
      ),
    },
    {
      Header: col.totalCompletedBookings,
      body: 'completedBookings',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.completedBookings}</span>
      ),
    },

   
    {
      Header: col.serviceAmount,
      body: 'without Tax',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.withoutTax ? row?.withoutTax + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: col.adminEarning,
      body: 'adminEarning',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.adminEarning ? row?.adminEarning + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: col.plus,
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: col.expertEarning,
      body: 'expertEarning',
      sorting:{type:"client"},
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning ? row?.expertEarning + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: col.plus,
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: col.tax,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.taxAmount ? row?.taxAmount?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: col.eq,
      thClass:'text-center fs-20 fw-bold'
    },
    {
      Header: col.totalRevenue,
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
      <Title name={ui.pages.monthlyReport} />

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
