import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSalonOrderDetails } from "../../../redux/slice/salonSlice";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "../../extras/Table";
import Title from "../../extras/Title";
import Pagination from "../../extras/Pagination";
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";
import { ReactComponent as Delievered } from "../../../assets/icon/deliever.svg";
import { ReactComponent as Cancel } from "../../../assets/icon/cancel.svg"
import { openDialog } from "../../../redux/slice/dialogueSlice";
const SalonOrder = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);
    const { state } = useLocation();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderType, setOrderType] = useState("All");
    const { salonOrders } = useSelector((state) => state.salon);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const [data, setData] = useState([])
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    useEffect(() => {
        setData(salonOrders)
    }, [salonOrders])
    const orderTypeShowData = [
        // { name: "ALL", value: "ALL" },
        { name: "Pending", value: "Pending" },
        { name: "Confirmed", value: "Confirmed" },
        { name: "Out Of Delivery", value: "Out Of Delivery" },
        { name: "Delivered ", value: "Delivered" },
        { name: "Cancelled ", value: "Cancelled" },
    ];
    useEffect(() => {
        dispatch(getSalonOrderDetails({ salonId: state?.data?._id, start: page, limit: rowsPerPage, status: orderType }))

    }, [state, page, rowsPerPage, orderType]);
    const navigate = useNavigate()
    const handleOrderView = (id) => {
        navigate(`/admin/order/orderDetails`, {
            state: id
        });
    }
    const groupedOrders = salonOrders?.reduce((acc, order) => {
        console.log("orderrr", order)
        const orderData = {
            orderId: order?.orderId,
            userFirstName: order?.userFirstName,
            items: order?.items?.map((item) => ({
                mainImage: item?.mainImage,
                productName: item?.productName,
                productQuantity: item?.item?.productQuantity,
                purchasedTimeProductPrice: item?.item?.purchasedTimeProductPrice,
                purchasedTimeShippingCharges: item?.item?.purchasedTimeShippingCharges,
                status: item?.item?.status,
                orderMainId: order?._id
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
            isGrouped: index === 0,  // Mark the first item to show order ID and user info
            srNo: index === 0 ? srNo : null,  // Only assign serial number to the first item in the group
            orderId: order?.orderId,
            userFirstName: order?.userFirstName,
            ...item,
        }));
    });

    console.log("flattenedOrdersflattenedOrders", flattenedOrders)

    const orderTable = [
        {
            Header: "SR NO",
            Cell: ({ row }) => {
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
            Cell: ({ row }) => (
                row?.isGrouped ? <div>{row?.userFirstName || "-"}</div> : null
            )
        },
        {
            Header: "Items",
            Cell: ({ row }) => (
                <div className="d-flex justify-content-start mb-2">
                    <div>
                        <img src={row?.mainImage} alt="image" />
                    </div>
                    <div className="text-start pl-2">
                        <div>{row?.productName}</div>
                        <div>Quantity: <span>{row?.productQuantity}</span></div>
                        <div>Price: {row?.purchasedTimeProductPrice}</div>
                    </div>
                </div>
            ),
        },
        {
            Header: "Total Price",
            Cell: ({ row }) => (
                <div>{row?.purchasedTimeProductPrice * row?.productQuantity || "-"}</div>
            ),
        },
        {
            Header: "Shipping Charge",
            Cell: ({ row }) => (
                <div>{row?.purchasedTimeShippingCharges || "-"}</div>
            ),
        },
        {
            Header: "Status",
            Cell: ({ row }) => {
                return (
                    <div className="boxCenter">
                        {/* {row?.items?.map((item, index) => {
                            return ( */}
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
                        {/* )
                        })} */}
                    </div>
                );
            }
        },

    ]
    return (
        <> <Title name={"Salon Orders"} />
            <div className="col-2">

                <div className="inputData">
                    <label className="styleForTitle" htmlFor="orderType">
                        Order type
                    </label>
                    <select
                        name="orderType"
                        className="rounded-2 fw-bold"
                        id="orderType"
                        value={orderType}
                        onChange={(e) => {
                            setOrderType(e.target.value);
                        }}
                    >
                        <option value="All" selected>
                            All
                        </option>
                        {orderTypeShowData?.map((data) => {
                            return <option value={data?.value}>{data?.name}</option>;
                        })}
                    </select>
                </div>
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
                totalData={data?.length}
            /> */}
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
                                                                                                                data
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
                                                                                                                data?.productName || "-"
                                                                                                                   
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
                                                                                                                data?.item?.productQuantity || "-"
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
                                                                                                                data?.item?.purchasedTimeProductPrice || "-"
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
                        totalData={data?.length}
                    /> 
                    {/* {dialogue && dialogueType === "order" && (
                        <EditOrder statusData={sendStatus} />
                    )} */}
                </div>
                </div>
        </>
    )
}
export default SalonOrder