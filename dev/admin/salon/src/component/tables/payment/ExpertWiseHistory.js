/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Title from "../../extras/Title";
import Table from "../../extras/Table";

import { useLocation, useNavigate } from "react-router-dom";
import { particularPaymentHistory } from "../../../redux/slice/payoutSlice";
import { useDispatch, useSelector } from "react-redux";
import male from "../../../assets/images/male.png";

const ExpertPaymentHistory = () => {

  const { setting } = useSelector((state) => state.setting);


  const [data, setData] = useState([]);
  const dispatch = useDispatch();
   const { state } = useLocation();
  const { payout } = useSelector((state) => state.payout); 
const navigate = useNavigate()
  useEffect(() => {
    
    const payload = {
      settlementIds: state?.settlements,
      expertId: state?.expert?._id,
    };
    dispatch(particularPaymentHistory(payload));
  }, [state, dispatch]);

  useEffect(() => {
    setData(payout);
  }, [payout]);

  const handleInfo = (id) => {
    navigate("/admin/userHistory" ,{
      state : {
        id
      }
    })
  }

  const mapData = [

    {
      Header: "No",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div
          className="userProfile"
        >
          <img
            src={row?.userId?.image? row?.userId?.image : male}
          style={{ height: "70px", width: "70px", overflow: "hidden" }}
            alt="image"
            className="cursor-pointer"
            onError={(e) => {
              e.target.src = male; 
            }}
            height={`100%`}
            
          />
        </div>
      ),
    },
    {
      Header: "User Name",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.bookingId?.userId?._id)}
        >
          {row?.UserId?.fname ? row?.userId?.fname + " " + row?.expertId?.lname : 'Salon User'}
        </span>
      ),
    },
    
    {
      Header: "BookingId",
      body: "amount",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bookingId?.bookingId ? row?.bookingId?.bookingId : 'Not Available'}
        </span>
      ),
    },

    {
      Header: "Amount",
      sorting: { type: "client" },
      body: "revenue",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.revenue? row?.revenue?.toFixed(1) + " " + setting?.currencySymbol : "0"}
        </span>
      ),
    },
    {
      Header: "Admin Earning",
      sorting: { type: "client" },
      body: "adminEarning",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.adminEarning?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Expert Earning",
      sorting: { type: "client" },
      body: "expertEarning",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.expertEarning?.toFixed(2) + " " + setting?.currencySymbol}
        </span>
      ),
    },
    {
      Header: "Date",
      sorting: { type: "date" },
      body: "payoutDate",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.date ? row?.date : 'Not available'}
        </span>
      ),
    },
    {
      Header: "Payment Date",
      body: "payoutDate",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.payoutDate}</span>
      ),
    },
   
  ];

  return (
    <div className="mainCategory">
      <Title name="Expert Earnings" />
      <div>
        <Table data={data} mapData={mapData} />
      </div>
    </div>
  );
};

export default ExpertPaymentHistory;
