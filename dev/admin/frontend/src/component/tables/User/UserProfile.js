/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import Title from "../../extras/Title";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { blockUser, getUser } from "../../../redux/slice/userSlice";
import { useState } from "react";
import { ExInput } from "../../extras/Input";
import ToggleSwitch from "../../extras/ToggleSwitch";
import Button from "../../extras/Button";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Male from "../../../assets/images/male.png";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { isLoading } from "../../../util/allSelector";

const UserProfile = () => {
  const { userProfile } = useSelector((state) => state.user);
  const { state } = useLocation();
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const navigate = useNavigate();
  const loader = useSelector(isLoading);

  useEffect(() => {
    dispatch(getUser(state?.id));
  }, [state]);

  useEffect(() => {
    setData(userProfile);
  }, [userProfile]);

  const handelPreviousPage = () => {
    if (state) {
      navigate(-1);
    } else {
      localStorage.removeItem("dialogueData");
      dispatch({ type: closeDialog });
    }
  };
  return (
    <div className="userProfile focusNone">
      {loader === true ? (
        <>
          <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
            <div className="col-xl-2 col-md-3 col-sm-4">
              <Skeleton height={30} />
            </div>
          </SkeletonTheme>
        </>
      ) : (
        <Title
          name={`${
            data?.fname ? data?.fname + ` ` + data?.lname : "User"
          }'s   Profile`}
        />
      )}
      <div className="col-7 my-auto ms-auto justify-content-end d-flex pe-3">
        <Button
          className={`bg-danger  text-center text-white mt-3`}
          onClick={handelPreviousPage}
          style={{
            borderRadius: "5px",
          }}
          bIcon={`fa-solid fa-angles-left text-white fs-20 m-auto`}
          text="Back"
        />
      </div>
      <div className="boxShadow p-4">
        <div
          className="position-relative  rounded-4 px-4 w-100"
          style={{ height: "180px", backgroundColor: "#1C2B20" }}
        >
          <div className="bg-theme w-100">
            {loader === true ? (
              <>
                <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                  <p className="d-flex justify-content-center ">
                    <Skeleton
                      className="mx-auto  position-absolute"
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: "50%",
                        top: "88px",
                        left: "50px",
                        backgroundColor: "#FFFFFF",
                        padding: "5px",
                      }}
                    />
                  </p>
                </SkeletonTheme>
              </>
            ) : (
              <img
                src={data?.image ? data.image : Male}
                onError={(e) => {
                  e.target.src = Male;
                }}
                alt="User"
                className="mx-auto  position-absolute"
                style={{
                  width: 160,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: "50%",
                  top: "88px",
                  left: "50px",
                  backgroundColor: "#FFFFFF",
                  padding: "5px",
                }}
              />
            )}
          </div>
        </div>
        <div className="row" style={{ marginTop: "100px" }}>
          {loader === true ? (
            <>
              <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <div key={index} className="col-xl-4 col-md-6 col-sm-12">
                    <Skeleton height={40} className="mt-3" />
                  </div>
                ))}
              </SkeletonTheme>
            </>
          ) : (
            <>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.fname}
                  label={`First name`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.lname ? data?.lname : "-"}
                  label={`Last name`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.uniqueId}
                  label={`Unique id`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.mobile ? data?.mobile : "-"}
                  label={`Mobile number`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.gender}
                  label={`Gender`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.age ? data?.age : "-"}
                  label={`Age`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={data?.email ? data?.email : "-"}
                  label={`Email id`}
                  readOnly={true}
                />
              </div>
              <div className="col-xl-4 col-md-6 col-sm-12">
                <ExInput
                  type={`text`}
                  value={
                    data?.loginType == 1
                      ? "Email Login"
                      : data?.loginType == 2
                      ? "Google Login"
                      : "Mobile Login"
                  }
                  label={`Login type`}
                  readOnly={true}
                  placeholder={`Login Type`}
                />
              </div>
            </>
          )}
        </div>
        <div className="row">
          <div className="col-12 inputData">
            {loader === true ? (
              <>
                <SkeletonTheme
                  baseColor="#e2e5e7"
                  highlightColor="#fff"
                  className="mb-5 mt-3"
                >
                  <Skeleton className="mt-5" height={142} />
                </SkeletonTheme>
              </>
            ) : (
              <>
                <label>Bio</label>
                <textarea
                  value={data?.bio ? data?.bio : "-"}
                  readOnly
                  style={{ width: "100%", resize: "none" }}
                  cols="30"
                  rows={5}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
