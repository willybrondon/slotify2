/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import Title from "../../extras/Title";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { expertUpdate, getExpert } from "../../../redux/slice/expertSlice";
import { useState } from "react";
import Multiselect from "multiselect-react-dropdown";
import {
  getAllServices,
  getParticularSalonService,
} from "../../../redux/slice/serviceSlice";
import Button from "../../extras/Button";
import { ReactComponent as Star } from "../../../assets/images/star.svg";
import { ReactComponent as Mail } from "../../../assets/images/mail.svg";
import { ReactComponent as Call } from "../../../assets/images/call.svg";
import { ReactComponent as Age } from "../../../assets/images/age.svg";
import Male from "../../../assets/images/male.png";
import { ExInput } from "../../extras/Input";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isLoading } from "../../../util/allSelector";

const ExpertProfile = () => {
  const { particularService } = useSelector((state) => state.service);
  const { oneExpert } = useSelector((state) => state.expert);
  const { setting } = useSelector((state) => state.setting);
  
  const loader = useSelector(isLoading);

  const { state } = useLocation();
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [allService, setAllService] = useState([]);

  useEffect(() => {
    dispatch(getParticularSalonService());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getExpert(state?.id));
  }, [dispatch, state]);

  useEffect(() => {
    setData(oneExpert);
  }, [oneExpert]);

  useEffect(() => {
    const addData = oneExpert?.serviceData?.map((item) => {
      const { _id, ...rest } = item;
      return { id: _id, ...rest };
    });
    setAllService(addData);
  }, [oneExpert]);

  const serviceList = particularService?.map((list) => ({
    name: list?.id?.name || "", // Ensure name property is not undefined
    id: list?.id?._id || "",
  }));

  function onSelect(selectedList, selectedItem) {
    
    setAllService((prev) => [...prev, selectedItem]);
  }

  function onRemove(selectedList, removedItem) {
    
    setAllService(selectedList);
  }

  const handleSubmit = async (e) => {
    
    const serviceIds = allService?.map((services) => services?.id).join(",");
    const payload = {
      formData: { serviceId: serviceIds },
      expertId: data?._id,
    };
    dispatch(expertUpdate(payload));
  };

  const select = data?.serviceData
    ? data?.serviceData?.map((item) => ({
        id: item?._id,
        name: item?.name,
      }))
    : data?.serviceId?.map((item) => ({
        id: item?._id,
        name: item?.name,
      }));

  console.log("select", select);
  return (
    <div className="expertProfileMain focusNone">
      <Title
        name={`${
          data?.fname ? data?.fname + ` ` + data?.lname : "Salon Expert"
        }'s   Profile`}
      />
      <div className="d-lg-flex d-md-block">
        <div className="col-12 col-sm-12 col-md-12 col-lg-3 mt-4 me-4">
          <div className="card">
            <div className="card-body">
              {loader === true ? (
                <>
                  <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                    <p className="d-flex justify-content-center ">
                      <Skeleton
                        height={180}
                        width={180}
                        className="rounded-circle mb-2"
                      />
                    </p>
                    <div className="d-flex justify-content-center ">
                      <Skeleton
                        height={30}
                        width={100}
                        className="mb-5 border-bottom"
                      />
                    </div>
                    <Skeleton count={4} height={30} className="mt-3" />
                  </SkeletonTheme>
                </>
              ) : (
                <>
                  <div className="position-relative">
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="d-none"
                    />
                    <img
                      src={data?.image ? data?.image : Male}
                      alt="admin"
                      className="mx-auto p-1 border "
                      style={{
                        width: 180,
                        height: 180,
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "50%",
                      }}
                    />
                    <div
                      className="position-absolute"
                      style={{ bottom: "-2%", right: "45%" }}
                    >
                      <div
                        className="bg-theme"
                        style={{
                          borderRadius: 50,
                          height: 29,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center my-4 pb-4 border-bottom ">
                    <h2 className="text-capitalize">
                      {data?.fname ? data?.fname + " " : "Salon"}
                      {data?.lname ? data?.lname : "User"}
                    </h2>
                    <div className="mt-4"></div>
                  </div>
                  <div>
                    <ul
                      style={{
                        listStyle: "none",
                        fontSize: 15,
                        paddingLeft: 10,
                      }}
                    >
                      <li className="mt-4 user  userEdit">
                        <span className="ps-2">
                          <Mail />
                        </span>
                        <span className="ps-2">{data?.email}</span>
                      </li>
                      <li className="mt-4 user ">
                        <span
                          className="ps-2 "
                          style={{ height: "26px", width: "26px" }}
                        >
                          <Call />
                        </span>
                        <span className="ps-2">{data?.mobile}</span>
                      </li>
                      <li className="mt-4 user ">
                        <span
                          className="ps-2 "
                          style={{ height: "26px", width: "26px" }}
                        >
                          <Age />
                        </span>
                        <span className="ps-2">{data?.age}</span>
                      </li>{" "}
                      <li className="mt-4 user -pointer">
                        <span
                          className="ps-2 "
                          style={{ height: "26px", width: "26px" }}
                        >
                          <Star />
                        </span>
                        <span className="ps-2">
                          {data?.review ? data?.review : "-"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xxl-9 mt-4">
          <div className="row">
            <div className="col-12">
              <div className="card ">
                <div className="card-body">
                  {loader === true ? (
                    <>
                      <SkeletonTheme
                        baseColor="#e2e5e7"
                        highlightColor="#fff"
                        className="mt-4"
                      >
                        <p>
                          <div className="mt-5">
                            <Skeleton count={4} height={40} className="mt-3" />
                          </div>
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7 col-xxl-7 mx-auto">
                      <div className="form-group ">
                        <div className="mb-2 mt-2 inputData">
                          <label className=" text-gray ml-3 font-weight-bold">
                            Earnings
                          </label>
                          <input
                            type="text"
                            className=" p-2 inputNoFocus"
                            placeholder="Earnings"
                            value={
                              data?.earning
                                ? data?.earning + " " + setting?.currencySymbol
                                : "-"
                            }
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-group inputData">
                        <div className=" mt-2">
                          <label className=" text-gray ml-3 font-weight-bold">
                            Services
                          </label>
                          <input
                            type="text"
                            className=" p-2 inputNoFocus"
                            placeholder="New Password"
                            value={
                              data?.totalBookingCount
                                ? data?.totalBookingCount
                                : "0"
                            }
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-group inputData">
                        <div className=" mt-2">
                          <label className=" text-gray ml-3 font-weight-bold">
                            Joining date
                          </label>
                          <input
                            type="text"
                            className=" p-2 inputNoFocus"
                            placeholder="New Password"
                            value={data?.createdAt?.split("T")[0]}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-group inputData">
                        <div className="mb-2 mt-2">
                          <label className="mb-2 text-gray ml-3 font-weight-bold">
                            Services providing
                          </label>
                          <div className="interested-topics">
                            <Multiselect
                              options={serviceList}
                              selectedValues={select}
                              hideOnClickOutside={false}
                              onSelect={onSelect}
                              onRemove={onRemove}
                              displayValue="name"
                            />
                            <div className="d-flex mt-2">
                              <Button
                                text={`Submit`}
                                className={` text-white ms-auto`}
                                style={{
                                  backgroundColor: "#1ebc1e",
                                  marginTop: "30px",
                                }}
                                onClick={(e) => handleSubmit(e)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row flex-wrap rounded border mt-3">
        {loader === true ? (
          <>
            <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="col-12 col-md-6">
                  <Skeleton height={40} />
                </div>
              ))}
            </SkeletonTheme>
          </>
        ) : (
          <>
            <div className="col-12 col-md-6  ">
              <ExInput
                type={`text`}
                value={data?.bankDetails?.bankName}
                label={`Bank name`}
                readOnly={true}
                placeholder={`Bank Name`}
              />
            </div>
            <div className="col-12 col-md-6">
              <ExInput
                type={`text`}
                value={data?.bankDetails?.branchName}
                label={`Branch name`}
                placeholder={`Branch Name`}
                readOnly={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <ExInput
                type={`text`}
                value={data?.bankDetails?.accountNumber}
                label={`Account number`}
                placeholder={`Bank Account Name`}
                readOnly={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <ExInput
                type={`text`}
                value={data?.bankDetails?.IFSCCode}
                label={`IFSC code`}
                placeholder={`IFSC Code`}
                readOnly={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <ExInput
                type={`text`}
                value={data?.upiId}
                label={`UPI Id`}
                placeholder={`UPI id`}
                readOnly={true}
              />
            </div>
            <div className="col-12 col-md-6">
              <ExInput
                type={`text`}
                value={data?.paymentType === 0 ? "Upi" : "Bank"}
                label={`Preferred payment type`}
                placeholder={`Payment Type`}
                readOnly={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpertProfile;
