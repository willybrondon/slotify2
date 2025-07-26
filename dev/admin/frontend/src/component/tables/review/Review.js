/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Title from "../../extras/Title";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReview, deleteReview } from "../../../redux/slice/reviewSlice";
import {  warning } from "../../../util/Alert";
import Searching from "../../extras/Searching";
import Rating from "@mui/material/Rating";
import male from "../../../assets/images/male.png";
import $ from "jquery";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Delete } from "../../../../src/assets/icon/delete.svg";

export const Review = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const { review, total } = useSelector((state) => state.review);
  const dispatch = useDispatch();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("ALL");
;

  const payload = {
    start: page,
    limit: rowsPerPage,
    search,
  };

  useEffect(() => {
    dispatch(getAllReview({ ...payload }));
  }, [page, rowsPerPage, search]);

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

  const handleInfo = (id) => {
    navigate("/admin/user/userProfile", {
      state: {
        id,
      },
    });
  };

  const handleExpertInfo = (id) => {
    navigate("/admin/expert/getExpertProfile", {
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
        <div
          className=""
          style={{ overflow: "hidden" }}
        >
          <img
            src={row?.userImage ? row?.userImage : male}
            alt="image"
            className="cursor-pointer userProfile"
            onClick={() => handleInfo(row?.userId)}
            style={{ height: "70px", width: "70px" }}
          />
        </div>
      ),
    },
    {
      Header: "User Name",
      Cell: ({ row }) => (
        <span
          className="text-capitalize cursor fw-bold"
          onClick={() => handleInfo(row?.userId)}
        >
          {row?.userFname + " " + row?.userLname}
        </span>
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
      Header: "BookingId",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bookingId ? row?.bookingId : "-"}
        </span>
      ),
    },
    {
      Header: "Expert",
      Cell: ({ row }) => (
        <span
          className="text-capitalize cursor fw-bold"
          onClick={() => handleExpertInfo(row?.expertId)}
        >
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

    {
      Header: "Delete",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ backgroundColor: "#FFF1F1", borderRadius: "8px" }}
            onClick={() => handleDelete(row._id)}
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
          dispatch(deleteReview(id));
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="mainExpert">
      <Title name="Reviews" />
      <div className="col-md-8 col-lg-5  ms-auto">
        <Searching
          type={`server`}
          data={review}
          setData={setData}
          column={reviewTable}
          serverSearching={handleFilterData}
        />
      </div>
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
