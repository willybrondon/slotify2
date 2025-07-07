import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { taxAdd, taxUpdate } from "../../../redux/slice/taxSlice";
import { DangerRight } from "../../api/toastServices";
import { addSalonTime, updateSalonTime } from "../../../redux/slice/timeSlice";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import moment from "moment";
import dayjs from "dayjs";


const TimeDialogue = () => {
  const { dialogueData } = useSelector((state) => state.dialogue);
;
  const dispatch = useDispatch();
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [endBreakTime, setEndBreakTime] = useState("");
  const [slotTime, setSlotTime] = useState();
  const [day, setDay] = useState("");
  const [error, setError] = useState({
    openTime: "",
    closeTime: "",
    day: "",
    slotTime: "",
  });

  if (dialogueData) {
    var timeInterval = dialogueData?.breakTime;
    var [startTime, endTime] = timeInterval?.split(" TO ");
  }

  useEffect(() => {
    if (dialogueData) {
      setOpenTime(moment(dialogueData?.openTime, "hh:mm A").format("hh:mm A"));
      setCloseTime(
        moment(dialogueData?.closedTime, "hh:mm A").format("hh:mm A")
      );
      setBreakTime(moment(startTime, "hh:mm A").format("hh:mm A"));
      setEndBreakTime(moment(endTime, "hh:mm A").format("hh:mm A"));
      setOpenTime(dialogueData?.openTime);
      setDay(dialogueData?.day);
      setSlotTime(dialogueData?.slot);
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    e.preventDefault();
    if (!openTime || !closeTime || !day || !slotTime) {
      let error = {};
      if (!openTime) error.openTime = "Open time is required";
      if (!day) error.day = "Day is required";
      if (!closeTime) error.closeTime = "Close time is required";
      return setError({ ...error });
    } else {
      let addTax = {
        openTime: tConvert(openTime),
        closedTime: tConvert(closeTime),
        day,
        slot: slotTime,
      };

      if (breakTime) {
        addTax.breakTime =
          tConvert(breakTime) + " TO " + tConvert(endBreakTime);
      }

      let response;
      if (dialogueData) {
        const payload = { data: addTax, id: dialogueData._id };
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
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-5 col-md-8 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Saloon Time Dialog</h2>
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
                    <ExInput
                      type={`text`}
                      id={`day`}
                      name={`day`}
                      label={`Day`}
                      placeholder={`Day`}
                      value={day}
                      onChange={(e) => {
                        setDay(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            day: "Day is Required !",
                          });
                        } else {
                          setError({
                            ...error,
                            day: "",
                          });
                        }
                      }}
                    />
                    {error && error?.day && (
                      <p className="errorMessage text-start">
                        {error && error?.day}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <ExInput
                      type={`number`}
                      id={`slotTime`}
                      name={`slotTime`}
                      label={`Slot Time (Minute)`}
                      placeholder={`slotTime`}
                      value={slotTime}
                      onChange={(e) => {
                        setSlotTime(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            slotTime: "slotTime is Required !",
                          });
                        } else {
                          setError({
                            ...error,
                            slotTime: "",
                          });
                        }
                      }}
                    />
                    {error && error?.slotTime && (
                      <p className="errorMessage text-start">
                        {error && error?.slotTime}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="inputData text  flex-row justify-content-start text-start">
                      <label className="col-12 m-0">Open Time</label>
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
                    <label className="col-12 m-0">Close Time</label>
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

                  <div className="col-12 col-md-6 inputData">
                    <label className="col-12 m-0">Break Time</label>
                    <TimePicker
                      onChange={(e) => handleBreakTime(e)}
                      showSecond={false}
                      allowEmpty
                      use12Hours
                      defaultValue={
                        dialogueData ? moment(startTime, "hh:mm a") : null
                      }
                    />
                  </div>
                  <div className="col-12 col-md-6 inputData">
                    <label className="col-12 m-0">Break End Time</label>
                    <TimePicker
                      onChange={(e) => handleEndBreak(e)}
                      showSecond={false}
                      allowEmpty
                      use12Hours
                      defaultValue={
                        dialogueData ? moment(endTime, "hh:mm a") : null
                      }
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
