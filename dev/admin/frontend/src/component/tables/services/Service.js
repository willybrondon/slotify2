import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
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
      Header: col.no,
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: col.image,
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image}
            alt=""
            className="sq-tbl-img cursor-pointer"
            onClick={() => openImage(row?.image)}
          />
        </div>
      ),
    },
    {
      Header: col.name,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: col.category,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.categoryname}</span>
      ),
    },

    {
      Header: col.duration,
      Cell: ({ row }) => <span>{row?.duration + " min"}</span>,
    },
    {
      Header: col.status,
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.status}
          onClick={() => handleStatus(row?._id)}
        />
      ),
    },
    {
      Header: col.action,
      Cell: ({ row }) => (
        <span className="sq-tbl-actions">
          <button
            type="button"
            className="sq-tbl-btn sq-tbl-btn--edit"
            aria-label="Modifier"
            onClick={() => dispatch(openDialog({ type: "service", data: row }))}
          >
            <Edit />
          </button>
          <button
            type="button"
            className="sq-tbl-btn sq-tbl-btn--delete"
            aria-label="Supprimer"
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
    <div className="mainCategory sq-table-page">
      <Title name={ui.pages.services} />
      <div className="row align-items-center mb-2">
        <div className="col-auto">
          <Button
            className="sq-btn-add"
            bIcon="fa-solid fa-plus"
            text={ui.labels.addService}
            onClick={() => {
              dispatch(openDialog({ type: "service" }));
            }}
          />
        </div>
        <div className="col-lg-5 col-md-7 col-12 ms-lg-auto">
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
