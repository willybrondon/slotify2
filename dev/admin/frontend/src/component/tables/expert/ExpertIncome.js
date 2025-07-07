/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { openDialog } from "../../../redux/slice/dialogueSlice";
import { getPayout } from "../../../redux/slice/payoutSlice";
import { warning } from "../../util/Alert";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { expertRevenue, payment } from "../../../redux/slice/salarySlice";
import BonusPenaltyDialog from "../BonusPenaltyDialog";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";
import Analytics from "../../extras/Analytics";

const ExpertIncome = () => {
  const { salary,total } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const payload = {
      expertId: state?.id,
      startDate,
      endDate,
      start: page,
      limit:rowsPerPage
    };
    dispatch(expertRevenue(payload));
  }, [state, startDate, endDate,page,rowsPerPage]);

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


  const navigate = useNavigate();
  const handleInfo = (id) => {
    navigate("/admin/user/userProfile", {
      state: {
        id,
      },
    });
  };
  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: "User Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.userId?.image}
            alt="image"
            className="cursor-pointer"
            onClick={() => handleInfo(row.userId?._id)}
            onError={(e) => {
              e.target.src = Male;
            }}
            height={`100%`}
            
          />
        </div>
      ),
    },
    {
      Header: "User",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row.userId?._id)}
        >
          {row?.userId?.fname
            ? row?.userId?.fname + " " + row?.userId?.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => <span className="text-capitalize">{row?.date}</span>,
    },
    {
      Header: "Earnings (Expert)",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Earnings (Admin)",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.adminEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.revenue + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: "Payout Month",
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },

    {
      Header: "Settlement Type",
      Cell: ({ row }) => (
        <span>
          {row?.type === 1 && (
            <button className="bg-danger text-light p10-x p4-y fs-12 br-5">
              Unsettled
            </button>
          )}
          {row?.type === 2 && (
            <button className="bg-success text-light p10-x p4-y fs-12 br-5">
              Settled
            </button>
          )}
        </span>
      ),
    },
    {
      Header: "Payment Status",
      Cell: ({ row }) => (
        <span>
          {row?.statusOfTransaction === 1 && (
            <button className="bg-danger text-light p10-x p4-y fs-12 br-5">
              Unpaid
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
      Header: "Settlement Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.settlementDate ? row?.settlementDate : "-"}
        </span>
      ),
    },
    {
      Header: "Payment Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.payoutDate ? row?.payoutDate : "Pending"}
        </span>
      ),
    },
  ];

  const handlePayment = (id) => {
    dispatch(payment(id));
  };

  console.log('data[0]?.expertId?.fname', data[0]?.expertId?.fname)

  const types = [
    { name: "Pending", value: 1 },
    { name: "Paid", value: 2 },
  ];
  return (
    <div className="mainCategory">
    <Title name={`${data[0]?.expertId?.fname ? data[0]?.expertId?.fname + " " + data[0]?.expertId?.lname + "'s Booking History" : "Salon Expert Booking History"}`} />
      <div className="col-md-9 ">
        <div className="inputData">
          <label>Analytic</label>
        </div>
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
        />
      </div>
      <div>
        <Table data={data} mapData={mapData} serverPerPage={rowsPerPage}

            Page={page}/>
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
