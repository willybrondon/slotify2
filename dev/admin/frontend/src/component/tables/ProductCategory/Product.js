import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProduct, getAllProduct, getProductInfo, getStatusWiseData, updateOutOfStockProduct } from "../../../redux/slice/productSlice";
import Title from "../../extras/Title";
import male from "../../../assets/images/male.png";
import ToggleSwitch from "../../extras/ToggleSwitch";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import ProductDialogue from "../ProductCategory/productDialogue";
import { useNavigate } from "react-router-dom";
import {  warning } from "../../../util/Alert";
import { toast } from "react-toastify";
import Button from "../../extras/Button";

const Product = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const { product, total, status } = useSelector((state) => state.product)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
    const [statusType, setStatusType] = useState("All")
  ;

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            status: statusType
        }
        dispatch(getAllProduct(payload))
    }, [page, rowsPerPage, statusType]);
    useEffect(() => {
        setData(product)
    }, [product]);
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

    function openImage(imageUrl) {
        window.open(imageUrl, "_blank");
    }
    const handleInfo = (id) => {
        navigate("/admin/product/productTableDetails", {
            state: {
                id,
            },
        });
    };

    const expertTable = [
        {
            Header: "No",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },
        {
            Header: "Product Code",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.productCode ? row?.productCode : "-"}
                </span>
            ),
        },
        {
            Header: "Name",
            Cell: ({ row }) =>
            (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.productName ? row?.productName : " "}
                </span>
            ),
        },
        {
            Header: "Brand",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.brand ? row?.brand : "-"}
                </span>
            ),
        },
        {
            Header: "Category",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.category?.name ? row?.category?.name : "-"}
                </span>
            ),
        },
        {
            Header: "Image",
            Cell: ({ row }) => (
                <div
                    className="userProfile"
                    style={{ height: "70px", width: "70px", overflow: "hidden" }}
                >
                    <img
                        src={row && row.mainImage ? row.mainImage : male}
                        alt="image"
                        className="cursor-pointer"
                        onClick={() => openImage(row && row.mainImage)}
                        height={`100%`}
                        onError={(e) => {
                            e.target.src = male;
                        }}
                    />
                </div>
            ),
        },

        {
            Header: "Price",
            Cell: ({ row }) => <span>{row?.price ? row?.price : "-"}</span>,
        },
        {
            Header: "Mrp",
            Cell: ({ row }) => <span>{row?.mrp ? row?.mrp : "-"}</span>,
        },
        {
            Header: "Shipping Charges",
            Cell: ({ row }) => <span>{row?.shippingCharges ? row?.shippingCharges : "-"}</span>,
        },
        {
            Header: "Status",
            Cell: ({ row }) => {
                return (
                    <div className="mb-2"> {/* Add margin for spacing */}
                        {row?.createStatus
                            === "Pending" ? (
                            <div className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
                                Pending
                            </div>
                        ) : row?.createStatus
                            === "Approved" ? (
                            <div className="badge badge-success p-2" style={{ color: "#EB8213", backgroundColor: "#F5DDC3", fontSize: "12px" }}>
                                Approved
                            </div>
                        ) : row?.createStatus
                            === "Rejected" ? (
                            <div className="badge badge-warning p-2" style={{ color: "#FF1B1B", backgroundColor: "#FAD5D5", fontSize: "12px" }}>
                                Rejected
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
            Header: "Is OutOfStock",
            body: "isOutOfStock",
            sorting: { type: "client" },
            Cell: ({ row }) =>
            (
                <ToggleSwitch
                    value={row?.isOutOfStock}
                    onClick={() => {
          
                        dispatch(updateOutOfStockProduct({ productId: row?._id, type: "outofstock" })).then((res) => {
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message);
                                const payload = {
                                    start: page,
                                    limit: rowsPerPage,
                                    status: statusType
                                }
                                dispatch(getAllProduct(payload))
                            } else {
                                toast.error(res?.payload?.message);
                            }
                        })
                    }}
                />
            ),
        },

        {
            Header: "Is Trending",
            body: "isTrending",
            sorting: { type: "client" },
            Cell: ({ row }) => (
                <ToggleSwitch
                    value={row?.isTrending}
                    onClick={() => {
          
                        dispatch(updateOutOfStockProduct({ productId: row?._id, type: "trending" })).then((res) => {
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message);
                                const payload = {
                                    start: page,
                                    limit: rowsPerPage,
                                    status: statusType
                                }
                                dispatch(getAllProduct(payload))
                            } else {
                                toast.error(res?.payload?.message);
                            }
                        })
                    }}
                />
            ),
        },
        {
            Header: "Is New Collection",
            body: "isNewCollection",
            sorting: { type: "client" },
            Cell: ({ row }) => (
                <ToggleSwitch
                    value={row?.isNewCollection}
                    onClick={() => {
          
                        dispatch(updateOutOfStockProduct({ productId: row?._id, type: "new" })).then((res) => {
                            if (res?.payload?.status) {
                                toast.success(res?.payload?.message);
                                const payload = {
                                    start: page,
                                    limit: rowsPerPage,
                                    status: statusType
                                }
                                dispatch(getAllProduct(payload))
                            } else {
                                toast.error(res?.payload?.message);
                            }
                        })
                    }}
                />
            ),
        },
        {
            Header: "Action",
            Cell: ({ row }) => (
                <span className="d-flex justify-content-center">
                    <button
                        className="py-1 me-2"
                        style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
                        onClick={() => {
                            dispatch(openDialog({ type: "product", data: row }))
                        }}
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 26 26"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15.0377 7.22744L5.50073 16.7652C5.4527 16.8133 5.41848 16.8735 5.40162 16.9394L4.34449 21.1823C4.32895 21.2453 4.3299 21.3112 4.34726 21.3737C4.36462 21.4362 4.3978 21.4931 4.4436 21.5391C4.51395 21.6092 4.6092 21.6486 4.70852 21.6487C4.73916 21.6487 4.76968 21.6449 4.79939 21.6374L9.04235 20.5801C9.10832 20.5636 9.16854 20.5294 9.21656 20.4812L18.7545 10.9441L15.0377 7.22744ZM21.1172 5.92698L20.0556 4.86538C19.346 4.15585 18.1094 4.15655 17.4006 4.86538L16.1002 6.16585L19.8168 9.88235L21.1172 8.58193C21.4716 8.22765 21.6668 7.75607 21.6668 7.25454C21.6668 6.75301 21.4716 6.28143 21.1172 5.92698Z"
                                fill="#059CF1"
                            />
                        </svg>
                    </button>
                </span>
            ),
        },
        {
            Header: "Info",
            Cell: ({ row }) => (
                <span>
                    <button
                        className="py-1"
                        style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
                        onClick={() => handleInfo(row._id)}
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
            Header: "Delete",
            Cell: ({ row }) => (
              <span className="d-flex">
                <button
                  className="py-1"
                  style={{ backgroundColor: "#FFF1F1", borderRadius: "8px" }}
                  onClick={() => handleDelete(row?._id)}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 26 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.9062 5.6875H16.25V5.28125C16.25 4.16122 15.3388 3.25 14.2188 3.25H11.7812C10.6612 3.25 9.75 4.16122 9.75 5.28125V5.6875H6.09375C5.87826 5.6875 5.6716 5.7731 5.51923 5.92548C5.36685 6.07785 5.28125 6.28451 5.28125 6.5V7.71875C5.28125 7.93424 5.36685 8.1409 5.51923 8.29327C5.6716 8.44565 5.87826 8.53125 6.09375 8.53125H19.9062C20.1217 8.53125 20.3284 8.44565 20.4808 8.29327C20.6331 8.1409 20.7188 7.93424 20.7188 7.71875V6.5C20.7188 6.28451 20.6331 6.07785 20.4808 5.92548C20.3284 5.7731 20.1217 5.6875 19.9062 5.6875ZM11.375 5.28125C11.375 5.05741 11.5574 4.875 11.7812 4.875H14.2188C14.4426 4.875 14.625 5.05741 14.625 5.28125V5.6875H11.375V5.28125ZM19.6137 9.60984C19.5376 9.52606 19.4448 9.45912 19.3412 9.4133C19.2377 9.36747 19.1257 9.34379 19.0125 9.34375H6.9875C6.87427 9.3438 6.7623 9.36751 6.65877 9.41335C6.55524 9.4592 6.46242 9.52616 6.38628 9.60996C6.31013 9.69376 6.25233 9.79254 6.21657 9.89997C6.18082 10.0074 6.1679 10.1211 6.17866 10.2338L7.17722 20.6696C7.29056 21.8558 8.33422 22.7504 9.60497 22.7504H16.395C17.6654 22.7504 18.7094 21.8558 18.8228 20.6696L19.8213 10.2338C19.8321 10.1211 19.8193 10.0074 19.7835 9.8999C19.7477 9.79244 19.6899 9.69364 19.6137 9.60984ZM11.1012 20.7171C11.0837 20.7179 11.0667 20.7187 11.0492 20.7187C10.8427 20.7185 10.644 20.6397 10.4936 20.4983C10.3431 20.3569 10.2521 20.1635 10.2391 19.9574L9.75163 12.2387C9.73816 12.0237 9.81061 11.8121 9.95306 11.6504C10.0955 11.4888 10.2963 11.3903 10.5113 11.3766C10.7262 11.3636 10.9376 11.4362 11.0991 11.5786C11.2607 11.7209 11.3593 11.9215 11.3734 12.1363L11.8609 19.8551C11.8743 20.0701 11.8019 20.2817 11.6594 20.4433C11.517 20.605 11.3162 20.7034 11.1012 20.7171ZM15.7609 19.9574C15.7547 20.0643 15.7274 20.1689 15.6807 20.2652C15.634 20.3615 15.5686 20.4477 15.4885 20.5186C15.4084 20.5896 15.315 20.6441 15.2138 20.6789C15.1125 20.7137 15.0054 20.7281 14.8985 20.7213C14.7917 20.7146 14.6872 20.6868 14.5912 20.6396C14.4951 20.5923 14.4093 20.5266 14.3388 20.4461C14.2682 20.3656 14.2142 20.2719 14.18 20.1705C14.1457 20.0691 14.1318 19.9619 14.1391 19.8551L14.6266 12.1363C14.6413 11.9221 14.7401 11.7223 14.9016 11.5807C15.0631 11.4392 15.2741 11.3673 15.4884 11.3808C15.7028 11.3944 15.903 11.4922 16.0454 11.6529C16.1878 11.8137 16.2608 12.0243 16.2484 12.2387L15.7609 19.9574Z"
                      fill="#ED1717"
                    />
                  </svg>
                </button>
              </span>
            ),
          },
    ];


      const handleDelete = (productId) => {
    
        const data = warning("Delete");
        data
          .then((logouts) => {
            const yes = logouts.isConfirmed;
            if (yes) {
              dispatch(deleteProduct(productId));
            }
          })
          .catch((err) => console.log(err));
      };


    const statusTypeData = [
        { name: "PENDING", value: "Pending" },
        { name: "APPROVED", value: "Approved" },
        { name: "REJECTED", value: "Rejected" },
    ]
    return (
        <div className="mainCategory">
            <Title name="Product" />
            <div className="row ">
                <div className="mt-2 col-2">
                    <div className="inputData">

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
                                    setStatusType("Approved")
                                }}
                                text={`Approved`}
                            />
                            <Button
                                className="bg-danger text-white p5-y"
                                onClick={() => {
                                    setStatusType("Rejected")
                                }}
                                text={`Rejected`}
                            />
                        </div>
                        {/* <select
                            name="statusType"
                            className="rounded-2 fw-bold"
                            id="statusType"
                            value={statusType}
                            onChange={(e) => {
                                const selectedStaus = e.target.value;
                                const payload = {
                                    status: selectedStaus,
                                    start: page,
                                    limit: rowsPerPage,
                                }
                                dispatch(getStatusWiseData(payload))
                                setStatusType(e.target.value);
                            }}
                        >
                            <option value="All" selected>
                                ALL
                            </option>
                            {statusTypeData?.map((data) => {
                                return <option value={data?.value}>{data?.name}</option>;
                            })}
                        </select> */}
                    </div>
                </div>

            </div>

            <div>
                <Table
                    data={data}
                    mapData={expertTable}
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
                />
            </div>
            {dialogue && dialogueType === "product" && (
                <ProductDialogue
                    setData={setData}
                    data={data}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    statusType={statusType}
                />
            )}
        </div>
    )
}
export default Product;