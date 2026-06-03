import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { expertHistory, payment } from "../../../redux/slice/salarySlice";
import BonusPenaltyDialog from "../BonusPenaltyDialog";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";

const ExpertHistory = () => {
  const { salary } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(expertHistory(state.id));
  }, [state]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

  const dispatch = useDispatch();

  function openHistory(imageUrl) {
    window.open(imageUrl, "_blank");
  }
  const navigate = useNavigate();
  const handleInfo = (id) => {
    navigate("/admin/user/userProfile", {
      state: {
        id,
      },
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  const mapData = [
    {
      Header: col.no,
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: col.userImage,
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.userId?.image}
            alt="image"
            className="cursor-pointer"
            onClick={() => handleInfo(row?.userId?._id)}
            onError={(e) => {
              e.target.src = Male;
            }}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: col.user,
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.userId?._id)}
        >
          {row?.userId?.fname
            ? row?.userId?.fname + " " + row?.userId?.lname
            : "Salon User"}
        </span>
      ),
    },

    {
      Header: col.expertEarning,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.expertEarning + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: col.salonCommissionPct,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.salonCommission+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: col.tax,
      Cell: ({ row }) => <span className="text-capitalize">{row?.tax+ " " + setting?.currencySymbol}</span>,
    },
    {
      Header: col.adminCommission,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.platformFee?.toFixed(2)+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: col.finalAmount,
      Cell: ({ row }) => <span className="text-capitalize">{row?.amount?.toFixed(2)+ " " + setting?.currencySymbol}</span>,
    },

    {
      Header: col.createdAt,
      Cell: ({ row }) => <span>{row?.createdAt && moment(row.createdAt).format("YYYY-MM-DD")}</span>,
    },
    {
      Header: col.paymentType,
      Cell: ({ row }) => <span>{row?.paymentType}</span>,
    },

    {
      Header: col.paymentDate,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.payout ? row?.payout : "Pending"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name={ui.labels.expertEarningsDetail} />

      <div>
        <Table
          data={data}
          mapData={mapData}
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
          totalData={data?.length}
        />
      </div>
    </div>
  );
};

export default ExpertHistory;
