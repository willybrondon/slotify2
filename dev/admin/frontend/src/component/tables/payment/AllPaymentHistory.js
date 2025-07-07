/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { getAllPaymentHistory } from "../../../redux/slice/payoutSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Analytics from "../../extras/Analytics";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";

const AllPaymentHistory = () => {
  const { payout, total } = useSelector((state) => state.payout);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const currentMonth = moment().format("YYYY-MM");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const formattedDate = moment(state?.month, 'YYYY-MM').format('MMM YYYY');
  useEffect(() => {
    const payload = {
      month: state.month,
      start: page,
      limit: rowsPerPage,
    };
    dispatch(getAllPaymentHistory(payload));
  }, [ page, rowsPerPage, dispatch]);

  useEffect(() => {
    setData(payout);
  }, [payout]);

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
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
         
        >
          <img
            src={row?.expertId?.image}
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            alt="image"
            className="cursor-pointer"
            height={`100%`}
            
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
        >
          {row?.expertId?.fname + " " + row?.expertId?.lname}
        </span>
      ),
    },
    {
      Header: "Total Bookings",
      sorting: { type: "client" },
      body: "totalBookings",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.bookings}</span>
      ),
    },

    {
      Header: "Paid Payment",
      sorting: { type: "client" },
      body: "amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Service Earning",
      sorting: { type: "client" },
      body: "serviceAmount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.serviceAmount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Bonus/Penalty",
      body: "bonus_penalty",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bonus_penalty ? row?.bonus_penalty + " " + setting?.currencySymbol : 0}
        </span>
      ),
    },
    {
      Header: "Settlement Month",
      sorting: { type: "client" },
      body: "month",
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },
    {
      Header: "Payment Date",
      sorting: { type: "client" },
      body: "payoutDate",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.payoutDate}</span>
      ),
    },
    {
      Header: "Payment Mode",
      sorting: { type: "client" },
      body: "payoutDate",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.paymentMode == 0 ? "UPI" : "Bank"}
        </span>
      ),
    },

    {
      Header: "Details",
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-success text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() => handleEarning(row)}
          >
            Details
          </button>
        </span>
      ),
      width: "300px",
    },
  ];
  const location = useLocation();
  const handleEarning = (row) => {
    let settlementIdsString = row?.settlementIds?.map((id) => id).join(",");

    navigate("/admin/expert/paymentHistory", {
      state: {
        expert: row?.expertId,
        settlements: settlementIdsString,
      },
    });
  };

  function openImage(imageUrl) {
    // Open the image in a new tab or window
    window.open(imageUrl, "_blank");
  }

  return (
    <div className="mainCategory">
      <Title name={`${formattedDate} 's Payment History`} />
      <div>
        <Table
          data={data}
          mapData={mapData}
          serverPerPage={rowsPerPage}
          type={"server"}
        />
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
    </div>
  );
};

export default AllPaymentHistory;
