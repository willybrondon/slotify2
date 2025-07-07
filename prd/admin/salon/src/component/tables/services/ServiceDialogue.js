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
  getAllServices,
} from "../../../redux/slice/serviceSlice";
import { getAllCategory } from "../../../redux/slice/categorySlice";
import { DangerRight } from "../../api/toastServices";


const ServiceDialogue = (props) => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [mongoId, setMongoId] = useState();
  const [duration, setDuration] = useState();
  const [price, setPrice] = useState();
  

  const [error, setError] = useState({
    price: "",
  });

  const { category } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllCategory());
  }, []);
  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData?._id);

      setPrice(dialogueData?.price);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {
    
    try {
      if (!price) {
        let error = {};

        if (!price) error.price = "Price is Required";

        return setError({ ...error });
      } else {
        let response;

        const data = { price, serviceId: mongoId };

        if (mongoId) {
          let payload = {
            data,
          };
          response = await dispatch(updateService(payload)).unwrap();
        }

        response.status
          ? dispatch(getAllServices())
          : DangerRight(response.message);
        dispatch(closeDialog());
      }
    } catch (err) {
      console.log("err.message", err);
    }
  };

  return (
    <div className="dialog">
      <div class="" style={{width :"1200px"}}>
        <div class="row justify-content-center">
          <div class="col-xl-5 col-md-8 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Service Dialogue</h2>
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
                <div className="col-12">
                  <div className="inputData text  flex-row justify-content-start text-start">
                    <label htmlFor="price" className="ms-2 order-1">
                      {" "}
                      Price ($){" "}
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
                </div>

                <div className="row  formFooter mt-4">
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
