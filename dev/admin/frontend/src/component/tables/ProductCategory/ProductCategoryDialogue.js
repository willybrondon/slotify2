/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-dupe-keys */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { DangerRight } from "../../api/toastServices";
import {
  getAllProductCategory,
  productCategoryAdd,
  productCategoryUpdate,
} from "../../../redux/slice/productCategorySlice";
import { toast } from "react-toastify";


const ProductCategoryDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [name, setName] = useState();
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [mongoId, setMongoId] = useState();
;
  const [error, setError] = useState({
    name: "",
    image: "",
    imagePath: "",
  });

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData?._id);
      setName(dialogueData?.name);
      setImage(dialogueData?.image);
      setImagePath(dialogueData?.image);
    }
  }, [dialogueData]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !image || !imagePath) {
      let error = {};
      if (!name) error.name = "Name is Required";
      if (!image?.length === 0 || !imagePath) error.image = "Image is Required";
      if (!imagePath) error.imagePath = "Image Path is Required";
      return setError({ ...error });
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    try {
      let response;
      if (mongoId) {
        const payload = {
          formData,
          id: mongoId,
        };
        response = await dispatch(productCategoryUpdate(payload)).unwrap();
      } else {
        response = await dispatch(productCategoryAdd(formData)).unwrap();
      }
      if (response.status) {
        if (mongoId) {
          toast.success(response?.message);
        }
        dispatch(getAllProductCategory());
        dispatch(closeDialog());
      } else {
        DangerRight(response.message);
      }
    } catch (err) {
      console.error("Error:", err);
      DangerRight(err.message);
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
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Product Category dialog</h2>
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
                <div className="inputData text  flex-row justify-content-start text-start">
                  <label
                    htmlFor="name"
                    className="ms-2 order-1"
                  >
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
                <div className="inputData file  flex-row justify-content-start text-start">
                  <label
                    htmlFor="name"
                    className="ms-2 order-1"
                  >
                    Image
                  </label>
                  <input
                    type="file"
                    className="rounded-2"
                    id="image"
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
export default ProductCategoryDialogue;
