import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  attributeAdd,
  attributeUpdate,
  getAllAttributes,
} from "../../../redux/slice/attributeSlice";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

import { toast } from "react-toastify";

const AttributeDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
;
  const [addDetail, setAddDetail] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState({});
  const [detail, setDetail] = useState("");
  const [mongoId, setMongoId] = useState();

  useEffect(() => {
    if (dialogueData) {
      setName(dialogueData?.name || "");
      setDetail(dialogueData?.detail || "");
      setMongoId(dialogueData?._id);
      setAddDetail(dialogueData?.value || []);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationError = {};

    if (!name) validationError.name = "Name is required!";
    if (!detail && addDetail?.length === 0)
      validationError.detail = "Details are required!";

    setError(validationError);

    if (Object.keys(validationError).length > 0) return;



    const data = {
      name,
      value: addDetail,
    };
    const data1 = {
      ...data,
      id: mongoId,
    };

    if (mongoId) {
      dispatch(attributeUpdate(data1)).then((res) => {
        if (res?.payload?.status) {
          dispatch(getAllAttributes());
          toast.success(res?.payload?.message);
        } else {
          toast.error(res?.payload?.message);
        }
      });
    } else {
      dispatch(attributeAdd(data)).then((res) => {
        if (res?.payload?.status) {
          dispatch(getAllAttributes());
        } else {
          toast.error(res?.payload?.message);
        }
      });
    }
    dispatch(closeDialog());
  };

  const addDetailToList = (e) => {
    e.preventDefault();
    if (detail.trim()) {
      setAddDetail((prev) => [
        ...prev,
        detail.charAt(0).toUpperCase() + detail.slice(1),
      ]);
      setDetail("");
      setError((prev) => ({ ...prev, detail: "" }));
    } else {
      setError((prev) => ({ ...prev, detail: "Details are required!" }));
    }
  };

  const onRemove = (index) => {
    setAddDetail((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Attribute dialog</h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => dispatch(closeDialog())}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                id="expertForm"
              >
                <div className="row align-items-start formBody">
                  <div className="col-12">
                    <div className="inputData text flex-row justify-content-start text-start">
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
                          setError({ ...error, name: "" });
                        }}
                      />
                      {error.name && (
                        <span
                          className="text-danger"
                          style={{ fontSize: "15px" }}
                        >
                          {error.name}
                        </span>
                      )}
                    </div>
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        {name === "Colors" ? (
                          <div className="inputData text flex-row justify-content-start text-start w-75">
                            <label
                              htmlFor="value"
                              className="ms-2 order-1"
                            >
                              Value
                            </label>
                            <input
                              type="color"
                              className="rounded-2"
                              style={{ cursor: "pointer", padding: "5px" }}
                              value={detail}
                              onChange={(e) => {
                                setDetail(e.target.value);
                                setError({ ...error, detail: "" });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="inputData text flex-row justify-content-start text-start w-100">
                            <label
                              htmlFor="value"
                              className="ms-2 order-1"
                            >
                              Value
                            </label>
                            <input
                              type="text"
                              className="rounded-2"
                              value={detail}
                              placeholder="Enter detail"
                              onChange={(e) => {
                                setDetail(e.target.value);
                                setError({ ...error, detail: "" });
                              }}
                            />
                          </div>
                        )}
                        {detail !== "" && (
                          <div
                            className="px-3 text-white d-flex align-items-center justify-content-center ms-3"
                            style={{
                              borderRadius: "5px",
                              cursor: "pointer",
                              backgroundColor: "#1C2B20",
                              padding: "6px 0px",
                              marginTop:"32px"
                            }}
                            onClick={addDetailToList}
                          >
                            <span>ADD</span>
                          </div>
                        )}
                      </div>
                      {error.detail && (
                        <span
                          className="text-danger"
                          style={{ fontSize: "15px" }}
                        >
                          {error.detail}
                        </span>
                      )}{" "}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <div
                      className="displayCountry form-control border p-3"
                      style={{ overflow: "auto" }}
                    >
                      {addDetail.map((item, index) => (
                        <span
                          key={index}
                          className="ms-1 my-1 text-capitalize"
                          style={{
                            backgroundColor: "#1C2B20",
                            padding: "5px",
                            color: "#fff",
                            borderRadius: "5px",
                            fontSize: "12px",
                          }}
                        >
                          {item}
                          <i
                            className="fa-solid fa-circle-xmark ms-2 my-2"
                            onClick={() => onRemove(index)}
                          ></i>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row formFooter">
                  <div className="col-12 text-end m0">
                    <Button
                      className={`bg-gray text-light`}
                      text={`Cancel`}
                      type={`button`}
                      onClick={() => dispatch(closeDialog())}
                    />
                    <Button
                      type={`submit`}
                      className={`text-white m10-left`}
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

export default AttributeDialogue;
