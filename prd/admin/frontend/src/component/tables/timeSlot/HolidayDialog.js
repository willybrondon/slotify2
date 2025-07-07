import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

import { addHoliday } from "../../../redux/slice/holidaySlice";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import { getAllSalons } from "../../../redux/slice/salonSlice";
const HolidayDialog = () => {
  const dispatch = useDispatch();
;
  const { salon } = useSelector((state) => state.salon);

  const [reason, setReason] = useState("");
  const [salonId, setSalonId] = useState("");

  const today = new Date();
  const [date, setDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [error, setError] = useState({
    salonId: "",
    date: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    let payload = {
      start: "ALL",
      limit: "ALL",
      search: "ALL",
    };
    dispatch(getAllSalons(payload));
  }, [dispatch]);

  const handleSubmit = () => {

    if (!date || !salonId || !endDate || !reason) {
      let error = {};
      if (!date) error.date = "Date is required";
      if (!salonId) error.salonId = "Salon is required";
      if (!endDate) error.endDate = "End date is required";
      if (!reason) error.reason = "Reason is required";
      return setError({ ...error });
    } else {
      const hDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");
      const hEndDate = moment(endDate, "YYYY-MM-DD").format("YYYY-MM-DD");

      let data = {
        startDate: hDate,
        endDate: hEndDate,
        reason: reason && reason,
      };
      let payload = { salonId, data };

      dispatch(addHoliday(payload)).unwrap();
    }
    dispatch(closeDialog());
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };
  const handleEndDateChange = (selectedDate) => {
    setEndDate(selectedDate);
  };

  return (
    <div className="dialog">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-4 col-md-6 col-11">
            <div class="mainDiaogBox" style={{ minHeight: "400px" }}>
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Holiday Dialog</h2>
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
                  <div class="inputData text  flex-row justify-content-start text-start">
                    <label for="fname" class="false text-capitalize">
                      Select Salon
                    </label>
                    <select
                      name="bookingType"
                      className="rounded-2 fw-bold"
                      id="bookingType"
                      value={salonId}
                      onChange={(e) => {
                        const selectedSalonId = e.target.value;
                        setSalonId(selectedSalonId);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            salonId: `Salon is required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            salonId: "",
                          });
                        }
                      }}
                    >
                      <option selected >
                        Select Salon
                      </option>
                      {salon.map((data) => (
                        <option key={data?._id} value={data?._id}>
                          {data?.name}
                        </option>
                      ))}
                    </select>
                    {error.salonId && (
                      <p className="errorMessage text-capitalize">
                        {error.salonId && error.salonId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="">
                    <label className="me-4">Choose Start Date</label>
                    <ReactDatePicker
                      selected={date}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                    />
                    {error.date && (
                      <p className="errorMessage text-capitalize">
                        {error.date && error.date}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="">
                    <label className="me-4">Choose End Date</label>
                    <ReactDatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      minDate={date}
                    />
                    {error.endDate && (
                      <p className="errorMessage text-capitalize">
                        {error.endDate && error.endDate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <ExInput
                    label={`Reason`}
                    id={`reason`}
                    type={`text`}
                    errorMessage={error.reason && error.reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          reason: `Reason is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          reason: "",
                        });
                      }
                    }}
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
                    onClick={(e) => handleSubmit(e)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayDialog;
