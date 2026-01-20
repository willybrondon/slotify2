/* eslint-disable no-lone-blocks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Title from "../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import {
  activesalon,
  getAdmin,
  logout,
  updateAdmin,
  updateAdminPassword,
} from "../../redux/slice/authSlice";
import Button from "../extras/Button";
import { adminProfile } from "../../redux/api";
import { useQuery } from "@tanstack/react-query";
import Male from "../../../src/assets/images/male.png";
import { ExInput, Textarea } from "../extras/Input";
import ToggleSwitch from "../extras/ToggleSwitch";


export const AdminProfile = () => {
  const dispatch = useDispatch();
  const [type, setType] = useState("address");

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [address, setAddress] = useState();
  const [landMark, setLandMark] = useState();
  const [city, setCity] = useState();
  const [state, setState] = useState();
  const [country, setCountry] = useState();
  const [mainImage, setMainImage] = useState([]);
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState();
  const [heroImage, setHeroImage] = useState([]);
  const [heroImagePath, setHeroImagePath] = useState();
  const [mobile, setMobile] = useState();
  const [platformFee, setPlatformFee] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [about, setAbout] = useState();
  const [valuePropositionTitle, setValuePropositionTitle] = useState();
  const [valuePropositionDescription, setValuePropositionDescription] = useState();
  const [valuePropositionFeatures, setValuePropositionFeatures] = useState();

  const [error, setError] = useState({
    name: "",
    email: "",
    address: "",
    landMark: "",
    city: "",
    state: "",
    country: "",
    images: "",
    mobile: "",
    platformFee: "",
    latitude: "",
    longitude: "",
    newPassword: "",
    confirmPassword: "",
    oldPassword: "",
    about: "",
    heroImage: "",
    valuePropositionTitle: "",
    valuePropositionDescription: "",
    valuePropositionFeatures: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [data, setData] = useState({});

  const { admin } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAdmin());
  }, []);

  useEffect(() => {
    setData(admin);
  }, [admin]);

  console.log("adminadminadminadmin", admin);

  useEffect(() => {
    if (data) {
      setName(data?.name);
      setEmail(data?.email);
      setImage(data?.mainImage);

      setAddress(data?.addressDetails?.addressLine1);
      setLandMark(data?.addressDetails?.landMark);
      setCity(data?.addressDetails?.city);
      setState(data?.addressDetails?.state);
      setCountry(data?.addressDetails?.country);
      setLatitude(data?.locationCoordinates?.latitude);
      setLongitude(data?.locationCoordinates?.longitude);
      setMobile(data?.mobile);
      setPlatformFee(data?.platformFee);
      setImagePath(data?.mainImage);
      setAbout(data?.about);
      setHeroImagePath(data?.heroImage);
      setValuePropositionTitle(data?.valueProposition?.title || "");
      setValuePropositionDescription(data?.valueProposition?.description || "");
      setValuePropositionFeatures(data?.valueProposition?.features?.join(", ") || "");
    }
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

  const handleUploadHeroImage = (e) => {
    setHeroImage(e.target.files[0]);
    setHeroImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      heroImage: "",
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

  const updateProfile = () => {

    if (!imagePath || !name || image.length === 0) {
      let error = {};
      if (!name) error.name = "name is required";
      if (!image || imagePath?.length < 0) error.image = "image is required";
    } else {
      const formData = new FormData();
      formData.append("mainImage", image);
      if (heroImage) {
        formData.append("heroImage", heroImage);
      }
      formData.append("name", name);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("landMark", landMark);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("mobile", mobile);
      formData.append("about", about);
      if (valuePropositionTitle) {
        formData.append("valuePropositionTitle", valuePropositionTitle);
      }
      if (valuePropositionDescription) {
        formData.append("valuePropositionDescription", valuePropositionDescription);
      }
      if (valuePropositionFeatures) {
        formData.append("valuePropositionFeatures", JSON.stringify(valuePropositionFeatures.split(",").map(f => f.trim()).filter(f => f)));
      }

      let payload = {
        salonId: admin?._id,
        formData: formData,
      };

      dispatch(updateAdmin(payload));
    }
  };

  const handlePrevious = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name={`${data ? data?.name : "Salon"}'s   Profile`} />
        <div className="d-flex justify-content-end mb-4">
          <Button
            onClick={updateProfile}
            text={`Submit`}
            className={` text-white`}
            style={{ backgroundColor: "#1ebc1e" }}
          />
        </div>
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-12 ">
                {/* <img
                  src={admin?.mainImage}
                  className="img-fluid"
                  style={{
                    height: "420px",
                    width: "420px",
                    objectFit: "cover",
                    boxSizing: "border-box",
                    borderRadius: "30px",
                  }}
                  alt=""
                /> */}
                <div className="userImgae" style={{ cursor: "pointer" }}>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={(e) => handleUploadImage(e)}
                  />
                  <div className="position-relative">
                    <img
                      className="image"
                      style={{
                        height: "420px",
                        width: "420px",
                        objectFit: "cover",
                        borderRadius: "30px",
                      }}
                      src={imagePath ? imagePath : admin?.mainImage}
                      onClick={() => handlePrevious(imagePath)}
                      alt="profile"
                      onError={(e) => {
                        e.currentTarget.src = Male;
                      }}
                    />
                    <div
                      className="position-absolute middle"
                      style={{ bottom: "0", left: "0" }}
                    >
                      <div
                        style={{
                          background:
                            "linear-gradient(rgb(28 43 32 / 60%), #1c2b20)",
                          borderRadius: "0px 0px 30px 30px",
                          height: "50px",
                          width: "420px",
                        }}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <label for="file-input" className="text-white ">
                          Update Image
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8 col-md-6 col-12">
                <div className="row">
                  <div className="col-md-4">
                    <ExInput
                      type={`text`}
                      id={`salonName`}
                      name={`salonName`}
                      value={name}
                      label={`Salon Name`}
                      placeholder={`salonName`}
                      errorMessage={error.name && error.name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            name: ` Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            name: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <ExInput
                      type={`text`}
                      id={`email`}
                      name={`email`}
                      value={email}
                      label={`email`}
                      placeholder={`email`}
                      errorMessage={error.email && error.email}
                      readOnly
                    />
                  </div>
                  <div className="col-md-4">
                    <ExInput
                      type={`number`}
                      id={`platformFee`}
                      name={`platformFee`}
                      value={platformFee}
                      label={`Plateform Fees (%)`}
                      placeholder={`platformFee`}
                      readOnly
                    />
                  </div>
                  <div className="col-md-4">
                    <ExInput
                      type={`number`}
                      id={`mobileNumber`}
                      name={`mobileNumber`}
                      value={mobile}
                      label={`Mobile Number`}
                      placeholder={`mobileNumber`}
                      errorMessage={error.mobile && error.mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            mobile: `Mobile Number Is Required`,
                          });
                        } else if (
                          e.target.value.length < 6 ||
                          e.target.value.length > 13
                        ) {
                          return setError({
                            ...error,
                            mobile: "Mobile number must be 6 to 13 digits",
                          });
                        } else {
                          return setError({
                            ...error,
                            mobile: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <ExInput
                      type={`number`}
                      id={`latitude`}
                      name={`latitude`}
                      value={latitude}
                      label={`Latitude`}
                      placeholder={`latitude`}
                      errorMessage={error.latitude && error.latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            latitude: `Latitude Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            latitude: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <ExInput
                      type={`number`}
                      id={`longitude`}
                      name={`longitude`}
                      value={longitude}
                      label={`Longitude`}
                      placeholder={`longitude`}
                      errorMessage={error.longitude && error.longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            longitude: `longitude Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            longitude: "",
                          });
                        }
                      }}
                    />
                    <p style={{ fontSize: "15px" }}>
                      Get latitude and longitude from{" "}
                      <a href="https://www.latlong.net/" target="_blank">
                        https://www.latlong.net/
                      </a>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Textarea
                      row={4}
                      value={about}
                      id={`about`}
                      name={`about`}
                      label={`About`}
                      placeholder={`about`}
                      errorMessage={error.about && error.about}
                      onChange={(e) => {
                        setAbout(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            about: `About Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            about: "",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h5 style={{ marginBottom: "20px", color: "#1c2b20" }}>Web Page Settings</h5>
                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                      Customize how your salon appears on the public web page
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-12 mb-3">
                    <label style={{ marginBottom: "10px", display: "block", fontWeight: "500" }}>
                      Hero Image (for public web page)
                    </label>
                    <div style={{ position: "relative", cursor: "pointer" }}>
                      <input
                        id="hero-image-input"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => handleUploadHeroImage(e)}
                      />
                      <div style={{ position: "relative" }}>
                        <img
                          style={{
                            height: "200px",
                            width: "100%",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "2px dashed #ddd",
                          }}
                          src={heroImagePath || admin?.heroImage || admin?.mainImage}
                          onClick={() => heroImagePath && handlePrevious(heroImagePath)}
                          alt="hero"
                          onError={(e) => {
                            e.currentTarget.src = admin?.mainImage || Male;
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            right: "0",
                            background: "linear-gradient(rgb(28 43 32 / 60%), #1c2b20)",
                            borderRadius: "0px 0px 10px 10px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <label htmlFor="hero-image-input" className="text-white" style={{ cursor: "pointer" }}>
                            {heroImagePath || admin?.heroImage ? "Change Hero Image" : "Upload Hero Image"}
                          </label>
                        </div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                        Recommended: 1200x400px. This image appears at the top of your public salon page.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12">
                    <ExInput
                      type={`text`}
                      id={`valuePropositionTitle`}
                      name={`valuePropositionTitle`}
                      value={valuePropositionTitle}
                      label={`Value Proposition Title`}
                      placeholder={`e.g., Premier Hair & Beauty Experience`}
                      errorMessage={error.valuePropositionTitle && error.valuePropositionTitle}
                      onChange={(e) => {
                        setValuePropositionTitle(e.target.value);
                        setError({
                          ...error,
                          valuePropositionTitle: "",
                        });
                      }}
                    />
                    <Textarea
                      row={3}
                      value={valuePropositionDescription}
                      id={`valuePropositionDescription`}
                      name={`valuePropositionDescription`}
                      label={`Value Proposition Description`}
                      placeholder={`Brief description of what makes your salon special`}
                      errorMessage={error.valuePropositionDescription && error.valuePropositionDescription}
                      onChange={(e) => {
                        setValuePropositionDescription(e.target.value);
                        setError({
                          ...error,
                          valuePropositionDescription: "",
                        });
                      }}
                    />
                    <ExInput
                      type={`text`}
                      id={`valuePropositionFeatures`}
                      name={`valuePropositionFeatures`}
                      value={valuePropositionFeatures}
                      label={`Key Features (comma-separated)`}
                      placeholder={`e.g., Expert stylists, Elegant atmosphere, Personalized service`}
                      errorMessage={error.valuePropositionFeatures && error.valuePropositionFeatures}
                      onChange={(e) => {
                        setValuePropositionFeatures(e.target.value);
                        setError({
                          ...error,
                          valuePropositionFeatures: "",
                        });
                      }}
                    />
                    <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                      Separate multiple features with commas. These will appear as highlights on your public page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="my-2"
              style={{
                width: "fit-content",
                border: "1px solid #1c2b20",
                padding: "4px",
                borderRadius: "40px",
              }}
            >
              <button
                type="button"
                className={`${
                  type === "address" ? "activeBtn" : "disabledBtn"
                }`}
                onClick={() => setType("address")}
              >
                Address
              </button>
              <button
                type="button"
                className={`${
                  type === "password" ? "activeBtn" : "disabledBtn"
                } ms-3`}
                onClick={() => setType("password")}
              >
                Password
              </button>
            </div>
            {type === "address" && (
              <>
                <div className="row">
                  <div className="col-lg-4">
                    <ExInput
                      type={`text`}
                      id={`address`}
                      name={`address`}
                      value={address}
                      label={`Address`}
                      placeholder={`address`}
                      errorMessage={error.address && error.address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            address: `Address Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            address: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`text`}
                      id={`landmark`}
                      name={`landmark`}
                      value={landMark}
                      label={`LandMark`}
                      placeholder={`landmark`}
                      errorMessage={error.landMark && error.landMark}
                      onChange={(e) => {
                        setLandMark(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            landMark: `LandMark Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            landMark: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`text`}
                      id={`city`}
                      name={`city`}
                      value={city}
                      label={`City`}
                      placeholder={`city`}
                      errorMessage={error.city && error.city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            city: `City Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            city: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`text`}
                      id={`state`}
                      name={`state`}
                      value={state}
                      label={`State`}
                      placeholder={`state`}
                      errorMessage={error.state && error.state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            state: `State Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            state: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`text`}
                      id={`country`}
                      name={`country`}
                      value={country}
                      label={`Country`}
                      placeholder={`country`}
                      errorMessage={error.country && error.country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            country: `Country Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            country: "",
                          });
                        }
                      }}
                    />
                  </div>
              
                </div>
              </>
            )}
            {type === "password" && (
              <>
                <div className="row">
                  <div className="col-lg-4">
                    <ExInput
                      type={`password`}
                      id={`oldPassword`}
                      name={`oldPassword`}
                      value={oldPassword}
                      label={`Old Password`}
                      placeholder={`Old Password`}
                      errorMessage={error.oldPassword && error.oldPassword}
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
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`password`}
                      id={`newPassword`}
                      name={`newPassword`}
                      value={newPassword}
                      label={`New Password`}
                      placeholder={`New Password`}
                      errorMessage={error.newPassword && error.newPassword}
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
                  </div>
                  <div className="col-lg-4">
                    <ExInput
                      type={`password`}
                      id={`confirmPassword`}
                      name={`confirmPassword`}
                      value={confirmPassword}
                      label={`Confirm Password`}
                      placeholder={`Confirm Password`}
                      errorMessage={
                        error.confirmPassword && error.confirmPassword
                      }
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            confirmPassword: "Confirm password is required !",
                          });
                        } else {
                          return setError({
                            ...error,
                            confirmPassword: "",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <Button
                    onClick={handleChangePassword}
                    text={`Submit`}
                    className={`bg-theme text-white`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
