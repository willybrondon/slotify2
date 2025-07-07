import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../extras/Title";
import Table from "../../extras/Table";
import { particulareExpertHistory } from "../../../redux/slice/salarySlice";
import Male from "../../../assets/images/male.png";

const ParticularExpertEarnings = () => {
  const { salary } = useSelector((state) => state.salary);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const { state } = useLocation();


  const expertId = state?.row?.expert
    ? state?.row?.expert?._id
    : state?.row?._id;

  useEffect(() => {
    dispatch(particulareExpertHistory(expertId));
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
  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },

    {
      Header: "Bookings",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.bookingId?.length}</span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }) => <span className="text-capitalize">{row?.date}</span>,
    },
    {
      Header: `Expert Earnings`,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.expertEarning+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Bonus/Panelty`,
      Cell: ({ row }) => <span className="text-capitalize">{row?.bonus+ " " + setting?.currencySymbol}</span>,
    },
    {
      Header: `Final Amount`,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.finalAmount+ " " + setting?.currencySymbol}</span>
      ),
    },

    {
      Header: "Status",
      Cell: ({ row }) => (
        <span>
          {row?.statusOfTransaction === 0 && (
            <span className="bg-success text-light p10-x p4-y fs-12 br-5">
              Pending
            </span>
          )}
          {row?.statusOfTransaction === 1 && (
            <span className="bg-success text-light p10-x p4-y fs-12 br-5">
              Paid
            </span>
          )}
        </span>
      ),
    },
    {
      Header: "Settlement Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.settlementDate ? row?.settlementDate : "-"}
        </span>
      ),
    },
    {
      Header: "Payment Date",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.payout ? row?.payout : "Pending"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title
        name={`${
          state?.row?.expert
            ? state?.row?.expert?.fname + " " + state?.row?.expert?.lname
            : state?.row?.fname + " " + state?.row?.lname
        }'s Income Details`}
      />

      <div>
        <Table data={data} mapData={mapData} />
      </div>
    </div>
  );
};

export default ParticularExpertEarnings;
