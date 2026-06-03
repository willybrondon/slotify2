import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExInput } from "../../extras/Input";
import Button from "../../extras/Button";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";

const CancleDetails = () => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");
  const [mongoId, setMongoId] = useState("");

  console.log("dialogueData", dialogueData);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData);
    }
  }, [dialogueData]);

  return (
    <div className="dialog ">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-3 col-md-4 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">{ui.dialog.cancelBooking}</h4>
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
              <form id="expertForm ">
                <div className="row align-items-start formBody focusNone">
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`reason`}
                      name={`reason`}
                      label={ui.dialog.reason}
                      placeholder={ui.dialog.reason}
                      value={mongoId?.cancel?.reason}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`Date`}
                      name={`Date`}
                      label={ui.table.date}
                      placeholder={ui.table.date}
                      value={mongoId?.cancel?.date}
                    />
                  </div>
                  <div className="col-12">
                    <ExInput
                      type={`text`}
                      id={`Time`}
                      name={`Time`}
                      label={ui.form.time}
                      placeholder={ui.form.time}
                      value={mongoId?.cancel?.time}
                    />
                  </div>
                </div>
                <div className="row  formFooter">
                  <div className="col-12 text-end m0">
                    <Button
                      className={`bg-gray text-light`}
                      text="Annuler"
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
