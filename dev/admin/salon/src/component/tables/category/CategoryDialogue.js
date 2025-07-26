import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import Input from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { editData, objectToFormData, submitData } from "../../../util/fuction";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { DangerRight } from "../../api/toastServices";

import {
  categoryAdd,
  categoryUpdate,
} from "../../../redux/slice/categorySlice";

const CategoryDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [imagePath, setImagePath] = useState("");
  useEffect(() => {
    if (dialogueData) {
      editData(dialogueData);
      setImagePath(dialogueData?.image);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addCategory = submitData(e);

    if (addCategory) {
      const formData = objectToFormData(addCategory);

      try {
        let response;
        if (dialogueData) {
          const payload = { formData, categoryId: dialogueData._id };
          response = await dispatch(categoryUpdate(payload)).unwrap();
        } else {
          response = await dispatch(categoryAdd(formData)).unwrap();
        }
        response.status
          ? dispatch(closeDialog())
          : DangerRight(response.message);
      } catch (err) {
        console.log("err", err);
        DangerRight(err.message);
      }
    }
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Category dialog</h2>
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
              <form onSubmit={handleSubmit} id="expertForm">
                <div className="row align-items-start formBody">
                  <div className="col-12 ">
                    <Input
                      type={`text`}
                      id={`name`}
                      name={`name`}
                      label={`Name`}
                      placeholder={`Name`}
                      errorMessage={`Enter Name`}
                    />
                  </div>
                  <div className="col-12 ">
                    <Input
                      type={`file`}
                      id={`image`}
                      name={`image`}
                      label={`Image`}
                      errorMessage={`Image is required`}
                      accept={"image/ "}
                    />
                  </div>
                </div>
                <div className="row  formFooter">
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
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDialogue;
