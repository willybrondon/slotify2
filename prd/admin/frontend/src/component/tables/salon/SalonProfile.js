import React, { useEffect, useState } from "react";
import { ExInput, Textarea } from "../../extras/Input";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import {
  getSalonDetail,
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

const SalonProfile = () => {
  const { salonDetail, review } = useSelector((state) => state.salon);
  const { setting } = useSelector((state) => state.setting);
;
  const loader = useSelector(isLoading);

  const state = useLocation();

  console.log("statestatestate", salonDetail);

  const [type, setType] = useState("address");
  const [data, setData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSalonDetail(state?.state?.id));
    dispatch(getSalonReview(state?.state?.id));
  }, [dispatch, state]);

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

  console.log("type+++", type);

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
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.9688 6.5625H18.75V6.09375C18.75 4.80141 17.6986 3.75 16.4062 3.75H13.5938C12.3014 3.75 11.25 4.80141 11.25 6.09375V6.5625H7.03125C6.78261 6.5625 6.54415 6.66127 6.36834 6.83709C6.19252 7.0129 6.09375 7.25136 6.09375 7.5V8.90625C6.09375 9.15489 6.19252 9.39335 6.36834 9.56916C6.54415 9.74498 6.78261 9.84375 7.03125 9.84375H22.9688C23.2174 9.84375 23.4558 9.74498 23.6317 9.56916C23.8075 9.39335 23.9062 9.15489 23.9062 8.90625V7.5C23.9062 7.25136 23.8075 7.0129 23.6317 6.83709C23.4558 6.66127 23.2174 6.5625 22.9688 6.5625ZM13.125 6.09375C13.125 5.83547 13.3355 5.625 13.5938 5.625H16.4062C16.6645 5.625 16.875 5.83547 16.875 6.09375V6.5625H13.125V6.09375ZM22.6312 11.0883C22.5434 10.9916 22.4363 10.9144 22.3168 10.8615C22.1973 10.8086 22.0681 10.7813 21.9375 10.7812H8.0625C7.93185 10.7813 7.80266 10.8087 7.6832 10.8616C7.56374 10.9145 7.45664 10.9917 7.36878 11.0884C7.28092 11.1851 7.21422 11.2991 7.17297 11.423C7.13171 11.547 7.11681 11.6782 7.12922 11.8083L8.28141 23.8495C8.41219 25.2183 9.61641 26.2505 11.0827 26.2505H18.9173C20.3831 26.2505 21.5878 25.2183 21.7186 23.8495L22.8708 11.8083C22.8832 11.6782 22.8684 11.547 22.8271 11.423C22.7859 11.299 22.7191 11.185 22.6312 11.0883ZM12.8091 23.9044C12.7889 23.9053 12.7692 23.9062 12.7491 23.9062C12.5108 23.906 12.2816 23.8151 12.108 23.6519C11.9344 23.4887 11.8294 23.2656 11.8144 23.0278L11.2519 14.1216C11.2363 13.8734 11.3199 13.6293 11.4843 13.4428C11.6487 13.2563 11.8803 13.1427 12.1284 13.1269C12.3764 13.1118 12.6203 13.1956 12.8067 13.3599C12.9931 13.5241 13.1069 13.7555 13.1231 14.0034L13.6856 22.9097C13.7012 23.1578 13.6176 23.4019 13.4532 23.5884C13.2888 23.775 13.0572 23.8886 12.8091 23.9044ZM18.1856 23.0278C18.1785 23.1511 18.147 23.2718 18.0931 23.3829C18.0392 23.4941 17.9638 23.5934 17.8713 23.6754C17.7789 23.7573 17.6712 23.8201 17.5543 23.8602C17.4375 23.9004 17.3139 23.917 17.1906 23.9092C17.0674 23.9015 16.9468 23.8694 16.836 23.8149C16.7251 23.7604 16.6262 23.6845 16.5447 23.5916C16.4633 23.4987 16.401 23.3907 16.3615 23.2736C16.322 23.1566 16.306 23.0329 16.3144 22.9097L16.8769 14.0034C16.8938 13.7562 17.0079 13.5257 17.1942 13.3624C17.3805 13.199 17.624 13.1161 17.8713 13.1317C18.1186 13.1473 18.3496 13.2602 18.5139 13.4457C18.6783 13.6312 18.7625 13.8742 18.7481 14.1216L18.1856 23.0278Z"
                fill="#E21C1C"
              />
            </svg>
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
      console.log("yes", yes);
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
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

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
                  <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                <div className="col-md-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
              <div className="row">
                <div className="col-12">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                      <Textarea row={5} value={salonDetail?.about} readOnly />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div
            className="my-2"
            style={{
              width: "308px",
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
              className={`${
                type === "review" ? "activeBtn" : "disabledBtn"
              } ms-1`}
              onClick={() => setType("review")}
            >
              Review
            </button>
            <button
              type="button"
              className={`${
                type === "service" ? "activeBtn" : "disabledBtn"
              } ms-1`}
              onClick={() => setType("service")}
            >
              Services
            </button>
          </div>
          <div className="col-lg-4">
            {loader === true ? (
              <>
                <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
          {type === "address" && (
            <div className="row">
              <div className="col-lg-4">
                {loader === true ? (
                  <>
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
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
          {type === "review" && <Table data={data} mapData={reviewTable} />}
          {type === "service" && (
            <Table data={serviceData} mapData={serviceTable} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonProfile;
