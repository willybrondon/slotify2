/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../extras/Title";
import Button from "../extras/Button";
import Table from "../extras/Table";
import { getAttendExpert } from "../../redux/slice/attendanceSlice";
import { useNavigate } from "react-router-dom";

import moment from "moment";
import Male from "../../assets/images/male.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../extras/Pagination";
import { getAllSalons } from "../../redux/slice/salonSlice";

const AttendanceTable = () => {
  const [data, setData] = useState([]);
  const { attendance } = useSelector((state) => state.attendance);
  const { salon } = useSelector((state) => state.salon);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const thisMonth = new Date();
  thisMonth.setDate(1);

  const [selectedDate, setSelectedDate] = useState(thisMonth);
  const [salonId, setSalonId] = useState("ALL");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  useEffect(() => {
    const formattedDate = moment(selectedDate, "YYYY-MM").format("YYYY-MM");
    let payload1 = {
      date: formattedDate,
      salonId: salonId,
    };
    dispatch(getAttendExpert(payload1));
    const payload = {
      start: page,
      limit: rowsPerPage,
      search: "ALL",
      salonId: salonId,
    };
    dispatch(getAllSalons(payload));
  }, [dispatch]);

  useEffect(() => {

    setData(attendance);
  }, [attendance]);

  const handleInfo = (id) => {
    navigate("/admin/expert/getExpertProfile", {
      state: {
        id,
      },
    });
  };

  const handleInfoSalon = (id) => {
    navigate("/admin/salon/salonProfile", {
      state: {
        id,
      },
    });
  };

  const expertTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>

      )
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.expert?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            onClick={() => openImage(row?.expert?.image)}
            height={`100%`}
            onError={(e) => {
              e.target.src = Male;
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
          onClick={() => handleInfo(row?.expert?._id)}
        >
          {row?.expert?.name}
        </span>
      ),
    },
    {
      Header: "Salon ",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold" style={{ cursor: "pointer" }}>
          {row?.salon}
        </span>
      ),
    },
    {
      Header: "Month Year",
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },
    {
      Header: "Available Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.attendCount}</span>
      ),
    },
    {
      Header: "Absent Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.absentCount}</span>
      ),
    },
    {
      Header: "Total Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalDays}</span>
      ),
    },
  ];

  const handleDateChange = (date) => {
    const selectedDateObject = moment(date, "YYYY-MM").toDate();
    setSelectedDate(selectedDateObject);
    const formattedDate = moment(selectedDateObject, "YYYY-MM").format(
      "YYYY-MM"
    );
    let payload1 = {
      date: formattedDate,
      salonId: salonId,
    };
    dispatch(getAttendExpert(payload1));
  };

  return (
    <div className="mainExpert">
      <Title name="Staff attendance data" />
      <div className="row">
        <div className="col-md-6 d-flex">
          <div className="m12-bottom inputData z-index-3 col-lg-4 col-md-4 position-relative">
            <label>Select month</label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy/MM"
              showMonthYearPicker
              style={{ fontWeight: "bold" }}
            />
          </div>
          <div className="inputData ms-4">
            <label className="styleForTitle" htmlFor="bookingType">
              Salon
            </label>
            <select
              name="bookingType"
              className="rounded-2 fw-bold"
              id="bookingType"
              value={salonId}
              onChange={(e) => {
                const selectedSalonId = e.target.value;
                const formattedDate = moment(selectedDate, "YYYY-MM").format(
                  "YYYY-MM"
                );

                let payload = {
                  salonId: selectedSalonId,
                  date: formattedDate,
                };
                setSalonId(selectedSalonId);
                dispatch(getAttendExpert(payload)); // Dispatch action with selected salon ID
              }}
            >
              <option key="ALL" value="ALL">
                All
              </option>
              {salon.map((data) => (
                <option key={data._id} value={data._id}>
                  {data.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <Table
          data={data}
          mapData={expertTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"client"}
        />
        <Pagination
          type={"client"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={data?.length}
        />
      </div>
    </div>
  );
};

export default AttendanceTable;
