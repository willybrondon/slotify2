import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductsDetails, getProductsRating } from "../../../redux/slice/productSlice";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Navigation } from "swiper/modules";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";


const ProductDetails = () => {
    const dispatch = useDispatch()
    const { state } = useLocation();
    const { productDetails, productRating ,total} = useSelector((state) => state.product);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const [data, setData] = useState([]);
    useEffect(() => {
        setData(productRating)
    }, [productRating])

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    useEffect(() => {
        dispatch(getProductsDetails(state?.id))
    }, []);
    useEffect(() => {
        const payload = {
            start: page,
            limit: rowsPerPage,
            productId: state?.id
        };
        dispatch(getProductsRating(payload))
    }, [page, rowsPerPage, state?.id])
    const swiperRef = React.useRef(null);
    const CustomPagination = ({ swiper }) => {
        return (
            <div
                className="custom-pagination d-flex align-items-center mt-3"
                style={{ overflowX: "scroll" }}
            >
                {productDetails?.[0]?.images?.map((img, index) => (
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
                                            >
                                                {productDetails?.[0]?.images?.map((img, index) => (
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
                                            <h4 className="">{productDetails?.[0]?.productName}</h4>
                                            <div className="hstack gap-3 flex-wrap">
                                                <div>
                                                    <p className="text-era d-block mb-0">
                                                        {productDetails?.[0]?.category?.name}
                                                    </p>
                                                </div>
                                                <div className="vr" />
                                                <div className="text-muted">
                                                    Seller :{" "}
                                                    <span className="text-body fw-medium">
                                                        {productDetails[0]?.seller?.name
                                                            ? productDetails[0]?.seller?.name
                                                            : ""}

                                                    </span>
                                                </div>
                                                <div className="vr" />
                                                <div className="text-muted">

                                                    <span className="text-body fw-medium">
                                                        {productDetails[0]?.isOutOfStock === false ? (
                                                            <>
                                                                <span className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0" }}>
                                                                    In Stock
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="badge badge-danger p-2">
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
                                                        {productDetails[0]?.productCode}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-wrap gap-2 align-items-center mt-3">

                                                <div className="text-muted">
                                                    {"(" +
                                                        productDetails[0]?.review +
                                                        " Customer Review )"}
                                                </div>
                                            </div>

                                            <div className="row mt-4">
                                                <div className="col-lg-3 col-sm-6 mt-2">
                                                    <div className=" p-2 border border-dashed rounded">
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-sm me-2">
                                                                <div className="avatar-title rounded bg-transparent text-era mx-2 fs-24">
                                                                    <i className="fa fa-dollar" style={{ color: "#B93160" }} />
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
                                                                    {productDetails[0]?.price
                                                                        ? " " + productDetails[0]?.price
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
                                                                    <i className="bi bi-cart4" style={{ color: "#B93160" }} />
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
                                                                    {productDetails[0]?.shippingCharges
                                                                        ? " " + productDetails[0]?.shippingCharges
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
                                                                    <i className="bi bi-bag-check" style={{ color: "#B93160" }} />
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
                                                                    {productDetails[0]?.sold}
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
                                                                    {productDetails[0]?.seller?.businessTag}
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </div>

                                            </div>
                                            <div className="row mt-2">
                                                {productDetails[0]?.attributes?.map((s) => {
                                                    return (
                                                        <>
                                                            <div className="col-6">
                                                                <div className="sizes my-3 me-2">
                                                                    <span className="fw-bold">{s?.name} : </span>{" "}
                                                                    <br />
                                                                    <div className="row">
                                                                        {s.value.length > 0 ? (
                                                                            <>
                                                                                {s.value.map((d) => {
                                                                                    return (
                                                                                        <>
                                                                                            <div
                                                                                                className="col-xl-3 col-md-4 col-6 mt-2"
                                                                                                style={{ marginRight: "10px" }}
                                                                                            >
                                                                                                <span
                                                                                                    className="badge text-light  py-2"
                                                                                                    style={{
                                                                                                        backgroundColor: "#b93160",
                                                                                                        fontSize: "13px",
                                                                                                        width: "95px",
                                                                                                    }}
                                                                                                >
                                                                                                    {d}
                                                                                                </span>
                                                                                            </div>
                                                                                        </>
                                                                                    );
                                                                                })}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span>-</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
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
                                                    {productDetails[0]?.description}
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
                                        <Table
                                            data={data}
                                            // mapData={expertTable}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div></>
    )
}
export default ProductDetails;