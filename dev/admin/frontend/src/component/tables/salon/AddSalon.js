import React, { useEffect, useState } from "react";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../extras/Button";
import Input, { ExInput, Textarea } from "../../extras/Input";

import { addSalon, updateSalon } from "../../../redux/slice/salonSlice";
import ReactDropzone from "react-dropzone";
import Title from "../../extras/Title";
import { useLocation, useNavigate } from "react-router-dom";

const AddSalon = () => {
  const { state } = useLocation();
;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState();
  const [about, setAbout] = useState();
  const [email, setEmail] = useState();
  const [address, setAddress] = useState();
  const [landMark, setLandMark] = useState();
  const [city, setCity] = useState();
  const [states, setStates] = useState();
  const [country, setCountry] = useState();
  const [mainImage, setMainImage] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePath, setImagePath] = useState();
  const [mobile, setMobile] = useState();
  const [platformFee, setPlatformFee] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [password, setPassword] = useState();
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
    password: "",
    about: "",
  });

  useEffect(() => {
    
    if (state) {
      setName(state?.row?.name);
      setEmail(state?.row?.email);
      setAddress(state?.row?.addressDetails?.addressLine1);
      setLandMark(state?.row?.addressDetails?.landMark);
      setCity(state?.row?.addressDetails?.city);
      setStates(state?.row?.addressDetails?.state);
      setCountry(state?.row?.addressDetails?.country);
      setPassword(state?.row?.password);
      setLatitude(state?.row?.locationCoordinates?.latitude);
      setLongitude(state?.row?.locationCoordinates?.longitude);
      setMobile(state?.row?.mobile);
      setPlatformFee(state?.row?.platformFee);
      setImagePath(state?.row?.mainImage);
      setImages(state?.row?.image);
      setAbout(state?.row?.about);
    }
  }, [state]);

  const handleImage = (e) => {
    setError((prevErrors) => ({
      ...prevErrors,
      mainImage: "",
    }));
    setMainImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
  };

  const onPreviewDrop = (files) => {
    
    setError({ ...error, image: "" });
    files.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages(files);
  };

  const removeImage = (file) => {
    if (file?.preview) {
      const image = images.filter((ele) => {
        return ele?.preview !== file?.preview;
      });
      setImages(image);
    } else {
      const image = images.filter((ele) => {
        return ele !== file;
      });
      setImages(image);
    }
  };

  const handleSubmit = (e) => {

    if (
      !name ||
      !email ||
      !about ||
      !password ||
      !mobile ||
      !address ||
      !landMark ||
      !city ||
      !states ||
      !country ||
      !latitude ||
      !longitude ||
      !images ||
      images?.length === 0 ||
      images?.length > 10 ||
      !platformFee
    ) {
      let error = {};
      if (!name) error.name = "Name is required";
      if (!about) error.about = "About is required";
      if (!email) error.email = "Email is required";
      if (!password) error.password = "Password is required";
      if (!platformFee) error.platformFee = "Plat form fee is required";
      if (!mobile) error.mobile = "Mobile number is required";
      if (!address) error.address = "Address is required";
      if (!landMark) error.landMark = "Land mark is required";
      if (!city) error.city = "City is required";
      if (!states) error.state = "State is required";
      if (!country) error.country = "Country is required";
      if (!latitude) error.latitude = "Latitude is required";
      if (!longitude) error.longitude = "Longitude is required";
      if (!images) error.images = "Images is required";
      if (images?.length === 0) error.images = "Images is required";
      if (images?.length > 10) error.images = "Select max 10 images";

      return setError({ ...error });
    } else {
      

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("landMark", landMark);
      formData.append("city", city);
      formData.append("state", states);
      formData.append("country", country);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("platformFee", platformFee);
      formData.append("mobile", mobile);
      formData.append("password", password);
      formData.append("about", about);
      if (state?.row) {
        formData.append("mainImage", mainImage);
      }

      for (let index = 0; index < images?.length; index++) {
        formData.append("image", images[index]);
      }
  
    
      if (state?.row) {
        let payload = { salonId: state?.row?._id, formData: formData };
        dispatch(updateSalon(payload));
        navigate(-1);
      } else {
        dispatch(addSalon(formData));
        navigate(-1);
      }
    }
  };

  return (
    <div className="p-3">
      <Title name={`Add salon`} />
      <div className="card">
        <div className="card-body">
          <div className="">
            <div className="row align-items-start formBody">
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`name`}
                  name={`name`}
                  value={name}
                  label={`Name`}
                  placeholder={`Name`}
                  errorMessage={error.name && error.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        name: ` Name is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  value={email}
                  label={`email`}
                  placeholder={`email`}
                  errorMessage={error.email && error.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `Email is required`,
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

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  value={mobile}
                  id={`mono`}
                  name={`mobile`}
                  label={`Mobile number`}
                  minLength={6}
                  maxLength={13}
                  placeholder={`Mobile number`}
                  errorMessage={error.mobile && error.mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        mobile: `Mobile number is required`,
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

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `Password is required`,
                      });
                    } else {
                      return setError({
                        ...error, 
                        password: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`platformFee`}
                  name={`platformFee`}
                  value={platformFee}
                  label={`Platform fee (%)`}
                  placeholder={`Platform Fee`}
                  errorMessage={error.platformFee && error.platformFee}
                  onChange={(e) => {
                    setPlatformFee(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        platformFee: `Plat form fee is required`,
                      });
                    } else if (e.target.value.length > 2) {
                      return setError({
                        ...error,
                        platformFee: "Plat form fee must be 2 digits",
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        platformFee: "Plat form fee must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        platformFee: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`address`}
                  name={`Address`}
                  value={address}
                  label={`Address`}
                  placeholder={`Address`}
                  errorMessage={error.address && error.address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        address: `Address is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`landmark`}
                  name={`Landmark`}
                  value={landMark}
                  label={`Landmark`}
                  placeholder={`Landmark`}
                  errorMessage={error.landMark && error.landMark}
                  onChange={(e) => {
                    setLandMark(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        landMark: `Landmark is required`,
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

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`city`}
                  name={`city`}
                  value={city}
                  label={`City`}
                  placeholder={`City`}
                  errorMessage={error.city && error.city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        city: ` City is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`state`}
                  name={`state`}
                  value={states}
                  label={`State`}
                  placeholder={`State`}
                  errorMessage={error.state && error.state}
                  onChange={(e) => {
                    setStates(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        state: `State is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`country`}
                  name={`country`}
                  value={country}
                  label={`Country`}
                  placeholder={`Country`}
                  errorMessage={error.country && error.country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        country: `Country is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`latitude`}
                  name={`latitude`}
                  value={latitude}
                  label={`latitude`}
                  placeholder={`latitude`}
                  errorMessage={error.latitude && error.latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        latitude: `latitude is required`,
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
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`longitude`}
                  name={`longitude`}
                  value={longitude}
                  label={`longitude`}
                  placeholder={`longitude`}
                  errorMessage={error.longitude && error.longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        longitude: `longitude is required`,
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
                  Get latitude and longitude in{" "}
                  <a href="https://www.latlong.net/" target="_blank">
                    https://www.latlong.net/
                  </a>
                </p>
              </div>
              <div className="col-12">
                <Textarea
                  id={`about`}
                  name={`about`}
                  value={about}
                  row={3}
                  label={`About`}
                  placeholder={`about`}
                  errorMessage={error.about && error.about}
                  onChange={(e) => {
                    setAbout(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        about: `About is required`,
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

              {state?.row && (
                <div className="col-12 d-flex">
                  <ExInput
                    label={`Main Image`}
                    id={`mainImage`}
                    type={`file`}
                    onChange={(e) => handleImage(e)}
                    errorMessage={error.mainImage && error.mainImage}
                    accept={"image/*"}
                  />
                  <img
                    src={imagePath}
                    alt=""
                    draggable="false"
                    className={`${
                      (!imagePath || imagePath === "") && "d-none"
                    } ms-4`}
                    data-class={`showImage`}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              )}
              <div className="col-12">
                <div className="inputData text  flex-row justify-content-start text-start">
                  <label for="latitude" className="false ">
                    Select multiple image
                  </label>

                  <ReactDropzone
                    onDrop={(acceptedFiles) => onPreviewDrop(acceptedFiles)}
                    accept="image/*"
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <div
                            style={{
                              height: 130,
                              width: 130,
                              border: "2px dashed gray",
                              textAlign: "center",
                              marginTop: "10px",
                            }}
                          >
                            <i
                              className="fas fa-plus"
                              style={{ paddingTop: 30, fontSize: 70 }}
                            ></i>
                          </div>
                        </div>
                      </section>
                    )}
                  </ReactDropzone>
                </div>
              </div>
              <div className="col-12 d-flex">
                {images?.length > 0 && (
                  <>
                    {images.map((file, index) => {
                      

                      return (
                        <div key={index}>
                          <img
                            height="60px"
                            width="60px"
                            alt="Image"
                            src={file?.preview ? file?.preview : file}
                            style={{
                              height: "100px",
                              width: "100px",
                              boxShadow: "0 5px 15px 0 rgb(105 103 103 / 00%)",
                              border: "2px solid #fff",
                              borderRadius: 10,
                              float: "left",
                              marginRight: 15,
                            }}
                          />
                          <div
                            className="img-container"
                            style={{
                              display: "inline",
                              position: "relative",
                              float: "left",
                            }}
                          >
                            <i
                              className="fas fa-times-circle text-danger"
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => removeImage(file)}
                            ></i>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div className="row  formFooter">
              <div className="col-12 text-end m0">
                <Button
                  className={`bg-gray text-light`}
                  text={`Cancel`}
                  type={`button`}
                  onClick={() => navigate(-1)}
                />
                <Button
                  type={`submit`}
                  className={` text-white m10-left`}
                  style={{ backgroundColor: "#1ebc1e" }}
                  text={`Submit`}
                  onClick={(e) => handleSubmit(e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalon;
