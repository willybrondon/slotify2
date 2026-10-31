import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Searching from "../../extras/Searching";
import { allSalonClients } from "../../../redux/slice/userSlice";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import { col } from "../../../constants/tableHeaders";
import male from "../../../assets/images/male.png";

const Clients = () => {
  const dispatch = useDispatch();
  const { user, total, isSkeleton } = useSelector((state) => state?.user);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("ALL");
  const [data, setData] = useState([]);

  useEffect(() => {
    dispatch(
      allSalonClients({
        start: page,
        limit: rowsPerPage,
        search,
      })
    );
  }, [dispatch, page, rowsPerPage, search]);

  useEffect(() => {
    setData(Array.isArray(user) ? user : []);
  }, [user]);

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") setSearch(filteredData);
    else setData(filteredData);
  };

  const clientTable = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{page * rowsPerPage + parseInt(index, 10) + 1}</span>,
    },
    {
      Header: col.image || "Photo",
      Cell: ({ row }) => (
        <img
          src={row?.image || male}
          alt=""
          style={{ height: 48, width: 48, borderRadius: 8, objectFit: "cover" }}
          onError={(e) => {
            e.target.src = male;
          }}
        />
      ),
    },
    {
      Header: col.name,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {[row?.fname, row?.lname].filter(Boolean).join(" ") || "Cliente"}
          {row?.isGuest ? (
            <span className="badge bg-secondary ms-2" style={{ fontWeight: 500 }}>
              Guest
            </span>
          ) : null}
        </span>
      ),
    },
    {
      Header: col.mobile,
      Cell: ({ row }) => <span>{row?.mobile || "—"}</span>,
    },
    {
      Header: col.email,
      Cell: ({ row }) => <span>{row?.email || "—"}</span>,
    },
    {
      Header: "RDV",
      Cell: ({ row }) => (
        <span>
          {row?.bookingCount || 0}
          {row?.completedCount != null ? (
            <span className="text-muted"> ({row.completedCount} terminés)</span>
          ) : null}
        </span>
      ),
    },
    {
      Header: "Dernier RDV",
      Cell: ({ row }) => <span>{row?.lastBookingDate || "—"}</span>,
    },
  ];

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name={ui.nav?.clients || "Clientes"} />
        <p style={{ color: "#666", maxWidth: 720, marginBottom: 16 }}>
          Clientees ayant réservé dans <strong>votre salon</strong> (y compris réservation
          guest). Ces contacts alimentent le rebooking et les campagnes SMS.
        </p>
        <Searching
          type={"server"}
          data={data}
          setData={setData}
          serverSearching={handleFilterData}
        />
        {!isSkeleton && (!data || data.length === 0) ? (
          <div className="alert alert-light border mt-3" role="status">
            Aucune cliente pour l’instant. Dès qu’une réservation est prise chez vous, elle
            apparaît ici (email + mobile) — même sans compte « complet ».
          </div>
        ) : null}
        <Table data={data} mapData={clientTable} PercantageWidth />
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={(_e, p) => setPage(p)}
          onRowsPerPageChange={(v) => {
            setRowsPerPage(parseInt(v, 10));
            setPage(0);
          }}
          totalData={total || 0}
        />
      </div>
    </div>
  );
};

export default Clients;
