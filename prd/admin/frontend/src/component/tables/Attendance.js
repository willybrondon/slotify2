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
;
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
    navigate("/admin/expert/getExpertProfile", {
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
      Header: "No",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
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
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.fname + " " + row?.lname}</span>
      ),
    },
    {
      Header: "All Attendance Info",
      Cell: ({ row }) => (
        <span>
          <button
            className=" text-light m5-right p12-x p4-y fs-12 br-5 "
            style={{ backgroundColor: "#3c64cd" }}
            onClick={() => navigate("/admin/attendanceTable")}
          >
            Info
          </button>
        </span>
      ),
      width: "50px",
    },
    {
      Header: "Present",
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
      Header: "Absent",
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-danger text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() => {
          
              dispatch(absentExpert(row._id));
            }}
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
      <Title name="Staff Attendance" />
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
