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

const StaffEarning = () => {
  const { payout, total } = useSelector((state) => state.payout);
  const { setting } = useSelector((state) => state.setting);

  const [data, setData] = useState([]);
  const [type, setType] = useState("ALL");
  const startOfMonth = moment().startOf("month").toDate();
  const endOfMonth = moment().endOf("month").toDate();
  const dDate = moment(startOfMonth).format("YYYY-MM-DD");
  const d2Date = moment(endOfMonth).format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(dDate);
  const [endDate, setEndDate] = useState(d2Date);
  const navigate = useNavigate();
  useEffect(() => {
    const payload = {
      startDate,
      endDate,
      type,
    };
    dispatch(getPayout(payload));
  }, [startDate, type, endDate]);

  useEffect(() => {
    setData(payout);
  }, [payout]);

  const dispatch = useDispatch();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

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
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.expert?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            onClick={() => handleInfo(row?.expert?._id)}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.expert?._id)}
        >
          {row?.expert?.fname + " " + row?.expert?.lname}
        </span>
      ),
    },
    {
      Header: "Total Bookings",
      sorting: { type: "client" },
      body: "totalBookings",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId?.length == 0 ? 0 : row?.bookingId?.length}
        </span>
      ),
    },

    {
      Header: `Staff Earning `,
      sorting: { type: "client" },
      body: "expertEarning",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.expertEarning?.toFixed(2) + " " + setting?.currencySymbol}</span>
      ),
    },

    {
      Header: `Bonus/Penalty `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.bonus + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Final Amount `,
      sorting: { type: "client" },
      body: "finalAmount",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.finalAmount.toFixed(2) + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `CreatedAt`,
      sorting: { type: "client" },
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt && moment(row.createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },

    {
      Header: "Earnings",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ backgroundColor: "#DEFFDF", borderRadius: "8px" }}
            onClick={() => handleInfo(row)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5421 5.96034C14.0507 3.45314 18.1527 3.45314 20.6599 5.96034C22.3088 7.60919 22.8739 9.94985 22.3534 12.0708C22.3116 12.0912 22.2698 12.1112 22.2295 12.1339L20.3828 13.1384C20.871 12.338 21.1145 11.4288 21.1145 10.5183C21.1145 9.23242 20.6262 7.94656 19.6511 6.97006H19.6497C18.6746 5.99356 17.3888 5.50673 16.1015 5.50673V5.50531C14.8142 5.50531 13.5283 5.99356 12.5518 6.97006C11.5753 7.94656 11.0871 9.23242 11.0871 10.5183C11.0871 10.8063 11.1113 11.0938 11.1597 11.3776C10.6766 11.3225 10.1965 11.332 9.72196 11.4032C9.45862 9.47109 10.065 7.43885 11.5421 5.96034ZM17.4642 12.5349C17.3917 12.6092 17.3113 12.6756 17.2246 12.7327C17.1383 12.789 17.047 12.8372 16.9518 12.8765C16.8255 12.9292 16.6908 12.9681 16.5494 12.9923L17.4006 13.2651C17.8419 13.4075 18.2172 13.6793 18.4886 14.0333C18.7064 13.8853 18.9124 13.7159 19.1045 13.5237C19.9301 12.6981 20.3434 11.6082 20.3434 10.5188C20.3434 9.43076 19.9306 8.34133 19.1045 7.51524C18.2775 6.68821 17.189 6.27493 16.101 6.27493V6.27635C15.0116 6.27635 13.9221 6.68916 13.0961 7.51524C12.2704 8.34086 11.8572 9.43076 11.8572 10.5188C11.8572 10.859 11.8975 11.1992 11.9782 11.5313C12.0963 11.5607 12.2149 11.5959 12.3331 11.6333L14.8417 12.4419C14.7446 12.3433 14.6576 12.2352 14.5822 12.1192C14.5053 12.0034 14.4384 11.8744 14.3777 11.732C14.297 11.5356 14.39 11.3112 14.586 11.2291C14.7824 11.147 15.0068 11.2414 15.0889 11.4364C15.1278 11.5318 15.1748 11.6191 15.226 11.6974C15.4092 11.9773 15.6564 12.1401 15.9136 12.2084C16.1717 12.2782 16.4369 12.2568 16.6547 12.1652C16.706 12.1439 16.7558 12.1183 16.8013 12.0874C16.8431 12.0604 16.8806 12.031 16.9114 11.9987C17.003 11.9047 17.0609 11.789 17.077 11.668C17.0932 11.5536 17.0704 11.4341 16.9992 11.3249C16.9736 11.2874 16.9456 11.2523 16.9119 11.2201C16.7857 11.0962 16.5043 11.0303 16.2082 10.9605C15.7508 10.8514 15.264 10.737 14.8915 10.3551C14.7572 10.2165 14.659 10.0509 14.5997 9.87346C14.5191 9.63811 14.5043 9.38141 14.558 9.13515C14.613 8.88652 14.7383 8.64833 14.9361 8.45473C15.0785 8.31618 15.2588 8.20183 15.477 8.12781C15.5283 8.11025 15.5819 8.09555 15.6384 8.08084C15.664 8.07562 15.6896 8.06897 15.7152 8.06328V7.48772C15.7152 7.27515 15.8875 7.10149 16.1015 7.10149C16.314 7.10149 16.4863 7.27515 16.4863 7.48772V8.04715C16.6059 8.06755 16.7231 8.09697 16.836 8.13872C17.2436 8.28914 17.5866 8.58237 17.7427 9.0412C17.7551 9.07869 17.7669 9.12044 17.7779 9.16362C17.8291 9.36955 17.7024 9.57785 17.497 9.6291C17.2896 9.68034 17.0813 9.55365 17.0315 9.3482C17.0263 9.32827 17.0206 9.30929 17.0125 9.28746C16.9413 9.07489 16.7729 8.93634 16.5712 8.86232C16.3373 8.77644 16.064 8.76837 15.822 8.82863C15.7897 8.8367 15.7575 8.84619 15.7238 8.8571C15.6203 8.89364 15.5368 8.94441 15.4723 9.00657C15.3888 9.08865 15.3366 9.19067 15.3124 9.29838C15.2882 9.40988 15.2948 9.52423 15.33 9.62672C15.3542 9.69932 15.3931 9.7667 15.4443 9.81889C15.6583 10.0395 16.0336 10.1268 16.3843 10.2103C16.7876 10.3057 17.1686 10.3944 17.4495 10.6692C17.5264 10.7446 17.5919 10.8239 17.6445 10.9031C17.822 11.1759 17.8799 11.4801 17.841 11.7705C17.8016 12.0533 17.6687 12.3237 17.4642 12.5349ZM22.5982 12.8105L18.882 14.8333C18.9883 15.2342 18.984 15.667 18.8483 16.0897C18.4701 17.2651 17.2009 17.9161 16.0251 17.5369C14.6989 17.1104 13.3727 16.6829 12.0465 16.2563C11.8705 16.1984 11.7722 16.0077 11.8287 15.8312L11.8581 15.7396C11.9146 15.5621 12.1058 15.4653 12.2833 15.5218C13.6095 15.9493 14.9357 16.3759 16.2619 16.8034C17.0324 17.0511 17.8666 16.6231 18.1138 15.8525C18.1826 15.6414 18.1997 15.4259 18.1731 15.2191C18.1033 14.6691 17.7238 14.1795 17.1643 13.9991C15.4752 13.4559 13.7869 12.9111 12.0977 12.3679C10.7459 11.9323 9.42114 12.0556 8.17418 12.7351L4.90162 14.5159L8.02234 19.935C8.89113 19.498 9.80832 19.4292 10.7445 19.7305L12.5964 20.3265C13.5758 20.6425 14.5347 20.5523 15.4386 20.0617L24.0051 15.3984C24.7168 15.0112 24.983 14.1125 24.5953 13.4013C24.2081 12.6896 23.3095 12.4248 22.5982 12.8105ZM3.62951 13.8544C3.52465 13.6703 3.28788 13.6067 3.10473 13.713L1.19206 14.8148C1.00891 14.9197 0.945801 15.1564 1.05066 15.3396L5.35191 22.8071C5.4582 22.9912 5.69355 23.0548 5.8767 22.9485L7.78937 21.8467C7.97252 21.7419 8.03705 21.5051 7.93076 21.3219L3.62951 13.8544ZM9.28354 6.74325C9.49611 6.74325 9.66835 6.56959 9.66835 6.35701V3.38481C9.66835 3.17224 9.49611 3 9.28354 3C9.06954 3 8.8973 3.17224 8.8973 3.38481V6.35749C8.89777 6.56959 9.07001 6.74325 9.28354 6.74325ZM7.29447 9.23574C7.50705 9.23574 7.67929 9.06208 7.67929 8.84951V5.87683C7.67929 5.66426 7.50705 5.49202 7.29447 5.49202C7.08048 5.49202 6.90824 5.66426 6.90824 5.87683V8.84951C6.90824 9.06208 7.08048 9.23574 7.29447 9.23574ZM22.9194 6.74325C23.132 6.74325 23.3042 6.56959 23.3042 6.35701V3.38481C23.3042 3.17224 23.132 3 22.9194 3C22.7054 3 22.5332 3.17224 22.5332 3.38481V6.35749C22.5337 6.56959 22.7054 6.74325 22.9194 6.74325ZM24.909 5.49249C24.695 5.49249 24.5227 5.66473 24.5227 5.87731V8.84998C24.5227 9.06256 24.695 9.23622 24.909 9.23622C25.1215 9.23622 25.2938 9.06256 25.2938 8.84998V5.87731C25.2933 5.66473 25.1211 5.49249 24.909 5.49249Z"
                fill="#11C00D"
              />
            </svg>
          </button>
        </span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
            onClick={() => handleEarning(row?._id)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9996 3C7.47746 3 3 7.47746 3 12.9996C3 18.5217 7.47746 23 12.9996 23C18.5217 23 23 18.5217 23 12.9996C23 7.47746 18.5217 3 12.9996 3ZM15.0813 18.498C14.5666 18.7012 14.1568 18.8552 13.8495 18.9619C13.5048 19.0745 13.1437 19.1286 12.7812 19.1219C12.1581 19.1219 11.673 18.9695 11.3276 18.6656C10.9822 18.3617 10.8104 17.9765 10.8104 17.5084C10.8104 17.3263 10.8231 17.1401 10.8485 16.9505C10.8799 16.7345 10.9214 16.52 10.9729 16.3079L11.6171 14.0324C11.6739 13.814 11.723 13.6066 11.7619 13.4135C11.8008 13.2188 11.8195 13.0402 11.8195 12.8777C11.8195 12.5881 11.7594 12.385 11.64 12.2707C11.5189 12.1564 11.2912 12.1005 10.9517 12.1005C10.7858 12.1005 10.6148 12.1251 10.4396 12.1767C10.266 12.2301 10.1153 12.2783 9.99175 12.3257L10.1619 11.6248C10.5835 11.4529 10.9873 11.3056 11.3725 11.1837C11.7247 11.0659 12.0932 11.0036 12.4646 10.9992C13.0834 10.9992 13.5608 11.1498 13.8969 11.4478C14.2313 11.7467 14.3998 12.1352 14.3998 12.6127C14.3998 12.7117 14.3879 12.8861 14.3651 13.135C14.3452 13.3676 14.3021 13.5976 14.2364 13.8216L13.5956 16.0904C13.5381 16.2956 13.4909 16.5035 13.4542 16.7134C13.4193 16.8881 13.3986 17.0654 13.3924 17.2434C13.3924 17.5448 13.4593 17.7505 13.5947 17.8597C13.7285 17.9689 13.963 18.0239 14.2948 18.0239C14.4514 18.0239 14.6267 17.996 14.8248 17.9418C15.0212 17.8876 15.1634 17.8394 15.2531 17.7979L15.0813 18.498ZM14.9678 9.2891C14.6764 9.56388 14.2889 9.71343 13.8885 9.70561C13.4686 9.70561 13.1062 9.56677 12.8049 9.2891C12.6615 9.16303 12.5471 9.00757 12.4692 8.8333C12.3913 8.65902 12.3519 8.47002 12.3537 8.27915C12.3537 7.8855 12.506 7.54688 12.8049 7.26667C13.0969 6.9897 13.4861 6.83859 13.8885 6.84593C14.3092 6.84593 14.6698 6.98561 14.9678 7.26667C15.2667 7.54688 15.4165 7.8855 15.4165 8.27915C15.4165 8.6745 15.2667 9.01143 14.9678 9.2891Z"
                fill="#0C7FE9"
              />
            </svg>
          </button>
        </span>
      ),
    },
  ];
  const handleEarning = (id) => {
    navigate("/admin/expert/income", {
      state: {
        id,
      },
    });
  };

  const handleInfo = (row) => {
    navigate("/admin/particularExpert/income", {
      state: {
        row,
      },
    });
  };

  function openImage(imageUrl) {
    // Open the image in a new tab or window
    window.open(imageUrl, "_blank");
  }
  const paymentType = [
    { name: "Pending", value: "0" },
    { name: "Paid", value: "1" },
  ];

  return (
    <div className="mainCategory">
      <Title name="Expert earnings" />
      <div className="row ">
        <div className="mt-2 col-2">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="paymentType">
              Payment type
            </label>
            <select
              name="paymentType"
              className="rounded-2 fw-bold"
              id="paymentType"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <option value="ALL" selected>
                ALL
              </option>
              {paymentType?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>
        </div>
        <div className="mt-2 col-md-9">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="date">
              Select date
            </label>
          </div>
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            allAllow={false}
          />
        </div>
      </div>

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

export default StaffEarning;
