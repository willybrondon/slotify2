import React, { useEffect, useState } from "react";
import Button from "../extras/Button";
import { ExInput } from "../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../redux/slice/dialogueSlice";

import { bonusPenalty } from "../../redux/slice/salarySlice";



const BonusPenaltyDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
;
  const { setting } = useSelector((state) => state.setting);

  const [bonus, setBonus] = useState(null);
  const [penalty, setPenalty] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState();

  const handleSubmit = () => {

    if (!bonus && !penalty) {
      setError("Bonus or Penalty is required");
    } else {
      
      const payload = {
        data: {
          bonus: bonus ? bonus : -penalty,
          note,
        },
        settlementId: dialogueData,
      };

      dispatch(bonusPenalty(payload)).unwrap();

      dispatch(closeDialog());
    }
  };

  return (
    <div className="dialog">
      <div class="w-100">
        <div class="row justify-content-center">
          <div class="col-xl-4 col-md-6 col-11">
            <div class="mainDiaogBox">
              <div class="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">Bonus Penalty Dialog</h2>
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
                <div
                  className={`col-6 ${
                    penalty !== null && penalty.length > 0 && "opacity-50"
                  }`}
                >
                  <ExInput
                    type={`number`}
                    id={`bonus`}
                    name={`bonus`}
                    value={bonus}
                    disabled={penalty !== null && penalty.length > 0}
                    label={`Bonus  (${setting?.currencySymbol})`}
                    placeholder={`Bonus`}
                    errorMessage={error && error}
                    onChange={(e) => {
                      setBonus(e.target.value);
                    }}
                  />
                </div>

                <div
                  className={`col-6 ${
                    bonus !== null && bonus.length > 0 && "opacity-50"
                  }`}
                >
                  <ExInput
                    type={`number`}
                    id={`penalty`}
                    name={`penalty`}
                    value={penalty}
                    disabled={bonus !== null && bonus.length > 0}
                    label={`Penalty  (${setting?.currencySymbol})`}
                    placeholder={`Penalty`}
                    errorMessage={error && error}
                    onChange={(e) => {
                      setPenalty(e.target.value);
                    }}
                  />
                </div>
                <div className="col-6">
                  <ExInput
                    type={`text`}
                    id={`note`}
                    name={`note`}
                    value={note}
                    label={`Note`}
                    placeholder={`Note`}
                    onChange={(e) => {
                      setNote(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="text-danger text-capitalize">
                Note : you Can either give bonus or penalty.
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

export default BonusPenaltyDialog;
