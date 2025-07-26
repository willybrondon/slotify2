import { useEffect, useState } from "react";
import Analytics from "../extras/Analytics";
import Title from "../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { getWalletData } from "../../redux/slice/userSlice";
import Table from "../extras/Table";
import Pagination from "../extras/Pagination";
import Sign from "../../assets/images/sign.png"
import { ReactComponent as Delievered } from "../../assets/icon/deliever.svg"
import { ReactComponent as WithDraw } from "../../assets/icon/wit.svg"
import { ReactComponent as Cancel } from "../../assets/icon/cancel.svg"
import { ReactComponent as Refund } from "../../assets/icon/refund.svg"

const Recharge = () => {
    const transactionTypeData = [
        { value: "1", label: "Credit" },
        { value: "2", label: "Debit" }
    ]
    const { walletData, total } = useSelector((state) => state.user);

    const [transactionType, setTransactionType] = useState("All");
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const dispatch = useDispatch()
    const { setting } = useSelector((state) => state.setting)

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };

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
        dispatch(getWalletData(payload))
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
                    {row?.uniqueId || "-"}
                </span>
            ),
        },
        {
            Header: "User Info",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"

                >
                    {row?.user?.fname + "" + row?.user?.lname || "-"}
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
                row?.type === 1 ? (
                    <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{
                        background: "#14AF14"
                    }}>
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
                    <button className="text-white m5-right p12-x p4-y fs-12 br-5 " style={{ backgroundColor: "#14AF14" }}>
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
        <>
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
                                const selectedSalonId = e.target.value;
                                const payload = {
                                    startDate: startDate === "ALL" ? "All" : startDate,
                                    endDate: endDate === "ALL" ? "All" : endDate,
                                    start: page,
                                    limit: rowsPerPage,
                                    type: selectedSalonId
                                }
                                setTransactionType(selectedSalonId);
                                dispatch(getWalletData(payload))
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
                    data={walletData}
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
        </>
    )
}
export default Recharge;