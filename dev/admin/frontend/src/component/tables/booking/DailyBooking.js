/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React from "react";
import Title from "../../extras/Title";
import { dailyBookings } from "../../../redux/slice/bookingSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import $ from "jquery";

import male from "../../../assets/images/male.png";
import Analytics from "../../extras/Analytics";

const DailyBooking = () => {
  const getCurrentMonthDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based

    const startOfMonth = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-${lastDay}`;

    return { startOfMonth, endOfMonth };
  };

  const { startOfMonth, endOfMonth } = getCurrentMonthDates();

  const { booking, total } = useSelector((state) => state.booking);
  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("ALL");
  const payload = {
    start: page,
    limit: rowsPerPage,
    startDate,
    endDate,
  };

  useEffect(() => {
    dispatch(dailyBookings({ ...payload, command: true }));
  }, [page, rowsPerPage, startDate, endDate]);

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

  function openImage(imageUrl) {
    // Open the image in a new tab or window
    window.open(imageUrl, "_blank");
  }

  $(document).ready(function () {
    $("img").bind("error", function () {
      // Set the default image
      $(this).attr("src", male);
    });
  });
  const bookingTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => <span className="text-capitalize">{row?.date}</span>,
    },
    {
      Header: "No. Booking",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalBookings}</span>
      ),
    },
    {
      Header: "No. Experts",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.experts}</span>
      ),
    },
    {
      Header: "Services Amount +",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.totalWithoutTax ? row?.totalWithoutTax?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "Admin Earning +",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.platFormFee ? row?.platFormFee?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "Expert Earning +",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning ? row?.expertEarning?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "Salon Earning +",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.salonCommission ? row?.salonCommission?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
    {
      Header: "Tax =",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.totalTax ? row?.totalTax?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },

    {
      Header: "Total revenue",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.totalAmount ? row?.totalAmount?.toFixed(2) + " " + setting?.currencySymbol : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainBooking">
      <Title name={`Bookings`} />
      <div className="row ">
        <div className="mt-2 col-md-9">
          <div className=" inputData col-lg-2 col-md-4 me-3">
            <label>Select date</label>
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
export default DailyBooking;
