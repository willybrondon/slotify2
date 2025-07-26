import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import {  warning } from "../../../util/Alert";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import Searching from "../../extras/Searching";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import AddSalon from "./AddSalon";
import {
  activesalon,
  getAllSalons,
  handleBestSeller,
  salonDelete,
} from "../../../redux/slice/salonSlice";
import { ReactComponent as Delete } from "../../../assets/icon/delete.svg";
import { ReactComponent as Booking } from "../../../assets/icon/booking.svg";
import { ReactComponent as Info } from "../../../assets/icon/info.svg";
import { ReactComponent as Earning } from "../../../assets/icon/earning.svg";
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";
import { toast } from "react-toastify";
import { ReactComponent as Delievered } from "../../../assets/icon/deliever.svg"

export const Salon = () => {
  // const dummysalons = Dummy(10000);
  const [data, setData] = useState([]);

  const { salon } = useSelector((state) => state.salon);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      search,
    };
    dispatch(getAllSalons(payload));
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    setData(salon);
  }, [salon]);

  function openImage(imageUrl) {
    // Open the image in a new tab or window
    window.open(imageUrl, "_blank");
  }

  const handleInfo = (id) => {
    navigate("/admin/salon/salonProfile", {
      state: {
        id,
      },
    });
  };

  const salonTable = [
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
            src={row && row.mainImage}
            alt="images"
            className="cursor-pointer"
            onClick={() => openImage(row && row.image)}
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
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
          onClick={() => handleInfo(row._id)}
        >
          {row?.name}
        </span>
      ),
    },
    {
      Header: "Mobile No",
      Cell: ({ row }) => <span>{row?.mobile ? row?.mobile : "-"}</span>,
    },
    {
      Header: "Platform Fee (%)",
      body: "platformFee",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.platformFee}</span>
      ),
    },
    {
      Header: "Country",
      Cell: ({ row }) => <span>{row?.addressDetails?.country}</span>,
    },
    {
      Header: "Active",
      body: "isActive",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => {
            dispatch(activesalon(row?._id));
          }}
        />
      ),
    },
    {
      Header: "Best Seller",
      body: "isBestSeller",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isBestSeller}
          onClick={() => {
        
            dispatch(handleBestSeller(row?._id))
              .then((res) => {
                if (res?.payload?.status) {
                  toast.success(res?.payload?.message);
                  const payload = {
                    start: page,
                    limit: rowsPerPage,
                    search,
                  };
                  dispatch(getAllSalons(payload));
                } else {
                  toast.error(res?.payload?.message);
                }
              })
          }}
        />
      ),
    },

    {
      Header: "Schedule",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ borderRadius: "8px", backgroundColor: "#E0F0FF" }}
            onClick={() => handleScheduleInfo(row)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.74984 4.75C9.74984 4.33579 9.41405 4 8.99984 4C8.58563 4 8.24984 4.33579 8.24984 4.75V6.32926C6.81051 6.44451 5.86561 6.72737 5.17141 7.42157C4.47721 8.11577 4.19435 9.06067 4.0791 10.5H23.9205C23.8053 9.06067 23.5224 8.11577 22.8282 7.42157C22.134 6.72737 21.1891 6.44451 19.7498 6.32926V4.75C19.7498 4.33579 19.414 4 18.9998 4C18.5856 4 18.2498 4.33579 18.2498 4.75V6.2629C17.5845 6.25 16.8388 6.25 15.9998 6.25H11.9998C11.1608 6.25 10.4151 6.25 9.74984 6.2629V4.75Z"
                fill="#0B6EC8"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 14.4641C4 13.6251 4 12.8794 4.0129 12.2141H23.9871C24 12.8794 24 13.6251 24 14.4641V16.4641C24 20.2353 24 22.121 22.8284 23.2925C21.6569 24.4641 19.7712 24.4641 16 24.4641H12C8.22876 24.4641 6.34315 24.4641 5.17157 23.2925C4 22.121 4 20.2353 4 16.4641V14.4641ZM19 16.4641C19.5523 16.4641 20 16.0164 20 15.4641C20 14.9118 19.5523 14.4641 19 14.4641C18.4477 14.4641 18 14.9118 18 15.4641C18 16.0164 18.4477 16.4641 19 16.4641ZM19 20.4641C19.5523 20.4641 20 20.0164 20 19.4641C20 18.9118 19.5523 18.4641 19 18.4641C18.4477 18.4641 18 18.9118 18 19.4641C18 20.0164 18.4477 20.4641 19 20.4641ZM15 15.4641C15 16.0164 14.5523 16.4641 14 16.4641C13.4477 16.4641 13 16.0164 13 15.4641C13 14.9118 13.4477 14.4641 14 14.4641C14.5523 14.4641 15 14.9118 15 15.4641ZM15 19.4641C15 20.0164 14.5523 20.4641 14 20.4641C13.4477 20.4641 13 20.0164 13 19.4641C13 18.9118 13.4477 18.4641 14 18.4641C14.5523 18.4641 15 18.9118 15 19.4641ZM9 16.4641C9.55228 16.4641 10 16.0164 10 15.4641C10 14.9118 9.55228 14.4641 9 14.4641C8.44772 14.4641 8 14.9118 8 15.4641C8 16.0164 8.44772 16.4641 9 16.4641ZM9 20.4641C9.55228 20.4641 10 20.0164 10 19.4641C10 18.9118 9.55228 18.4641 9 18.4641C8.44772 18.4641 8 18.9118 8 19.4641C8 20.0164 8.44772 20.4641 9 20.4641Z"
                fill="#0B6EC8"
              />
            </svg>
          </button>
        </span>
      ),
    },
    {
      Header: "Booking",
      body: "booking",
      Cell: ({ row }) => (
        <button
          className="py-1"
          style={{ backgroundColor: "#FFE7CF", borderRadius: "8px" }}
          onClick={() => handleOpenBookings(row)}
        >
          <Booking />
        </button>
      ),
    },
    {
      Header: "Order",
      body: "order",
      Cell: ({ row }) => (
        <button
          className="py-1"
          style={{ backgroundColor: "#C0E9C0", borderRadius: "8px" }}
          onClick={() => handleOpenOrders(row)}
        >
          <Delievered />
        </button>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }) => (
        <span className="d-flex justify-content-center">
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
            onClick={() => handleInfo(row?._id)}
          >
            <Info />
          </button>
          <button
            className="py-1"
            style={{ backgroundColor: "#DEFFDF", borderRadius: "8px" }}
            onClick={() => handleEarning(row)}
          >
            <Earning />
          </button>
        </span>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <span className="d-flex justify-content-center">
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => {
              handleAddSalon(row);
            }}
          >
            <Edit />
          </button>
        </span>
      ),
    },
  ];

  const handleAddSalon = (row) => {
    navigate("/admin/salon/addSalon", {
      state: {
        row,
      },
    });
  };

  const handleEarning = (row) => {
    navigate("/admin/salon/income", {
      state: {
        row,
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      const data = await warning("Delete");
      const yes = data?.isConfirmed;
      if (yes) {
        dispatch(salonDelete(id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleScheduleInfo = (id) => {
    navigate("/admin/allSalon/schedule", { state: id });
  };
  const handleOpenBookings = (row) => {
    navigate("/admin/salon/bookings", { state: { data: row } });
  };
  const handleOpenOrders = (row) => {
    navigate("/admin/salon/orders", { state: { data: row } });
  };

  return (
    <div className="userTable">
      <Title name="Salons" />

      <div className="betBox">
        <Button
          className={`bg-button p-10 text-white m10-bottom`}
          text={`Add salon`}
          bIcon={`fa-solid fa-user-plus`}
          onClick={() => handleAddSalon()}
        />

        <div className="col-md-8 col-lg-5  ms-auto">
          <Searching
            type={`server`}
            data={data}
            setData={setData}
            column={salonTable}
            serverSearching={handleFilterData}
          />
        </div>
      </div>
      <div>
        <Table
          data={data}
          mapData={salonTable}
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
