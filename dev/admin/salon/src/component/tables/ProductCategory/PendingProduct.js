import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../extras/Button";
import { getPendingRequest, getUpdatePendingRequest, pendingProductStatus, pendingProductUpdateStatus, pendingRejectProductStatus } from "../../../redux/slice/productSlice";
import Table from "../../extras/Table";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import Pagination from "../../extras/Pagination";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AcceptProductWarning, AcceptWarning, RejectProductWarning, RejectWarning, warning } from "../../../util/Alert";

const PendingProduct = () => {
    const dispatch = useDispatch();
    const [type, setType] = useState("Pending");
    const [status, setStatus] = useState("Create");
    const [data, setData] = useState([]);
    const { pendingReq, total, pendingUpdateReq } = useSelector((state) => state.product)
    const {setting } = useSelector((state) => state.setting)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [updateData, setupdateData] = useState([]);
    const [modal,setModal] = useState(false);
    const navigate = useNavigate()
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };


    useEffect(() => {
        if (status === "Create") {
            dispatch(getPendingRequest(type));
            setData([]);
        } else {
            dispatch(getUpdatePendingRequest(type));
            setData([]);
        }
    }, [status, type, page, rowsPerPage])
    useEffect(() => {
        if (status === "Create") {
            setData(pendingReq);
        } else {
            setupdateData(pendingUpdateReq);
        }
    }, [pendingReq]);
    const handleAccept = async (id) => {
        if (status === "Create") {
        try {
            const data = await AcceptProductWarning("Accept");
            const yes = data?.isConfirmed;
            console.log("yes", yes);
            if (yes) {
                dispatch(pendingProductStatus({ productId: id, type: "Approved" }))
                    .then((res) => {
                        console.log("ressssssss", res)
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message)
                            dispatch(getPendingRequest(type))
                        } else {
                            toast.error(res?.payload?.message)
                        }
                    })
            }
        } catch (err) {
            console.log(err);
        }
    }else{
            try {
                const data = await AcceptProductWarning("Accept");
                const yes = data?.isConfirmed;
                console.log("yes", yes);
                if (yes) {
                    dispatch(pendingProductUpdateStatus({ productId: id, type: "Approved" }))
                        .then((res) => {
                            console.log("ressssssss", res)
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message)
                                dispatch(getPendingRequest(type))
                            } else {
                                toast.error(res?.payload?.message)
                            }
                        })
                }
            } catch (err) {
                console.log(err);
            }
    }
    }

    const handleReject = async (id) => {
        if(status === "Create"){
            try {
                const data = await RejectProductWarning("Reject");
                const yes = data?.isConfirmed;
                console.log("yes", yes);
                if (yes) {
                    dispatch(pendingProductStatus({ productId: id, type: "Rejected" }))
                        .then((res) => {
                            console.log("ressssssss", res)
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message)
                                dispatch(getPendingRequest(type))
                            } else {
                                toast.error(res?.payload?.message)
                            }
                        })
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                const data = await RejectProductWarning("Reject");
                const yes = data?.isConfirmed;
                console.log("yes", yes);
                if (yes) {
                    dispatch(pendingRejectProductStatus({ productId: id, type: "Rejected" }))
                        .then((res) => {
                            console.log("ressssssss", res)
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message)
                                dispatch(getPendingRequest(type))
                            } else {
                                toast.error(res?.payload?.message)
                            }
                        })
                }
            } catch (err) {
                console.log(err);
            }
        }
        }
    
    // const handleReject = (id) => {
    //     if (status === "Create") {
    //         dispatch(pendingProductStatus({ productId: id, type: "Rejected" }))
    //             .then((res) => {
    //                 console.log("ressssssss", res)
    //                 if (res?.payload?.status) {
    //                     toast.success(res?.payload?.message)
    //                     dispatch(getPendingRequest(type))
    //                 } else {
    //                     toast.error(res?.payload?.message)
    //                 }
    //             })
    //     } else {
    //         dispatch(pendingRejectProductStatus({ productId: id, type: "Rejected" }))
    //             .then((res) => {
    //                 console.log("ressssssss", res)
    //                 if (res?.payload?.status) {
    //                     toast.success(res?.payload?.message)
    //                     dispatch(getUpdatePendingRequest(type))
    //                 } else {
    //                     toast.error(res?.payload?.message)
    //                 }
    //             })
    //     }
    // }
    const handleInfoSettlement = (id) => {
        navigate("/admin/product/productDetails", {
            state: {
                id,
            },
        });
    };
    const mapData = [
        {
            Header: "No",
            width: "20px",
            Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
        },
        {
            Header: "Product",
            body: "image",
            Cell: ({ row }) => (
                <div className="d-flex ">
                    <div className="position-relative">


                        <img
                            src={row?.mainImage}
                            height={60}
                            width={60}
                            style={{ borderRadius: "10px" }}
                            alt=""
                        />


                    </div>
                    <span className="ms-2 boxCenter">{row.productName}</span>
                </div>
            ),
        },

        { Header: "Product Code", body: "productCode" },

        {
            Header: `Price (${setting?.currencySymbol})`,
            body: "price",
            Cell: ({ row }) => (
                <span className="fw-bold text-dark">${row.price}</span>
            ),
        },
        {
            Header: "Shipping Charges",
            body: "shippingCharges",
            Cell: ({ row }) => <span>${row.shippingCharges}</span>,
        },

        {
            Header: "CreatedDate",
            body: "createdAt",
            Cell: ({ row }) => (
                <span>{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
            ),
        },
        {
            Header: "Create Status",
            body: "status",
            Cell: ({ row }) => (
                <div className="boxCenter">
                    <span className="badge badge-primary p-2">
                        {status === "Create" ? (
                            <span className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                {row.createStatus}
                            </span>

                        ) : (
                            <span className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                {row.updateStatus}
                            </span>
                        )}
                    </span>
                </div>
            ),
        },
        {
            Header: "Info",
            Cell: ({ row }) => (
                <span>
                    <button
                        className="py-1 "
                        style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
                        onClick={() => handleInfoSettlement(row?._id)}
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
            Header: "Accept",
            body: "",
            Cell: ({ row }) =>
            (
                <>

                    <i className="fa-solid fa-check" style={{ color: "green", fontSize: "18px" }} onClick={() => {
                        handleAccept(row?._id)
                        // setModal(true)
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
                        handleReject(row?._id)
                    }}></i>
                </>
            ),
        },

    
        // add more columns as needed
    ];
    return (
        <>
        {
                modal && (
                    <div className="dialog">
                        <div className="w-100">
                            <div className="row justify-content-center">
                                <div className="col-xl-5 col-md-8 col-11">
                                    <div className="mainDiaogBox">
                                      
                                        <form>
                                            <p>Would you like to approve the Pending request?</p>

                                            <div className="row formFooter">
                                                <div className="col-12 text-start m0">
                                                    <Button
                                                        className={`bg-gray text-light`}
                                                        text={`Cancel`}
                                                        type={`button`}
                                                        onClick={() => setModal(false)}
                                                    />
                                                    <Button
                                                        type={`submit`}
                                                        className={`text-white m10-left`}
                                                        style={{ backgroundColor: "#1ebc1e" }}
                                                        text={`Update`}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
        }
            <div className="mainSellerTable">
                <div className="sellerTable">
                    <div className="sellerHeader primeHeader">
                        <div className="row">
                            <div className="col-4 d-flex" id="">

                                <Button
                                    className={`bg-secondary m20-left p-10 mt-5 text-white`}
                                    text={`New Items`}
                                    style={{ padding: "9px 20px" }}
                                    onClick={() => setStatus("Create")}
                                />
                                <Button
                                    className={`bg-primary m20-left p-10 mt-5 text-white`}
                                    text={`Updated Items`}
                                    style={{ padding: "9px 20px" }}
                                    onClick={() => setStatus("Update")}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sellerMain">
                        <div className="tableMain">
                            {type == "Pending" && (
                                <>
                                    <Table
                                        data={status === "Create" ? data : updateData}
                                        mapData={mapData}
                                        PerPage={rowsPerPage}
                                        Page={page}
                                        type={"client"}
                                    />
                                </>
                            )}
                            <Pagination
                                serverPage={page}
                                type={"server"}
                                onPageChange={handleChangePage}
                                setServerPage={setPage}
                                serverPerPage={rowsPerPage}
                                totalData={total}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                    </div>
                    <div className="sellerFooter primeFooter"></div>
                </div>
            </div></>
    )
}
export default PendingProduct;