import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  cancelPlanningBooking,
  fetchPlanningBookingDetail,
  updatePlanningBookingServices,
} from "../../../redux/slice/teamScheduleSlice";
import { getParticularSalonService } from "../../../redux/slice/serviceSlice";
import { Success } from "../../api/toastServices";
import { warning } from "../../../util/Alert";

const STATUS_LABELS = {
  pending: "À valider",
  confirm: "Confirmé",
  completed: "Terminé",
  cancel: "Annulé",
};

const PlanningBookingDetailModal = ({ bookingId, onClose, onUpdated }) => {
  const dispatch = useDispatch();
  const particularService = useSelector((state) => state.service?.particularService);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingServices, setEditingServices] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadBooking = useCallback(() => {
    if (!bookingId) return;
    setLoading(true);
    dispatch(fetchPlanningBookingDetail(bookingId))
      .unwrap()
      .then((res) => {
        const data = res?.data || null;
        setBooking(data);
        setSelectedServiceIds((data?.serviceId || []).map((s) => String(s._id)));
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId, dispatch]);

  useEffect(() => {
    loadBooking();
    dispatch(getParticularSalonService());
  }, [loadBooking, dispatch]);

  const canModify = booking && ["pending", "confirm"].includes(booking.status);
  const user = booking?.userId;
  const expert = booking?.expertId;
  const expertServiceIds = (expert?.serviceId || []).map((id) => String(id));

  const availableServices = useMemo(() => {
    const raw = particularService?.serviceIds ?? particularService;
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((entry) => {
      const service = entry?.id || entry;
      const serviceId = String(service?._id || entry?._id || "");
      return !expertServiceIds.length || expertServiceIds.includes(serviceId);
    });
  }, [particularService, expertServiceIds]);

  const toggleService = (serviceId) => {
    const id = String(serviceId);
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSaveServices = async () => {
    if (!selectedServiceIds.length) return;
    setActionLoading(true);
    try {
      await dispatch(
        updatePlanningBookingServices({
          bookingId: booking._id,
          serviceIds: selectedServiceIds,
        })
      ).unwrap();
      Success("Services mis à jour");
      setEditingServices(false);
      loadBooking();
      onUpdated?.();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirm = await warning("Annuler ce rendez-vous ?");
    if (!confirm?.isConfirmed) return;

    setActionLoading(true);
    try {
      await dispatch(
        cancelPlanningBooking({
          bookingId: booking._id,
          reason: cancelReason || "Annulé depuis le planning",
        })
      ).unwrap();
      Success("Réservation annulée");
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!bookingId) return null;

  return createPortal(
    <div className="sq-planning-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="sq-planning-modal sq-booking-detail"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="sq-planning-modal__header">
          <div>
            <p className="sq-planning-modal__kicker">Détail rendez-vous</p>
            <h3>{user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "Client"}</h3>
            <p className="sq-planning-modal__meta">
              #{booking?.bookingId || "—"} ·{" "}
              {booking?.date ? moment(booking.date).format("dddd D MMM YYYY") : "—"}
            </p>
          </div>
          <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
        </div>

        <div className="sq-planning-modal__body">
          {loading && <p className="text-muted mb-0">Chargement…</p>}
          {!loading && !booking && (
            <p className="text-danger mb-0">Impossible de charger ce rendez-vous.</p>
          )}
          {!loading && booking && (
            <>
              <div className="sq-detail-grid">
                <div className="sq-detail-item">
                  <span>Statut</span>
                  <strong className={`sq-status sq-status--${booking.status}`}>
                    {STATUS_LABELS[booking.status] || booking.status}
                  </strong>
                </div>
                <div className="sq-detail-item">
                  <span>Horaire</span>
                  <strong>
                    {booking.startTime || booking.time?.[0] || "—"}
                    {booking.time?.length > 1
                      ? ` → ${booking.time[booking.time.length - 1]}`
                      : ""}
                  </strong>
                </div>
                <div className="sq-detail-item">
                  <span>Durée</span>
                  <strong>{booking.duration || (booking.time?.length || 1) * 15} min</strong>
                </div>
                <div className="sq-detail-item">
                  <span>Professionnel</span>
                  <strong>
                    {expert ? `${expert.fname || ""} ${expert.lname || ""}`.trim() : "—"}
                  </strong>
                </div>
                <div className="sq-detail-item">
                  <span>Téléphone</span>
                  <strong>{user?.mobile || "—"}</strong>
                </div>
                <div className="sq-detail-item">
                  <span>Montant TTC</span>
                  <strong>{booking.amount != null ? `${booking.amount} €` : "—"}</strong>
                </div>
              </div>

              <div className="sq-detail-services">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="sq-detail-services__label mb-0">Services</span>
                  {canModify && !editingServices && (
                    <button
                      type="button"
                      className="btn btn-sm sq-btn-outline"
                      onClick={() => setEditingServices(true)}
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {!editingServices && (
                  <ul className="mb-0">
                    {(booking.serviceId || []).map((service) => (
                      <li key={service._id}>
                        {service.name}
                        {service.duration ? ` · ${service.duration} min` : ""}
                      </li>
                    ))}
                  </ul>
                )}

                {editingServices && (
                  <>
                    <div className="sq-service-pills mb-2">
                      {availableServices.map((entry) => {
                        const service = entry?.id || entry;
                        const serviceId = service?._id || entry?._id;
                        const name = service?.name || entry?.name || "Service";
                        const price = entry?.price ?? service?.price;
                        if (!serviceId) return null;
                        const active = selectedServiceIds.includes(String(serviceId));
                        return (
                          <button
                            key={serviceId}
                            type="button"
                            className={`sq-service-pill ${active ? "is-active" : ""}`}
                            onClick={() => toggleService(serviceId)}
                          >
                            {name}
                            {price != null ? ` · ${price}€` : ""}
                          </button>
                        );
                      })}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm sq-btn-primary"
                        disabled={actionLoading || !selectedServiceIds.length}
                        onClick={handleSaveServices}
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => {
                          setEditingServices(false);
                          setSelectedServiceIds(
                            (booking.serviceId || []).map((s) => String(s._id))
                          );
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </div>

              {canModify && (
                <div className="sq-detail-cancel mt-3">
                  <span className="sq-detail-services__label">Annuler le RDV</span>
                  <textarea
                    className="form-control mt-2 mb-2"
                    rows={2}
                    placeholder="Motif d'annulation (optionnel)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    disabled={actionLoading}
                    onClick={handleCancel}
                  >
                    Annuler le rendez-vous
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="sq-planning-modal__footer">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PlanningBookingDetailModal;
