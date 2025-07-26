/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import Title from "../../extras/Title";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { blockUser, getFetchWalletData, getUser } from "../../../redux/slice/userSlice";
import { useState } from "react";
import Female from "../../../assets/images/lum3n-ck3HFWw2OiM-unsplash.jpg";
import { ExInput } from "../../extras/Input";
import ToggleSwitch from "../../extras/ToggleSwitch";
import Button from "../../extras/Button";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Male from "../../../assets/images/male.png";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isLoading } from "../../../util/allSelector";
import Pagination from "../../extras/Pagination";
import Table from "../../extras/Table";
import { getAllExpert } from "../../../redux/slice/expertSlice";
import Analytics from "../../extras/Analytics";
import Sign from "../../../assets/images/sign.png"
import { ReactComponent as Delievered } from "../../../assets/icon/deliever.svg"
import { ReactComponent as Cancel } from "../../../assets/icon/cancel.svg"
import { ReactComponent as Refund } from "../../../assets/icon/refund.svg"
import { ReactComponent as WithDraw } from "../../../assets/icon/wit.svg"

const UserProfile = () => {
  const { userProfile, fetchWalletData, totalWalletData } = useSelector((state) => state.user);
  const { state } = useLocation();
  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();
  const loader = useSelector(isLoading);
  const [transactionType, setTransactionType] = useState("All");
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  useEffect(() => {
    dispatch(getUser(state?.id));
  }, [state]);

  useEffect(() => {
    // if (walletDetails) {
    //   const payload = {
    //     startDate: startDate,
    //     endDate: endDate,
    //     start: page,
    //     limit: rowsPerPage,
    //     type: transactionType
    //   }
    //   dispatch(getWalletData(payload))
    // } else {
    const payload = {
      startDate: startDate === "ALL" ? "All" : startDate,
      userId: state?.id,
      endDate: endDate === "ALL" ? "All" : endDate,
      start: page,
      limit: rowsPerPage,
      type: transactionType
    }
    dispatch(getFetchWalletData(payload))
    // }
  }, [startDate, page, rowsPerPage, transactionType])




  useEffect(() => {
    setUserData(userProfile);
  }, [userProfile]);
  // useEffect(() => {
  //   setData(walletData)
  // }, [walletData])
  useEffect(() => {
    setData(fetchWalletData)
  }, [fetchWalletData])

  const transactionTypeData = [
    { value: "1", label: "Credit" },
    { value: "2", label: "Debit" }
  ]


  const handelPreviousPage = () => {
    if (state) {
      navigate(-1);
    } else {
      localStorage.removeItem("dialogueData");
      dispatch({ type: closeDialog });
    }
  };
  const walletTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "UniqueId",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
        >
          {row?.uniqueId}
        </span>
      ),
    },
    {
      Header: `Amount (${setting?.currencySymbol})`,
      Cell: ({ row }) => <span className="text-capitalize">{row?.amount || "-"}</span>,
    },
    {
      Header: "Date",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
        >
          {row?.date
            ? row?.date
            : "-"}
        </span>
      ),
    },

    {
      Header: "Time",
      Cell: ({ row }) => (
        <div>
          {row?.time ? row?.time : "-"}
        </div>
      ),
    },
    {
      Header: "Transaction Type",
      Cell: ({ row }) =>
        row?.type === 1 ? (
          <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#1ebc1e" }}>
            Credit
          </button>
        ) : row?.type === 2 || row?.type === 3 ? (
          <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#F23434" }}>
            Debit
          </button>
        ) : row?.type === 4 ? (
          <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#F23434" }}>
            Debit
          </button>
        ) : row?.type === 5 ? (
          <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#1ebc1e" }}>
            Credit
          </button>
        ) : row?.type === "All" ? (
          <button
            className="bg-primary text-white m5-right p12-x p4-y fs-12 br-5 "
            style={{ cursor: "pointer" }}
          >
            All
          </button>
        ) : (
          ""
        ),
    },
    {
      Header: "Transaction Completed",
      Cell: ({ row }) =>
        row?.type === 1 ? (
          <button className="d-flex align-items-center justify-content-center"
            style={{ background: "#C0E9C0", color: "#14AF14", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
            <img src={Sign} height={28} width={25} alt="Icon" style={{ objectFit: "contain", marginRight: "8px" }} />
            <span style={{ whiteSpace: "nowrap" }}>Wallet Deposit</span>
          </button>
        ) : row?.type === 2 ? (

            <button
              className="d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "#FFE7CF", borderRadius: "8px", color: "#EB8213", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}
            >
              <WithDraw />
              <span style={{ whiteSpace: "nowrap" }} className="ms-2">Booking Fee Deduction</span>
            </button>
        ) : row?.type === 3 ? (

          <button className="d-flex align-items-center justify-content-center"
            style={{ background: "#D9F2D9", color: "#14AF14", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
            <Delievered />
            {/* <img src={Delieverd} height={28} width={25} alt="Icon" style={{ objectFit: "contain", marginRight: "8px" }} /> */}
            <span style={{ whiteSpace: "nowrap" }} className="ms-2">Product Purchase Deduction</span>
          </button>
        ) : row?.type === 4 ? (
          <button className="d-flex align-items-center justify-content-center"
            style={{ background: "#FFC7C6", color: "#FF1B1B", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
            <Cancel />
            <span style={{ whiteSpace: "nowrap" }} className="ms-2">Order Cancellation Fee</span>
          </button>
        ) : row?.type === 5 ? (
          <button className="d-flex align-items-center justify-content-center"
            style={{ background: "#D8F0F9", color: "#17A7DB", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
            <Refund />
            <span style={{ whiteSpace: "nowrap" }} className="ms-2">Order Refund</span>
          </button>
        ) : (
          ""
        ),
    },
  ];
  return (
    <div className="userProfile focusNone">
      {loader === true ? (
        <>
          <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
            <div className="col-xl-2 col-md-3 col-sm-4">
              <Skeleton height={30} />
            </div>
          </SkeletonTheme>
        </>
      ) : (
        <Title
          name={`${data?.fname ? data?.fname + ` ` + data?.lname : "User"
            }'s   Profile`}
        />
      )}
      <div className="col-7 my-auto ms-auto justify-content-end d-flex pe-3">
        <Button
          className={`bg-danger  text-center text-white mt-3`}
          onClick={handelPreviousPage}
          style={{
            borderRadius: "5px",
          }}
          bIcon={`fa-solid fa-angles-left text-white fs-20 m-auto`}
          text="Back"
        />
      </div>
      <div className="boxShadow p-4">
        <div
          className="position-relative  rounded-4 px-4 w-100"
          style={{ height: "180px", backgroundColor: "#1C2B20" }}
        >
          <div className="bg-theme w-100">
            {loader === true ? (
              <>
                <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                  <p className="d-flex justify-content-center ">
                    <Skeleton
                      className="mx-auto  position-absolute"
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: "50%",
                        top: "88px",
                        left: "50px",
                        backgroundColor: "#FFFFFF",
                        padding: "5px",
                      }}
                    />
                  </p>
                </SkeletonTheme>
              </>
            ) : (
              <img
                src={data?.image ? data.image : Male}
                onError={(e) => {
                  e.target.src = Male;
                }}
                alt="User"
                className="mx-auto  position-absolute"
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: "50%",
                  top: "88px",
                  left: "50px",
                  backgroundColor: "#FFFFFF",
                  padding: "5px",
                }}
              />
            )}
          </div>
        </div>
        <div className="row" style={{ marginTop: "100px" }}>
          {loader === true ? (
            <>
              <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <div key={index} className="col-xl-4 col-md-6 col-sm-12">
                    <Skeleton height={40} className="mt-3" />
                  </div>
                ))}
              </SkeletonTheme>
            </>
          ) : (
            <>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.fname}
                  label={`First name`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.lname ? userData?.lname : "-"}
                  label={`Last name`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.uniqueId}
                  label={`Unique id`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.mobile ? userData?.mobile : "-"}
                  label={`Mobile number`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.gender}
                  label={`Gender`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.age ? userData?.age : "-"}
                  label={`Age`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={userData?.email ? userData?.email : "-"}
                  label={`Email id`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={
                    userData?.loginType == 1
                      ? "Email Login"
                      : userData?.loginType == 2
                        ? "Google Login"
                        : "Mobile Login"
                  }
                  label={`Login type`}
                  readOnly={true}
                  placeholder={`Login Type`}
                />
              </div>
            </>
          )}
        </div>
        <div className="row">
          <div className="col-12 inputData">
            {loader === true ? (
              <>
                <SkeletonTheme
                  baseColor="#e2e5e7"
                  highlightColor="#fff"
                  className="mb-5 mt-3"
                >
                  <Skeleton className="mt-5" height={142} />
                </SkeletonTheme>
              </>
            ) : (
              <>
                <label>Bio</label>
                <textarea
                  value={data?.bio ? data?.bio : "-"}
                  readOnly
                  style={{ width: "100%", resize: "none" }}
                  cols="30"
                  rows={2}
                />
              </>
            )}
          </div>
        </div>


        <div className="orderDetails mt-2">
          <div className="row">
            <Title name="Wallet History" className="mt-4" onClick={(e) => {
              // setOrderDetails(false);
              // setWalletDetails(true);
              setTransactionType("All");
              setStartDate("All");
              setEndDate("All");
            }} />
          </div>
          <div className="betBox">
            <div className="inputData pb-2 pt-2">
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
                    startDate: startDate,
                    endDate: endDate,
                    start: page,
                    limit: rowsPerPage,
                    type: selectedSalonId
                  }
                  setTransactionType(selectedSalonId);
                  // dispatch(getWalletData(payload))
                }}
              >
                <option key="All" value="All">
                  ALL
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

          <Table
            data={data}
            rowsPerPage={rowsPerPage}
            page={page}
            mapData={walletTable}
          />
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalWalletData}
          />
        </div>

      </div>

    </div>
  );
};

export default UserProfile;
