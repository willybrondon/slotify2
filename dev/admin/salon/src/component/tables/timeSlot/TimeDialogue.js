import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { taxAdd, taxUpdate } from "../../../redux/slice/taxSlice";
import { DangerRight } from "../../api/toastServices";
import {
  activeBreak,
  addSalonTime,
  updateSalonTime,
} from "../../../redux/slice/timeSlice";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import moment from "moment";
import dayjs from "dayjs";

import ToggleSwitch from "../../extras/ToggleSwitch";

const TimeDialogue = () => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const { time } = useSelector((state) => state?.time);

  console.log("time", time);
  console.log("dialogueData", dialogueData);

  const findIndex = time?.findIndex(
    (value) => value?._id === dialogueData?._id
  );

  console.log("findIndex", findIndex);
  console.log("time", time);

  const dispatch = useDispatch();
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [endBreakTime, setEndBreakTime] = useState("");
  const [error, setError] = useState({
    openTime: "",
    closeTime: "",
  });

  useEffect(() => {
    if (dialogueData) {
      setOpenTime(moment(dialogueData?.openTime, "hh:mm A").format("hh:mm A"));
      setCloseTime(
        moment(dialogueData?.closedTime, "hh:mm A").format("hh:mm A")
      );
      setBreakTime(
        moment(dialogueData?.breakStartTime, "hh:mm A").format("hh:mm A")
      );
      setEndBreakTime(
        moment(dialogueData?.breakEndTime, "hh:mm A").format("hh:mm A")
      );
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    e.preventDefault();
    if (!openTime || !closeTime) {
      let error = {};
      if (!openTime) error.openTime = "Open Time is required";
      if (!closeTime) error.closeTime = "Close TIme is required";
      return setError({ ...error });
    } else {
      let addTax = {
        openTime: tConvert(openTime),
        closedTime: tConvert(closeTime),
        breakStartTime: tConvert(breakTime),
        breakEndTime: tConvert(endBreakTime),
      };

      let response;
      if (dialogueData) {
        console.log("dialogueData", dialogueData);
        const payload = { data: addTax, day: dialogueData?.day };
        response = await dispatch(updateSalonTime(payload)).unwrap();
      } else {
        response = await dispatch(addSalonTime(addTax)).unwrap();
      }
      response.status ? dispatch(closeDialog()) : DangerRight(response.message);
    }
    dispatch(closeDialog());
  };

  function handleOpenTime(v) {
    setOpenTime(
      v.hour().toString().padStart(2, "0") +
        ":" +
        v.minute().toString().padStart(2, "0")
    );
  }

  function handleCloseTime(v) {
    setCloseTime(
      v.hour().toString().padStart(2, "0") +
        ":" +
        v.minute().toString().padStart(2, "0")
    );
  }

  function handleBreakTime(v) {
    setBreakTime(
      v.hour().toString().padStart(2, "0") +
        ":" +
        v.minute().toString().padStart(2, "0")
    );
  }

  function handleEndBreak(v) {
    setEndBreakTime(
      v.hour().toString().padStart(2, "0") +
        ":" +
        v.minute().toString().padStart(2, "0")
    );
  }

  useEffect(() => {
    const timePicker = document.querySelector(".rc-time-picker");
    if (timePicker) {
      timePicker.classList.remove("rc-time-picker");
    }
  }, []);

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Salon time dialog</h2>
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
                  <div className="col-12 col-md-6">
                    <div className="inputData text  flex-row justify-content-start text-start">
                      <label className="col-12 m-0">Open time</label>
                      <TimePicker
                        onChange={(e) => handleOpenTime(e)}
                        showSecond={false}
                        allowEmpty
                        use12Hours
                        defaultValue={
                          dialogueData
                            ? moment(dialogueData?.openTime, "hh:mm a")
                            : null
                        }
                      />
                      {error && error?.openTime && (
                        <p className="errorMessage text-start">
                          {error && error?.openTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6 inputData">
                    <label className="col-12 m-0">Close time</label>
                    <TimePicker
                      onChange={(e) => handleCloseTime(e)}
                      showSecond={false}
                      allowEmpty
                      use12Hours
                      defaultValue={
                        dialogueData
                          ? moment(dialogueData?.closedTime, "hh:mm a")
                          : null
                      }
                    />
                    {error && error?.closeTime && (
                      <p className="errorMessage text-start">
                        {error && error?.closeTime}
                      </p>
                    )}
                  </div>

                  {time[findIndex]?.isBreak === true ? (
                    <div className="col-12 col-md-6 inputData">
                      <label className="col-12 m-0">Break start time</label>
                      <TimePicker
                        onChange={(e) => handleBreakTime(e)}
                        showSecond={false}
                        allowEmpty
                        use12Hours
                        defaultValue={
                          time[findIndex]?.breakStartTime
                            ? moment(time[findIndex]?.breakStartTime, "hh:mm a")
                            : null
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {time[findIndex]?.isBreak === true ? (
                    <div className="col-12 col-md-6 inputData">
                      <label className="col-12 m-0">Break end time</label>
                      <TimePicker
                        onChange={(e) => handleEndBreak(e)}
                        showSecond={false}
                        allowEmpty
                        use12Hours
                        defaultValue={
                          time[findIndex]?.breakEndTime
                            ? moment(time[findIndex]?.breakEndTime, "hh:mm a")
                            : null
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="col-12 col-md-6 inputData">
                    <label className="col-12 m-0">
                      Enable Or Disable Break
                    </label>
                    <ToggleSwitch
                      value={time[findIndex]?.isBreak}
                      onClick={() => {
                    

                        const day = dialogueData?.day;
                        dispatch(activeBreak(day));
                      }}
                    />
                  </div>

                  <p className="text-danger">
                    Note :- If you enable a break, please select both break
                    start time and break end time. If you do not select these
                    times, some misfunction found in app.
                  </p>
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
export default TimeDialogue;

function tConvert(time) {
  // Check correct time format and split into components
  const formatTime = time
    .toString()
    .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:([0-5]\d))?$/) || [time];

  if (formatTime.length > 1) {
    const timeParts = formatTime.slice(1);
    const period = +timeParts[0] < 12 ? " AM" : " PM";
    const hours = +timeParts[0] % 12 || 12; // Adjust hours
    const minutes = timeParts[2].padStart(2, "0");

    return hours + ":" + minutes + period;
  }

  return time;
}
