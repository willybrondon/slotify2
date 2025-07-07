import React, { useEffect, useState } from "react";
import { particulareSalonEarningHistory } from "../../../redux/slice/salarySlice";
import Table from "../../extras/Table";
import Title from "../../extras/Title";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Male from "../../../assets/images/male.png";
import Pagination from "../../extras/Pagination";
import moment from "moment";

const ParticularSalonSettlementInfo = () => {
  const { salary } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const { state } = useLocation();



  const expertId = state?.row?._id;

  useEffect(() => {
    dispatch(particulareSalonEarningHistory(expertId));
  }, [expertId]);

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
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: "User Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
        >
          <img
            src={row?.userId?.image ? row?.userId?.image : Male}
            alt="images"
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
      Header: "User",
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
      Header: `Booking Id`,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.bookingId}</span>
      ),
    },
    {
      Header: `Expert Earnings `,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.expertEarning+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Salon Commission `,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.salonCommission+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Tax `,
      Cell: ({ row }) => <span className="text-capitalize">{row?.tax+ " " + setting?.currencySymbol}</span>,
    },
    {
      Header: `Admin Commission `,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.platformFee?.toFixed(2)+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Final Amount `,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.amount?.toFixed(2)+ " " + setting?.currencySymbol}</span>
      ),
    },

    {
      Header: "Date",
      Cell: ({ row }) => (
        <span>{row?.date && moment(row.date).format("YYYY-MM-DD")}</span>
      ),
    },

    {
      Header: "Payment Type",
      Cell: ({ row }) => <span>{row?.paymentType}</span>,
    },
    {
      Header: "Payment Date",
      body: "paymentDate",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {moment(row?.paymentDate).format("YYYY-MM-DD")}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title
        name={`${
          state?.row?.salon ? state?.row?.salon?.name : " "
        }'s Income Details`}
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

export default ParticularSalonSettlementInfo;
