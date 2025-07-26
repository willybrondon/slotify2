import Table from "../../extras/Table";
import Button from "../../extras/Button";
import React, { useEffect, useState } from "react";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { getSalonTime, timeActive } from "../../../redux/slice/timeSlice";
import TimeDialogue from "./TimeDialogue";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import ToggleSwitch from "../../extras/ToggleSwitch";


const WeekTime = () => {
  const { time } = useSelector((state) => state?.time);
  const { dialogue, dialogueType } = useSelector((state) => state?.dialogue);
;
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  useEffect(() => {
    dispatch(getSalonTime());
  }, []);

  useEffect(() => {
    setData(time);
  }, [time]);

  const formatTime = (time) => {
    if (!time) return "-";

    const [hour, minute] = time.split(":");

    const formattedHour = hour.padStart(2, "0");
    const formattedMinute = minute.padStart(2, "0");

    return `${formattedHour}:${formattedMinute}`;
  };

  const timeTable = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: "Day",
      Cell: ({ row }) => <span className="text-capitalize">{row?.day}</span>,
    },
    {
      Header: "Open Time",
      Cell: ({ row }) => <span>{formatTime(row?.openTime)}</span>,
    },
    {
      Header: "Close Time",
      Cell: ({ row }) => <span>{formatTime(row?.closedTime)}</span>,
    },
    {
      Header: "Salon Break Start Time",
      Cell: ({ row }) => <span>{row?.isBreak === true ? formatTime(row?.breakStartTime) : '-'}</span>,
    },
    {
      Header: "Salon Break End Time",
      Cell: ({ row }) => <span>{row?.isBreak === true ? formatTime(row?.breakEndTime) : '-'}</span>,
    },

    {
      Header: "Edit",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => {

              dispatch(openDialog({ type: "timeTable", data: row }));
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.0377 7.22744L5.50073 16.7652C5.4527 16.8133 5.41848 16.8735 5.40162 16.9394L4.34449 21.1823C4.32895 21.2453 4.3299 21.3112 4.34726 21.3737C4.36462 21.4362 4.3978 21.4931 4.4436 21.5391C4.51395 21.6092 4.6092 21.6486 4.70852 21.6487C4.73916 21.6487 4.76968 21.6449 4.79939 21.6374L9.04235 20.5801C9.10832 20.5636 9.16854 20.5294 9.21656 20.4812L18.7545 10.9441L15.0377 7.22744ZM21.1172 5.92698L20.0556 4.86538C19.346 4.15585 18.1094 4.15655 17.4006 4.86538L16.1002 6.16585L19.8168 9.88235L21.1172 8.58193C21.4716 8.22765 21.6668 7.75607 21.6668 7.25454C21.6668 6.75301 21.4716 6.28143 21.1172 5.92698Z"
                fill="#059CF1"
              />
            </svg>
          </button>
        </span>
      ),
    },
  ];

  const handleStatus = (id) => {
    dispatch(timeActive(id));
  };
  return (
    <div className="mainTimeTable">
      <Title name="Salon time" />

      <div>
        <Table data={data} mapData={timeTable} />
      </div>
      {dialogue && dialogueType === "timeTable" && (
        <TimeDialogue setData={setData} data={data} />
      )}
    </div>
  );
};
export default WeekTime;
