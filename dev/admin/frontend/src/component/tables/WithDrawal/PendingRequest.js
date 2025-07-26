import { useEffect, useState } from "react";
import Table from "../../extras/Table";
import { useDispatch, useSelector } from "react-redux";
import { acceptWithDraw, getExpertWithDraw, rejectedWithDraw } from "../../../redux/slice/withDrawSlice";
import { toast } from "react-toastify";
import Button from "../../extras/Button";
import Pagination from "../../extras/Pagination";
import { AcceptWarning, warning } from "../../../util/Alert";
import moment from "moment";

const PendingRequest = ({ status, startDate, endDate }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const { setting } = useSelector((state) => state.setting)
  ;

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [modal, setModal] = useState(false);
    const [reason, setReason] = useState("");
    const [data, setData] = useState("");
    const [rejectedId, setRejectedId] = useState("");
    const [paymentDetailsModal, setPaymentDetailsModal] = useState(false)
    const { expertWithDraw, total } = useSelector((state) => state.withDraw)
    useEffect(() => {
        const payload = {
            start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
        }
        dispatch(getExpertWithDraw(payload))
    }, [startDate, endDate])
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
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
        

            if (yes) {
                dispatch(acceptWithDraw(id))
                    .then((res) => {
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message)
                            const payload = {
                                start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
                            }
                            dispatch(getExpertWithDraw(payload))
                        } else {
                            toast.error(res?.payload?.message)
                        }
                    })
            }
        } catch (err) {
            console.log(err);
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault()
    

        const payload = {
            id: rejectedId,
            reason: reason
        }
        dispatch(rejectedWithDraw(payload))
            .then((res) => {
                if (res?.payload?.status) {
                    toast.success(res?.payload?.message)
                    const payload = {
                        start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
                    }
                    dispatch(getExpertWithDraw(payload))
                    setModal(false)
                    setReason("")
                } else {
                    toast.error(res?.payload?.message)
                }
            })
    }
    const pendingTable = [
        {
            Header: "SR NO",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            )
        },
        {
            Header: "Expert Image",
            Cell: ({ row }) => (
                <>
                    <img src={row?.expert?.image} alt="expert" width="80" height="80" style={{ objectFit: "contain", cursor: "pointer" }} onClick={(e) => {
                        handleOpenImgae(row?.expert?.image)
                    }} />
                </>
            )
        },
        {
            Header: "Expert Name",
            Cell: ({ row }) => (
                <>
                    <div>{row?.expert?.fname + " " + row?.expert?.lname ? row?.expert?.fname + " " + row?.expert?.lname : "-"}</div>
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
                    <div>{moment(row?.createdAt).format("DD-MM-YYYY") ? moment(row?.createdAt).format("DD-MM-YYYY") : "-"}</div>
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
                            setPaymentDetailsModal(true);
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
                        setModal(true);
                        setRejectedId(row?._id);
                    }}></i>
                </>
            ),
        },
    ]
    return (
        <>
            <Table
                data={expertWithDraw}
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
            {
                paymentDetailsModal && (<>
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
                                                        setPaymentDetailsModal(false)
                                                    }}
                                                >
                                                    <i className="ri-close-line"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <form id="expertForm"  >
                                            <div className="row align-items-start formBody">
                                                <div className="col-12 mb-3">
                                                    <label className="fs-15">Payment GateWay</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={data?.paymentGateway}
                                                        name="paymentGateway"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <label className="fs-15">Payment Details</label>

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
                                                        onClick={() => { setPaymentDetailsModal(false) }}
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
                modal && (
                    <>
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
                                                            setModal(false)
                                                            setReason("")
                                                        }}
                                                    >
                                                        <i className="ri-close-line" onClick={() => {
                                                            setModal(false)
                                                            setReason("")
                                                        }}></i>
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
                                                                setModal(false);
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
                    </>
                )
            }
        </>
    )
}
export default PendingRequest;