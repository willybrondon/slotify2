import { col } from "../../constants/tableHeaders";
import { SKEDISY_SALON_UI as ui } from "../../constants/skedisyUiCopy";
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useEffect,  useState } from "react";
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

const AttendanceTable = () => {
  const [data, setData] = useState([]);
  const { attendance } = useSelector((state) => state.attendance);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const thisMonth = new Date();
  thisMonth.setDate(1); 
  
  const [selectedDate, setSelectedDate] = useState(thisMonth);

    useEffect(() => {
        const formattedDate = moment(selectedDate, 'YYYY-MM').format('YYYY-MM');
        dispatch(getAttendExpert(formattedDate));
  }, [selectedDate, dispatch]);

  useEffect(() => {
    setData(attendance);
  }, [attendance]);

  const handleInfo = (id) => {
    navigate("/salonpanel/getExpertProfile", {
      state: {
        id,
      },
    });
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
            style={{  overflow: "hidden" }}
          >
            <img
              src={row?.expertId?.image}
              alt="image"
              className="cursor-pointer"
              style={{height: "70px", width: "70px",}}
              onClick={() => handleInfo(row?.expertId?._id)}
              
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
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.expertId?._id)}
        >
          {row?.expertId?.fname + " " + row?.expertId?.lname}
        </span>
      ),
    },
    {
      Header: col.monthYear,
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },
    {
      Header: col.availableDays,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.attendCount}</span>
      ),
    },
    {
      Header: col.absentDays,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.absentCount}</span>
      ),
    },
    {
      Header: col.totalDays,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalDays}</span>
      ),
    },
  ];

    const handleDateChange = (date) => {
        const selectedDateObject = moment(date, "YYYY-MM").toDate();
        setSelectedDate(selectedDateObject);
    };
    
    console.log('selectedDate', selectedDate)
  return (
    <div className="mainExpert">
      <Title name={ui.pages.staffAttendanceData} />
      <div className="m12-bottom inputData col-lg-2 col-md-4 z-index-3 position-relative">
        <label>{ui.labels.selectMonth}</label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM"
          showMonthYearPicker
          style={{fontWeight: "bold",color : "#000"}}
        />
      </div>

      <div>
        <Table data={data} mapData={expertTable} />
      </div>
    </div>
  );
};

export default AttendanceTable;
