import { toast } from "react-toastify";
import Pagination from "../../extras/Pagination"
import Table from "../../extras/Table"
import { AcceptWarning, warning } from "../../../util/Alert";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptSalonWithDraw, getSalonWithDraw, rejectSalonWithDraw } from "../../../redux/slice/withDrawSlice";
import moment from "moment";
import Button from "../../extras/Button";

const PendingSalonReq = ({ status, startDate, endDate }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modal, setModal] = useState(false);
    const [reasonModal, setReasonModal] = useState(false);
    const [data, setData] = useState("");
    const [rejectedId, setRejectedId] = useState("");
    const [reason, setReason] = useState("");
    const { setting } = useSelector((state) => state.setting)
    const { total, salonWithDraw } = useSelector((state) => state.withDraw)
    console.log("settingsettingsetting", setting)
    useEffect(() => {
        const payload = {
            start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
        }
        dispatch(getSalonWithDraw(payload))
    }, [startDate, endDate, page, rowsPerPage, status])
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    }
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    const handleOpenImgae = (image) => {
        window.open(image, "_blank");
    }
    const handleAccept = async (id) => {
        try {
            const data = await AcceptWarning("Accept");
            const yes = data?.isConfirmed;
            console.log("yes", yes);
            if (yes) {
                dispatch(acceptSalonWithDraw(id))
                    .then((res) => {
                        console.log("ressssssss", res)
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message)
                            const payload = {
                                start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
                            }
                            dispatch(getSalonWithDraw(payload))
                        } else {
                            toast.error(res?.payload?.message)
                        }
                    })
            }
        } catch (err) {
            console.log(err);
        }
    }

    const pendingTable = [
        {
            Header: "SR NO",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            )
        },
        {
            Header: "Salon Image",
            Cell: ({ row }) => (
                <>
                    <img src={row?.salon?.mainImage} alt="expert" width="80" height="80" style={{ objectFit: "contain", cursor: "pointer" }} onClick={(e) => {
                        handleOpenImgae(row?.expert?.mainImage)
                    }} />
                </>
            )
        },
        {
            Header: "Salon Name",
            Cell: ({ row }) => (
                <>
                    <div>{row?.salon?.name ? row?.salon?.name : "-"}</div>
                </>
            )
        },
        {
            Header: `Amount (${setting?.currencySymbol})`,
            Cell: ({ row }) => (
                <>
                    <div>{row?.amount ? row?.amount : "-"}</div>
                </>
            )
        },
        {
            Header: "Date",
            Cell: ({ row }) => (
                <>
                    <div>{moment(row?.createdAt).format("DD.MM.YYYY") ? moment(row?.createdAt).format("DD.MM.YYYY") : "-"}</div>
                </>
            )
        },
        {
            Header: "Info",
            Cell: ({ row }) => (
                <span>
                    <button
                        className=" text-light m5-right p12-x p4-y fs-12 br-5 "
                        style={{ backgroundColor: "#3c64cd" }}
                        onClick={() => {
                            setModal(true);
                            setData(row)
                        }}
                    >
                        Info
                    </button>
                </span>
            ),
            width: "50px",
        },
        {
            Header: "Accept",
            body: "",
            Cell: ({ row }) =>
            (
                <>

                    <i className="fa-solid fa-check" style={{ color: "green", fontSize: "18px" }} onClick={() => {
                        handleAccept(row?._id)
                    }}></i>
                </>
            ),
        },
        {
            Header: "Reject",
            body: "",
            Cell: ({ row }) => (
                <>
                    <i className="fa-sharp fa-solid fa-xmark" style={{ color: "red", fontSize: "18px" }} onClick={() => {
                        setRejectedId(row?._id)
                        setReasonModal(true)
                    }}></i>
                </>
            ),
        },
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        const payload = {
            requestId: rejectedId,
            reason: reason
        }
        dispatch(rejectSalonWithDraw(payload))
            .then((res) => {
                console.log("resssssss", res)
                if (res?.payload?.status) {
                    toast.success(res?.payload?.message)
                    const payload = {
                        start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
                    }
                    dispatch(getSalonWithDraw(payload))
                    setReasonModal(false)
                    setReason("")
                } else {
                    toast.error(res?.payload?.message)
                }
            })
    }

    return (
        <>
            {
                modal && (<>
                    <div className="dialog">
                        <div className="w-100">
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-md-8 col-11">
                                    <div className="mainDiaogBox">
                                        <div className="row justify-content-between align-items-center formHead">
                                            <div className="col-8">
                                                <h3 className="text-theme m0">Payment Details</h3>
                                            </div>
                                            <div className="col-4">
                                                <div
                                                    className="closeButton"
                                                    onClick={() => {
                                                        setModal(false)
                                                    }}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <form id="expertForm"  >
                                            <div className="row align-items-start formBody">
                                                <div className="col-12 mb-3">
                                                    <label className="fs-12">Payment GateWay</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={data?.paymentGateway}
                                                        name="paymentGateway"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <label className="fs-12">Payment Details</label>

                                                    {
                                                        data?.paymentDetails?.map((item, index) => {
                                                            const [label, value] = item.split(":");

                                                            return (
                                                                <div className="inputData mt-2" key={index}>
                                                                    <label>{label}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder={`Enter your ${label.toLowerCase()}`}
                                                                        value={value?.trim()}
                                                                        disabled
                                                                    />
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>


                                            </div>
                                            <div className="row  formFooter">
                                                <div className="col-12 text-end m0">

                                                    <Button
                                                        type={`cancel`}
                                                        className={` text-white m10-left`}
                                                        style={{ backgroundColor: "#1ebc1e" }}
                                                        text={`Cancel`}
                                                        onClick={() => { setModal(false) }}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>)
            }
            {
                reasonModal && (<>
                    <div className="dialog">
                        <div className="w-100">
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-md-8 col-11">
                                    <div className="mainDiaogBox">
                                        <div className="row justify-content-between align-items-center formHead">
                                            <div className="col-8">
                                                <h3 className="text-theme m0">Reason</h3>
                                            </div>
                                            <div className="col-4">
                                                <div
                                                    className="closeButton"
                                                    onClick={() => {
                                                        setReasonModal(false)
                                                        setReason("")
                                                    }}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <form id="expertForm" onSubmit={handleSubmit}>
                                            <div className="row align-items-start formBody">
                                                <div className="col-12 mb-3">
                                                    <label>Reason</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={reason}
                                                        onChange={(e) => {
                                                            setReason(e.target.value)
                                                        }}
                                                        name="reason"
                                                    />
                                                </div>

                                            </div>
                                            <div className="row  formFooter">
                                                <div className="col-12 text-end m0">
                                                    <Button
                                                        className={`bg-gray text-light`}
                                                        text={`Cancel`}
                                                        type={`button`}
                                                        onClick={() => {
                                                            setReasonModal(false);
                                                            setReason("")
                                                        }}
                                                    />
                                                    <Button
                                                        type={`submit`}
                                                        className={` text-white m10-left`}
                                                        style={{ backgroundColor: "#1ebc1e" }}
                                                        text={`Submit`}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>)
            }
            <Table
                data={salonWithDraw}
                mapData={pendingTable}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
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

        </>
    )
}
export default PendingSalonReq
