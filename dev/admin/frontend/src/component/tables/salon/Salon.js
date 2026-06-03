import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
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
  sendClaimInvitation,
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
    // Debug: Check if salons have isClaimed field
    if (salon && salon.length > 0) {
      console.log("=== SALON DATA DEBUG ===");
      console.log("Total salons:", salon.length);
      console.log("Salon data sample:", salon[0]);
      console.log("isClaimed values:", salon.map(s => ({ 
        name: s.name, 
        isClaimed: s.isClaimed,
        isClaimedType: typeof s.isClaimed,
        hasIsClaimed: 'isClaimed' in s
      })));
      const unclaimedCount = salon.filter(s => s.isClaimed !== true).length;
      console.log(`Unclaimed salons: ${unclaimedCount} out of ${salon.length}`);
      console.log("========================");
    }
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
      Header: col.no,
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: col.image,
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
      Header: col.name,
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
      Header: col.mobile,
      Cell: ({ row }) => <span>{row?.mobile ? row?.mobile : "-"}</span>,
    },
    {
      Header: col.platformFee,
      body: "platformFee",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.platformFee}</span>
      ),
    },
    {
      Header: col.country,
      Cell: ({ row }) => <span>{row?.addressDetails?.country}</span>,
    },
    {
      Header: col.active,
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
      Header: col.bestSeller,
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
      Header: col.claimStatus,
      Cell: ({ row }) => {
        // Use row directly like all other columns
        const isClaimed = row?.isClaimed === true;
        
        return (
          <span className={`badge ${isClaimed ? 'bg-success' : 'bg-warning'}`} style={{ padding: "6px 12px", fontSize: "12px" }}>
            {isClaimed ? 'Claimed' : 'Unclaimed'}
          </span>
        );
      },
    },

    {
      Header: col.schedule,
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
      Header: col.booking,
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
      Header: col.order,
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
      Header: col.info,
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
      Header: col.action,
      Cell: ({ row }) => {
        // Check if salon is unclaimed - use row directly like other columns
        const isClaimedValue = row?.isClaimed;
        const isUnclaimed = isClaimedValue !== true;
        
        return (
          <span className="d-flex justify-content-center align-items-center gap-2" style={{ flexWrap: "nowrap" }}>
            <button
              className="py-1 me-2"
              style={{ backgroundColor: "#CFF3FF", borderRadius: "8px", minWidth: "40px", height: "32px" }}
              onClick={() => {
                handleAddSalon(row);
              }}
            >
              <Edit />
            </button>
            {/* TEMPORARY: Always show button for testing - will fix condition after confirming it works */}
            <button
              className="py-1"
              style={{ backgroundColor: "#FFCDD2", borderRadius: "8px", minWidth: "40px", height: "32px" }}
              onClick={() => handleDelete(row?._id)}
              title="Delete salon"
            >
              <Delete />
            </button>
            <button
              className="py-1 px-2"
              style={{ 
                backgroundColor: "#FF6B00", 
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "90px",
                height: "32px",
                flexShrink: 0,
                marginLeft: "8px"
              }}
              onClick={() => handleSendInvitation(row)}
              title="Send Claim Invitation (Email & SMS)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "6px", flexShrink: 0 }}
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="#FFFFFF"
                />
              </svg>
              <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>Invite</span>
            </button>
          </span>
        );
      },
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

  const handleSendInvitation = async (row) => {
    try {
      const result = await dispatch(
        sendClaimInvitation({ salonId: row._id, method: "both" })
      ).unwrap();

      if (result?.status) {
        // Check which methods succeeded
        const results = result?.data?.results || {};
        let message = "Invitation sent successfully!";
        
        if (results.email?.success && results.sms?.success) {
          message = "Invitation sent via email and SMS!";
        } else if (results.email?.success) {
          message = "Invitation sent via email. SMS failed (no phone number or Twilio not configured).";
        } else if (results.sms?.success) {
          message = "Invitation sent via SMS. Email failed.";
        }
        
        toast.success(message);
        
        // Refresh salon list to update claim status
        const payload = {
          start: page,
          limit: rowsPerPage,
          search,
        };
        dispatch(getAllSalons(payload));
      } else {
        // Show detailed error message
        const results = result?.data?.results || {};
        let errorMsg = result?.message || "Failed to send invitation";
        
        if (results.email && !results.email.success) {
          errorMsg += ` Email: ${results.email.error || "Failed"}`;
        }
        if (results.sms && !results.sms.success) {
          errorMsg += ` SMS: ${results.sms.error || "Failed"}`;
        }
        
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send invitation"
      );
    }
  };

  const handleBulkSendInvitations = async () => {
    const unclaimedSalons = data.filter((salon) => !salon.isClaimed);
    
    if (unclaimedSalons.length === 0) {
      toast.info("No unclaimed salons to send invitations to.");
      return;
    }

    const confirmed = window.confirm(
      `Send claim invitations to ${unclaimedSalons.length} unclaimed salon(s)?`
    );

    if (!confirmed) return;

    try {
      toast.info(`Sending invitations to ${unclaimedSalons.length} salons...`);
      
      // Send invitations in batches to avoid overwhelming the server
      const batchSize = 10;
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < unclaimedSalons.length; i += batchSize) {
        const batch = unclaimedSalons.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (salon) => {
            try {
              const result = await dispatch(
                sendClaimInvitation({ salonId: salon._id, method: "both" })
              ).unwrap();
              
              if (result?.status) {
                sent++;
              } else {
                failed++;
              }
            } catch (error) {
              failed++;
            }
          })
        );

        // Small delay between batches
        if (i + batchSize < unclaimedSalons.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      toast.success(
        `Bulk send completed! Sent: ${sent}, Failed: ${failed}`
      );

      // Refresh salon list
      const payload = {
        start: page,
        limit: rowsPerPage,
        search,
      };
      dispatch(getAllSalons(payload));
    } catch (error) {
      console.error("Error in bulk send:", error);
      toast.error("Error sending bulk invitations");
    }
  };

  return (
    <div className="userTable">
      <Title name={ui.pages.salons} />

      <div className="betBox">
        <div className="d-flex gap-2">
          <Button
            className={`bg-button p-10 text-black m10-bottom`}
            text={`Add salon`}
            bIcon={`fa-solid fa-user-plus`}
            onClick={() => handleAddSalon()}
          />
          <Button
            className={`bg-warning p-10 text-white m10-bottom`}
            text={`Send Invitations (Bulk)`}
            bIcon={`fa-solid fa-envelope`}
            onClick={handleBulkSendInvitations}
          />
        </div>

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
