/* eslint-disable no-lone-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Title from "../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { getAdmin,logout, updateAdmin, updateAdminPassword } from "../../redux/slice/authSlice";
import Button from "../extras/Button";
import { adminProfile } from "../../redux/api";
import { useQuery } from "@tanstack/react-query";
import Male from "../../../src/assets/images/male.png"
import male from "../../assets/images/male.png";


export const AdminProfile = () => {
  const dispatch = useDispatch();

  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [toggle, setToggle] = useState(false)

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [data,setData] = useState({});
  
  const { admin } = useSelector((state) => state.auth);


  useEffect(() =>{
 
    dispatch(getAdmin())
  },[])

;
  
  useEffect(() => {
      setData(admin);
  }, [admin]);
  
  useEffect(() => {
    setName(data?.name);
    setEmail(data?.email);
    setImagePath(data?.image);
    setError({ name: "", email: "" });
  }, [data]);


  const handleUploadImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };

  const handleChangePassword = () => {

    if (
      !newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword ||
      !oldPassword
    ) {
      let error = {};
      if (!newPassword) error.newPassword = "New password is required !";
      if (!confirmPassword)
        error.confirmPassword = "Confirm password Is required !";
      if (newPassword !== confirmPassword)
        error.confirmPassword =
          "New password and confirm password doesn't match";
      if (!oldPassword) error.oldPassword = "Old password is required !";
      return setError({ ...error });
    } else {
      let data = {
        oldPass: oldPassword,
        confirmPass: confirmPassword,
        newPass: newPassword,
      };
      dispatch(updateAdminPassword(data));
    }
  };

  const handleEditName = () => {
    if ( ! name || !email) {
      
      let error= {}
      if(!email) error.email = "Email is required"
      if(!name) error.name = "Name is required"
    } else {
      let data ={
        name,
        email
      }

      dispatch(updateAdmin(data));
    }
  };


  const handleUpdateImage = () => {
    if ( !image) {
      
      let error= {}
      if(!image || imagePath?.length < 0) error.image = "Image is required"
    } else {
      const formData = new FormData();
      formData.append("image", image);

      dispatch(updateAdmin(formData));
    }
  };

  const handlePrevious = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="mainAdminProfile">
      <Title name="Admin Profile" />
      <div class="d-lg-flex d-md-block">
        <div className="col-12 col-sm-12 col-md-12 col-lg-3 mt-4 me-4">
          <div className="card" style={{minHeight:"500px"}}>
            <div className="card-body">
              <div className="position-relative">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={(e) => handleUploadImage(e)}
                />
                <img
                  src={imagePath ? imagePath : Male}
                  alt="admin"
                  className="mx-auto p-1 border "
                  onError={(e) => {
                    e.target.src = male; 
                  }}
                  style={{
                    width: 180,
                    height: 180,
                    objectFit: "cover",
                    display: "block",
                    borderRadius: "50%",
                  }}
                  onClick={() => handlePrevious(imagePath)}
                  />
                  { error?.image && <p className="errorMessage text-danger text-capitalize">{error?.image}</p>}
                <div
                  className="position-absolute"
                  style={{ bottom: "-4%", right: "45%" }}
                >
                  <div className="bg-theme"
                    style={{
                      // background: "rgb(31, 28, 48)",
                      borderRadius: 50,
                      height: 29,
                    }}
                  >
                    <label htmlFor="file-input">
                      <i
                        className="fa fa-camera d-flex justify-content-center  rounded-circle  p-2 cursorPointer m-0"
                        style={{
                          fontSize: 14,
                          color: "rgb(255, 255, 255)",
                          cursor: "pointer",
                          marginRight: "3px",
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="text-center my-4 pb-4 border-bottom ">
                <h2 className="text-capitalize">{data?.name}</h2>
                <div className="mt-4">
                  <Button
                    onClick={handleUpdateImage}
                    className={`text-end btn bg-theme text-white ml-2`}
                    text={`Upload Image`}
                  />
                </div>
              </div>
              <div>
                <ul style={{ listStyle: "none", fontSize: 15, paddingLeft: 10 }}>
                  <li
                    className="mt-2 user cursor-pointer userEdit"
                    onClick={() => setToggle(false)}
                  >
                    <span className="ps-2">
                      <i className="fa fa-edit p-3" style={{borderRadius : "50%" , backgroundColor : "#F3F9FA",fontSize : "18px"}} />
                    </span>
                    <span className="ps-2 fs-18">Edit Profile</span>
                  </li>
                  <li
                    className="mt-2 user cursor-pointer"
                    onClick={() => setToggle(true)}
                  >
                    <span className="ps-2">
                      <i className="fa fa-key p-3" style={{borderRadius : "50%" , backgroundColor : "#F3F9FA",fontSize : "18px"}} />
                    </span>
                    <span className="ps-2 fs-18">Change Password</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xxl-9 mt-4">
          <div className="row">
            <div className="col-12">
              <div className="card" style={{ height: 500 }}>
                {toggle ? (
                  <div className="card-body">
                    <h4 className="profile_box pb-2 my-3 text-center head-bg">
                      Password Settings
                    </h4>
                    <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7 col-xxl-7 mx-auto">
                      <div className="form-group mt-4 ">
                        <div className="mb-2 my-4">
                          <label className="mb-2 text-gray ml-3 font-weight-bold">
                            Old Password
                          </label>
                          <input
                            type="password"
                            className="form-control p-2"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => {
                              setOldPassword(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  oldPassword: "Old password is required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  oldPassword: "",
                                });
                              }
                            }}
                          />
                          {error.oldPassword && (
                            <p className="text-danger errorMessage text-capitalize">
                              {error.oldPassword}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="mb-2 my-4">
                          <label className="mb-2 text-gray ml-3 font-weight-bold">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="form-control p-2"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  newPassword: "New password is required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  newPassword: "",
                                });
                              }
                            }}
                          />
                          {error.newPassword && (
                            <p className="text-danger errorMessage text-capitalize">
                              {error.newPassword}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group ">
                        <div className="mb-2 ">
                          <label className="mb-2 text-gray ml-3 font-weight-bold">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            className="form-control p-2"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  confirmPassword:
                                    "Confirm password is required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  confirmPassword: "",
                                });
                              }
                            }}
                          />
                          {error.confirmPassword && (
                            <p className="text-danger errorMessage text-capitalize">
                              {error.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="d-flex justify-content-end pt-4">
                        <Button
                          onClick={handleChangePassword}
                          text={`Submit`}
                          className={` text-white`}
                          style={{ backgroundColor: "#1ebc1e" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-body">
                    <h4 className=" profile_box pb-2 my-3 text-center head-bg">
                      Edit Profile
                    </h4>
                    <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7 col-xxl-7 mx-auto my-5">
                      <div className="form-group  mr-4 mt-3">
                        <div className="mb-3">
                          <label
                            className="mb-2 text-gray ml-3"
                            style={{ fontSize: 15 }}
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            placeholder="name"
                            className="form-control p-2"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  name: "Name is required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  name: "",
                                });
                              }
                            }}
                          />
                          {error.name && (
                            <p className="errorMessage text-capitalize text-danger">{error.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="form-group  mr-4">
                        <div className="mb-2">
                          <label
                            className="mb-2 text-gray ml-3"
                            style={{ fontSize: 15 }}
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            placeholder="email"
                            className="form-control p-2"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  email: "Email is required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  email: "",
                                });
                              }
                            }}
                          />
                        </div>
                        {error.email && (
                          <p className="errorMessage text-capitalize text-danger">{error.email}</p>
                        )}
                      </div>
                      <div className="d-flex justify-content-end pt-4">
                        <Button
                          onClick={handleEditName}
                          text={`Submit`}
                          className={` text-white`}
                          style={{ backgroundColor: "#1ebc1e" }}
                        />
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
  );
};

