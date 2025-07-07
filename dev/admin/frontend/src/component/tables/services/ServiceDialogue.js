/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-dupe-keys */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import {
  addService,
  updateService,
  getCatSubCat,
} from "../../../redux/slice/serviceSlice";
import { getAllCategory } from "../../../redux/slice/categorySlice";
import { DangerRight } from "../../api/toastServices";


const ServiceDialogue = (props) => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const { subCat } = useSelector((state) => state.service);
  const [name, setName] = useState();
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [mongoId, setMongoId] = useState();
  const [duration, setDuration] = useState();
  // const [price, setPrice] = useState();
  const [categoryy, setCategoryy] = useState();
;

  const [error, setError] = useState({
    name: "",
    categoryy: "",
    image: "",
    imagePath: "",
    duration: "",
    // price: "",
    categoryy: "",
  });

  const { category } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllCategory());
  }, []);
  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData?._id);
      setName(dialogueData?.name);
      setDuration(dialogueData?.duration);
      // setPrice(dialogueData?.price);
      setImage(dialogueData?.image);
      setImagePath(dialogueData?.image);
      setCategoryy(dialogueData?.categoryId);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {

    try {
      if (
        !name ||
        !image ||
        !imagePath ||
        !duration ||
        // !price ||
        duration <= 0 ||
        // price <= 0 ||
        !categoryy
      ) {
        let error = {};
        if (!name) error.name = "Name is Required";
        if (!duration) error.duration = "Duration is Required";
        // if (!price) error.price = "Price is Required";
        if (!categoryy) error.categoryy = "category is Required";
        // if (price <= 0) error.price = "Enter Correct price";
        if (duration <= 0) error.duration = "Enter Correct duration";
        if (!image?.length === 0 || !imagePath)
          error.image = "Name is Required";
        if (!imagePath) error.imagePath = "imagePath is Required";
        return setError({ ...error });
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("duration", duration);
        // formData.append("price", price);
        formData.append("image", image);
        formData.append("categoryId", categoryy);
        if (mongoId) {
          let payload = {
            formData,
            id: mongoId,
          };
          dispatch(updateService(payload));
          dispatch(closeDialog());
        } else {
          dispatch(addService(formData));
          dispatch(closeDialog());
        }
        // dispatch(closeDialog());
      }
    } catch (err) {
      console.log("err.message", err);
    }
  };

  const handleImage = (e) => {
    if (!e.target.files) {
      setError((prevErrors) => ({
        ...prevErrors,
        image: "Image is Required",
      }));
    }
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };

  return (
    <div className="dialog">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-5 col-md-8 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Service dialog</h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>

              <div className="row align-items-start formBody">
                <div className="col-12 col-md-6">
                  <div className="inputData text  flex-row justify-content-start text-start">
                    <label htmlFor="name" className="ms-2 order-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="rounded-2"
                      id="name"
                      value={name}
                      placeholder="Enter Name"
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
                    {error && (
                      <p className="errorMessage text-start">
                        {error && error?.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="inputData text  flex-row justify-content-start text-start">
                    <label htmlFor="duration" className="ms-2 order-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="rounded-2"
                      id="duration"
                      value={duration}
                      placeholder="Enter Duration"
                      onChange={(e) => {
                        setDuration(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            duration: ` Duration is required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            duration: "",
                          });
                        }
                      }}
                    />
                    {error && (
                      <p className="errorMessage text-start">
                        {error && error?.duration}
                      </p>
                    )}
                  </div>
                </div>
                {/* <div className="col-12 col-md-6">
                  <div className="inputData text  flex-row justify-content-start text-start">
                    <label htmlFor="price" className="ms-2 order-1">
                      
                      Price ($)
                    </label>
                    <input
                      type="number"
                      className="rounded-2"
                      id="price"
                      value={price}
                      placeholder="Enter Price"
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            price: ` Price is required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            price: "",
                          });
                        }
                      }}
                    />
                    {error && (
                      <p className="errorMessage text-start">
                        {error && error?.price}
                      </p>
                    )}
                  </div>
                </div> */}

                <div className="col-md-6 inputData">
                  <div class="inputData">
                    <label className="  " htmlFor="category">
                      Category
                    </label>
                    <select
                      name="category"
                      className="rounded-2 fw-bold"
                      id="category"
                      value={categoryy}
                      onChange={(e) => {
                        setCategoryy(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            categoryType: "CategoryType is Required !",
                          });
                        } else {
                          setError({
                            ...error,
                            categoryy: "",
                          });
                        }
                        {
                          error && (
                            <p className="errorMessage text-start">
                              {error && error?.categoryy}
                            </p>
                          );
                        }
                      }}
                    >
                      <option value="" disabled selected>
                        --select category--
                      </option>
                      {category.map((data) => {
                        return <option value={data._id}>{data.name}</option>;
                      })}
                    </select>
                    {error?.categoryy && (
                      <p className="errorMessage text-start">
                        {error && error?.categoryy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="inputData file  flex-row justify-content-start text-start">
                    <label htmlFor="name" className="ms-2 order-1">
                      Image
                    </label>
                    <input
                      type="file"
                      className="rounded-2"
                      id="image"
                      // value={name}
                      onChange={(e) => handleImage(e)}
                      accept="image/*"
                    />
                    {error && (
                      <p className="errorMessage text-start">
                        {error && error?.image}
                      </p>
                    )}
                    {imagePath && (
                      <div className="image-start">
                        <img
                          src={imagePath}
                          alt="ServiceImage"
                          draggable="false"
                          className={`${
                            (!imagePath || imagePath == "") && "d-none"
                          }`}
                          width={"100px"}
                          height={"100px"}
                          // data-image={name}
                          data-class={`showImage`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="row  formFooter mt-3">
                  <div className="col-12 text-end m0">
                    <Button
                      className={`bg-gray text-light`}
                      text={`Cancel`}
                      type={`button`}
                      onClick={() => dispatch(closeDialog())}
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
      </div>
    </div>
  );
};
export default ServiceDialogue;
