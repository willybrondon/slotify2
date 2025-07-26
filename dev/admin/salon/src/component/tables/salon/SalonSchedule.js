import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeBreak, getSalonSchedule } from "../../../redux/slice/salonSlice";
import { useLocation } from "react-router-dom";
import Title from "../../extras/Title";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import ScheduleDialogue from "./ScheduleDialogue";

import ToggleSwitch from "../../extras/ToggleSwitch";

const SalonSchedule = () => {
  const { salonSchedule } = useSelector((state) => state.salon);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  console.log("salonSchdule", salonSchedule);

  const state = useLocation();

  console.log("first", state?.state?._id);

  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(getSalonSchedule(state?.state?._id));
  }, [dispatch]);

  useEffect(() => {
    setData(salonSchedule);
  }, [salonSchedule]);

  const handleOpenDialog = (row) => {
    dispatch(
      openDialog({
        type: "schedule",
        data: { data: row, salonId: state?.state?._id },
      })
    );
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hour, minute] = time.split(":");

    const formattedHour = hour?.padStart(2, "0");
    const formattedMinute = minute?.padStart(2, "0");

    return `${formattedHour}:${formattedMinute}`;
  };

  const scheduleTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Day",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.day}</span>
      ),
    },
    {
      Header: "Open Time",
      Cell: ({ row }) => (
        <span className="text-capitalize">{formatTime(row?.openTime)}</span>
      ),
    },

    {
      Header: "Closed Time",
      Cell: ({ row }) => <span>{formatTime(row?.closedTime)}</span>,
    },

    {
      Header: "Salon Break Start Time",
      Cell: ({ row }) => (
        <span>{row?.isBreak ? formatTime(row?.breakStartTime) : "-"}</span>
      ),
    },

    {
      Header: "Salon Break End Time",
      Cell: ({ row }) => (
        <span>{row?.isBreak ? formatTime(row?.breakEndTime) : "-"}</span>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#FFEFFB", borderRadius: "5px" }}
            onClick={() => {
              handleOpenDialog(row);
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3511 8.33916L6.3468 19.3443C6.29139 19.3998 6.2519 19.4692 6.23245 19.5452L5.01269 24.441C4.99475 24.5136 4.99585 24.5897 5.01588 24.6618C5.03591 24.7339 5.0742 24.7996 5.12705 24.8526C5.20822 24.9335 5.31812 24.979 5.43272 24.979C5.46807 24.979 5.50329 24.9747 5.53757 24.9661L10.4333 23.7461C10.5094 23.727 10.5789 23.6875 10.6343 23.6319L21.6396 12.6276L17.3511 8.33916ZM24.3658 6.83863L23.1408 5.61372C22.3221 4.79502 20.8952 4.79583 20.0775 5.61372L18.577 7.11425L22.8653 11.4025L24.3658 9.90203C24.7747 9.49326 25 8.94912 25 8.37043C25 7.79174 24.7747 7.24761 24.3658 6.83863Z"
                fill="#A7398B"
              />
            </svg>
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name={`${state?.state?.name}'s Schedule`} />

      <div>
        <Table
          data={data}
          mapData={scheduleTable}
          serverPerPage={rowsPerPage}
          Page={page}
        />
      </div>
      {dialogue && dialogueType === "schedule" && (
        <ScheduleDialogue setData={setData} data={data} />
      )}
    </div>
  );
};

export default SalonSchedule;
