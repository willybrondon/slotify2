import { col } from "../../../constants/tableHeaders";
import React, { useEffect, useState } from "react";
import Pagination from "../../extras/Pagination";
import Table from "../../extras/Table";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";
import {
  expertHistory,
  particulareExpertSettlementInfo,
} from "../../../redux/slice/salarySlice";
import moment from "moment";

const ParticularExpertSettlementInfo = () => {
  const { salary } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  useEffect(() => {
    dispatch(particulareExpertSettlementInfo(state?.row?._id));
  }, [state]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

  const dispatch = useDispatch();

  function openHistory(imageUrl) {
    window.open(imageUrl, "_blank");
  }
  const navigate = useNavigate();

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
        <span className="text-capitalize fw-bold cursor">
          {row?.userId?.fname
            ? row?.userId?.fname + " " + row?.userId?.lname
            : "Salon User"}
        </span>
      ),
    },

    {
      Header: col.expertEarning,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.salonCommissionPct,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.salonCommission + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.tax,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.tax + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.adminCommission,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.platformFee + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: col.finalAmount,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.amount?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },

    {
      Header: col.paymentType,
      Cell: ({ row }) => <span>{row?.paymentType}</span>,
    },
  ];

  return (
    <div className="mainCategory">
      <Title
        name={`${
          state?.row?.expert
            ? state?.row?.expert?.fname + " " + state?.row?.expert?.lname
            : " "
        }'s Earnings Details`}
      />

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
export default ParticularExpertSettlementInfo;
