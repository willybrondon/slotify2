import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../extras/Button";
import { ExInput, Textarea } from "../../extras/Input";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import { attachResultPhotos, getAllBookings } from "../../../redux/slice/bookingSlice";
import { Success } from "../../api/toastServices";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";

/**
 * P2 — attach result photos + planned/actual variance on completed bookings.
 */
const ResultPhotosDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [note, setNote] = useState("");
  const [varianceNote, setVarianceNote] = useState("");
  const [actualDuration, setActualDuration] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dialogueData) return;
    setNote(dialogueData.resultPhotoNote || "");
    setVarianceNote(dialogueData.actualVarianceNote || "");
    setActualDuration(
      dialogueData.actualDurationMinutes != null
        ? String(dialogueData.actualDurationMinutes)
        : dialogueData.plannedDurationMinutes != null
          ? String(dialogueData.plannedDurationMinutes)
          : dialogueData.duration != null
            ? String(dialogueData.duration)
            : ""
    );
    setActualPrice(
      dialogueData.actualPrice != null
        ? String(dialogueData.actualPrice)
        : dialogueData.withoutTax != null
          ? String(dialogueData.withoutTax)
          : ""
    );
    setFiles([]);
  }, [dialogueData]);

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    if (!dialogueData?._id || saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("bookingId", dialogueData._id);
      if (note) fd.append("resultPhotoNote", note);
      if (varianceNote) fd.append("actualVarianceNote", varianceNote);
      if (actualDuration !== "") fd.append("actualDurationMinutes", actualDuration);
      if (actualPrice !== "") fd.append("actualPrice", actualPrice);
      Array.from(files || []).slice(0, 6).forEach((f) => fd.append("photos", f));
      const res = await dispatch(attachResultPhotos(fd)).unwrap();
      if (res?.status) {
        Success(ui.toast?.saved || "Enregistré");
        dispatch(closeDialog());
        dispatch(
          getAllBookings({
            start: 0,
            limit: 10,
            type: "completed",
            startDate: "ALL",
            endDate: "ALL",
          })
        );
      }
    } catch (err) {
      // toast from api layer
    } finally {
      setSaving(false);
    }
  };

  if (!dialogueData) return null;

  return createPortal(
    <div
      className="dialog sq-dialog-pro"
      role="presentation"
      onClick={() => dispatch(closeDialog())}
    >
      <div
        className="sq-dialog-pro__sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="mainDiaogBox sq-dialog-pro__box">
          <div className="row justify-content-between align-items-center formHead">
            <div className="col-9">
              <p className="sq-dialog-pro__kicker mb-1">
                {ui.booking?.resultPhotosTitle || "Résultat & durée réelle"}
              </p>
              <h2 className="text-theme m0 sq-dialog-pro__title">
                {dialogueData?.bookingId || "RDV"}
              </h2>
              {dialogueData?.plannedDurationMinutes != null && (
                <p className="sq-dialog-pro__meta mb-0">
                  Prévu : {dialogueData.plannedDurationMinutes} min
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

          <form onSubmit={onSubmit}>
            <div className="row formBody">
              <div className="col-md-6 mb-3">
                <ExInput
                  type="number"
                  label={ui.booking?.actualDuration || "Durée réelle (min)"}
                  value={actualDuration}
                  onChange={(e) => setActualDuration(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <ExInput
                  type="number"
                  label={ui.booking?.actualPrice || "Prix réel (€ HT)"}
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                />
              </div>
              <div className="col-12 mb-3">
                <label className="sq-dialog-pro__label">
                  {ui.booking?.resultPhotosUpload || "Photos résultat (max 6)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control"
                  onChange={(e) => setFiles(e.target.files)}
                />
                {Array.isArray(dialogueData.resultPhotoUrls) &&
                  dialogueData.resultPhotoUrls.length > 0 && (
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
                      {dialogueData.resultPhotoUrls.length} photo(s) déjà
                      enregistrée(s)
                    </p>
                  )}
              </div>
              <div className="col-12 mb-3">
                <Textarea
                  row={2}
                  label={ui.booking?.resultPhotoNote || "Note photo"}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="col-12 mb-3">
                <Textarea
                  row={2}
                  label={
                    ui.booking?.actualVarianceNote ||
                    "Écart prévu / réalisé (optionnel)"
                  }
                  value={varianceNote}
                  placeholder="Ex. +45 min — nattes plus fines que prévu"
                  onChange={(e) => setVarianceNote(e.target.value)}
                />
              </div>
            </div>
            <div className="row formFooter">
              <div className="col-12 text-end m0">
                <Button
                  className="bg-gray text-light me-2"
                  text={ui.common?.cancel || "Annuler"}
                  type="button"
                  onClick={() => dispatch(closeDialog())}
                />
                <Button
                  className="text-light"
                  text={saving ? "…" : ui.common?.save || "Enregistrer"}
                  type="submit"
                  disabled={saving}
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

export default ResultPhotosDialog;
