/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Title from "../../extras/Title";
import {
  getAllCategory,
  categoryDelete,
  categoryStatus,
} from "../../../redux/slice/categorySlice";
import { warning } from "../../../util/Alert";
import {
  getComplains,
  solveComplain,
} from "../../../redux/slice/complainSlice";
import noImage from "../../../assets/images/noImage.png";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Analytics from "../../extras/Analytics";
import ComplainDialog from "./ComplainDialog";

const Complain = () => {
  const { complain, total } = useSelector((state) => state.complain);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [type, setType] = useState(2);
  const [person, setPerson] = useState(1);

  const payload = {
    start: page,
    limit: rowsPerPage,
    type,
    person,
  };

  useEffect(() => {
    dispatch(getComplains(payload));
  }, [page, rowsPerPage, type, person]);

  useEffect(() => {
    setData(complain);
  }, [complain]);

  const dispatch = useDispatch();

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

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.image ? row?.image : row?.image == "" ? noImage : noImage}
            alt="image"
            className="cursor-pointer"
            onClick={() => openImage(row?.image)}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "BookingId",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId ? row?.bookingId : "-"}
        </span>
      ),
    },
    {
      Header: "User Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.userId?.fname
            ? row?.userId.fname + " " + row?.userId.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: "Details",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[0] : "-"}
        </span>
      ),
    },
    {
      Header: "Time",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[1] : "-"}
        </span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }) => (
        <span>
          {row?.type == 0 && (
            <button
              className="text-white not-allowed  p10-x p4-y fs-12 br-5"
              style={{ backgroundColor: "#ff7512" }}
            >
              Pending
            </button>
          )}
          {row?.type == 1 && (
            <button className="bg-danger not-allowed text-light p10-x p4-y fs-12 br-5">
              Solved
            </button>
          )}
        </span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-success text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() =>
              dispatch(openDialog({ type: "complain", data: row }))
            }
          >
            Info
          </button>
        </span>
      ),
    },
  ];

  const expertTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.image ? row?.image : row?.image == "" ? noImage : noImage}
            alt="image"
            className="cursor-pointer"
            onClick={() => openImage(row?.image)}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "BookingId",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId ? row?.bookingId : "-"}
        </span>
      ),
    },
    {
      Header: "Expert Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.expertId
            ? row?.expertId.fname + " " + row?.expertId.lname
            : "-"}
        </span>
      ),
    },
    {
      Header: "Details",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[0] : "-"}
        </span>
      ),
    },
    {
      Header: "Time",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[1] : "-"}
        </span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }) => (
        <span>
          {row?.type == 0 && (
            <button
              className="text-white p10-x p4-y fs-12 br-5"
              style={{ backgroundColor: "#ff7512" }}
            >
              Pending
            </button>
          )}
          {row?.type == 1 && (
            <button className="bg-danger text-light p10-x p4-y fs-12 br-5">
              Solved
            </button>
          )}
        </span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }) => (
        <span>
          <button
            className="bg-success text-light m5-right p10-x p4-y fs-12 br-5"
            onClick={() =>
              dispatch(openDialog({ type: "complain", data: row }))
            }
          >
            Info
          </button>
        </span>
      ),
    },
  ];

  const complainType = [
    { name: "PENDING", value: 0 },
    { name: "SOLVED", value: 1 },
  ];

  return (
    <div className="mainCategory">
      <Title name={"Complain"} />

      <div className="row mb-2">
        <div className="d-flex col-10 mt-auto mb-0">
          <div
            className="my-2"
            style={{
              width: "329px",
              border: "1px solid #1c2b20",
              padding: "4px",
              borderRadius: "40px",
            }}
          >
            <button
              type="button"
              className={`${person === 1 ? "activeBtn" : "disabledBtn"}`}
              onClick={() => setPerson(1)}
            >
              User complain
            </button>
            <button
              type="button"
              className={`${person === 0 ? "activeBtn" : "disabledBtn"} ms-1`}
              onClick={() => setPerson(0)}
            >
              Expert complain
            </button>
          </div>
        </div>
        <div className="col-2">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="bookingType">
              Complain type
            </label>
            <select
              name="bookingType"
              className="rounded-2 fw-bold"
              id="bookingType"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <option value={2} selected>
                ALL
              </option>
              {complainType?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>
        </div>
      </div>
      <div>
        <Table
          data={data}
          mapData={person == 0 ? expertTable : userTable}
          PerPage={rowsPerPage}
          Page={page}
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
      {dialogue && dialogueType === "complain" && (
        <ComplainDialog setData={setData} data={data} />
      )}
    </div>
  );
};

export default Complain;
