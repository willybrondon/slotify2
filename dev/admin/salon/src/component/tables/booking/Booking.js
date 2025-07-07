/* eslint-disable no-useless-concat */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React from "react";
import Title from "../../extras/Title";
import Searching from "../../extras/Searching";
import { getAllBookings } from "../../../redux/slice/bookingSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";

import male from "../../../assets/images/male.png";
import Analytics from "../../extras/Analytics";
import { useNavigate } from "react-router-dom";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import CancelBookingDialog from "./CancelBookingDialog";
import CancleDetails from "./CancleDetails";


const Booking = () => {
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { booking, total } = useSelector((state) => state.booking);
  const { setting } = useSelector((state) => state.setting);
  

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [type, setType] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const navigate = useNavigate();
  const payload = {
    start: page,
    limit: rowsPerPage,
    type,
    startDate,
    endDate,
  };

  useEffect(() => {
    dispatch(getAllBookings({ ...payload, command: true }));
  }, [page, rowsPerPage, type, startDate, endDate]);

  useEffect(() => {
    setData(booking);
  }, [booking]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const [search, setSearch] = useState("");

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleInfo = (id) => {
    navigate("/salonPanel/getExpertProfile", {
      state: {
        id,
      },
    });
  };



  const bookingTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "User",
      Cell: ({ row }) => (
        <div
          className="userProfile cursor"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.user?.image || male}
            alt="image"
           
            height={`100%`}
            onError={(e) => {
              e.target.src = male;
            }}
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
          {row?.user?.fname
            ? row?.user?.fname + " " + row?.user?.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: "Expert",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.expert?._id)}
        >
          {row?.expert?.fullName}
        </span>
      ),
    },
    {
      Header: "Service",
      Cell: ({ row }) => (
        <div>
          {row?.services?.map((dur, index) => (
            <span key={index} className="text-capitalize">
              {dur?.name}
              {index !== row?.services?.length - 1 && <br />}
            </span>
          ))}
        </div>
      ),
    },
    {
      Header: "Booking Id",
      body: "bookingId",
      sorting: { type: "client" },
    },
    {
      Header: `Price `,
      body: "amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
      sorting: { type: "client" },
    },
    {
      Header: `Admin Commission `,
      body: "platformFee",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.status == "cancel"
            ? "-"
            : row?.platformFee + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Duration",
      body: "duration",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.duration + " " + "Min"}</span>
      ),
    },
    {
      Header: "Date",
      body: "date",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.date ? row?.date : "-"}</span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }) =>
        row?.status === "completed" ? (
          <div className="d-flex justify-content-center">
            <div className="me-2 mt-1 dot-status bg-success"> </div>
            <span>Completed</span>
          </div>
        ) : row?.status === "confirm" ? (
          <div className="d-flex justify-content-center">
            <div className="me-2 mt-1 bg-info dot-status"> </div>
            <span>Confirm</span>
          </div>
        ) : row?.status === "cancel" ? (
          <button
            className="bg-danger text-white m5-right p12-x p4-y fs-12 br-5 "
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenDialogue(row)}
          >
            Cancel
          </button>
        ) : (
          <div className="d-flex justify-content-center">
            <span>
              <button
                className=" text-white m5-right p12-x p4-y fs-12 br-5 "
                style={{ backgroundColor: "#ff7512" }}
                onClick={() => handleCancel(row._id)}
              >
                Pending
              </button>
            </span>
          </div>
        ),
    },
    {
      Header: "First Slot",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.time ? row?.time[0] : "-"}
        </span>
      ),
    },
  
  ];

  const handleCancel = (row) => {
    
    dispatch(openDialog({ type: "cancelBooking", data: row }));
  };

  const bookingType = [
    // { name: "ALL", value: "ALL" },
    { name: "Pending", value: "pending" },
    { name: "Confirm", value: "confirm" },
    { name: "Completed", value: "completed" },
    { name: "Cancelled", value: "cancel" },
  ];

  const handleOpenDialogue = (row) => {
    dispatch(openDialog({ type: "cancel", data: row }));
  };

  return (
    <div className="mainBooking">
      <Title name={`Bookings`} />
      {dialogue && dialogueType === "cancelBooking" && (
        <CancelBookingDialog setData={setData} data={data} />
      )}
      {dialogue && dialogueType === "cancel" && (
        <CancleDetails setData={setData} data={data} />
      )}

      <div className="row">
        <div className="col-2">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="bookingType">
              Booking type
            </label>
            <select
              name="bookingType"
              className="rounded-2 fw-bold"
              id="bookingType"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <option value="ALL" selected>
                ALL
              </option>
              {bookingType?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>
        </div>

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
      </div>

      <div>
        <Table
          data={data}
          mapData={bookingTable}
          serverPerPage={rowsPerPage}
          serverSearching={handleFilterData}
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
export default Booking;
