import React, { useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { bonusPenaltyExpertBySalon } from "../../../redux/slice/payoutSlice";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";

const SalonExpertBonusDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData, dialogueMainData } = useSelector((state) => state.dialogue);
  const { setting } = useSelector((state) => state.setting);
  const [bonus, setBonus] = useState("");
  const [penalty, setPenalty] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!bonus && !penalty) {
      setError(ui.bonusPenalty.required);
      return;
    }
    dispatch(
      bonusPenaltyExpertBySalon({
        salonId: dialogueMainData?.salonId,
        settlementId: dialogueData,
        data: {
          bonus: bonus ? bonus : -penalty,
        },
      })
    );
    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-md-6 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">{ui.bonusPenalty.title}</h2>
                </div>
                <div className="col-4">
                  <button type="button" className="closeButton" onClick={() => dispatch(closeDialog())}>
                    <i className="ri-close-line" />
                  </button>
                </div>
              </div>
              <div className="row formBody">
                <div className="col-6">
                  <ExInput
                    type="number"
                    label={`${ui.bonusPenalty.bonus} (${setting?.currencySymbol})`}
                    value={bonus}
                    disabled={!!penalty}
                    onChange={(e) => setBonus(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <ExInput
                    type="number"
                    label={`${ui.bonusPenalty.penalty} (${setting?.currencySymbol})`}
                    value={penalty}
                    disabled={!!bonus}
                    onChange={(e) => setPenalty(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-danger">{error}</p>}
              <div className="formFooter text-end">
                <Button className="bg-gray text-light" text="Annuler" onClick={() => dispatch(closeDialog())} />
                <Button className="text-white m10-left" style={{ backgroundColor: "#1ebc1e" }} text="Enregistrer" onClick={handleSubmit} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonExpertBonusDialog;
