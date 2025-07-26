/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import Title from "../../extras/Title";
import {
  deleteService,
  getAllServices,
  getParticularSalonService,
} from "../../../redux/slice/serviceSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Searching from "../../extras/Searching";
import ServiceDialogue from "./ServiceDialogue";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import { ExInput } from "../../extras/Input";
import {  warning } from "../../../util/Alert";
import ServiceEditDialogue from "./ServiceEditDialogue";

const Service = () => {
  const dispatch = useDispatch();

  const { service, particularService } = useSelector((state) => state.service);
  const { setting } = useSelector((state) => state.setting);
  const { dialogue, dialogueType, dialogueData } = useSelector((state) => state.dialogue);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [particular, setParticular] = useState([]);
  const [search, setSearch] = useState("ALL");

  useEffect(() => {
    dispatch(getAllServices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getParticularSalonService());
  }, [dispatch]);

  useEffect(() => {
    setData(service);
  }, [service]);

  useEffect(() => {
    setParticular(particularService);
  }, [particularService]);

  function openImage(imageUrl) {
    window.open(imageUrl, "_blank");
  }

  const serviceTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image}
            alt="image"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            className="cursor-pointer"
            onClick={() => openImage(row?.image)}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Category",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.categoryname}</span>
      ),
    },

    {
      Header: `Price  ${"(" + setting?.currencySymbol + ")"}`,
      Cell: ({ row }) => <span>{row?.price}</span>,
    },
    {
      Header: "Duration",
      Cell: ({ row }) => <span>{row?.duration + " min"}</span>,
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <span className="d-flex justify-content-center">
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => dispatch(openDialog({ type: "service", data: row }))}
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
  ];

  const handleDelete = (id) => {

    const data = warning("Delete");
    data
      .then((logouts) => {
        const yes = logouts.isConfirmed;
        console.log("yes", yes);
        if (yes) {
          dispatch(deleteService(id));
          dispatch(getAllServices());
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="mainCategory">
      <Title name="Services" />

      <div className="row">
        <div className="col-lg-4 col-md-6 col-12">
          <div className="m40-top">
            <div className="card" style={{ borderRadius: "10px" }}>
              <div
                className="card-head text-center fw-bold"
                style={{
                  backgroundColor: "#1C2B20",
                  padding: "10px 0px",
                  borderRadius: "10px 10px 0 0",
                  color: "#fff",
                }}
              >
                SELECT ADMIN SERVICES
              </div>
              <div
                className="card-body"
                style={{ height: "69vh", overflowY: "scroll" }}
              >
                {data?.map((item) => {
                  return (
                    <div className="card mt-3">
                      <div className="card-body d-flex align-items-center">
                        <div>
                          <img
                            src={item?.image}
                            style={{
                              height: "100px",
                              width: "100px",
                              borderRadius: "10px",
                            }}
                            alt=""
                          />
                        </div>
                        <div className="ms-3">
                          <span
                            style={{ color: "#223126" }}
                            className="fw-bold fs-18"
                          >
                            {item?.name}
                          </span>
                          <p className="fs-15 mt-2">{item?.duration} Minutes</p>
                        </div>
                        <div className="ms-auto">
                          <ExInput
                            type={`checkbox`}
                            checked={false}
                            onChange={() =>
                              dispatch(
                                openDialog({ type: "service", data: item })
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-8 col-md-6 col-12">
          <div className="m40-top">
            <div className="card" style={{ borderRadius: "10px" }}>
              <div
                className="card-head text-center fw-bold"
                style={{
                  backgroundColor: "#1C2B20",
                  padding: "10px 0px",
                  borderRadius: "10px 10px 0 0",
                  color: "#fff",
                }}
              >
                EDIT OUR SERVICES & REMOVE SERVICES
              </div>
              <div
                className="card-body"
                style={{ height: "69vh", overflowY: "scroll" }}
              >
                {particular?.map((item) => {
                  return (
                    <div className="card mt-3" style={{width: "fit-content"}}>
                      <div className="card-body d-flex align-items-center">
                        <div>
                          <img
                            src={item?.id?.image}
                            style={{
                              height: "100px",
                              width: "100px",
                              borderRadius: "10px",
                            }}
                            alt=""
                          />
                        </div>
                        <div className="px-3">
                          <ExInput
                            type={`text`}
                            value={item?.id?.name}
                            label={`Service name`}
                            readOnly={true}
                            placeholder={`Service name`}
                          />
                        </div>
                        <div className="px-3">
                          <ExInput
                            type={`text`}
                            value={setting?.currencySymbol + " " + item?.price}
                            label={`Service charge`}
                            readOnly={true}
                            placeholder={`Service charge`}
                          />
                        </div>
                        <div className="px-3">
                          <ExInput
                            type={`text`}
                            value={item?.id?.duration}
                            label={`Service duration`}
                            readOnly={true}
                            placeholder={`Service duration`}
                          />
                        </div>
                        <div className="d-flex justify-content-center align-items-center">
                          <button
                            className="py-1"
                            style={{
                              backgroundColor: "#EBFBF2",
                              borderRadius: "8px",
                            }}
                            onClick={() => 
                              dispatch(
                                openDialog({ 
                                  type: "serviceEdit", 
                                  data: {
                                    _id: item?.id?._id,
                                    name: item?.id?.name,
                                    price: item?.price,
                                    duration: item?.id?.duration,
                                    cities: item?.allowCities || []
                                  }
                                })
                              )
                            }
                          >
                            <svg
                              className="svg-icon"
                              width="26"
                              height="26"
                              style={{
                                verticalAlign: "middle",
                                fill: "currentColor",
                                overflow: "hidden",
                              }}
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M834.3 705.7c0 82.2-66.8 149-149 149H325.9c-82.2 0-149-66.8-149-149V346.4c0-82.2 66.8-149 149-149h129.8v-42.7H325.9c-105.7 0-191.7 86-191.7 191.7v359.3c0 105.7 86 191.7 191.7 191.7h359.3c105.7 0 191.7-86 191.7-191.7V575.9h-42.7v129.8z" />
                              <path d="M889.7 163.4c-22.9-22.9-53-34.4-83.1-34.4s-60.1 11.5-83.1 34.4L312 574.9c-16.9 16.9-27.9 38.8-31.2 62.5l-19 132.8c-1.6 11.4 7.3 21.3 18.4 21.3 0.9 0 1.8-0.1 2.7-0.2l132.8-19c23.7-3.4 45.6-14.3 62.5-31.2l411.5-411.5c45.9-45.9 45.9-120.3 0-166.2zM362 585.3L710.3 237 816 342.8 467.8 691.1 362 585.3zM409.7 730l-101.1 14.4L323 643.3c1.4-9.5 4.8-18.7 9.9-26.7L436.3 720c-8 5.2-17.1 8.7-26.6 10z m449.8-430.7l-13.3 13.3-105.7-105.8 13.3-13.3c14.1-14.1 32.9-21.9 52.9-21.9s38.8 7.8 52.9 21.9c29.1 29.2 29.1 76.7-0.1 105.8z" />
                            </svg>
                          </button>
                        </div>
                        <div className="ps-3 d-flex justify-content-center align-items-center">
                          <button
                            className="py-1"
                            style={{
                              backgroundColor: "#FFF1F1",
                              borderRadius: "8px",
                            }}
                            onClick={() => handleDelete(item?.id?._id)}
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {dialogue && dialogueType === "service" && (
        <ServiceDialogue setData={setData} data={data} />
      )}
      
      {dialogue && dialogueType === "serviceEdit" && (
        <ServiceEditDialogue  />
      )}
    </div>
  );
};

export default Service;
