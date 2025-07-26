import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { DangerRight } from "../../api/toastServices";
import { ExInput } from "../../extras/Input";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import moment from "moment";
import Button from "../../extras/Button";
import {
  activeBreak,
  getSalonSchedule,
  updateSalonTime,
} from "../../../redux/slice/salonSlice";
import ToggleSwitch from "../../extras/ToggleSwitch";

const ScheduleDialogue = () => {
  const { dialogueData, salonId } = useSelector((state) => state.dialogue);
  const { salonSchedule } = useSelector((state) => state.salon);
  const findIndex = salonSchedule?.findIndex(
    (value) => value?._id === dialogueData?.data?._id
  );

  const dispatch = useDispatch();
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [endBreakTime, setEndBreakTime] = useState("");
  const [error, setError] = useState({
    openTime: "",
    closeTime: "",
  });

  let addTax;

  useEffect(() => {
    if (dialogueData) {
      setOpenTime(
        moment(dialogueData?.data?.openTime, "hh:mm A").format("hh:mm A")
      );
      setCloseTime(
        moment(dialogueData?.data?.closedTime, "hh:mm A").format("hh:mm A")
      );
      setBreakTime(
        moment(dialogueData?.data?.breakStartTime, "hh:mm A").format("hh:mm A")
      );
      setEndBreakTime(
        moment(dialogueData?.data?.breakEndTime, "hh:mm A").format("hh:mm A")
      );
      setOpenTime(dialogueData?.data?.openTime);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!openTime || !closeTime) {
      let error = {};
      if (!openTime) error.openTime = "Open time is required";
      if (!closeTime) error.closeTime = "Close time is required";
      return setError({ ...error });
    } else {
    
      let response;
      if (dialogueData) {
        if (salonSchedule[findIndex]?.isBreak === true) {
          addTax = {
            openTime: tConvert(openTime),
            closedTime: tConvert(closeTime),
            breakStartTime: tConvert(breakTime),
            breakEndTime: tConvert(endBreakTime),
          };
        } else {
          addTax = {
            openTime: tConvert(openTime),
            closedTime: tConvert(closeTime),
          };
        }
        const payload = {
          data: addTax,
          id: dialogueData?.salonId,
          day: dialogueData?.data?.day,
        };
        response = await dispatch(updateSalonTime(payload)).unwrap();
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
                            ? moment(dialogueData?.data?.openTime, "hh:mm a")
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
                          ? moment(dialogueData?.data?.closedTime, "hh:mm a")
                          : null
                      }
                    />
                    {error && error?.closeTime && (
                      <p className="errorMessage text-start">
                        {error && error?.closeTime}
                      </p>
                    )}
                  </div>

                  {salonSchedule[findIndex]?.isBreak === true ? (
                    <div className="col-12 col-md-6 inputData">
                      <label className="col-12 m-0">Break start time</label>
                      <TimePicker
                        onChange={(e) => handleBreakTime(e)}
                        showSecond={false}
                        allowEmpty
                        use12Hours
                        defaultValue={
                          salonSchedule[findIndex]?.breakStartTime
                            ? moment(
                                salonSchedule[findIndex]?.breakStartTime,
                                "hh:mm a"
                              )
                            : null
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {salonSchedule[findIndex]?.isBreak === true ? (
                    <div className="col-12 col-md-6 inputData">
                      <label className="col-12 m-0">Break End Time</label>
                      <TimePicker
                        onChange={(e) => handleEndBreak(e)}
                        showSecond={false}
                        allowEmpty
                        use12Hours
                        defaultValue={
                          salonSchedule[findIndex]?.breakEndTime
                            ? moment(
                                salonSchedule[findIndex]?.breakEndTime,
                                "hh:mm a"
                              )
                            : null
                        }
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="col-12 col-md-6 inputData">
                    <label className="col-12 m-0">
                      Enable or Disable break
                    </label>
                    <ToggleSwitch
                      value={
                        // dialogueData?.data?.isBreak ||
                        salonSchedule[findIndex]?.isBreak
                      }
                      onClick={() => {
                    

                        const payload = {
                          id: dialogueData?.salonId,
                          day: dialogueData?.data?.day,
                        };
                        dispatch(activeBreak(payload));
                        dispatch(getSalonSchedule(dialogueData?.salonId));
                      }}
                    />
                  </div>

                  <p className="text-danger">
                    Note :- If you enable a break, please select both break start
                    time and break end time. If you do not select these times,
                    some misfunction found in app.
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

export default ScheduleDialogue;

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
