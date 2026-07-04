import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Multiselect from "multiselect-react-dropdown";
import { ExInput } from "../../extras/Input";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import {
  allowCity,
  blockCity,
  getParticularSalonService,
} from "../../../redux/slice/serviceSlice";
import { getAllCity } from "../../../redux/slice/citySlice";

const ServiceEditDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const { city } = useSelector((state) => state.city);
  const { admin } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    selectedCities: [],
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [citiesToBlock, setCitiesToBlock] = useState([]);

  useEffect(() => {
    dispatch(getAllCity());
  }, [dispatch]);

  useEffect(() => {
    if (city?.data) {
      setCityOptions(
        city.data.map((cityData) => ({
          name: cityData.city,
          id: cityData.city,
          country: cityData.country,
        }))
      );
    }
  }, [city]);

  useEffect(() => {
    if (dialogueData) {
      const formattedSelectedCities =
        dialogueData?.cities?.map((c) => ({
          name: c.city,
          id: c.city,
          country: c.country,
        })) || [];
      setFormData({
        name: dialogueData?.name || "",
        price: dialogueData?.price || "",
        duration: dialogueData?.duration || "",
        selectedCities: formattedSelectedCities,
      });
      setCitiesToBlock([]);
    }
  }, [dialogueData]);

  const handleSubmit = async () => {
    const existingCities = dialogueData?.cities || [];

    const newCities = formData.selectedCities.filter(
      (selectedCity) =>
        !existingCities.some(
          (existingCity) =>
            existingCity.city === selectedCity.name &&
            existingCity.country === selectedCity.country
        )
    );

    const citiesToRemove = citiesToBlock.map((c) => ({
      city: c.name,
      country: c.country,
    }));

    const promises = [];

    if (newCities.length > 0) {
      promises.push(
        dispatch(
          allowCity({
            salonId: admin?._id,
            serviceId: dialogueData?._id,
            allowCities: newCities.map((c) => ({
              city: c.name,
              country: c.country,
            })),
          })
        )
      );
    }

    if (citiesToRemove.length > 0) {
      promises.push(
        dispatch(
          blockCity({
            salonId: admin?._id,
            serviceId: dialogueData?._id,
            blockCities: citiesToRemove,
          })
        )
      );
    }

    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        dispatch(closeDialog());
        dispatch(getParticularSalonService());
      });
    } else {
      dispatch(closeDialog());
    }
  };

  return createPortal(
    <div className="dialog sq-dialog-pro" role="presentation" onClick={() => dispatch(closeDialog())}>
      <div
        className="sq-dialog-pro__sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mainDiaogBox sq-dialog-pro__box">
          <div className="row justify-content-between align-items-center formHead">
            <div className="col-9">
              <p className="sq-dialog-pro__kicker mb-1">{ui.servicesPage.manageCities}</p>
              <h2 className="text-theme m0 sq-dialog-pro__title">{formData.name}</h2>
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

          <div className="row align-items-start formBody">
            <div className="col-12 mb-3">
              <ExInput type="text" value={formData.name} label={ui.form.serviceName} readOnly />
            </div>
            <div className="col-12 mb-3">
              <label className="sq-dialog-pro__label">{ui.servicesPage.allowCities}</label>
              <Multiselect
                options={cityOptions}
                selectedValues={formData.selectedCities}
                onSelect={(list) => setFormData({ ...formData, selectedCities: list })}
                onRemove={(list) => setFormData({ ...formData, selectedCities: list })}
                displayValue="name"
                hideOnClickOutside={false}
              />
            </div>
            <div className="col-12 mb-3">
              <label className="sq-dialog-pro__label">{ui.servicesPage.blockCities}</label>
              <Multiselect
                options={
                  dialogueData?.cities?.map((c) => ({
                    name: c.city,
                    id: c.city,
                    country: c.country,
                  })) || []
                }
                selectedValues={citiesToBlock}
                onSelect={setCitiesToBlock}
                onRemove={setCitiesToBlock}
                displayValue="name"
                hideOnClickOutside={false}
              />
            </div>
            <div className="col-12 d-flex flex-wrap justify-content-end gap-2 formFooter mt-2">
              <Button
                className="bg-gray text-light"
                text="Annuler"
                type="button"
                onClick={() => dispatch(closeDialog())}
              />
              <Button
                type="button"
                className="text-white"
                style={{ backgroundColor: "#c45c26" }}
                text="Enregistrer"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ServiceEditDialogue;
