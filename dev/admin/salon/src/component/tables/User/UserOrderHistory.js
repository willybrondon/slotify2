import { useEffect, useState } from "react"
import Button from "../../extras/Button"
import Pagination from "../../extras/Pagination"
import Table from "../../extras/Table"
import Title from "../../extras/Title"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { openDialog } from "../../../redux/slice/dialogueSlice"
import { ReactComponent as Edit } from "../../../assets/icon/edit.svg";

import { getProductOrderHistory } from "../../../redux/slice/productSlice"

const UserOrderHistory = () => {

    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const { product, total, status, productOrderHistory } = useSelector((state) => state.product)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [statusType, setStatusType] = useState("All")
    const { state } = useLocation()
    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            status: statusType,
            userId: state?.id
        }
        dispatch(getProductOrderHistory(payload))
        // dispatch(getAllProduct(payload))
    }, [page, rowsPerPage, statusType]);
    useEffect(() => {
        setData(productOrderHistory)
    }, [productOrderHistory]);
    useEffect(() => {
        setData(status)
    }, [status]);

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    const handleOrderView = (id) => {
        navigate(`/admin/order/orderDetails`, {
            state: id
        });
    }
    const groupedOrders = productOrderHistory?.reduce((acc, order) => {
        console.log("orderrrr", order)
        const orderData = {
            orderId: order?.orderId,

            firstName: order?.userId?.fname,
            lastName: order?.userId?.lname,

            items: order?.items?.map((item) => ({
                mainImage: item?.product?.mainImage,
                productName: item?.product?.productName,
                productQuantity: item?.productQuantity,
                purchasedTimeProductPrice: item?.purchasedTimeProductPrice,
                purchasedTimeShippingCharges: item?.purchasedTimeShippingCharges,
                status: item?.status,
                itemId: item?._id,
                userId: order?.userId?._id,
                orderMainId: order?._id,
            })),
        };
        acc.push(orderData);
        console.log("Acccccccc", acc)
        return acc;
    }, []);
    console.log("groupedOrdersgroupedOrders", groupedOrders, data)
    // Flattening for pagination
    const flattenedOrders = groupedOrders?.flatMap((order, orderIndex) => {
        console.log("orderrr", order)
        // Maintain a counter for the serial number
        let srNo = orderIndex + 1;
        return order?.items?.map((item, index) => ({
            isGrouped: index === 0,  // Mark the first item to show order ID and user info
            srNo: index === 0 ? srNo : null,  // Only assign serial number to the first item in the group
            orderId: order?.orderId,
            firstName: order?.firstName,
            lastName: order?.lastName,
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
            Cell: ({ row }) =>
                row?.isGrouped ? <div>{row?.firstName + " " + row?.lastName ? row?.firstName + " " + row?.lastName : "-"}</div> : null
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
            Header: "Total Price",
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
    ]

    return (
        <div className="mainCategory">
            <Title name="Product" />
            <div className="row ">
                <div className="mt-2 col-4">
                    <div className="inputData">
                        <label className="styleForTitle" htmlFor="paymentType">
                            Status type
                        </label>
                        <div className="d-flex justify-content-start  gap-2">
                            <Button
                                className="bg-secondary text-white p5-y"
                                onClick={() => {
                                    setStatusType("All")
                                }}
                                text={`All`}
                            />
                            <Button
                                className="bg-info text-white p5-y"
                                onClick={() => {
                                    setStatusType("Pending")
                                }}
                                text={`Pending`}
                            />
                            <Button
                                className="bg-primary text-white p5-y"
                                onClick={() => {
                                    setStatusType("Confirmed")
                                }}
                                text={`Confirmed`}
                            />
                            <Button
                                className="text-white p5-y"
                                style={{ backgroundColor: "#1C2B20" }}
                                onClick={() => {
                                    setStatusType("Out Of Delivery")
                                }}
                                text={`Out Of Delivery`}
                            />
                            <Button
                                className="bg-danger text-white p5-y"
                                onClick={() => {
                                    setStatusType("Cancelled")
                                }}
                                text={`Cancelled`}
                            />
                        </div>
                    </div>
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
                                                                        {mapData?.userId?.fname
                                                                            ? mapData?.userId?.fname + " "
                                                                            : "multi" + " "}
                                                                        {mapData?.userId?.lname
                                                                            ? mapData?.userId?.lname
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
                                                                                                                data?.product?.productName || "-"

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
                                                                                                                data?.productQuantity || "-"
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
                                                                                                                data?.purchasedTimeProductPrice || "-"
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
                />
                <Pagination
                    type={"server"}
                    serverPage={page}
                    setServerPage={setPage}
                    serverPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    totalData={total}
                /> */}
            </div>
        </div>
    )
}
export default UserOrderHistory