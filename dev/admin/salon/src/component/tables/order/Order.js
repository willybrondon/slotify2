import { useEffect, useState } from "react";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../../redux/slice/orderSlice";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { useNavigate } from "react-router-dom";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import EditOrder from "./EditOrder";

import { ReactComponent as Delievered } from "../../../assets/images/deliever.svg"
import { ReactComponent as Cancel } from "../../../assets/images/cancel.svg"
import { ReactComponent as Edit } from "../../../assets/images/edit.svg"
const Order = () => {
    const [type, setType] = useState("All");
    const { order } = useSelector((state) => state.order)
    const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

    const orderType = [
        { name: "Pending", value: "Pending" },
        { name: "Confirmed", value: "Confirmed" },
        { name: "Out Of Delivery", value: "Out Of Delivery" },
        { name: "Delivered ", value: "Delivered" },
        { name: "Cancelled ", value: "Cancelled" },
    ];
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const navigate = useNavigate();
    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            status: type
        }
        dispatch(getOrders(payload))
    }, [type, page, rowsPerPage]);

    const groupedOrders = order?.reduce((acc, order) => {
        console.log("1234", order)
        const orderData = {
            orderId: order?.orderId,
            firstName: order?.userFirstName,
            lastName: order?.userLastName,
            finalTotal: order?.finalTotal,

            items: order?.items?.map((item) => ({
                mainImage: item?.mainImage,
                productName: item?.productName,
                productQuantity: item?.item?.productQuantity,
                purchasedTimeProductPrice: item?.item?.purchasedTimeProductPrice,
                purchasedTimeShippingCharges: item?.item?.purchasedTimeShippingCharges,
                commissionPerProductQuantity: item?.item?.commissionPerProductQuantity,
                status: item?.item?.status,
                itemId: item?.item?._id,
                userId: order?.userId,

                orderMainId: order?._id,
            })),
        };
        acc.push(orderData);
        return acc;
    }, []);
    // Flattening for pagination
    const flattenedOrders = groupedOrders?.flatMap((order, orderIndex) => {
        // Maintain a counter for the serial number
        let srNo = orderIndex + 1;
        return order?.items?.map((item, index) => ({
            isGrouped: index === 0,
            srNo: index === 0 ? srNo : null,
            orderId: order?.orderId,
            firstName: order?.firstName,
            lastName: order?.lastName,
            finalTotal: order?.finalTotal,

            ...item,
        }));
    });
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    const handleOrderView = (id) => {
        navigate(`/salonPanel/orderDetails`, {
            state: id
        });
    }
    useEffect(() => {
        setData(order)
    }, [order])

    const orderTable = [
        {
            Header: "SR NO",
            Cell: ({ row, index }) => {
                if (row?.isGrouped && row?.srNo) {
                    return <span>{row?.srNo}</span>; // Use the srNo generated above
                }
                return null;
            }
        },
        {
            Header: "Order ID",
            Cell: ({ row }) => (
                row?.isGrouped ? (
                    <span style={{ color: "blue", cursor: "pointer" }} onClick={() => handleOrderView(row?.orderMainId)}>
                        {row?.orderId}
                    </span>
                ) : null
            )
        },
        {
            Header: "User Info",
            Cell: ({ row }) => row?.isGrouped ? <div>{row?.firstName || "-"}</div> : null
        },
        {
            Header: "Items",
            Cell: ({ row }) => (
                <>
                    <div className="d-flex justify-content-start">
                        <div>

                            <img src={row?.mainImage} />
                        </div>

                        <div className="text-start pl-2">
                            <div>{row?.productName}</div>
                            <div>Quantity : <span>{row?.productQuantity}</span></div>
                            <div>Price : {row?.purchasedTimeProductPrice}</div>
                        </div>
                    </div>
                </>
            )
        },
        {
            Header: "Price",
            Cell: ({ row }) => (
                <>
                    <div>{row?.purchasedTimeProductPrice * row?.productQuantity ? row?.purchasedTimeProductPrice * row?.productQuantity : "-"}</div>
                </>
            )
        },
        {
            Header: "Shipping Charge",
            Cell: ({ row }) => (
                <>
                    <div>{row?.purchasedTimeShippingCharges ? row?.purchasedTimeShippingCharges : "-"}</div>
                </>
            )
        },
        {
            Header: "Admin Commission",
            Cell: ({ row }) => (
                <>
                    <div>{row?.commissionPerProductQuantity === 0 ? 0 : row?.commissionPerProductQuantity}</div>
                </>
            )
        },
        {
            Header: "Status",
            Cell: ({ row }) => {
                return (
                    <div className="mb-2"> {/* Add margin for spacing */}
                        {row?.status === "Pending" ? (
                            <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                Pending
                            </div>
                        ) : row?.status === "Confirmed" ? (
                            <div className="badge badge-success p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                Confirmed
                            </div>
                        ) : row?.status === "Out Of Delivery" ? (
                            <div className="badge badge-warning p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                Out Of Delivery
                            </div>
                        ) : row?.status === "Delivered" ? (
                            <div className="badge badge-info p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                Delivered
                            </div>
                        ) : row?.status === "Cancelled" ? (
                            <div className="badge badge-danger p-2" style={{ color: "#FF1B1B", backgroundColor: "#FAD5D5", fontSize: "12px" }}>
                                Cancelled
                            </div>
                        ) : (
                            <div className="badge badge-danger p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                Status Unknown
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            Header: "Action",  // Show the Action header
            Cell: ({ row }) => {
                const { status } = row;  // Extract status from the row
                return (
                    <span className="d-flex justify-content-center">
                        {status === "Cancelled" ? (
                            // Show cancel icon when status is "Cancelled"
                            <button
                                className="py-1"
                                style={{ backgroundColor: "#FAD5D5", borderRadius: "8px" }}
                            >
                                <Cancel />
                            </button>

                        ) : status === "Delivered" ? (
                            // Show delivered icon when status is "Delivered"
                            <button
                                className="py-1"
                                style={{ backgroundColor: "#C0E9C0", borderRadius: "8px" }}
                            >
                                <Delievered />
                            </button>

                        ) : (
                            // Show edit button for other statuses
                            <button
                                className="py-1 me-2 mb-2"
                                style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
                                onClick={() => {
                                    dispatch(openDialog({ type: "order", data: row, mainData: row }));
                                }}
                            >
                                <Edit />
                            </button>
                        )}
                    </span>
                );
            }
        }



    ]
    const showActionHeader = orderTable.some(row => row?.status !== "Cancelled");
    if (!showActionHeader) {
        orderTable = orderTable.filter(column => column.Header !== "Action");
    }



    return (
        <div className="mainExpert">
            <Title name="Orders" />
            <div className="col-2">
                <div className="inputData">
                    <label className="styleForTitle" htmlFor="orderType">
                        Order type
                    </label>
                    <select
                        name="orderType"
                        className="rounded-2 fw-bold"
                        id="orderType"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                        }}
                    >
                        <option value="All" selected>
                            All
                        </option>
                        {orderType?.map((data) => {
                            return <option value={data?.value}>{data?.name}</option>;
                        })}
                    </select>
                </div>
            </div>

            <div>
                <div className="tableMain">
                    <div className="primeMain">
                        <table
                            width="100%"
                            border
                            className="primeTable text-center"
                            style={{ maxHeight: "680px" }}
                        >
                            <thead
                                className="sticky-top"
                                style={{ top: "-1px", zIndex: "1" }}
                            >
                                <tr>
                                    <th className="fw-bold py-3" style={{ width: "40px" }}>
                                        No
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        Order Id
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        User Info
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "450px" }}>
                                        Items
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        Price
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        Shipping Charge
                                    </th>
                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        Status
                                    </th>

                                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                                        Edit
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.length > 0 ? (
                                    <>
                                        {data?.map((mapData, index) => {
                                            console.log("mapdata", mapData)
                                            return (
                                                <>
                                                    <tr>
                                                        <td>
                                                            <span>{index + 1}</span>
                                                        </td>
                                                        <td width="160px">
                                                            <span className="tableBoldFont orderId">
                                                                <b
                                                                    className="fw-bold orderIdText"
                                                                    onClick={() => handleOrderView(mapData?._id)}
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        color: "#0B5ED7",
                                                                    }}
                                                                >
                                                                    {mapData?.orderId}
                                                                </b>
                                                            </span>
                                                        </td>
                                                        <td style={{ width: "350px" }}>
                                                            <div>
                                                                <span className="tableBoldFont">
                                                                    <b className="fw-bold">
                                                                        {mapData?.userFirstName
                                                                            ? mapData?.userFirstName + " "
                                                                            : "multi" + " "}
                                                                        {mapData?.userLastName
                                                                            ? mapData?.userLastName
                                                                            : "User"}
                                                                    </b>
                                                                </span>
                                                                <br />
                                                               
                                                            </div>
                                                        </td>
                                                        <td
                                                            colSpan={6}
                                                            style={{ width: "70%" }}
                                                            className="py-0"
                                                        >
                                                            {mapData?.items.map((data) => {
                                                                console.log("datattt", data)
                                                                return (
                                                                    <>
                                                                        <div className="">
                                                                            <table
                                                                                width="100%"
                                                                                border
                                                                                className=" text-center"
                                                                            >
                                                                                <tbody>
                                                                                    <tr
                                                                                        style={{
                                                                                            borderLeft:
                                                                                                "2px solid #f3f3f3",
                                                                                        }}
                                                                                    >
                                                                                        <td
                                                                                            className="my-2"
                                                                                            style={{ width: "360px" }}
                                                                                        >
                                                                                            <div className="">
                                                                                                <div className="d-flex">

                                                                                                    <>
                                                                                                        <img
                                                                                                            src={
                                                                                                                data?.mainImage
                                                                                                            }
                                                                                                            width={55}
                                                                                                            height={55}
                                                                                                            style={{
                                                                                                                borderRadius:
                                                                                                                    "10px",
                                                                                                                margin: "5px",
                                                                                                                objectFit:
                                                                                                                    "cover",
                                                                                                            }}
                                                                                                            alt=""
                                                                                                            srcset=""
                                                                                                        />
                                                                                                    </>

                                                                                                    <div className="ms-3 text-start">
                                                                                                        <b className="fs-12 text-muted">
                                                                                                            {
                                                                                                                data?.productName
                                                                                                            }
                                                                                                        </b>
                                                                                                        <br />
                                                                                                        <span
                                                                                                            style={{
                                                                                                                fontSize: "13px",
                                                                                                            }}
                                                                                                        >
                                                                                                            <b className="text-dark">
                                                                                                                Quantity
                                                                                                            </b>
                                                                                                            :
                                                                                                            {
                                                                                                                data?.item?.productQuantity
                                                                                                            }
                                                                                                        </span>
                                                                                                        <br />
                                                                                                        <span
                                                                                                            style={{
                                                                                                                fontSize: "13px",
                                                                                                            }}
                                                                                                        >
                                                                                                            <b className="text-dark">
                                                                                                                Price
                                                                                                            </b>
                                                                                                            :
                                                                                                            {
                                                                                                                data?.item?.purchasedTimeProductPrice
                                                                                                            }
                                                                                                            $
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td
                                                                                            className="my-2"
                                                                                            style={{ width: "350px" }}
                                                                                        >
                                                                                            <div className="">
                                                                                                <b className="fs-15">
                                                                                                    {data?.item?.purchasedTimeProductPrice *
                                                                                                        data?.item?.productQuantity || "-"}
                                                                                                    $
                                                                                                </b>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td
                                                                                            className="my-2"
                                                                                            style={{ width: "350px" }}
                                                                                        >
                                                                                            <div className="">
                                                                                                <b className="fs-15">
                                                                                                    {
                                                                                                        data?.item?.purchasedTimeShippingCharges || "-"
                                                                                                    }
                                                                                                    $
                                                                                                </b>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td
                                                                                            className="my-2"
                                                                                            style={{ width: "350px" }}
                                                                                        >
                                                                                            <div className="mb-2"> {/* Add margin for spacing */}
                                                                                                {data?.item?.status === "Pending" ? (
                                                                                                    <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                                                                                        Pending
                                                                                                    </div>
                                                                                                ) : data?.item?.status === "Confirmed" ? (
                                                                                                    <div className="badge badge-success p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                                                                                        Confirmed
                                                                                                    </div>
                                                                                                ) : data?.item?.status === "Out Of Delivery" ? (
                                                                                                    <div className="badge badge-warning p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                                                                                        Out Of Delivery
                                                                                                    </div>
                                                                                                ) : data?.item?.status === "Delivered" ? (
                                                                                                    <div className="badge badge-info p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                                                                                        Delivered
                                                                                                    </div>
                                                                                                ) : data?.item?.status === "Cancelled" ? (
                                                                                                    <div className="badge badge-danger p-2" style={{ color: "#FF1B1B", backgroundColor: "#FAD5D5", fontSize: "12px" }}>
                                                                                                        Cancelled
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="badge badge-danger p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                                                                                        Status Unknown
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            {/* <div className="boxCenter">
                                                                                                {(data?.status ===
                                                                                                    "Pending" && (
                                                                                                        <span className="badge badge-primary p-2">
                                                                                                            Pending
                                                                                                        </span>
                                                                                                    )) ||
                                                                                                    (data?.status ===
                                                                                                        "Confirmed" && (
                                                                                                            <span className="badge badge-success p-2">
                                                                                                                Confirmed
                                                                                                            </span>
                                                                                                        )) ||
                                                                                                    (data?.status ===
                                                                                                        "Cancelled" && (
                                                                                                            <span className="badge badge-danger p-2">
                                                                                                                Cancelled
                                                                                                            </span>
                                                                                                        )) ||
                                                                                                    (data?.status ===
                                                                                                        "Out Of Delivery" && (
                                                                                                            <span className="badge badge-warning p-2">
                                                                                                                Out Of Delivery
                                                                                                            </span>
                                                                                                        )) ||
                                                                                                    (data?.status ===
                                                                                                        "Delivered" && (
                                                                                                            <span className="badge badge-info p-2">
                                                                                                                Delivered
                                                                                                            </span>
                                                                                                        ))}
                                                                                            </div> */}
                                                                                        </td>
                                                                                        <td
                                                                                            className="my-2"
                                                                                            style={{ width: "280px" }}
                                                                                        >
                                                                                            <span className="d-flex justify-content-center">
                                                                                                {data?.item?.status === "Cancelled" ? (
                                                                                                    // Show cancel icon when data?.status is "Cancelled"
                                                                                                    <button
                                                                                                        className="py-1"
                                                                                                        style={{ backgroundColor: "#FAD5D5", borderRadius: "8px", marginTop: "-2px" }}
                                                                                                    >
                                                                                                        <Cancel />
                                                                                                    </button>

                                                                                                ) : data?.item?.status === "Delivered" ? (
                                                                                                    // Show delivered icon when status is "Delivered"
                                                                                                    <button
                                                                                                        className="py-1"
                                                                                                        style={{ backgroundColor: "#C0E9C0", borderRadius: "8px" }}
                                                                                                    >
                                                                                                        <Delievered />
                                                                                                    </button>

                                                                                                ) : (
                                                                                                    // Show edit button for other statuses
                                                                                                    <button
                                                                                                        className="py-1 me-2 mb-2"
                                                                                                        style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
                                                                                                        onClick={() => {
                                                                                                            dispatch(openDialog({ type: "order", data: data, mainData: mapData }));
                                                                                                        }}
                                                                                                    >
                                                                                                        <Edit />
                                                                                                    </button>
                                                                                                )}
                                                                                            </span>
                                                                                            {/* <div className="">
                                                                                                <Button
                                                                                                    newClass={`themeFont boxCenter userBtn fs-5`}
                                                                                                    btnIcon={`far fa-edit`}
                                                                                                    style={{
                                                                                                        borderRadius: "5px",
                                                                                                        margin: "auto",
                                                                                                        width: "40px",
                                                                                                        backgroundColor: "#fff",
                                                                                                        color: "#160d98",
                                                                                                    }}
                                                                                                    // onClick={() =>
                                                                                                    //     editOpenDialog(
                                                                                                    //         data,
                                                                                                    //         mapData
                                                                                                    //     )
                                                                                                    // }
                                                                                                />
                                                                                            </div> */}
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })}
                                                        </td>
                                                    </tr>
                                                </>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="25" className="text-center">
                                            No Data Found !
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        type={"client"}
                        serverPage={page}
                        setServerPage={setPage}
                        serverPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    /> 
                    {/* {dialogue && dialogueType === "order" && (
                        <EditOrder statusData={sendStatus} />
                    )} */}
                </div>
                {/* <Table
                    data={flattenedOrders}
                    mapData={orderTable}
                    serverPerPage={rowsPerPage}
                    Page={page}
                />
                <Pagination
                    type={"client"}
                    serverPage={page}
                    setServerPage={setPage}
                    serverPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                /> */}
            </div>
            {dialogue && dialogueType === "order" && <EditOrder page={page} rowsPerPage={rowsPerPage} type={type} />}
        </div>
    )
}
export default Order;