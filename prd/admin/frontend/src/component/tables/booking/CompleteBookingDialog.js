import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ExInput } from "../../extras/Input";
import Button from "../../extras/Button";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

const CompleteBookingDetails = () => {
    const { dialogueData } = useSelector((state) => state.dialogue);
    const dispatch = useDispatch();
    const [mongoId, setMongoId] = useState("");

    console.log('dialogueData', dialogueData)
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
                                    <h4 className="text-theme m0">Booking Info</h4>
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
                                            label={`check in time`}
                                            placeholder={`Reason`}
                                            value={mongoId?.checkInTime}
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <ExInput
                                            type={`text`}
                                            id={`Date`}
                                            name={`Date`}
                                            label={`Check out time`}
                                            placeholder={`Date`}
                                            value={mongoId?.checkOutTime}
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
export default CompleteBookingDetails;
