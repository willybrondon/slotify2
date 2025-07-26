/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Title from "../../extras/Title";
import {  warning } from "../../../util/Alert";
import {
  getAllServices,
  deleteService,
  serviceStatus,
} from "../../../redux/slice/serviceSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ServiceDialogue from "./ServiceDialogue";
import { ReactComponent as Delete } from "../../../assets/icon/delete.svg";
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";
import Searching from "../../extras/Searching";

const Service = () => {
  const dispatch = useDispatch();

  const { setting } = useSelector((state) => state.setting);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const { service, total } = useSelector((state) => state.service);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("ALL");
;

  const payload = {
    start: page,
    limit: rowsPerPage,
    search,
  };

  useEffect(() => {
    dispatch(getAllServices(payload));
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    setData(service);
  }, [service]);

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

  const serviceTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            onClick={() => openImage(row?.image)}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Category",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.categoryname}</span>
      ),
    },

    {
      Header: "Duration",
      Cell: ({ row }) => <span>{row?.duration + " min"}</span>,
    },
    {
      Header: "Status",
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.status}
          onClick={() => handleStatus(row?._id)}
        />
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => dispatch(openDialog({ type: "service", data: row }))}
          >
            <Edit />
          </button>
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

  const handleStatus = (id) => {

    dispatch(serviceStatus(id));
  };

  const handleDelete = (id) => {

    const data = warning("Delete");
    data
      .then((logouts) => {
        const yes = logouts.isConfirmed;
        if (yes) {
          dispatch(deleteService(id));
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="mainCategory">
      <Title name="Services" />
      <div className="row">
        <div className="col-3">
          <Button
            className={`bg-button p-10 text-white m10-bottom `}
            bIcon={`fa-solid fa-user-plus`}
            text="Add service"
            onClick={() => {
              dispatch(openDialog({ type: "service" }));
            }}
          />
        </div>
        <div className="col-lg-5 col-md-7 col-8  ms-auto">
          <Searching
            type={`server`}
            data={service}
            setData={setData}
            column={serviceTable}
            serverSearching={handleFilterData}
          />
        </div>
      </div>
      <div>
        <Table
          data={data}
          mapData={serviceTable}
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
      {dialogue && dialogueType === "service" && (
        <ServiceDialogue
          setData={setData}
          data={data}
        />
      )}
    </div>
  );
};

export default Service;
