import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Multiselect from "multiselect-react-dropdown";
import { ExInput, Textarea } from "../../extras/Input";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import {
  allowCity,
  blockCity,
  getParticularSalonService,
  updateServiceDetailCard,
  getPrepTemplates,
} from "../../../redux/slice/serviceSlice";
import { getProducts } from "../../../redux/slice/productSlice";
import { getAllCity } from "../../../redux/slice/citySlice";
import { Success } from "../../api/toastServices";

const linesToText = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");
const textToLines = (s) =>
  String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 5);

const addonsToText = (addons) =>
  Array.isArray(addons)
    ? addons
        .map((a) =>
          [a.label || "", a.addPrice ?? "", a.addMinutes ?? ""].join(" | ")
        )
        .join("\n")
    : "";

const textToAddons = (s) =>
  textToLines(s).map((line, i) => {
    const parts = line.split("|").map((p) => p.trim());
    return {
      id: `addon_${i + 1}`,
      label: parts[0] || "",
      addPrice: Number(parts[1]) || 0,
      addMinutes: Number(parts[2]) || 0,
    };
  });

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
  const [detail, setDetail] = useState({
    shortDescription: "",
    includes: "",
    prepMust: "",
    prepAvoid: "",
    inspirationPhotoEnabled: false,
    addons: "",
    importantNote: "",
    depositPercent: "",
    prepBufferMinutes: "",
    prepFamilyId: "",
    recommendedProductIds: [],
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [citiesToBlock, setCitiesToBlock] = useState([]);
  const [saving, setSaving] = useState(false);
  const [prepFamilies, setPrepFamilies] = useState([]);
  const [applyingPrep, setApplyingPrep] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    dispatch(getAllCity());
    dispatch(getProducts({ start: 0, limit: 100 }))
      .unwrap()
      .then((res) => {
        const list = Array.isArray(res?.products) ? res.products : [];
        setProductOptions(
          list
            .filter((p) => !p.createStatus || p.createStatus === "Approved")
            .map((p) => ({
              id: String(p._id),
              name: p.productName || p.name || "Produit",
            }))
        );
      })
      .catch(() => setProductOptions([]));
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
      const dc = dialogueData?.detailCard || {};
      const afro = dialogueData?.afroConfig || {};
      setDetail({
        shortDescription: dc.shortDescription || "",
        includes: linesToText(dc.includes),
        prepMust: linesToText(dc.prepMust),
        prepAvoid: linesToText(dc.prepAvoid),
        inspirationPhotoEnabled: Boolean(dc.inspirationPhotoEnabled),
        addons: addonsToText(dc.addons || afro.addonDefs),
        importantNote: dc.importantNote || "",
        depositPercent:
          dc.depositPercent === null || dc.depositPercent === undefined
            ? ""
            : String(dc.depositPercent),
        prepBufferMinutes:
          afro.prepBufferMinutes === null || afro.prepBufferMinutes === undefined
            ? ""
            : String(afro.prepBufferMinutes),
        prepFamilyId: dc.prepFamilyId || "",
        recommendedProductIds: Array.isArray(dc.recommendedProductIds)
          ? dc.recommendedProductIds.map(String)
          : [],
      });
      setCitiesToBlock([]);

      const categoryName =
        dialogueData?.categoryName ||
        dialogueData?.categoryId?.name ||
        dialogueData?.categoryId?.nameFr ||
        "";
      dispatch(
        getPrepTemplates({
          serviceName: dialogueData?.name || "",
          categoryName,
        })
      )
        .unwrap()
        .then((res) => {
          if (res?.status && Array.isArray(res.families)) {
            setPrepFamilies(res.families);
          }
          if (!dc.prepFamilyId && res?.detectedFamilyId) {
            setDetail((prev) => ({
              ...prev,
              prepFamilyId: res.detectedFamilyId,
            }));
          }
          const emptyPrep =
            !linesToText(dc.prepMust) && !linesToText(dc.prepAvoid);
          if (emptyPrep && res?.suggested) {
            setDetail((prev) => ({
              ...prev,
              prepFamilyId: res.suggested.familyId || prev.prepFamilyId,
              prepMust: linesToText(res.suggested.prepMust),
              prepAvoid: linesToText(res.suggested.prepAvoid),
            }));
          }
        })
        .catch(() => {});
    }
  }, [dialogueData, dispatch]);

  useEffect(() => {
    const ids = detail.recommendedProductIds || [];
    if (!ids.length || !productOptions.length) {
      setSelectedProducts(
        ids.length
          ? ids.map((id) => ({ id: String(id), name: String(id) }))
          : []
      );
      return;
    }
    setSelectedProducts(
      ids.map((id) => {
        const found = productOptions.find((p) => p.id === String(id));
        return found || { id: String(id), name: String(id) };
      })
    );
  }, [detail.recommendedProductIds, productOptions]);

  const applyPrepTemplate = async () => {
    setApplyingPrep(true);
    try {
      const categoryName =
        dialogueData?.categoryName ||
        dialogueData?.categoryId?.name ||
        dialogueData?.categoryId?.nameFr ||
        "";
      const res = await dispatch(
        getPrepTemplates({
          serviceName: dialogueData?.name || formData.name || "",
          categoryName,
          familyId: detail.prepFamilyId || undefined,
        })
      ).unwrap();
      if (res?.suggested) {
        setDetail((prev) => ({
          ...prev,
          prepFamilyId: res.suggested.familyId || prev.prepFamilyId,
          prepMust: linesToText(res.suggested.prepMust),
          prepAvoid: linesToText(res.suggested.prepAvoid),
        }));
        Success(ui.servicesPage.prepTemplateApplied);
      }
    } catch (e) {
      // toast via api layer
    } finally {
      setApplyingPrep(false);
    }
  };

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

    setSaving(true);
    try {
      const res = await dispatch(
        updateServiceDetailCard({
          serviceId: dialogueData?._id,
          detailCard: {
            shortDescription: detail.shortDescription,
            includes: textToLines(detail.includes),
            prepMust: textToLines(detail.prepMust),
            prepAvoid: textToLines(detail.prepAvoid),
            inspirationPhotoEnabled: detail.inspirationPhotoEnabled,
            addons: textToAddons(detail.addons),
            importantNote: detail.importantNote,
            depositPercent:
              detail.depositPercent === "" ? null : Number(detail.depositPercent),
            prepBufferMinutes:
              detail.prepBufferMinutes === ""
                ? undefined
                : Number(detail.prepBufferMinutes),
            prepFamilyId: detail.prepFamilyId || null,
            recommendedProductIds: selectedProducts.map((p) => p.id).slice(0, 12),
          },
        })
      ).unwrap();
      if (res?.status === false) {
        return;
      }
      Success(ui.apiMessages.successGeneric);
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      dispatch(closeDialog());
      dispatch(getParticularSalonService());
    } catch (e) {
      // toast handled by api layer when present
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="dialog sq-dialog-pro" role="presentation" onClick={() => dispatch(closeDialog())}>
      <div
        className="sq-dialog-pro__sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="mainDiaogBox sq-dialog-pro__box">
          <div className="row justify-content-between align-items-center formHead">
            <div className="col-9">
              <p className="sq-dialog-pro__kicker mb-1">{ui.servicesPage.detailCardTitle}</p>
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

            <div className="col-12 mt-2 mb-2">
              <h5 className="mb-1">{ui.servicesPage.detailCardTitle}</h5>
              <p className="text-muted" style={{ fontSize: 13 }}>
                {ui.servicesPage.detailCardHint}
              </p>
            </div>
            <div className="col-12 mb-3">
              <Textarea
                row={2}
                value={detail.shortDescription}
                label={ui.servicesPage.shortDescription}
                placeholder="Ex. Box braids avec finition soignée, mèches incluses."
                onChange={(e) =>
                  setDetail({ ...detail, shortDescription: e.target.value })
                }
              />
            </div>
            <div className="col-md-6 mb-3">
              <Textarea
                row={4}
                value={detail.includes}
                label={ui.servicesPage.includes}
                placeholder={"Box Braids\nfinition\nmèches incluses"}
                onChange={(e) => setDetail({ ...detail, includes: e.target.value })}
              />
            </div>
            <div className="col-12 mb-2">
              <label className="sq-dialog-pro__label">
                {ui.servicesPage.prepTemplateLabel}
              </label>
              <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                {ui.servicesPage.prepTemplateHint}
              </p>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <select
                  className="form-select"
                  style={{ maxWidth: 360 }}
                  value={detail.prepFamilyId || ""}
                  onChange={(e) =>
                    setDetail({ ...detail, prepFamilyId: e.target.value })
                  }
                >
                  <option value="">— {ui.servicesPage.prepTemplateDetected} —</option>
                  {prepFamilies.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  className="bg-gray text-light"
                  text={applyingPrep ? "…" : ui.servicesPage.prepTemplateApply}
                  onClick={applyPrepTemplate}
                />
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <Textarea
                row={5}
                value={detail.prepMust}
                label={ui.servicesPage.prepMust}
                placeholder={"cheveux propres\ncheveux démêlés\ncheveux séchés"}
                onChange={(e) => setDetail({ ...detail, prepMust: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <Textarea
                row={5}
                value={detail.prepAvoid}
                label={ui.servicesPage.prepAvoid}
                placeholder={"huiles lourdes\nproduits gras\ncheveux encore mouillés"}
                onChange={(e) => setDetail({ ...detail, prepAvoid: e.target.value })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <Textarea
                row={4}
                value={detail.addons}
                label={ui.servicesPage.addons}
                placeholder={"Extra length | 30 | 30\nHuman hair | 40 | 0"}
                onChange={(e) => setDetail({ ...detail, addons: e.target.value })}
              />
              <p style={{ fontSize: 12, color: "#666" }}>{ui.servicesPage.addonsHint}</p>
            </div>
            <div className="col-12 mb-3">
              <label className="sq-dialog-pro__label">
                {ui.servicesPage.recommendedProducts}
              </label>
              <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                {ui.servicesPage.recommendedProductsHint}
              </p>
              {productOptions.length === 0 ? (
                <p style={{ fontSize: 13, color: "#8a6a00" }}>
                  {ui.servicesPage.recommendedProductsEmpty}
                </p>
              ) : (
                <Multiselect
                  options={productOptions}
                  selectedValues={selectedProducts}
                  onSelect={(list) => {
                    setSelectedProducts(list);
                    setDetail({
                      ...detail,
                      recommendedProductIds: list.map((p) => p.id),
                    });
                  }}
                  onRemove={(list) => {
                    setSelectedProducts(list);
                    setDetail({
                      ...detail,
                      recommendedProductIds: list.map((p) => p.id),
                    });
                  }}
                  displayValue="name"
                  hideOnClickOutside={false}
                  selectionLimit={12}
                />
              )}
            </div>
            <div className="col-md-4 mb-3">
              <ExInput
                type="number"
                value={detail.depositPercent}
                label={ui.servicesPage.depositPercent}
                placeholder="25"
                onChange={(e) =>
                  setDetail({ ...detail, depositPercent: e.target.value })
                }
              />
            </div>
            <div className="col-md-4 mb-3">
              <ExInput
                type="number"
                value={detail.prepBufferMinutes}
                label={ui.servicesPage.prepBufferMinutes}
                placeholder="15"
                onChange={(e) =>
                  setDetail({ ...detail, prepBufferMinutes: e.target.value })
                }
              />
              <p style={{ fontSize: 12, color: "#666" }}>
                {ui.servicesPage.prepBufferMinutesHint}
              </p>
            </div>
            <div className="col-12 mb-3 d-flex align-items-center justify-content-between p-3 rounded" style={{ background: "#f8f9fa" }}>
              <span style={{ fontWeight: 600 }}>{ui.servicesPage.inspirationPhoto}</span>
              <ToggleSwitch
                value={detail.inspirationPhotoEnabled}
                onClick={() =>
                  setDetail({
                    ...detail,
                    inspirationPhotoEnabled: !detail.inspirationPhotoEnabled,
                  })
                }
              />
            </div>
            <div className="col-12 mb-3">
              <Textarea
                row={2}
                value={detail.importantNote}
                label={ui.servicesPage.importantNote}
                placeholder="Merci de lire les conditions de préparation avant de réserver."
                onChange={(e) =>
                  setDetail({ ...detail, importantNote: e.target.value })
                }
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
                text={saving ? "…" : ui.servicesPage.saveDetailCard}
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
