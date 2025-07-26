import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getOrderDetails } from "../../../redux/slice/orderSlice";
import Table from "../../extras/Table";

const OrderDetails = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    // const { dialogueData } = useSelector((state) => state.dialog)
    const [data, setData] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const { orderDetails } = useSelector((state) => state.ordersData)
    useEffect(() => {
        dispatch(getOrderDetails(state))
    }, [state]);
    useEffect(() => {
        setData(orderDetails)
    }, [orderDetails]);
    const mapData = [
        {
            Header: "No",
            width: "20px",
            Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
        },

        {
            Header: "Item Detail",
            body: "",
            Cell: ({ row }) => {
                return (
                    <div>

                        <div className="d-flex mb-3">
                            <img
                                src={row?.product?.mainImage}
                                style={{
                                    borderRadius: "10px",
                                    width: "70px",
                                    height: "70px",
                                    objectFit: "cover",
                                }}
                            // alt={row?.product?.productName || "Product Image"}
                            />
                            <div className="ms-3 text-start">
                                <p
                                    className="text-muted fw-bold mb-0"
                                    style={{ fontSize: "16px", color: "rgb(64,81,137)" }}
                                >
                                    {row?.product?.productName}
                                </p>
                                {/* Ensure the item?.attributesArray is used correctly */}
                                {row?.attributesArray?.map((att, attIndex) => {
                                    return (
                                        <span key={attIndex} style={{ fontSize: "13px" }} className="d-flex justify-content-start">
                                            {att?.name}: 
                                            <b className="text-dark ms-1" style={{ fontSize: "12px" }}>
                                                {att?.value}
                                            </b>
                                            <br />
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                );
            },
        },


        {
            Header: "Price",
            body: "price",
            Cell: ({ row }) => {
                return (
                    <>
                        <div className="">
                            <span>{"$" + row.purchasedTimeProductPrice}</span>
                        </div>
                    </>
                );
            },
        },

        {
            Header: "Quantity",
            body: "Quantity",
            Cell: ({ row }) => {
                return (
                    <>
                        <div className="">
                            <span>{row.productQuantity}</span>
                        </div>
                    </>
                );
            },
        },



        {
            Header: "Shipping Charge",
            body: "purchasedTimeShippingCharges",
            Cell: ({ row }) => {
                return (
                    <>
                        <span className="fs-14">{row?.purchasedTimeShippingCharges}$</span>
                    </>
                );
            },
        },
        {
            Header: "Delivered Service",
            body: "deliveredServiceName",
            Cell: ({ row }) => {
                return (
                    <>
                        <span className="fs-14">
                            {row?.deliveredServiceName ? row?.deliveredServiceName : "-"}
                        </span>
                    </>
                );
            },
        },

        {
            Header: "Status",
            body: "status",
            Cell: ({ row }) => {
                return (
                    <div className="boxCenter">

                        <div className="mb-2"> {/* Add margin for spacing */}
                            {row?.status === "Pending" ? (
                                <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Pending
                                </div>
                            ) : row?.status === "Confirmed" ? (
                                <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Confirmed
                                </div>
                            ) : row?.status === "Out Of Delivery" ? (
                                <div className="badge badge-warning p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Out Of Delivery
                                </div>
                            ) : row?.status === "Delivered" ? (
                                <div className="badge badge-info p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Delivered
                                </div>
                            ) : row?.status === "Cancelled" ? (
                                <div className="badge badge-danger p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Cancelled
                                </div>
                            ) : (
                                <div className="badge badge-danger p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                    Status Unknown
                                </div>
                            )}
                        </div>

                    </div>
                );
            },
        },

        {
            Header: "Total",
            body: "purchTotal AmountasedTimeShippingCharges",
            Cell: ({ row }) => {
                return (
                    <>
                        <b className="fs-14">
                            {row?.purchasedTimeProductPrice * row?.productQuantity ? row?.purchasedTimeProductPrice * row?.productQuantity : "-"}$
                        </b>
                    </>
                );
            },
        },


        // add more columns as needed
    ];
    return (
        <div>
            <div className="mainUserTable">
                <div className="userTable">
                    <div className="userMain">
                        <div style={{ margin: "10px 18px" }}>
                            <div className="row">
                                <div className="col-xl-9 col-md-12 col-12">
                                    <div className="card mt-3" style={{ borderRadius: "5px" }}>
                                        <div className="card-header">
                                            <p className="fs-17 fw-bolder">
                                                OrderID :{orderDetails?.orderId}
                                            </p>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="dashBoardTable">
                                                <div className="tableMain m-0">
                                                    <Table
                                                        data={data?.items}
                                                        mapData={mapData}
                                                        PerPage={rowsPerPage}
                                                        Page={page}
                                                        type={"client"}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <table className="w-100 ms-4">
                                                        <tbody>
                                                            <tr className="text-start ">
                                                                <td
                                                                    width="180px"
                                                                    className="py-3 text-profile "
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                >
                                                                    Total Items
                                                                </td>
                                                                <td width="30px">:</td>
                                                                <td className="text-capitalize text-start">
                                                                    {orderDetails?.totalItems}
                                                                </td>
                                                            </tr>
                                                            <tr className="text-start ">
                                                                <td
                                                                    width="180px"
                                                                    className="py-3 text-profile "
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                >
                                                                    Total Quantity
                                                                </td>
                                                                <td width="30px">:</td>
                                                                <td className="text-capitalize text-start">
                                                                    {orderDetails?.totalQuantity}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="col-md-6 d-flex justify-content-end">
                                                    <div>
                                                        <table className="w-100">
                                                            <tbody>
                                                                <tr className="text-start ">
                                                                    <td
                                                                        width="180px"
                                                                        className="py-3 text-profile "
                                                                    >
                                                                        <b>Amount</b>
                                                                    </td>
                                                                    <td width="30px">:</td>
                                                                    <td className="text-capitalize text-start">
                                                                        <b> {orderDetails?.subTotal} $</b>
                                                                    </td>
                                                                </tr>
                                                                <tr className="text-start ">
                                                                    <td
                                                                        width="180px"
                                                                        className="py-3 text-profile "
                                                                    >
                                                                        <b style={{ whiteSpace: "nowrap" }}>Shipping Charge</b>
                                                                    </td>
                                                                    <td width="30px">:</td>
                                                                    <td className="text-capitalize text-success text-start">
                                                                        <b>
                                                                            {" "}
                                                                            {"+" +
                                                                                orderDetails?.totalShippingCharges}{" "}
                                                                            $
                                                                        </b>
                                                                    </td>
                                                                </tr>
                                                                {/* <tr>
                                                                    <td width="180px" className="py-3"></td>
                                                                    <td width="30px"></td>
                                                                    <td className="text-capitalize text-start">
                                                                        <hr width="60px" />
                                                                    </td>
                                                                </tr> */}
                                                                <tr className="text-start ">
                                                                    <td
                                                                        width="180px"
                                                                        className=" text-profile "
                                                                    >
                                                                        <b>Total Amount</b>
                                                                    </td>
                                                                    <td width="30px">:</td>
                                                                    <td className="text-capitalize text-start">
                                                                        <b> {orderDetails?.total} $</b>
                                                                    </td>
                                                                </tr>
                                                                <tr className="text-start ">
                                                                    <td
                                                                        width="180px"
                                                                        className=" text-profile "
                                                                    >
                                                                        <b>Discount</b>
                                                                    </td>
                                                                    <td width="30px">:</td>
                                                                    <td className="text-capitalize text-danger text-start">
                                                                        <b> {"-" + orderDetails?.discount} $</b>
                                                                    </td>
                                                                </tr>
                                                                {/* <tr>
                                                                    <td width="180px" className="">

                                                                    </td>
                                                                    <td width="30px"></td>
                                                                    <td className="text-capitalize text-start">
                                                                        <hr width="60px" />
                                                                    </td>
                                                                </tr> */}
                                                                <tr className="text-start ">
                                                                    <td
                                                                        width="180px"
                                                                        className=" text-profile "
                                                                    >
                                                                        <b>Total</b>
                                                                    </td>
                                                                    <td width="30px">:</td>
                                                                    <td className="text-capitalize text-start">
                                                                        <b> {orderDetails?.finalTotal} $</b>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3">
                                    <div className="card mt-3" style={{ borderRadius: "5px" }}>
                                        <div className="card-header">
                                            <div className="d-flex py-2">
                                                <h5 className="card-title fw-bold flex-grow-1 mb-0">
                                                    <i className="bi bi-truck align-middle me-1 text-muted" />{" "}
                                                    Logistics Details
                                                </h5>
                                                <div className="flex-shrink-0">
                                                    <a
                                                        href="javascript:void(0);"
                                                        className="badge bg-secondary-subtle text-secondary fs-11"
                                                    >
                                                        Track Order
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {data?.items?.map((item) => {
                                                return (
                                                    <>
                                                        <div className="d-flex my-2">
                                                            <>
                                                                <img
                                                                    src={item.productId?.mainImage}
                                                                    style={{
                                                                        borderRadius: "10px",
                                                                        width: "70px",
                                                                        height: "70px",
                                                                        objectFit: "cover",
                                                                    }}
                                                                    alt=""
                                                                />
                                                            </>
                                                            <div className="ms-3 text-start">
                                                                <p
                                                                    className="text-muted fw-bold mb-0"
                                                                    style={{ fontSize: "13px", color: "rgb(64,81,137)" }}
                                                                >
                                                                    <b>Tracking Link :</b> <a href={item?.trackingLink} target="_blank">{item?.trackingLink || "-"}</a>
                                                                </p>
                                                                <p
                                                                    className="text-muted fw-bold mb-0"
                                                                    style={{ fontSize: "13px", color: "rgb(64,81,137)" }}
                                                                >
                                                                    <b>Tracking Id :</b> <div>{item?.trackingId || "-"}</div>
                                                                </p>
                                                                <p
                                                                    className="text-muted fw-bold mb-0"
                                                                    style={{ fontSize: "13px", color: "rgb(64,81,137)" }}
                                                                >
                                                                    <b>Delivered ServiceName :</b> <div>{item?.deliveredServiceName || "-"}</div>
                                                                </p>
                                                                {/* Ensure the item?.attributesArray is used correctly */}

                                                            </div>

                                                        </div>

                                                    </>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="card mt-4" style={{ borderRadius: "5px" }}>
                                        <div className="card-header">
                                            <h5 className="card-title fw-bold my-2">
                                                <i className="bi bi-geo-alt align-middle me-1 fw-bold text-muted" />{" "}
                                                Shipping Address
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <ul className="list-unstyled vstack gap-2 fs-13 mb-0">
                                                <li className="fw-bold fs-14">
                                                    {data?.shippingAddress?.name}
                                                </li>
                                                <li className="py-1">
                                                    {data?.shippingAddress?.address}
                                                </li>
                                                <li className="py-1">
                                                    {data?.shippingAddress?.city}
                                                </li>
                                                <li className="py-1">
                                                    {data?.shippingAddress?.state}
                                                </li>
                                                <li className="py-1">
                                                    {data?.shippingAddress?.country +
                                                        " - " +
                                                        data?.shippingAddress?.zipCode}
                                                </li>
                                            </ul>
                                        </div>
                                    </div> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default OrderDetails;