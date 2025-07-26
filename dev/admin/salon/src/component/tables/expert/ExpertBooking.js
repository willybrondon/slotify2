import React from "react";
import Title from "../../extras/Title";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";

import male from "../../../assets/images/male.png";
import Analytics from "../../extras/Analytics";
import { useLocation, useNavigate } from "react-router-dom";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import { getExpertBookings } from "../../../redux/slice/expertSlice";
import CancelBookingDialog from "../booking/CancelBookingDialog";

const ExpertBooking = () => {
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { booking, total } = useSelector((state) => state.expert);
  const { setting } = useSelector((state) => state.setting);

  const state = useLocation();

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const navigate = useNavigate();

  const payload = {
    start: page,
    limit: rowsPerPage,
    expertId: state?.state?.row?._id,
    startDate,
    endDate,
  };

  useEffect(() => {
    dispatch(getExpertBookings(payload));
  }, [page, rowsPerPage, state, startDate, endDate]);

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
        <span className="text-capitalize fw-bold cursor">
          {row?.user?.fname
            ? row?.user?.fname + " " + row?.user?.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: "Salon",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.salon?.name}
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
      body: "rupee",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
      sorting: { type: "client" },
    },
    {
      Header: `Admin Commission `,
      body: "commission",
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
          <div className="d-flex">
            <div className="me-2 mt-1 dot-status bg-success"> </div>
            <span>Completed</span>
          </div>
        ) : row?.status === "confirm" ? (
          <div className="d-flex">
            <div className="me-2 mt-1 bg-info dot-status"> </div>
            <span>Confirm</span>
          </div>
        ) : row?.status === "cancel" ? (
          <div className="d-flex">
            <div className="me-2 mt-1 bg-danger dot-status"> </div>
            <span>Cancel</span>
          </div>
        ) : (
          <div className="d-flex">
            {/* <div className="me-2 bg-warning dot-status"> </div>
            <span>Pending</span> */}
            <span>
              <button
                className="text-white  m5-right p12-x p4-y fs-12 br-5 "
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

  return (
    <div className="mainBooking">
      <Title
        name={`${
          state ? state?.state?.row?.fname + state?.state?.row?.lname : ""
        }'s Bookings`}
      />
      {dialogue && dialogueType === "cancelBooking" && (
        <CancelBookingDialog setData={setData} data={data} />
      )}

      <div className="row">
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
          // PerPage={rowsPerPage}
          // Page={page}
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
export default ExpertBooking;
