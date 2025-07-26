import React, { useEffect, useState } from "react";
import { ExInput, Textarea } from "../../extras/Input";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import {
  getSalonDetail,
  getSalonOrderDetails,
  getSalonProductDetails,
  getSalonReview,
  salonReviewDelete,
} from "../../../redux/slice/salonSlice";
import { useLocation } from "react-router-dom";
import Table from "../../extras/Table";
import { Rating } from "react-simple-star-rating";
import {  warning } from "../../../util/Alert";
import moment from "moment";
import { isLoading } from "../../../util/allSelector";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ReactComponent as Delete } from "../../../assets/icon/delete.svg";
import dayjs from "dayjs";
import Pagination from "../../extras/Pagination";

const SalonProfile = () => {
  const { salonDetail, review, salonProduct, total } = useSelector((state) => state.salon);
  const { setting } = useSelector((state) => state.setting);
;
  const loader = useSelector(isLoading);

  const state = useLocation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderType, setOrderType] = useState("All");
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  const [type, setType] = useState("address");
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [serviceData, setServiceData] = useState([]);
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    dispatch(getSalonDetail(state?.state?.id));
    dispatch(getSalonReview(state?.state?.id));
    dispatch(getSalonProductDetails({ salonId: state?.state?.id, start: page, limit: rowsPerPage }))
  }, [dispatch, state, page, rowsPerPage, type]);
  // useEffect(() => {
  //   dispatch(getSalonOrderDetails({ salonId: state?.state?.id, start: page, limit: rowsPerPage, status: orderType }))

  // }, [dispatch, state, page, rowsPerPage, type, orderType]);
  const orderTypeShowData = [
    // { name: "ALL", value: "ALL" },
    { name: "Pending", value: "Pending" },
    { name: "Confirmed", value: "Confirmed" },
    { name: "Out Of Delivery", value: "Out Of Delivery" },
    { name: "Delivered ", value: "Delivered" },
    { name: "Cancelled ", value: "Cancelled" },
  ];

  useEffect(() => {
    if (salonDetail) {
      setData(review);
    } else {
      setData("");
    }
  }, [review]);

  useEffect(() => {
    if (salonDetail?.serviceIds) {
      setServiceData(salonDetail?.serviceIds);
    } else {
      setServiceData("");
    }
  }, [salonDetail?.serviceIds]);
  useEffect(() => {
    setProductData(salonProduct)
  }, [salonProduct])


  const reviewTable = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: "Rating",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold cursor">
          <Rating
            initialValue={row?.rating}
            readonly={true}
            allowFraction
            size="25px"
            fillColor="#ffc632"
          />
        </span>
      ),
    },
    {
      Header: "Review",
      Cell: ({ row }) => <span>{row?.review ? row?.review : "-"}</span>,
    },
    {
      Header: "CreatedAt",
      body: "createdAt",
      sorting: { type: "client" },
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt && moment(row.createdAt).format("YYYY-MM-DD")}
        </span>
      ),
    },

    {
      Header: "Delete",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1"
            style={{ backgroundColor: "#FFF1F1", borderRadius: "5px" }}
            onClick={() => handleDelete(row?._id)}
          >
            <Delete />
          </button>
        </span>
      ),
    },
  ];
  const serviceTable = [
    {
      Header: "No",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.id?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.id?.name}</span>
      ),
    },
    {
      Header: `Price ( ${setting?.currencySymbol} )`,
      Cell: ({ row }) => <span className="text-capitalize">{row?.price}</span>,
    },

    {
      Header: "Duration",
      Cell: ({ row }) => <span>{row?.id?.duration + " min"}</span>,
    },
  ];

  const handleDelete = async (id) => {
    try {
      const data = await warning("Delete");
      const yes = data?.isConfirmed;
      if (yes) {
        dispatch(salonReviewDelete(id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const iframeData = document.getElementById("iframeId");

    if (iframeData) {
      iframeData.src = `https://maps.google.com/maps?q=${salonDetail?.locationCoordinates?.latitude},${salonDetail?.locationCoordinates?.longitude}&hl=es;&output=embed`;
    }
  }, [salonDetail]);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const productTableData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      )
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
      Header: "Price",
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
            <span className="badge badge-success p-2" style={{ color: "#008036", backgroundColor: "#DAF4F0", fontSize: "12px" }}>
              {row.createStatus}
            </span>
          </span>
        </div>
      ),
    },
    // add more columns as needed
  ];

  return (
    <div className="p-3">
      <Title
        name={`${capitalizeFirstLetter(salonDetail?.name || "")}'s profile`}
        className="title"
      />
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-lg-4 col-md-6 col-12">
              {loader === true ? (
                <>
                  <SkeletonTheme
                    baseColor="#e2e5e7"
                    highlightColor="#fff"
                  >
                    <p className="d-flex justify-content-center ">
                      <Skeleton
                        height={380}
                        width={380}
                        style={{
                          height: "380px",
                          width: "380px",
                          objectFit: "cover",
                          boxSizing: "border-box",
                          borderRadius: "30px",
                        }}
                      />
                    </p>
                  </SkeletonTheme>
                </>
              ) : (
                <img
                  src={salonDetail?.mainImage}
                  className="img-fluid"
                  style={{
                    height: "380px",
                    width: "380px",
                    objectFit: "cover",
                    boxSizing: "border-box",
                    borderRadius: "30px",
                  }}
                  alt=""
                />
              )}
            </div>
            <div className="col-lg-8 col-md-6 col-12">
              <div className="row">
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`salonName`}
                      name={`salonName`}
                      value={salonDetail?.name}
                      label={`Salon name`}
                      placeholder={`salonName`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`email`}
                      name={`email`}
                      value={salonDetail?.email}
                      label={`Email`}
                      placeholder={`email`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`platformFee`}
                      name={`platformFee`}
                      value={
                        salonDetail?.platformFee ? salonDetail?.platformFee : ""
                      }
                      label={`Plateform fee (%)`}
                      placeholder={`Plat form Fee`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-md-6">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      type={`number`}
                      id={`mobileNumber`}
                      name={`mobileNumber`}
                      value={salonDetail?.mobile}
                      label={`Mobile number`}
                      placeholder={`mobileNumber`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-md-6">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`city`}
                      name={`city`}
                      value={salonDetail?.password}
                      label={`Password`}
                      placeholder={`city`}
                      readOnly
                    />
                  )}
                </div>

              </div>
              <div className="row">
                <div className="col-12">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={150}
                            width={850}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <>
                      <div className="inputData number  flex-row justify-content-start text-start">
                        <label>About salon</label>
                      </div>
                      <Textarea
                        row={5}
                        value={salonDetail?.about}
                        readOnly
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className="my-2"
            style={{
              width: "390px",
              border: "1px solid #1c2b20",
              padding: "4px",
              borderRadius: "40px",
            }}
          >
            <button
              type="button"
              className={`${type === "address" ? "activeBtn" : "disabledBtn"}`}
              onClick={() => setType("address")}
            >
              Address
            </button>
            <button
              type="button"
              className={`${type === "review" ? "activeBtn" : "disabledBtn"
                } ms-1`}
              onClick={() => setType("review")}
            >
              Review
            </button>
            <button
              type="button"
              className={`${type === "service" ? "activeBtn" : "disabledBtn"
                } ms-1`}
              onClick={() => setType("service")}
            >
              Services
            </button>
            <button
              type="button"
              className={`${type === "products" ? "activeBtn" : "disabledBtn"
                } ms-1`}
              onClick={() => {
                setType("products")
                setData([])
              }}
            >
              Products
            </button>
            {/* <button
              type="button"
              className={`${type === "orders" ? "activeBtn" : "disabledBtn"
                } ms-1`}
              onClick={() => {
                setType("orders")
                setData([])
              }}
            >
              Orders
            </button> */}
          </div>
          {
            type === "address" && (
              <div className="row">
                <div className="col-md-6">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`latitude`}
                      name={`latitude`}
                      value={salonDetail?.locationCoordinates?.latitude}
                      label={`Latitude`}
                      placeholder={`latitude`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-md-6">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                      >
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={250}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`latitude`}
                      name={`latitude`}
                      value={salonDetail?.locationCoordinates?.longitude}
                      label={`Longitude`}
                      placeholder={`latitude`}
                      readOnly
                    />
                  )}
                </div>
              </div>
            )
          }


          {type === "address" && (
            <div className="row">
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme
                      baseColor="#e2e5e7"
                      highlightColor="#fff"
                    >
                      <p className="d-flex justify-content-center my-3">
                        <Skeleton
                          height={40}
                          width={400}
                          style={{
                            borderRadius: "10px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <ExInput
                    id={`address`}
                    name={`address`}
                    value={salonDetail?.addressDetails?.addressLine1}
                    label={`Address`}
                    placeholder={`address`}
                    readOnly
                  />
                )}
              </div>
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme
                      baseColor="#e2e5e7"
                      highlightColor="#fff"
                    >
                      <p className="d-flex justify-content-center my-3">
                        <Skeleton
                          height={40}
                          width={400}
                          style={{
                            borderRadius: "10px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <ExInput
                    id={`landmark`}
                    name={`landmark`}
                    value={salonDetail?.addressDetails?.landMark}
                    label={`LandMark`}
                    placeholder={`landmark`}
                    readOnly
                  />
                )}
              </div>
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme
                      baseColor="#e2e5e7"
                      highlightColor="#fff"
                    >
                      <p className="d-flex justify-content-center my-3">
                        <Skeleton
                          height={40}
                          width={400}
                          style={{
                            borderRadius: "10px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <ExInput
                    id={`city`}
                    name={`city`}
                    value={salonDetail?.addressDetails?.city}
                    label={`City`}
                    placeholder={`city`}
                    readOnly
                  />
                )}
              </div>
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme
                      baseColor="#e2e5e7"
                      highlightColor="#fff"
                    >
                      <p className="d-flex justify-content-center my-3">
                        <Skeleton
                          height={40}
                          width={400}
                          style={{
                            borderRadius: "10px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <ExInput
                    id={`state`}
                    name={`state`}
                    value={salonDetail?.addressDetails?.state}
                    label={`State`}
                    placeholder={`state`}
                    readOnly
                  />
                )}
              </div>
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme
                      baseColor="#e2e5e7"
                      highlightColor="#fff"
                    >
                      <p className="d-flex justify-content-center my-3">
                        <Skeleton
                          height={40}
                          width={400}
                          style={{
                            borderRadius: "10px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <ExInput
                    id={`country`}
                    name={`country`}
                    value={salonDetail?.addressDetails?.country}
                    label={`Country`}
                    placeholder={`country`}
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="fw-bold mb-2">Map</label>
                <iframe
                  id="iframeId"
                  height="500px"
                  title="salonLocation"
                  width="100%"
                ></iframe>
              </div>
            </div>
          )}
          <div></div>
          {type === "review" && (
            <Table
              data={data}
              mapData={reviewTable}
            />
          )}
          {type === "service" && (
            <>
              <Table
                data={serviceData}
                mapData={serviceTable}
              />
            </>
          )}
          {type === "products" && (
            <>
              <Table
                data={productData}
                mapData={productTableData}
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
            </>
          )}
          {/* {type === "orders" && (
            <>
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
                      ALL
                    </option>
                    {orderTypeShowData?.map((data) => {
                      return <option value={data?.value}>{data?.name}</option>;
                    })}
                  </select>
                </div>
              </div>
              
            </>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default SalonProfile;
