import { col } from "../../../constants/tableHeaders";
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
import { expertHistory, payment } from "../../../redux/slice/salarySlice";
import BonusPenaltyDialog from "../BonusPenaltyDialog";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";

const ExpertHistory = () => {
  const { salary } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();

  useEffect(() => {
    dispatch(expertHistory(state.id));
  }, [state]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

  const dispatch = useDispatch();

  function openHistory(imageUrl) {
    window.open(imageUrl, "_blank");
  }
  const navigate = useNavigate();

  const mapData = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: col.userImage,
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.bookingId?.userId?.image}
            alt="image"
            className="cursor-pointer"
            onError={(e) => {
              e.target.src = Male;
            }}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: col.user,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.bookingId?.userId?.fname
            ? row?.bookingId?.userId?.fname +
              " " +
              row?.bookingId?.userId?.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: col.earningsExpert,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.earningsAdmin,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.adminEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.amount,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bookingId?.rupee + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.payoutMonth,
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },
    {
      Header: col.status,
      Cell: ({ row }) => (
        <span>
          {row?.statusOfTransaction === 1 && (
            <button
              className="text-white p10-x p4-y fs-12 br-5"
              style={{ backgroundColor: "#ff7512" }}
            >
              Pending
            </button>
          )}
          {row?.statusOfTransaction === 2 && (
            <button className="bg-success text-light p10-x p4-y fs-12 br-5">
              Paid
            </button>
          )}
        </span>
      ),
    },
    {
      Header: col.settlementDate,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.settlementDate ? row?.settlementDate : "-"}
        </span>
      ),
    },
    {
      Header: col.paymentDate,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.paymentDate ? row?.paymentDate : "Pending"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name={"Expert Booking Details"} />

      <div>
        <Table data={data} mapData={mapData} />
      </div>
    </div>
  );
};

export default ExpertHistory;
