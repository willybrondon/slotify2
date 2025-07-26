import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import { getOrder, updateOrderStatus } from "../../../redux/slice/orderSlice";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Button from "../../extras/Button";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";
import { closeDialog, openDialog } from "../../../redux/slice/dialogueSlice";
import Input, { ExInput } from "../../extras/Input";
import EditOrder from "./EditOrder";
import { ReactComponent as Delievered } from "../../../assets/icon/deliever.svg";
import { ReactComponent as Cancel } from "../../../assets/icon/cancel.svg"

const Order = () => {
    const [type, setType] = useState("All");
    const { ordersData, total } = useSelector((state) => state.ordersData);
    const orderType = [
        { name: "Pending", value: "Pending" },
        { name: "Confirmed", value: "Confirmed" },
        { name: "Out Of Delivery", value: "Out Of Delivery" },
        { name: "Delivered ", value: "Delivered" },
        { name: "Cancelled ", value: "Cancelled" },
    ];
    const { setting } = useSelector((state) => state.setting)

    const [data, setData] = useState([]);
    const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
    const dispatch = useDispatch()
    useEffect(() => {
        setData(ordersData)
    }, [ordersData])
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    useEffect(() => {
        const payload = {
            start: page, limit: rowsPerPage, status: type
        }
        dispatch(getOrder(payload))
    }, [type, page]);
    const navigate = useNavigate()
    const handleOrderView = (id) => {
        navigate(`/admin/order/orderDetails`, {
            state: id
        });
    }



    const groupedOrders = ordersData?.reduce((acc, order) => {
        const existingOrderIndex = acc.findIndex(
            (item) => item.orderId === order.orderId
        );
        const orderData = {
            orderId: order?.orderId,

            firstName: order?.userId?.fname,
            lastName: order?.userId?.lname,
            finalTotal: order?.finalTotal,

            items: order?.items?.map((item) => ({
                mainImage: item?.product?.mainImage,
                productName: item?.product?.productName,
                productQuantity: item?.productQuantity,
                purchasedTimeProductPrice: item?.purchasedTimeProductPrice,
                purchasedTimeShippingCharges: item?.purchasedTimeShippingCharges,
                commissionPerProductQuantity: item?.commissionPerProductQuantity,
                status: item?.status,
                itemId: item?._id,
                userId: order?.userId?._id,
                orderMainId: order?._id,
            })),
        };
        if (existingOrderIndex >= 0) {
            // If order already exists, push the new items
            acc[existingOrderIndex].items.push(...orderData.items);
        } else {
            // If new order, push to the accumulator
            acc.push(orderData);
        }
        return acc;
    }, []);
        
    // Flattening for pagination
    const flattenedOrders = groupedOrders?.flatMap((order, orderIndex) => {
        // Maintain a counter for the serial number
        let srNo = orderIndex + 1;
        return order?.items?.map((item, index) => ({
            isGrouped: index === 0,  // Mark the first item to show order ID and user info
            srNo: index === 0 ? srNo : null,  // Only assign serial number to the first item in the group
            orderId: order?.orderId,
            firstName: order?.firstName,
            lastName: order?.lastName,
            finalTotal: order?.finalTotal,
            ...item,
        }));
    });


    const orderTable = [
        {
            Header: "SR NO",
            Cell: ({ row, index }) => {
                if (row?.isGrouped && row?.srNo) {
                    return <span>{page * rowsPerPage + parseInt(index) + 1}</span>; // Use the srNo generated above
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
            Header: `Price (${setting?.currencySymbol})`,
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
                                style={{ backgroundColor: "#FAD5D5", borderRadius: "8px",marginTop:"-12px" }}
                            >
                                <Cancel />
                            </button>
                           
                        ) : status === "Delivered" ? (
                            // Show delivered icon when status is "Delivered"
                            <button
                                className="py-1"
                                style={{ backgroundColor: "#C0E9C0", borderRadius: "8px",marginTop:"-12px" }}
                            >
                                <Delievered />
                            </button>

                        ) : (
                            // Show edit button for other statuses
                            <button
                                className="py-1 mt-2"
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
                        name="bookingType"
                        className="rounded-2 fw-bold"
                        id="bookingType"
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
                                                                        {mapData?.userId?.fname
                                                                            ? mapData?.userId?.fname + " "
                                                                            : "multi" + " "}
                                                                        {mapData?.userId?.lname
                                                                            ? mapData?.userId?.lname
                                                                            : "User"}
                                                                    </b>
                                                                </span>
                                                                <br />
                                                                <span>
                                                                    {mapData?.userId?.uniqueId
                                                                        ? mapData?.userId?.uniqueId
                                                                        : "-"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td
                                                            colSpan={6}
                                                            style={{ width: "70%" }}
                                                            className="py-0"
                                                        >
                                                            {mapData?.items.map((data) => {
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
                                                                                                                    data?.product
                                                                                                                        ?.mainImage
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
                                                                                                                data.product
                                                                                                                    ?.productName
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
                                                                                                                data?.productQuantity
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
                                                                                                                data?.purchasedTimeProductPrice
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
                                                                                                    {data?.purchasedTimeProductPrice *
                                                                                                        data?.productQuantity || "-"}
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
                                                                                                        data?.purchasedTimeShippingCharges || "-"
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
                                                                                                {data?.status === "Pending" ? (
                                                                                                    <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                                                                                        Pending
                                                                                                    </div>
                                                                                                ) : data?.status === "Confirmed" ? (
                                                                                                    <div className="badge badge-success p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                                                                                        Confirmed
                                                                                                    </div>
                                                                                                ) : data?.status === "Out Of Delivery" ? (
                                                                                                    <div className="badge badge-warning p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                                                                                        Out Of Delivery
                                                                                                    </div>
                                                                                                ) : data?.status === "Delivered" ? (
                                                                                                    <div className="badge badge-info p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                                                                                        Delivered
                                                                                                    </div>
                                                                                                ) : data?.status === "Cancelled" ? (
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
                                                                                                {data?.status === "Cancelled" ? (
                                                                                                    // Show cancel icon when data?.status is "Cancelled"
                                                                                                    <button
                                                                                                        className="py-1"
                                                                                                        style={{ backgroundColor: "#FAD5D5", borderRadius: "8px", marginTop: "-2px" }}
                                                                                                    >
                                                                                                        <Cancel />
                                                                                                    </button>

                                                                                                ) : data?.status === "Delivered" ? (
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
                        type={"server"}
                        serverPage={page}
                        setServerPage={setPage}
                        serverPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        totalData={total}
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
                /> */}
                {/* <Pagination
                    type={"server"}
                    serverPage={page}
                    setServerPage={setPage}
                    serverPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    totalData={total}
                /> */}
            </div>
            {dialogue && dialogueType === "order" && (
                <EditOrder page={page} rowsPerPage={rowsPerPage} type={type} />
            )}
        </div>
    )
}
export default Order;