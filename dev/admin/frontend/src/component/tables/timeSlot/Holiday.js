/* eslint-disable no-useless-concat */
/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React from "react";
import Title from "../../extras/Title";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Analytics from "../../extras/Analytics";
import { useNavigate } from "react-router-dom";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import { deleteHoliday, getHoliday } from "../../../redux/slice/holidaySlice";
import Button from "../../extras/Button";
import HolidayDialog from "./HolidayDialog";
import {  warning } from "../../../util/Alert";
import { ReactComponent as Delete } from "../../../../src/assets/icon/delete.svg";
const Holiday = () => {
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { holiday, total } = useSelector((state) => state.holiday);
;

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
    };
    dispatch(getHoliday(payload));
  }, [page, rowsPerPage, startDate, endDate]);

  useEffect(() => {
    setData(holiday);
  }, [holiday]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const bookingTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      body: "name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.salonId?.name}
        </span>
      ),
    },
    {
      Header: "Date",
      sorting: { type: "client" },
      body: "date",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },

    {
      Header: "Reason",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.reason ? row?.reason : "-"}
        </span>
      ),
    },
    {
      Header: "Delete",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ backgroundColor: "#FFF1F1", borderRadius: "5px" }}
            onClick={() => handleDelete(row?._id)}
          >
            <Delete />
          </button>
        </span>
      ),
    },
  ];

  const handleDelete = (id) => {

    const data = warning("Delete");
    data
      .then((logouts) => {
        const yes = logouts.isConfirmed;
        if (yes) {
          dispatch(deleteHoliday(id));
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="mainBooking">
      <Title name={`Holiday`} />
      {dialogue && dialogueType === "holiday" && (
        <HolidayDialog
          setData={setData}
          data={data}
        />
      )}
      <div className="row mb-2">
        <div className="inputData">
          <label>Analytic</label>
        </div>
        <div className="d-flex">
          <Button
            className={`bg-button p-8 text-white my-2 me-3`}
            text={`New holiday`}
            bIcon={`fa-solid fa-user-plus`}
            onClick={() => {
              dispatch(openDialog({ type: "holiday" }));
            }}
          />
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
export default Holiday;
