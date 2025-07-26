import React, { useEffect, useState } from "react";
import Pagination from "../../extras/Pagination";
import Table from "../../extras/Table";
import Analytics from "../../extras/Analytics";
import Title from "../../extras/Title";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getSalonBookings } from "../../../redux/slice/salonSlice";
import CancleDetails from "../booking/CancleDetails";
import CancelBookingDialog from "../booking/CancelBookingDialog";


const SalonBooking = () => {
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { booking, total } = useSelector((state) => state.salon);
  const { setting } = useSelector((state) => state.setting);

  const state = useLocation();

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
    salonId: state?.state?.data?._id,
    type,
    startDate,
    endDate,
  };

  useEffect(() => {
    dispatch(getSalonBookings({ ...payload, command: true }));
  }, [page, rowsPerPage, state, type, startDate, endDate]);

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
    navigate("/admin/expert/getExpertProfile", {
      state: {
        id,
      },
    });
  };

  const handleUserInfo = (id) => {
    navigate("/admin/user/userProfile", {
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
            src={row?.user?.image}
            alt="image"
            onClick={() => handleUserInfo(row?.user?._id)}
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
          onClick={() => handleUserInfo(row?.user?._id)}
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
      body: "rupee",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.amount?.toFixed(2) + " " + setting?.currencySymbol}</span>
      ),
      sorting: { type: "client" },
    },
    {
      Header: `Admin Commission `,
      body: "commission",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.status == "cancel" ? "-" : (row?.platformFee?.toFixed(2) + " " + setting?.currencySymbol)}
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
          <button className="bg-success text-white m5-right p12-x p4-y fs-12 br-5 ">
            Completed
          </button>
        ) : row?.status === "confirm" ? (
          <button className="bg-info text-white m5-right p12-x p4-y fs-12 br-5 ">
            Confirm
          </button>
        ) : row?.status === "cancel" ? (
          <button
            className="bg-danger text-white m5-right p12-x p4-y fs-12 br-5 "
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenDialogue(row)}
          >
            Cancel
          </button>
        ) : (
          <div className="d-flex">
            <span>
              <button
                className="  m5-right p12-x p4-y fs-12 br-5 text-white"
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

  const handleOpenDialogue = (row) => {
    dispatch(openDialog({ type: "cancel", data: row }));
  };

  const bookingType = [
    { name: "Pending", value: "pending" },
    { name: "Confirm", value: "confirm" },
    { name: "Completed", value: "completed" },
    { name: "Cancelled", value: "cancel" },
  ];

  return (
    <div className="mainBooking">
      <Title name={`${state ? state?.state?.data?.name : ""}'s Bookings`} />

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
                All
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
      {dialogue && dialogueType === "cancel" && (
        <CancleDetails setData={setData} data={data} />
      )}
       {dialogue && dialogueType === "cancelBooking" && (
        <CancelBookingDialog setData={setData} data={data} />
      )}

    </div>
  );
};

export default SalonBooking;
