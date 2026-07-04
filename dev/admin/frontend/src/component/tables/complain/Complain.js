import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Title from "../../extras/Title";
import {
  getComplains,
  solveComplain,
} from "../../../redux/slice/complainSlice";
import noImage from "../../../assets/images/noImage.png";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComplainDialog from "./ComplainDialog";
import PageComplainFilters from "../../extras/PageComplainFilters";
import { ReactComponent as Edit } from "../../../../src/assets/icon/edit.svg";

const Complain = () => {
  const dispatch = useDispatch();
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
            src={row?.image ? row?.image : row?.image == "" ? noImage : noImage}
            alt="image"
            className="sq-tbl-img cursor-pointer"
            onClick={() => openImage(row?.image)}
          />
        </div>
      ),
    },
    {
      Header: col.bookingId,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId ? row?.bookingId : "-"}
        </span>
      ),
    },
    {
      Header: col.userName,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.userId?.fname
            ? row?.userId.fname + " " + row?.userId.lname
            : "Salon User"}
        </span>
      ),
    },
    {
      Header: col.details,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: col.date,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[0] : "-"}
        </span>
      ),
    },
    {
      Header: col.time,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[1] : "-"}
        </span>
      ),
    },
    {
      Header: col.status,
      Cell: ({ row }) => (
        <span>
          {row?.type == 0 && (
            <span className="sq-badge sq-badge--pending">{ui.complaints.pendingBadge}</span>
          )}
          {row?.type == 1 && (
            <span className="sq-badge sq-badge--success">{ui.complaints.solvedBadge}</span>
          )}
        </span>
      ),
    },
    {
      Header: col.action,
      Cell: ({ row }) => (
        <span className="sq-tbl-actions">
          <button
            type="button"
            className="sq-tbl-btn sq-tbl-btn--view"
            aria-label={ui.complaints.info}
            onClick={() =>
              dispatch(openDialog({ type: "complain", data: row }))
            }
          >
            <Edit />
          </button>
          {row?.type == 0 && (
            <button
              type="button"
              className="sq-tbl-btn sq-tbl-btn--edit"
              title={ui.complaints.solve}
              onClick={() => solveComplains(row?._id)}
            >
              <i className="ri-check-line" />
            </button>
          )}
        </span>
      ),
    },
  ];

  const expertTable = [
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
            src={row?.image ? row?.image : noImage}
            alt=""
            className="sq-tbl-img cursor-pointer"
            onClick={() => openImage(row?.image)}
          />
        </div>
      ),
    },
    {
      Header: col.bookingId,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId ? row?.bookingId : "-"}
        </span>
      ),
    },
    {
      Header: col.expertName,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.expertId
            ? row?.expertId.fname + " " + row?.expertId.lname
            : "-"}
        </span>
      ),
    },
    {
      Header: col.details,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: col.date,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[0] : "-"}
        </span>
      ),
    },
    {
      Header: col.time,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date?.split(",")[1] : "-"}
        </span>
      ),
    },
    {
      Header: col.status,
      Cell: ({ row }) => (
        <span>
          {row?.type == 0 && (
            <span className="sq-badge sq-badge--pending">{ui.complaints.pendingBadge}</span>
          )}
          {row?.type == 1 && (
            <span className="sq-badge sq-badge--success">{ui.complaints.solvedBadge}</span>
          )}
        </span>
      ),
    },
    {
      Header: col.action,
      Cell: ({ row }) => (
        <span className="sq-tbl-actions">
          <button
            type="button"
            className="sq-tbl-btn sq-tbl-btn--view"
            aria-label={ui.complaints.info}
            onClick={() =>
              dispatch(openDialog({ type: "complain", data: row }))
            }
          >
            <i className="ri-information-line" />
          </button>
          {row?.type == 0 && (
            <button
              type="button"
              className="sq-tbl-btn sq-tbl-btn--edit"
              title={ui.complaints.solve}
              onClick={() => solveComplains(row?._id)}
            >
              <i className="ri-check-line" />
            </button>
          )}
        </span>
      ),
    },
  ];

  const solveComplains = async (id) => {
    await dispatch(solveComplain(id));
    dispatch(getComplains(payload));
  };

  return (
    <div className="mainCategory sq-table-page">
      <Title name={ui.nav.complaints} />

      <PageComplainFilters
        person={person}
        setPerson={setPerson}
        type={type}
        setType={setType}
      />

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
        <ComplainDialog
          setData={setData}
          data={data}
        />
      )}
    </div>
  );
};

export default Complain;
