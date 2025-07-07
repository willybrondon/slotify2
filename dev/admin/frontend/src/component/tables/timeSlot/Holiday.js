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
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.9688 6.5625H18.75V6.09375C18.75 4.80141 17.6986 3.75 16.4062 3.75H13.5938C12.3014 3.75 11.25 4.80141 11.25 6.09375V6.5625H7.03125C6.78261 6.5625 6.54415 6.66127 6.36834 6.83709C6.19252 7.0129 6.09375 7.25136 6.09375 7.5V8.90625C6.09375 9.15489 6.19252 9.39335 6.36834 9.56916C6.54415 9.74498 6.78261 9.84375 7.03125 9.84375H22.9688C23.2174 9.84375 23.4558 9.74498 23.6317 9.56916C23.8075 9.39335 23.9062 9.15489 23.9062 8.90625V7.5C23.9062 7.25136 23.8075 7.0129 23.6317 6.83709C23.4558 6.66127 23.2174 6.5625 22.9688 6.5625ZM13.125 6.09375C13.125 5.83547 13.3355 5.625 13.5938 5.625H16.4062C16.6645 5.625 16.875 5.83547 16.875 6.09375V6.5625H13.125V6.09375ZM22.6312 11.0883C22.5434 10.9916 22.4363 10.9144 22.3168 10.8615C22.1973 10.8086 22.0681 10.7813 21.9375 10.7812H8.0625C7.93185 10.7813 7.80266 10.8087 7.6832 10.8616C7.56374 10.9145 7.45664 10.9917 7.36878 11.0884C7.28092 11.1851 7.21422 11.2991 7.17297 11.423C7.13171 11.547 7.11681 11.6782 7.12922 11.8083L8.28141 23.8495C8.41219 25.2183 9.61641 26.2505 11.0827 26.2505H18.9173C20.3831 26.2505 21.5878 25.2183 21.7186 23.8495L22.8708 11.8083C22.8832 11.6782 22.8684 11.547 22.8271 11.423C22.7859 11.299 22.7191 11.185 22.6312 11.0883ZM12.8091 23.9044C12.7889 23.9053 12.7692 23.9062 12.7491 23.9062C12.5108 23.906 12.2816 23.8151 12.108 23.6519C11.9344 23.4887 11.8294 23.2656 11.8144 23.0278L11.2519 14.1216C11.2363 13.8734 11.3199 13.6293 11.4843 13.4428C11.6487 13.2563 11.8803 13.1427 12.1284 13.1269C12.3764 13.1118 12.6203 13.1956 12.8067 13.3599C12.9931 13.5241 13.1069 13.7555 13.1231 14.0034L13.6856 22.9097C13.7012 23.1578 13.6176 23.4019 13.4532 23.5884C13.2888 23.775 13.0572 23.8886 12.8091 23.9044ZM18.1856 23.0278C18.1785 23.1511 18.147 23.2718 18.0931 23.3829C18.0392 23.4941 17.9638 23.5934 17.8713 23.6754C17.7789 23.7573 17.6712 23.8201 17.5543 23.8602C17.4375 23.9004 17.3139 23.917 17.1906 23.9092C17.0674 23.9015 16.9468 23.8694 16.836 23.8149C16.7251 23.7604 16.6262 23.6845 16.5447 23.5916C16.4633 23.4987 16.401 23.3907 16.3615 23.2736C16.322 23.1566 16.306 23.0329 16.3144 22.9097L16.8769 14.0034C16.8938 13.7562 17.0079 13.5257 17.1942 13.3624C17.3805 13.199 17.624 13.1161 17.8713 13.1317C18.1186 13.1473 18.3496 13.2602 18.5139 13.4457C18.6783 13.6312 18.7625 13.8742 18.7481 14.1216L18.1856 23.0278Z"
                fill="#E21C1C"
              />
            </svg>
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
        console.log("yes", yes);
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
        <HolidayDialog setData={setData} data={data} />
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
