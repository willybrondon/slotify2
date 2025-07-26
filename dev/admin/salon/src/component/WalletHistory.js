import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Pagination from "./extras/Pagination";
import Table from "./extras/Table";
import Title from "./extras/Title";
import Analytics from "./extras/Analytics";
import { getWalletHistory } from "../redux/slice/withDrawSlice";
import Sign from "../assets/images/sign.png"
import With from "../assets/images/with.png";
import { ReactComponent as Complete } from "../assets/images/complete.svg"
import { ReactComponent as Order } from "../assets/images/order.svg"
import { ReactComponent as WithDraw } from "../assets/images/wit.svg"
import { ReactComponent as Refund } from "../assets/icon/refund.svg"
const WalletHistory = () => {
    const transactionTypeData = [
        { value: "3", label: "Credit" },
        { value: "2", label: "Debit" }
    ]
    const { setting } = useSelector((state) => state.setting)

    const { walletHistory, total } = useSelector((state) => state.withDraw);

    const [transactionType, setTransactionType] = useState("All");
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const dispatch = useDispatch()

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
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
    const { startOfMonth, endOfMonth } = getCurrentMonthDates();
    const [startDate, setStartDate] = useState("ALL");
    const [endDate, setEndDate] = useState("ALL");
    useEffect(() => {
        const payload = {
            startDate: startDate === "ALL" ? "All" : startDate,
            endDate: endDate === "ALL" ? "All" : endDate,
            start: page,
            limit: rowsPerPage,
            type: transactionType
        }
        dispatch(getWalletHistory(payload))
    }, [page, rowsPerPage, startDate, transactionType])

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
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"

                >
                    {row?.amount || "-"}
                </span>
            ),
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
                row?.type === 3 ? (
                    <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#1ebc1e" }}>
                        Credit
                    </button>
                ) : row?.type === 4 ? (
                    <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#1ebc1e" }}>
                        Credit
                    </button>
                ) : row?.type === 2 && row?.payoutStatus === 2 ? (
                    <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#F23434" }}>
                        Debit
                    </button>
                ) : (
                    <button className="m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#FFC7C6", color: "#FF1B1B", fontWeight: "700" }}>
                        Pending
                    </button>
                ),
        },
        {
            Header: "Transaction Completed",
            Cell: ({ row }) =>
                row?.type === 2 ? ( 
                    <>
                        {row?.payoutStatus === 1 ? (
                            <button className="d-flex align-items-center justify-content-center"
                                style={{ background: "#D8F0F9", color: "#17A7DB", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                                <Refund />
                                <span style={{ whiteSpace: "nowrap" }} className="ms-2">{
                                    row?.payoutStatus === 1 && "Withdraw Pending" || row?.payoutStatus === 2 && "Withdraw Approve" || row?.payoutStatus === 3 && "Withdraw Declined"
                                }</span>
                            </button>
                        ) : (
                            <button className="d-flex align-items-center justify-content-center"
                                style={{ background: "#F5DDC3", color: "#EB8213", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                                <WithDraw />
                                <span style={{ whiteSpace: "nowrap" }} className="ms-2">{
                                    row?.payoutStatus === 1 && "Withdraw Pending" || row?.payoutStatus === 2 && "Withdraw Approve" || row?.payoutStatus === 3 && "Withdraw Declined"
                                }</span>
                            </button>
                        )
                        }
                    </>

                ) : row?.type === 3 ? (
                    <button className="d-flex align-items-center justify-content-center"
                        style={{ background: "#D9F2D9", color: "#14AF14", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                        <Order />
                        <span style={{ whiteSpace: "nowrap" }} className="ms-2">Order Confirmed</span>
                    </button>

                ) : row?.type === 4 ? (
                    <button className="d-flex align-items-center justify-content-center"
                        style={{ background: "#D9F2E7", color: "#0EC070", border: "none", borderRadius: "5px", padding: "8px 12px", marginLeft: "70px" }}>
                        <Complete />
                        <span style={{ whiteSpace: "nowrap" }} className="ms-2">Booking Completed</span>
                    </button>

                ) : (
                    ""
                ),
        },
    ];

    return (
        <div className="orderDetails mt-2">
            <div className="row">
                <Title name="Wallet History" className="mt-4" />
            </div>
            <div className="betBox">
                <div className="inputData pb-2">
                    <label className="styleForTitle" htmlFor="transactionType">
                        Transaction Type
                    </label>
                    <select
                        name="transactionType"
                        className="rounded-2 fw-bold"
                        id="transactionType"
                        value={transactionType}
                        onChange={(e) => {
                            console.log("eeeeee", e)
                            const selectedSalonId = e.target.value;
                            setTransactionType(selectedSalonId);
                            // dispatch(getWalletData(payload))
                        }}
                    >
                        <option key="All" value="All">
                            All
                        </option>
                        {transactionTypeData?.map((data) => (
                            <option key={data?.value} value={data?.value}>
                                {data?.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className=" " >
                    <div className="inputData">
                        <label>Analytic</label>
                    </div>
                    <div className="d-flex justify-content-end">
                        <Analytics
                            analyticsStartDate={startDate}
                            analyticsStartEnd={endDate}
                            placeholder="Wallet"
                            analyticsStartDateSet={setStartDate}
                            analyticsStartEndSet={setEndDate}
                        />
                    </div>

                </div>
            </div>

            <Table
                data={walletHistory}
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
                totalData={total}
            />
        </div>
    )
}
export default WalletHistory