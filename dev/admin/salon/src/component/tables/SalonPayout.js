/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-unused-vars */

import { openDialog } from "../../redux/slice/dialogueSlice";
import { getPayout } from "../../redux/slice/payoutSlice";
import {  warning } from "../../util/Alert";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../extras/Title";
import Button from "../extras/Button";
import Table from "../extras/Table";
import Pagination from "../extras/Pagination";

import { getSalary, payment } from "../../redux/slice/salarySlice";
import BonusPenaltyDialog from "./BonusPenaltyDialog";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Analytics from "../extras/Analytics";

const SalonPayout = () => {
  const getCurrentMonthDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based

    const startOfMonth = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-01`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-${lastDay}`;

    return { startOfMonth, endOfMonth };
  };
  const { salary } = useSelector((state) => state.salary);
  const [data, setData] = useState([]);

  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { setting } = useSelector((state) => state.setting);
  const { startOfMonth, endOfMonth } = getCurrentMonthDates();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [type, setType] = useState("ALL");
  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(endOfMonth);
  const navigate = useNavigate();
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const [selectedDate, setSelectedDate] = useState(thisMonth);
  const dispatch = useDispatch();

  useEffect(() => {
    const formattedDate = moment(selectedDate, "YYYY-MM").format("YYYY-MM");
    const payload = {
      start: page,
      limit: rowsPerPage,
      startDate,
      endDate,
      type,
    };
    dispatch(getSalary(payload));
  }, [page, rowsPerPage, type, startDate, endDate]);

  useEffect(() => {
    setData(salary);
  }, [salary]);

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
            src={row?.salon?.mainImage}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            height={`100%`}
          />
        </div>
      ),
    },

    {
      Header: "Salon",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.salon?.name}
        </span>
      ),
    },
    {
      Header: "Total Bookings",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">
          {row?.bookingId?.length == 0 ? 0 : row?.bookingId?.length}
        </span>
      ),
    },
    {
      Header: `Total (Earnings) `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.salonEarning + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Salon Commission `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.salonCommission + " " + setting?.currencySymbol}</span>
      ),
    },

    {
      Header: "Note",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.note
            ? row?.note.length > 15 && row?.note?.slice(0, 15) + "..."
            : "-"}
        </span>
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
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.finalAmount + " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `CreatedAt`,
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt && moment(row.createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      Header: `Payment Date`,
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.paymentDate ? row.paymentDate : "Pending"}
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
            onClick={() => handleEarning(row)}
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
            className="py-1 "
            style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
            onClick={() => handleInfoSettlement(row)}
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

    {
      Header: "Pay",
      Cell: ({ row }) => (
        <span className="d-flex justify-content-center">
          {row?.statusOfTransaction === 0 ? (
            <button
              className="py-1 me-2"
              style={{backgroundColor: "#E0EEFF",borderRadius: "8px"}}
              onClick={() =>
                dispatch(openDialog({ type: "bonus", data: row?._id }))
              }
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5837 11.8939C18.952 11.8939 20.0614 10.7846 20.0614 9.41617C20.0614 8.04778 18.952 6.93848 17.5837 6.93848C16.2153 6.93848 15.106 8.04778 15.106 9.41617C15.106 10.7846 16.2153 11.8939 17.5837 11.8939Z"
                  fill="#1C69DB"
                />
                <path
                  d="M21.9843 3H13.1813C12.6468 3 12.1342 3.21232 11.7563 3.59025C11.3783 3.96819 11.166 4.48077 11.166 5.01525V13.8183C11.1661 14.3527 11.3785 14.8652 11.7564 15.2431C12.1343 15.621 12.6468 15.8334 13.1813 15.8335H21.9843C22.5188 15.8335 23.0314 15.6212 23.4093 15.2433C23.7872 14.8653 23.9995 14.3528 23.9995 13.8183V5.01525C23.9995 4.48077 23.7872 3.96819 23.4093 3.59025C23.0314 3.21232 22.5188 3 21.9843 3ZM17.583 13.7275C15.2057 13.7275 13.272 11.7934 13.272 9.41653C13.272 7.03967 15.2061 5.10554 17.583 5.10554C19.9599 5.10554 21.894 7.03967 21.894 9.41653C21.894 11.7934 19.9599 13.7275 17.583 13.7275Z"
                  fill="#1C69DB"
                />
                <path
                  d="M21.9848 17.208H13.1817C11.3122 17.208 9.7915 15.6873 9.7915 13.8178V5.01524C9.7915 4.81587 9.81213 4.62154 9.84559 4.43134H7.95683C7.95287 4.19114 7.85472 3.96211 7.68353 3.79357C7.51233 3.62504 7.28179 3.53048 7.04156 3.53027H5.66659C5.42562 3.53038 5.1944 3.62546 5.02306 3.79491C4.85173 3.96436 4.75409 4.19451 4.75132 4.43546C3.22693 4.48175 2 5.73298 2 7.26836V19.1953C2.00085 19.9475 2.30002 20.6686 2.83188 21.2005C3.36374 21.7323 4.08486 22.0315 4.83702 22.0323H20.3036C21.0558 22.0315 21.7769 21.7323 22.3088 21.2005C22.8406 20.6686 23.1398 19.9475 23.1406 19.1953V17.0004C22.7704 17.1366 22.3792 17.2072 21.9848 17.208ZM6.5837 8.57184C6.94836 8.57184 7.29809 8.7167 7.55595 8.97455C7.8138 9.23241 7.95867 9.58214 7.95867 9.94681C7.95867 10.3115 7.8138 10.6612 7.55595 10.9191C7.29809 11.1769 6.94836 11.3218 6.5837 11.3218C6.21903 11.3218 5.8693 11.1769 5.61144 10.9191C5.35359 10.6612 5.20872 10.3115 5.20872 9.94681C5.20872 9.58214 5.35359 9.23241 5.61144 8.97455C5.8693 8.7167 6.21903 8.57184 6.5837 8.57184ZM7.95867 19.1133H5.66705C5.42394 19.1133 5.19079 19.0167 5.01888 18.8448C4.84698 18.6729 4.7504 18.4397 4.7504 18.1966C4.7504 17.9535 4.84698 17.7204 5.01888 17.5485C5.19079 17.3766 5.42394 17.28 5.66705 17.28H7.95867C8.20178 17.28 8.43493 17.3766 8.60683 17.5485C8.77874 17.7204 8.87531 17.9535 8.87531 18.1966C8.87531 18.4397 8.77874 18.6729 8.60683 18.8448C8.43493 19.0167 8.20178 19.1133 7.95867 19.1133ZM7.95867 16.3633H5.66705C5.42394 16.3633 5.19079 16.2668 5.01888 16.0949C4.84698 15.923 4.7504 15.6898 4.7504 15.4467C4.7504 15.2036 4.84698 14.9704 5.01888 14.7985C5.19079 14.6266 5.42394 14.53 5.66705 14.53H7.95867C8.20178 14.53 8.43493 14.6266 8.60683 14.7985C8.77874 14.9704 8.87531 15.2036 8.87531 15.4467C8.87531 15.6898 8.77874 15.923 8.60683 16.0949C8.43493 16.2668 8.20178 16.3633 7.95867 16.3633Z"
                  fill="#1C69DB"
                />
              </svg>
            </button>
          ) : null}
          {row?.statusOfTransaction === 0 && (
            <button
              className="py-1"
              style={{ backgroundColor: "#D5F4EE", borderRadius: "8px" }}
              onClick={() => handlePayment(row)}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.8908 8H4.10924C3.81515 8.00032 3.5332 8.11729 3.32524 8.32524C3.11729 8.5332 3.00032 8.81515 3 9.10924V21.0024C3.00032 21.2964 3.11729 21.5784 3.32524 21.7864C3.5332 21.9943 3.81515 22.1113 4.10924 22.1116H25.8908C26.1848 22.1113 26.4668 21.9943 26.6748 21.7864C26.8827 21.5784 26.9997 21.2964 27 21.0024V9.10924C26.9997 8.81515 26.8827 8.5332 26.6748 8.32524C26.4668 8.11729 26.1848 8.00032 25.8908 8ZM25.3866 17.7755C25.3866 17.8557 25.3547 17.9326 25.2979 17.9894C25.2412 18.0461 25.1643 18.078 25.084 18.078C24.5226 18.0786 23.9843 18.3019 23.5873 18.6989C23.1903 19.0959 22.967 19.6342 22.9664 20.1956C22.9664 20.2759 22.9345 20.3528 22.8778 20.4095C22.821 20.4663 22.7441 20.4982 22.6639 20.4982H7.33613C7.2559 20.4982 7.17895 20.4663 7.12222 20.4095C7.06549 20.3528 7.03361 20.2759 7.03361 20.1956C7.03297 19.6342 6.80966 19.0959 6.41266 18.6989C6.01566 18.3019 5.4774 18.0786 4.91597 18.078C4.83573 18.078 4.75879 18.0461 4.70205 17.9894C4.64532 17.9326 4.61345 17.8557 4.61345 17.7755V12.3361C4.61345 12.2559 4.64532 12.179 4.70205 12.1222C4.75879 12.0655 4.83573 12.0336 4.91597 12.0336C5.4774 12.033 6.01566 11.8097 6.41266 11.4127C6.80966 11.0157 7.03297 10.4774 7.03361 9.91597C7.03361 9.83573 7.06549 9.75879 7.12222 9.70205C7.17895 9.64532 7.2559 9.61345 7.33613 9.61345H22.6639C22.7441 9.61345 22.821 9.64532 22.8778 9.70205C22.9345 9.75879 22.9664 9.83573 22.9664 9.91597C22.967 10.4774 23.1903 11.0157 23.5873 11.4127C23.9843 11.8097 24.5226 12.033 25.084 12.0336C25.1643 12.0336 25.2412 12.0655 25.2979 12.1222C25.3547 12.179 25.3866 12.2559 25.3866 12.3361V17.7755Z"
                  fill="#0A856F"
                />
                <path
                  d="M22.3775 10.2148H7.62214C7.55257 10.8283 7.27696 11.4 6.84035 11.8366C6.40375 12.2731 5.83198 12.5486 5.21851 12.6181V17.4862C5.83198 17.5557 6.40375 17.8312 6.84035 18.2677C7.27696 18.7043 7.55257 19.276 7.62214 19.8895H22.3771C22.4467 19.276 22.7223 18.7043 23.1589 18.2677C23.5955 17.8312 24.1672 17.5557 24.7807 17.4862V12.6181C24.1673 12.5485 23.5956 12.273 23.1591 11.8364C22.7226 11.3999 22.4471 10.8282 22.3775 10.2148ZM14.9996 18.5814C13.0534 18.5814 11.4702 16.9982 11.4702 15.052C11.4702 13.1057 13.0534 11.5225 14.9996 11.5225C16.9458 11.5225 18.529 13.1061 18.529 15.052C18.529 16.9978 16.9458 18.5814 14.9996 18.5814Z"
                  fill="#0A856F"
                />
                <path
                  d="M14.9998 17.9806C16.6149 17.9806 17.9242 16.6713 17.9242 15.0562C17.9242 13.4411 16.6149 12.1318 14.9998 12.1318C13.3847 12.1318 12.0754 13.4411 12.0754 15.0562C12.0754 16.6713 13.3847 17.9806 14.9998 17.9806Z"
                  fill="#0A856F"
                />
              </svg>
            </button>
          )}
          {row?.statusOfTransaction === 1 && (
            <button className="bg-success text-light p10-x p4-y fs-12 br-5">
              Paid
            </button>
          )}
        </span>
      ),
    },
  ];

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handlePayment = (row) => {


    const payload = {
      settlementId: row?._id,
    };
    dispatch(payment(payload));
  };

  const handleEarning = (row) => {
    navigate("/admin/salon/income", {
      state: {
        row,
      },
    });
  };

  const handleInfoSettlement = (row) => {
    navigate("/admin/salon/particularSettlement", {
      state: {
        row,
      },
    });
  };

  const types = [
    { name: "Pending", value: "0" },
    { name: "Paid", value: "1" },
  ];

  return (
    <div className="mainCategory">
      {dialogue && dialogueType === "bonus" && <BonusPenaltyDialog />}
      <Title name="Salon payment" />
      <div className="d-flex">
        <div className="m40-bottom inputData col-lg-3 col-md-4 me-3">
          <label>Select date</label>
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            allAllow={false}
          />
        </div>
        <div className="col-md-3 col-lg-2 ms-4">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="settlement">
              Settlement type
            </label>
            <select
              name="types"
              className="rounded-2  fw-bold"
              id="bookingType"
              style={{ marginTop: "11px" }}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
            >
              <option value="ALL" selected>
                ALL
              </option>
              {types?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>
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

export default SalonPayout;
