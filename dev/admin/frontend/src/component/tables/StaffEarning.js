/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { openDialog } from "../../redux/slice/dialogueSlice";
import { getPayout } from "../../redux/slice/payoutSlice";
import { warning } from "../../util/Alert";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../extras/Title";
import Button from "../extras/Button";
import Table from "../extras/Table";
import Pagination from "../extras/Pagination";
import Analytics from "../extras/Analytics";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { getAllWalletHistory } from "../../redux/slice/salarySlice";
import Sign from "../../assets/images/sign.png"
import With from "../../assets/images/with.png"
import { ReactComponent as Refund } from "../../assets/icon/refund.svg"
const StaffEarning = () => {
  const { allExpert, total } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting)

  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [transactionType, setTransactionType] = useState("All");
  const transactionTypeData = [
    { value: "1", label: "Credit" },
    { value: "2", label: "Debit" }
  ]
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  useEffect(() => {
    const payload = {
      startDate: startDate === "ALL" ? "All" : startDate,
      endDate: endDate === "ALL" ? "All" : endDate,
      start: page,
      limit: rowsPerPage,
      type: transactionType
    }
    dispatch(getAllWalletHistory(payload));
  }, [startDate, page, transactionType, rowsPerPage]);
  useEffect(() => {
    setData(allExpert);
  }, [allExpert]);

  const dispatch = useDispatch();

  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{page * rowsPerPage + parseInt(index) + 1}</span>
    },

    {
      Header: "UniqueId",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.uniqueId || "-"}</span>
      ),
    },
    {
      Header: "Expert Info",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.expert?.name || "-"}</span>
      ),
    },
    {
      Header: `Amount (${setting?.currencySymbol})`,
      Cell: ({ row }) => <span className="text-capitalize">{row?.amount || "-"}</span>,
    },
    {
      Header: `Date`,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.date || "-"}</span>
      ),
    },
    {
      Header: "Time",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.time ? row?.time : "-"}
        </span>
      ),
    },

    {
      Header: 'Transaction Type',
      Cell: ({ row }) => {
        const isCredit = row?.type === 1;
        const isDebit = row?.type === 2 && row?.payoutStatus === 2;

        return isCredit ? (
          <button className=" text-white m5-right p12-x p4-y fs-12 br-5" style={{ backgroundColor: "#14AF14" }}>
            Credit
          </button>
        ) : isDebit ? (
          <button className="text-white m5-right p12-x p4-y fs-12 br-5" style={{ backgroundColor: "#F23434" }}>
            Debit
          </button>
        ) : (
          <button className="m5-right p12-x p4-y fs-12 br-5" style={{ backgroundColor: "#FFC7C6", color: "#FF1B1B", fontWeight: "700" }}>
            Pending
          </button>
        );
      },
    },
    {
      Header: 'Transaction Completed',
      Cell: ({ row }) => {
        const isCredit = row?.type === 1;
        const isDebit = row?.type === 2;

        return isCredit ? (

          <button className="d-flex align-items-center justify-content-center"
            style={{ background: "#C0E9C0", color: "#14AF14", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
            <img src={Sign} height={28} width={25} alt="Icon" style={{ objectFit: "contain", marginRight: "8px" }} />
            <span style={{ whiteSpace: "nowrap" }}>Booking Complete</span>
          </button>
        ) : isDebit ? (
          <>
            {row?.payoutStatus === 1 ? (
              <button className="d-flex align-items-center justify-content-center"
                style={{ background: "#D8F0F9", color: "#17A7DB", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                <Refund />
                <span style={{ whiteSpace: "nowrap" }} className="ms-2">{
                  row?.payoutStatus === 1 && "Withdraw Pending" || row?.payoutStatus === 2 && "Withdraw Approve" || row?.payoutStatus === 3 && "Withdraw Declined"
                }</span>
              </button>
            ) : (
              <button className="d-flex align-items-center justify-content-center"
                style={{ background: "#F5DDC3", color: "#EB8213", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                <img src={With} height={28} width={25} alt="Icon" style={{ objectFit: "contain", marginRight: "8px", border: "none", borderRadius: "5px" }} />
                <span style={{ whiteSpace: "nowrap" }}>{
                  row?.payoutStatus === 1 && "Withdraw Pending" || row?.payoutStatus === 2 && "Withdraw Approve" || row?.payoutStatus === 3 && "Withdraw Declined"
                }</span>
              </button>
            )
            }
          </>
        ) : (
          ""
        );
      },
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Expert earnings" />
      <div className="betBox">
        <div className="inputData pb-2">
          <label className="styleForTitle" htmlFor="transactionType">
            Transaction Type
          </label>
          <select
            name="transactionType"
            className="rounded-2 fw-bold"
            id="transactionType"
            value={transactionType}
            onChange={(e) => {
              const selectedSalonId = e.target.value;
              const payload = {
                startDate: startDate === "ALL" ? "All" : startDate,
                endDate: endDate === "ALL" ? "All" : endDate,
                start: page,
                limit: rowsPerPage,
                type: transactionType
              }
              setTransactionType(selectedSalonId);
              dispatch(getAllWalletHistory(payload));
            }}
          >
            <option key="All" value="All">
              All
            </option>
            {transactionTypeData?.map((data) => (
              <option key={data?.value} value={data?.value}>
                {data?.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-9"  >
          <div className="inputData">
            <label>Analytic</label>
          </div>
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            placeholder="Wallet"
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
          />
        </div>
      </div>

      <div>
        <Table
          data={data}
          mapData={mapData}
          rowsPerPage={rowsPerPage}
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

export default StaffEarning;
