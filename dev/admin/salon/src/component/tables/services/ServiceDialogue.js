/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import {
  updateService,
  getAllServices,
  getParticularSalonService,
} from "../../../redux/slice/serviceSlice";
import { getAllCategory } from "../../../redux/slice/categorySlice";
import { DangerRight } from "../../api/toastServices";

const ServiceDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const { setting } = useSelector((state) => state.setting);
  const [mongoId, setMongoId] = useState();
  const [price, setPrice] = useState();
  const [error, setError] = useState({ price: "" });

  useEffect(() => {
    dispatch(getAllCategory());
  }, [dispatch]);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData?._id);
      setPrice(dialogueData?.price ?? "");
    }
  }, [dialogueData]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      if (!price) {
        return setError({ price: ui.dialog.priceRequired });
      }

      const response = await dispatch(
        updateService({
          data: { price: Number(price), serviceId: mongoId },
        })
      ).unwrap();

      if (response?.status) {
        dispatch(getAllServices());
        dispatch(getParticularSalonService());
        dispatch(closeDialog());
      } else {
        DangerRight(response?.message || ui.toast.oops);
      }
    } catch (err) {
      console.error("[ServiceDialogue]", err);
    }
  };

  const currency = setting?.currencySymbol || "€";

  return createPortal(
    <div className="dialog sq-dialog-pro" role="presentation" onClick={() => dispatch(closeDialog())}>
      <div
        className="sq-dialog-pro__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sq-service-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mainDiaogBox sq-dialog-pro__box">
          <div className="row justify-content-between align-items-center formHead">
            <div className="col-9">
              <p className="sq-dialog-pro__kicker mb-1">{ui.dialog.serviceDialog}</p>
              <h2 id="sq-service-dialog-title" className="text-theme m0 sq-dialog-pro__title">
                {dialogueData?.name || ui.dialog.serviceDialog}
              </h2>
              {dialogueData?.duration != null && (
                <p className="sq-dialog-pro__meta mb-0">
                  {dialogueData.duration} {ui.servicesPage.minutes}
                  {dialogueData?.categoryname ? ` · ${dialogueData.categoryname}` : ""}
                </p>
              )}
            </div>
            <div className="col-auto">
              <button
                type="button"
                className="closeButton"
                aria-label="Fermer"
                onClick={() => dispatch(closeDialog())}
              >
                <i className="ri-close-line" />
              </button>
            </div>
          </div>

          <form className="row align-items-start formBody" onSubmit={handleSubmit}>
            <div className="col-12">
              <div className="inputData text flex-row justify-content-start text-start">
                <label htmlFor="service-price" className="ms-2 order-1">
                  {ui.form.serviceCharge} ({currency})
                </label>
                <input
                  type="number"
                  className="rounded-2"
                  id="service-price"
                  min="0"
                  step="0.01"
                  value={price}
                  placeholder={ui.dialog.enterPrice}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setError({
                      price: !e.target.value ? ui.dialog.priceRequired : "",
                    });
                  }}
                />
                {error?.price && (
                  <p className="errorMessage text-start">{error.price}</p>
                )}
              </div>
            </div>

            <div className="row formFooter mt-3">
              <div className="col-12 d-flex flex-wrap justify-content-end gap-2 m0">
                <Button
                  className="bg-gray text-light"
                  text="Annuler"
                  type="button"
                  onClick={() => dispatch(closeDialog())}
                />
                <Button
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: "#c45c26" }}
                  text="Enregistrer"
                  onClick={handleSubmit}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ServiceDialogue;
