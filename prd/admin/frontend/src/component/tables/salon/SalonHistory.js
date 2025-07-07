import { useEffect, useState } from "react";
import Analytics from "../../extras/Analytics";
import Pagination from "../../extras/Pagination";
import Table from "../../extras/Table";
import Title from "../../extras/Title";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getSalonHistory } from "../../../redux/slice/salonSlice";

const SalonHistory = () => {
  const { salary, total } = useSelector((state) => state.salon);
  const [data, setData] = useState([]);

  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  const { setting } = useSelector((state) => state.setting);

  const startOfMonth = moment().startOf("month").toDate();
  const endOfMonth = moment().endOf("month").toDate();
  const dDate = moment(startOfMonth).format("YYYY-MM-DD");
  const d2Date = moment(endOfMonth).format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(dDate);
  const [endDate, setEndDate] = useState(d2Date);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [type, setType] = useState("ALL");
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const [selectedDate, setSelectedDate] = useState(thisMonth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const salonId = state?.row?.salon ? state?.row?.salon?._id : state?.row?._id;

  useEffect(() => {
    const formattedDate = moment(selectedDate, "YYYY-MM").format("YYYY-MM");
    const payload = {
      start: page,
      limit: rowsPerPage,
      startDate: startDate,
      endDate: endDate,
      salonId: salonId,
    };
    dispatch(getSalonHistory(payload));
  }, [page, rowsPerPage, startDate, endDate, salonId]);

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

  function openHistory(id) {
    navigate("/admin/expert/income", {
      state: {
        id,
      },
    });
  }

  const mapData = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Total Bookings",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.bookingId?.length == 0 ? 0 : row?.bookingId?.length}
        </span>
      ),
    },
    {
      Header: `Salon Earnings `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.salonEarning+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Admin Earnings`,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.salonCommission.toFixed(2)+ " " + setting?.currencySymbol}</span>
      ),
    },

    {
      Header: "Note",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.note
            ? row?.note?.length > 25 && row?.note?.slice(0.25) + "..."
            : "-"}
        </span>
      ),
    },
    {
      Header: `Bonus/Penalty `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.bonus+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: `Final Amount `,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.finalAmount+ " " + setting?.currencySymbol}</span>
      ),
    },
    {
      Header: "CreatedAt",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt && moment(row.createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.statusOfTransaction === 0 ? "Pending" : "Paid"}
        </span>
      ),
    },
  ];





  const types = [
    { name: "Pending", value: "unpaid" },
    { name: "Paid", value: "paid" },
  ];

  return (
    <div className="mainCategory">
      <Title
        name={`${
          state?.row?.salon ? state?.row?.salon?.name : state?.row?.name
        }'s Earnings`}
      />
      <div className="d-flex justify-between">
        <div className="m40-bottom inputData col-lg-2 col-md-4 me-3">
          <label>Select date</label>
        
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            allAllow={false}
          />
        </div>
        <div className="col-md-3 col-lg-2 ms-4 mt-2">
          <div className="inputData">
            <label className="styleForTitle" htmlFor="settlement">
              Settlement type
            </label>
            <select
              name="types"
              className="rounded-2 fw-bold"
              id="bookingType"
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
          serverPerPage={rowsPerPage}
          Page={page}
        />
        <Pagination
          type={"server"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={total}
        />
      </div>
    </div>
  );
};

export default SalonHistory;
