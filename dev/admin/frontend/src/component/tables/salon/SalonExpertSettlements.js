import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import {
  getExpertEarningBySalon,
  paymentExpertBySalon,
} from "../../../redux/slice/payoutSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Analytics from "../../extras/Analytics";
import moment from "moment";
import SalonExpertBonusDialog from "./SalonExpertBonusDialog";

const SalonExpertSettlements = ({ salonId }) => {
  const dispatch = useDispatch();
  const { payout } = useSelector((state) => state.payout);
  const { setting } = useSelector((state) => state.setting);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  const [data, setData] = useState([]);
  const startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = moment().endOf("month").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(endOfMonth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!salonId) return;
    dispatch(
      getExpertEarningBySalon({
        salonId,
        startDate,
        endDate,
      })
    );
  }, [salonId, startDate, endDate, dispatch]);

  useEffect(() => {
    setData(payout || []);
  }, [payout]);

  const handlePayment = (row) => {
    dispatch(
      paymentExpertBySalon({
        salonId,
        settlementId: row._id,
      })
    );
  };

  const mapData = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{page * rowsPerPage + parseInt(index, 10) + 1}</span>,
    },
    {
      Header: col.image,
      Cell: ({ row }) => (
        <img src={row?.expert?.image} alt="expert" width="60" height="60" style={{ objectFit: "cover", borderRadius: 8 }} />
      ),
    },
    {
      Header: col.name,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.expert?.fname} {row?.expert?.lname}
        </span>
      ),
    },
    {
      Header: col.totalBookings,
      Cell: ({ row }) => <span>{row?.bookingId?.length || 0}</span>,
    },
    {
      Header: col.expertEarning,
      Cell: ({ row }) => (
        <span>
          {row?.expertEarning?.toFixed(2)} {setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.bonusPenalty,
      Cell: ({ row }) => (
        <span>
          {row?.bonus} {setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.finalAmount,
      Cell: ({ row }) => (
        <span className="fw-bold">
          {row?.finalAmount?.toFixed(2)} {setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.paymentDate,
      Cell: ({ row }) => <span>{row?.paymentDate || "En attente"}</span>,
    },
    {
      Header: col.action,
      Cell: ({ row }) => (
        <span className="d-flex gap-2">
          {row?.statusOfTransaction === 0 && (
            <>
              <button
                type="button"
                className="btn btn-sm sq-btn-outline"
                onClick={() =>
                  dispatch(
                    openDialog({
                      type: "expertBonus",
                      data: row._id,
                      mainData: { salonId },
                    })
                  )
                }
              >
                Bonus
              </button>
              <button
                type="button"
                className="btn btn-sm sq-btn-primary"
                onClick={() => handlePayment(row)}
              >
                Marquer payé
              </button>
            </>
          )}
          {row?.statusOfTransaction === 1 && (
            <span className="badge bg-success">Payé</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      {dialogue && dialogueType === "expertBonus" && <SalonExpertBonusDialog />}
      <Analytics
        analyticsStartDate={startDate}
        analyticsStartEnd={endDate}
        analyticsStartDateSet={setStartDate}
        analyticsStartEndSet={setEndDate}
        allAllow={false}
      />
      <Table data={data} mapData={mapData} PerPage={rowsPerPage} Page={page} type="client" />
      <Pagination
        type="client"
        serverPage={page}
        setServerPage={setPage}
        serverPerPage={rowsPerPage}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(v) => {
          setRowsPerPage(parseInt(v, 10));
          setPage(0);
        }}
        totalData={data?.length}
      />
    </div>
  );
};

export default SalonExpertSettlements;
