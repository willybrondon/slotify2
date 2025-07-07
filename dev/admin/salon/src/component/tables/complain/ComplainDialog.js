import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput, Textarea } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

const ComplainDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);

  return (
    <div className="dialog focusNone">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-4 col-md-6 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Complain Info</h2>
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
                  <Textarea
                    value={dialogueData?.details}
                    label={`Details`}
                    placeholder={`Details`}
                    readOnly={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <ExInput
                    type={`text`}
                    value={
                      dialogueData?.userId?.fname
                        ? dialogueData?.userId.fname +
                          " " +
                          dialogueData?.userId?.lname
                        : dialogueData?.expertId
                        ? dialogueData?.expertId?.fname +
                          " " +
                          dialogueData?.expertId?.lname
                        : dialogueData?.userId ? 'Salon User' : 'Salon Expert'
                    }
                    label={
                      dialogueData?.expertId
                        ? "Expert"
                        : dialogueData.userId
                        ? "User"
                        : ""
                    }
                    placeholder={
                      dialogueData?.expertId
                        ? "Expert"
                        : dialogueData.userId
                        ? "User"
                        : ""
                    }
                    readOnly={true}
                  />
                              </div>
                              
                              <div className="col-12 col-md-6">
                  <ExInput
                    type={`text`}
                    value={
                      dialogueData?.userId
                        ? dialogueData?.userId.uniqueId 
                        : dialogueData?.expertId
                        ? dialogueData?.expertId?.uniqueId 
                        : "-"
                    }
                    label={
                      dialogueData?.expertId
                        ? "Expert UniqueId"
                        : dialogueData.userId
                        ? "User UniqueId"
                        : ""
                    }
                    placeholder={
                      dialogueData?.expertId
                        ? "Expert"
                        : dialogueData.userId
                        ? "User"
                        : ""
                    }
                    readOnly={true}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <ExInput
                    value={dialogueData?.date}
                    label={`Date And Time Of Report`}
                    placeholder={`Date & Time`}
                    readOnly={true}
                  />
                              </div>
                              {dialogueData?.type === 1 &&
                                  <div className="col-12 col-md-6">
                                  <ExInput
                                    value={dialogueData?.solvedDate}
                                    label={`Solved Date And Time `}
                                    placeholder={`Date & Time`}
                                    readOnly={true}
                                  />
                                </div>
                              }
                {dialogueData?.image ? (
                  <div className="col-6">
                    <img
                      src={dialogueData?.image}
                      alt=""
                      draggable="false"
                      data-class={`showImage`}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplainDialog;
