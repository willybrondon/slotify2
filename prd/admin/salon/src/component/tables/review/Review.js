/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Title from "../../extras/Title";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReview, deleteReview } from "../../../redux/slice/reviewSlice";
import { warning } from "../../../util/Alert";
import Searching from "../../extras/Searching";
import Rating from "@mui/material/Rating";
import male from "../../../assets/images/male.png";
import $ from "jquery";
import { useNavigate } from "react-router-dom";

export const Review = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const { review, total } = useSelector((state) => state.review);
  const dispatch = useDispatch();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("ALL");

  const payload = {
    start: page,
    limit: rowsPerPage,
    search,
  };

  useEffect(() => {
    dispatch(getAllReview({ ...payload }));
  }, [page, rowsPerPage]);

  useEffect(() => {
    setData(review);
  }, [review]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  $(document).ready(function () {
    $("img").bind("error", function () {
      // Set the default image
      $(this).attr("src", male);
    });
  });



  const handleExpertInfo = (id) => {
    navigate("/salonPanel/getExpertProfile", {
      state: {
        id,
      },
    });
  };

  const reviewTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "User",
      Cell: ({ row }) => (
        <div>
          <img
            src={row?.userImage ? row?.userImage : male}
            alt="image"
            className="cursor-pointer userProfile"
            style={{ height: "70px", width: "70px" }}
          />
        </div>
      ),
    },
    {
      Header: "Review",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.review ? row?.review : "-"}
        </span>
      ),
    },
    {
      Header: "Rating",
      Cell: ({ row }) => (
        <>
          <Rating
            name="read-only"
            style={{ color: "#ffc632" }}
            value={parseInt(row?.rating)}
            readOnly
          />
        </>
      ),
    },
    {
      Header: "User",
      Cell: ({ row }) => (
        <span className="text-capitalize cursor fw-bold">
          {row?.userFname + " " + row?.userLname}
        </span>
      ),
    },
    {
      Header: "BookingId",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bookingIds ? row?.bookingIds : "-"}
        </span>
      ),
    },
    {
      Header: "Expert",
      Cell: ({ row }) => (
        <span className="text-capitalize cursor fw-bold">
          {row?.expertFname + " " + row?.expertLname}
        </span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.createdAt?.split("T")[0]}</span>
      ),
    },
  ];

  return (
    <div className="mainExpert">
      <Title name="Reviews" />
      <div>
        <Table
          data={data}
          mapData={reviewTable}
          serverPerPage={rowsPerPage}
          Page={page}
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
