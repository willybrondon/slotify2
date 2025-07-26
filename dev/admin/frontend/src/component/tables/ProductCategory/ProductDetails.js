import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation } from "swiper/modules";
import { useLocation } from "react-router-dom";
import { getProductInfo, getProductReview } from "../../../redux/slice/productSlice";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import { Rating } from "@mui/material";



const ProductDetails = () => {
    const { dialogueData } = useSelector((state) => state.dialogue);
    const { productDetails, productReview } = useSelector((state) => state.product);
    const swiperRef = React.useRef(null);
    const { state } = useLocation();
    const dispatch = useDispatch();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [data, setData] = useState([])
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    useEffect(() => {
        setData(productReview)
    }, [productReview])

    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            productId: state?.id
        }
        dispatch(getProductInfo(state?.id))
        dispatch(getProductReview(payload))
    }, [state])
    const CustomPagination = ({ swiper }) => {
        return (
            <div
                className="custom-pagination d-flex align-items-center mt-3"
                style={{ overflowX: "scroll" }}
            >
                {productDetails?.images?.map((img, index) => (
                    <span
                        key={index}
                        className={`custom-pagination-bullet ${index === swiper?.activeIndex
                            ? "custom-pagination-bullet-active"
                            : ""
                            }`}
                        onClick={() => swiper.slideTo(index)}
                    >
                        <img
                            src={img}
                            style={{ width: "95px", height: "95px" }}
                            className="me-2"
                            alt={`Slide ${index}`}
                        />
                    </span>
                ))}
            </div>
        );
    };

    const reviewTable = [
        {
            Header: "No",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },
        {
            Header: "Image",
            Cell: ({ row }) => (
                <img src={row?.userImage} style={{ width: "50px", height: "50px" }} />
            ),
        },
        {
            Header: "First Name",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.fname ? row?.fname : "-"}
                </span>
            ),
        },
        {
            Header: "Last Name",
            Cell: ({ row }) => (
                <span
                    className="text-capitalize fw-bold cursor"
                >
                    {row?.lname ? row?.lname : "-"}
                </span>
            ),
        },
        {
            Header: "Review",
            Cell: ({ row }) => (
                <div>
                    {row?.review ? row?.review : "-"}
                </div>
            ),
        },
        {
            Header: "Rating",
            Cell: ({ row }) => (
                <Rating name="read-only" value={row?.rating} readOnly />
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
    ];

    return (
        <>
            <div className="mainProductDetail mt-2">
                <div className="ProductDetail">
                    <div className="productDetailMain">
                        <div className="card" style={{ margin: "0px 18px" }}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-xl-4 col-md-4 col-12">
                                        <div className=" ">
                                            <Swiper
                                                modules={[Navigation]}
                                                spaceBetween={0}
                                                slidesPerView={1}
                                                navigation
                                                onSwiper={(swiper) => (swiperRef.current = swiper)}
                                            // onSlideChange={() => console.log("slide change")}
                                            >
                                                {productDetails?.images?.map((img, index) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            src={img}
                                                            style={{
                                                                width: "100%",
                                                                height: "550px",
                                                                objectFit: "cover",
                                                                boxSizing: "border-box",
                                                                borderRadius: "0.25rem",
                                                            }}
                                                            alt={`Slide ${index}`}
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            <CustomPagination swiper={swiperRef.current} />

                                            <div className="subImage d-flex m-2 boxCenter"></div>
                                        </div>
                                    </div>
                                    <div className="col-xl-8 col-md-8 col-12">
                                        <div className="details">
                                            <h4 className="">{productDetails?.productName}</h4>
                                            <div className="hstack gap-3 flex-wrap">
                                                <div>
                                                    <p className="text-era d-block mb-0">
                                                        {productDetails?.category?.name}
                                                    </p>
                                                </div>
                                                <div className="vr" />
                                                <div className="text-muted">
                                                    Seller :{" "}
                                                    <span className="text-body fw-medium">
                                                        {productDetails?.seller?.name
                                                            ? productDetails?.seller?.name
                                                            : ""}

                                                    </span>
                                                </div>
                                                <div className="vr" />
                                                <div className="text-muted">

                                                    <span className="text-body fw-medium">
                                                        {productDetails?.isOutOfStock === false ? (
                                                            <>
                                                                <span className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0" }}>
                                                                    In Stock
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="badge badge-danger p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0" }}>
                                                                    Out Of Stock
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="vr" />
                                                <div className="text-muted">
                                                    Product Code :{" "}
                                                    <span className="text-body fw-medium">
                                                        {productDetails?.productCode}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
                                                <Rating
                                                    name="read-only"
                                                    value={productDetails[0]?.rating} precision={0.5} readOnly

                                                />
                                                <div className="text-muted">
                                                    {"(" +
                                                        productDetails?.review +
                                                        " Customer Review )"}
                                                </div>
                                            </div>

                                            <div className="row mt-4">
                                                <div className="col-lg-3 col-sm-6 mt-2">
                                                    <div className=" p-2 border border-dashed rounded">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-2">
                                                                <div className="avatar-title rounded bg-transparent text-era mx-2 fs-24">
                                                                    <i className="fa fa-dollar" style={{ color: "#1C2B20" }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <p
                                                                    className="text-muted mb-1"
                                                                    style={{ fontSize: "13px" }}
                                                                >
                                                                    Price :
                                                                </p>
                                                                <div className="mb-0 fw-bold text-muted" style={{ fontSize: "17px" }}>
                                                                    $
                                                                    {productDetails?.price
                                                                        ? " " + productDetails?.price
                                                                        : ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-sm-6 mt-2">
                                                    <div className="p-2 border border-dashed rounded">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-2">
                                                                <div className="avatar-title rounded bg-transparent text-era mx-2 fs-24">
                                                                    <i className="bi bi-cart4" style={{ color: "#1C2B20" }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <p
                                                                    className="text-muted mb-1"
                                                                    style={{ fontSize: "13px" }}
                                                                >
                                                                    Shipping Charge :
                                                                </p>
                                                                <div className="mb-0 fw-bold text-muted" style={{ fontSize: "17px" }}>
                                                                    $
                                                                    {productDetails?.shippingCharges
                                                                        ? " " + productDetails?.shippingCharges
                                                                        : ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-sm-6 mt-2">
                                                    <div className="p-2 border border-dashed rounded">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-2">
                                                                <div className="avatar-title rounded bg-transparent text-era mx-2 fs-24">
                                                                    <i className="bi bi-bag-check" style={{ color: "#1C2B20" }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <p
                                                                    className="text-muted mb-1"
                                                                    style={{ fontSize: "13px" }}
                                                                >
                                                                    Sold :
                                                                </p>
                                                                <h5 className="mb-0 fw-bold text-muted" style={{ fontSize: "17px" }}>
                                                                    {productDetails?.sold}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-lg-3 col-sm-6 mt-2">
                                                    {/* <div className="p-2 border border-dashed rounded">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-2">
                                                                <div className="avatar-title rounded bg-transparent text-era mx-2 fs-24">
                                                                    <i className="bi bi-bookmark-check fs-5" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <p
                                                                    className="text-muted mb-1"
                                                                    style={{ fontSize: "13px" }}
                                                                >
                                                                    Tag :
                                                                </p>
                                                                <h5 className="mb-0 fw-bold text-muted fs-6">
                                                                    {productDetailsseller?.businessTag}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </div>

                                            </div>
                                            <div className="row">
                                                {productDetails?.attributes?.map((s) => {
                                                    return (
                                                        <div className="col-6">
                                                            <div className="attribute-section">
                                                                <span className="fw-bold">{s?.name} : </span>
                                                                <div className="badge-container">
                                                                    {s.value.length > 0 ? (
                                                                        s.value.map((d, index) => {
                                                                            return (
                                                                                <div key={index} className="badge-wrapper">
                                                                                    <span className="badge-custom">{d}</span>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <span>-</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 ">
                                                <h5
                                                    className="fs-14 fw-bold"
                                                    style={{ fontSize: "16px" }}
                                                >
                                                    Description :
                                                </h5>
                                                <p style={{ fontSize: "14px" }} className="text-muted">
                                                    {productDetails?.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 col-12">
                                        <div className="userReview mt-4 ">
                                            <h5 className="p-title pb-2">Product Review</h5>

                                        </div>
                                        <div>
                                            <Table
                                                data={data}
                                                mapData={reviewTable}
                                                serverPerPage={rowsPerPage}
                                                type={"server"}
                                            />
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
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div></>
    )
}
export default ProductDetails;