import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { getParticularSalonService } from "../../../redux/slice/serviceSlice";
import {
  createPlanningBooking,
  searchPlanningClients,
} from "../../../redux/slice/teamScheduleSlice";
import { Success } from "../../api/toastServices";

const PlanningBookingModal = ({ slot, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const particularService = useSelector((state) => state.service?.particularService);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [mobile, setMobile] = useState("");
  const [userId, setUserId] = useState("");
  const [serviceIds, setServiceIds] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getParticularSalonService());
  }, [dispatch]);

  useEffect(() => {
    if (!clientSearch || clientSearch.length < 2) {
      setClientResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await dispatch(searchPlanningClients(clientSearch)).unwrap();
        setClientResults(res?.data || []);
      } catch {
        setClientResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch, dispatch]);

  const services = useMemo(() => {
    const raw = particularService?.serviceIds ?? particularService;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [particularService]);

  const toggleService = (serviceId) => {
    const id = String(serviceId);
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const pickClient = (client) => {
    setUserId(client._id);
    setFname(client.fname || "");
    setLname(client.lname || "");
    setMobile(client.mobile || "");
    setClientSearch(`${client.fname || ""} ${client.lname || ""}`.trim());
    setClientResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceIds.length) return;
    setSubmitting(true);
    try {
      await dispatch(
        createPlanningBooking({
          expertId: slot.expertId,
          date: slot.date,
          startTime: slot.startTime,
          serviceIds,
          userId: userId || undefined,
          fname,
          lname,
          mobile,
        })
      ).unwrap();
      Success("Réservation créée");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!slot) return null;

  return createPortal(
    <div className="sq-planning-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="sq-planning-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sq-planning-modal__header">
          <div>
            <p className="sq-planning-modal__kicker">Nouveau rendez-vous</p>
            <h3>{slot.expertName || "Professionnel"}</h3>
            <p className="sq-planning-modal__meta">
              {moment(slot.date).format("dddd D MMMM YYYY")} · {slot.startTime}
            </p>
          </div>
          <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="sq-planning-modal__body">
          <label className="sq-field">
            <span>Rechercher un client</span>
            <input
              type="search"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setUserId("");
              }}
              placeholder="Nom ou téléphone"
            />
          </label>
          {clientResults.length > 0 && (
            <ul className="sq-client-results">
              {clientResults.map((client) => (
                <li key={client._id}>
                  <button type="button" onClick={() => pickClient(client)}>
                    {client.fname} {client.lname} · {client.mobile}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="row g-2">
            <div className="col-md-6">
              <label className="sq-field">
                <span>Prénom</span>
                <input value={fname} onChange={(e) => setFname(e.target.value)} required />
              </label>
            </div>
            <div className="col-md-6">
              <label className="sq-field">
                <span>Nom</span>
                <input value={lname} onChange={(e) => setLname(e.target.value)} required />
              </label>
            </div>
          </div>

          <label className="sq-field">
            <span>Téléphone</span>
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          </label>

          <div className="sq-field">
            <span>Services</span>
            <div className="sq-service-pills">
              {services.map((entry) => {
                const service = entry?.id || entry;
                const serviceId = service?._id || entry?._id;
                const name = service?.name || entry?.name || "Service";
                const price = entry?.price ?? service?.price;
                if (!serviceId) return null;
                const active = serviceIds.includes(String(serviceId));
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
          </div>

          <div className="sq-planning-modal__footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn sq-btn-primary"
              disabled={submitting || !serviceIds.length}
            >
              {submitting ? "Création…" : "Créer le RDV"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PlanningBookingModal;
