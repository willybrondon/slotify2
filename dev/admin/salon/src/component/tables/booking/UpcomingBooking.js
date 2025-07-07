/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import React from "react";
import Title from "../../extras/Title";
import Searching from "../../extras/Searching";
import {
  getAllBookings,
  upcomingBookings,
} from "../../../redux/slice/bookingSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import $ from "jquery";
import male from "../../../assets/images/male.png";
import { Select } from "../../extras/Input";
import { useNavigate } from "react-router-dom";

const UpcomingBooking = () => {
  const { futureBooking } = useSelector((state) => state.booking);
  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(upcomingBookings());
  }, []);

  useEffect(() => {
    setData(futureBooking);
  }, [futureBooking]);

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

  const upcomingBooking = [
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
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.userId?.image ? row?.userId?.image : male}
            alt="image"
            className="cursor-pointer"
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.userId
            ? row?.userId?.fname + " " + row?.userId?.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: "Expert",
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
      Header: "Service",
      Cell: ({ row }) => (
        <div>
          {row?.serviceId &&
            row.serviceId.map((service, index) => (
              <span key={index} className="text-capitalize">
                {service?.name}
                {index !== row.serviceId.length - 1 && <br />}
              </span>
            ))}
        </div>
      ),
    },

    {
      Header: "Price",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.rupee + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Commission",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.status == "cancel"
            ? "-"
            : row?.commission + " " + setting?.currencySymbol}
        </span>
      ),
    },

    {
      Header: "Duration",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.duration + " " + "Min"}</span>
      ),
    },
    {
      Header: "Booked At",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.createdAt?.split("T")[0]}</span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.date?.split("T")[0]}</span>
      ),
    },
    {
      Header: "First Slot",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.time[0]}</span>
      ),
    },
   
  ];
  const handleInfo = (id) => {
    navigate("/salonPanel/getExpertProfile", {
      state: {
        id,
      },
    });
  };



  return (
    <div className="mainBooking">
      <Title name={` Today's Pending Bookings`} />
      <div>
        <Table
          data={data}
          mapData={upcomingBooking}
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
          totalData={futureBooking?.length}
        />
      </div>
    </div>
  );
};
export default UpcomingBooking;
