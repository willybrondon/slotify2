import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExInput } from "../../extras/Input";
import Button from "../../extras/Button";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

const CancleDetails = () => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const dispatch = useDispatch();
  const [mongoId, setMongoId] = useState("");

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData);
    }
  }, [dialogueData]);

  return (
    <div className="dialog">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-3 col-md-4 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">Cancel Details</h4>
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
              <form id="expertForm">
                <div className="row align-items-start formBody">
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`reason`}
                      name={`reason`}
                      label={`Reason`}
                      placeholder={`Reason`}
                      value={mongoId?.cancel?.reason}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`Date`}
                      name={`Date`}
                      label={`Date`}
                      placeholder={`Date`}
                      value={mongoId?.cancel?.date}
                      disabled={true}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`Time`}
                      name={`Time`}
                      label={`Time`}
                      placeholder={`Time`}
                      value={mongoId?.cancel?.time}
                      disabled={true}
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
export default CancleDetails;
