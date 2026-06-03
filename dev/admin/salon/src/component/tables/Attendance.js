import { col } from "../../constants/tableHeaders";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../extras/Title";
import Button from "../extras/Button";
import Table from "../extras/Table";
import Pagination from "../extras/Pagination";
import {
  getAttendExpert,
  attendExpert,
  absentExpert,
} from "../../redux/slice/attendanceSlice";
import { getAllExpert } from "../../redux/slice/expertSlice";
import ToggleSwitch from "../extras/ToggleSwitch";
import Searching from "../extras/Searching";
import { useNavigate } from "react-router-dom";


const Attendance = () => {
  const [data, setData] = useState([]);
  const { attendance } = useSelector((state) => state.attendance);
  const { expert } = useSelector((state) => state.expert);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const payload = {
      start: 0,
      limit: 100,
      search,
    };
    dispatch(getAllExpert(payload));
  }, [search]);

  useEffect(() => {
    setData(expert);
  }, [expert]);

  const handleInfo = (id) => {
    navigate("/salonpanel/getExpertProfile", {
      state: {
        id,
      },
    });
  };
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const expertTable = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: col.image,
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.image}
            alt="image"
            className="cursor-pointer"
            onClick={() => openImage(row?.image)}
            height={`100%`}
            onError={(e) => {
              e.target.src = Male;
            }}
          />
        </div>
      ),
    },
    {
      Header: col.name,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.fname + " " + row?.lname}</span>
      ),
    },
    {
      Header: col.allAttendanceInfo,
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-theme text-light m5-right p12-x p4-y fs-12 br-5 "
            onClick={() => navigate("/salonpanel/attendanceTable")}
          >
            Info
            {/* <span><i className="fa-solid fa-info"></i></span> */}
          </button>
        </span>
      ),
      width: "50px",
    },
    {
      Header: col.present,
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-success text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() => {
          
              dispatch(attendExpert(row._id));
            }}
          >
            Present
          </button>
        </span>
      ),
      width: "200px",
    },
    {
      Header: col.absent,
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-danger text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() => {
          
              dispatch(absentExpert(row._id))}}
          >
            Absent
          </button>
        </span>
      ),
      width: "200px",
    },
  ];

  return (
    <div className="mainExpert">
      <Title name={ui.pages.staffAttendance} />
      <div className="col-md-8 col-lg-5  ms-auto">
        <Searching
          type={`server`}
          data={data}
          setData={setData}
          column={expertTable}
          serverSearching={handleFilterData}
        />
      </div>
      <div>
        <Table data={data} mapData={expertTable} />
      </div>
    </div>
  );
};

export default Attendance;
