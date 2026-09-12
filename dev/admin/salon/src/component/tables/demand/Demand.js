import React, { useEffect, useMemo, useState } from "react";
import Title from "../../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import {
  adjustDemand,
  fetchAfroConfig,
  getAllDemands,
  updateAfroConfig,
} from "../../../redux/slice/demandSlice";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "quoted", label: "Estimé" },
  { value: "needs_salon_review", label: "À valider / question" },
  { value: "awaiting_slot", label: "Créneau" },
  { value: "deposit_paid", label: "Acompte payé" },
  { value: "converted", label: "Réservé" },
  { value: "cancelled", label: "Annulé" },
];

const emptyEdit = {
  estimatedPrice: "",
  estimatedDurationMinutes: "",
  depositAmount: "",
  reviewNote: "",
  salonQuestion: "",
};

const Demand = () => {
  const dispatch = useDispatch();
  const {
    demands,
    isLoading,
    afroEnabled,
    afroServices,
    publicDemandPath,
    configLoading,
    onboarding,
  } = useSelector((state) => state.demand);
  const { setting } = useSelector((state) => state.setting);
  const currency = setting?.currencySymbol || "€";
  const [tab, setTab] = useState("inbox");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [seedServiceId, setSeedServiceId] = useState("");

  const reload = () =>
    dispatch(getAllDemands({ status: status || undefined, limit: 100 }));

  useEffect(() => {
    reload();
  }, [dispatch, status]);

  useEffect(() => {
    dispatch(fetchAfroConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!seedServiceId && afroServices?.length) {
      setSeedServiceId(String(afroServices[0].serviceId));
    }
  }, [afroServices, seedServiceId]);

  const counts = useMemo(() => {
    const c = { review: 0, open: 0, paid: 0 };
    (demands || []).forEach((d) => {
      if (d.status === "needs_salon_review") c.review += 1;
      if (["quoted", "awaiting_slot", "needs_salon_review"].includes(d.status)) c.open += 1;
      if (d.status === "deposit_paid") c.paid += 1;
    });
    return c;
  }, [demands]);

  const publicUrl = useMemo(() => {
    if (!publicDemandPath) return "";
    if (typeof window === "undefined") return publicDemandPath;
    return `${window.location.origin}${publicDemandPath}`;
  }, [publicDemandPath]);

  const onApprove = async (row) => {
    const res = await dispatch(
      adjustDemand({
        id: row._id,
        body: { status: "quoted", reviewNote: "Validé salon" },
      })
    );
    if (res?.payload?.status) {
      toast.success("Réservation validée");
      reload();
    } else {
      toast.error(res?.payload?.message || "Échec validation");
    }
  };

  const onAskQuestion = async (row) => {
    const q = window.prompt(
      "Une question précise pour la cliente (ex. Qui apporte les mèches ?)",
      row.salonQuestion || ""
    );
    if (q == null) return;
    const trimmed = String(q).trim();
    if (!trimmed) {
      toast.error("Question vide");
      return;
    }
    const res = await dispatch(
      adjustDemand({
        id: row._id,
        body: { salonQuestion: trimmed, status: "needs_salon_review" },
      })
    );
    if (res?.payload?.status) {
      toast.success("Question enregistrée — la cliente pourra y répondre");
      reload();
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const onWaiveDeposit = async (row) => {
    const res = await dispatch(
      adjustDemand({ id: row._id, body: { waiveDeposit: true } })
    );
    if (res?.payload?.status) {
      toast.success("Acompte exonéré");
      reload();
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const openEdit = (row) => {
    setEditing(row);
    setEditForm({
      estimatedPrice: String(row.estimatedPrice ?? ""),
      estimatedDurationMinutes: String(row.estimatedDurationMinutes ?? ""),
      depositAmount: String(row.depositAmount ?? ""),
      reviewNote: row.reviewNote || "",
      salonQuestion: row.salonQuestion || "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const res = await dispatch(
      adjustDemand({
        id: editing._id,
        body: {
          estimatedPrice: Number(editForm.estimatedPrice),
          estimatedDurationMinutes: Number(editForm.estimatedDurationMinutes),
          depositAmount: Number(editForm.depositAmount),
          reviewNote: editForm.reviewNote,
          salonQuestion: editForm.salonQuestion || undefined,
          status:
            editing.status === "needs_salon_review" && !editForm.salonQuestion
              ? "quoted"
              : undefined,
        },
      })
    );
    if (res?.payload?.status) {
      toast.success("Estimation mise à jour");
      setEditing(null);
      reload();
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const toggleFlow = async (enabled) => {
    const res = await dispatch(updateAfroConfig({ enabled }));
    if (res?.payload?.status) {
      toast.success(
        enabled
          ? "Réservation sur mesure activée"
          : "Réservation sur mesure désactivée"
      );
      dispatch(fetchAfroConfig());
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const seedKnotless = async () => {
    if (!seedServiceId) {
      toast.error("Choisissez une prestation");
      return;
    }
    const res = await dispatch(
      updateAfroConfig({
        enabled: true,
        serviceId: seedServiceId,
        seedKnotlessDemo: true,
      })
    );
    if (res?.payload?.status) {
      toast.success("Config Knotless S2 appliquée + flow ON");
      dispatch(fetchAfroConfig());
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const setDepositPercent = async (serviceId, depositPercent) => {
    const res = await dispatch(
      updateAfroConfig({ serviceId, depositPercent: Number(depositPercent) })
    );
    if (res?.payload?.status) {
      toast.success("Acompte mis à jour");
      dispatch(fetchAfroConfig());
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const clearConfig = async (serviceId) => {
    const res = await dispatch(
      updateAfroConfig({ serviceId, clearAfroConfig: true })
    );
    if (res?.payload?.status) {
      toast.success("Config retirée");
      dispatch(fetchAfroConfig());
    } else {
      toast.error(res?.payload?.message || "Échec");
    }
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Lien copié — à coller dans WhatsApp / Instagram");
    } catch {
      toast.error("Copie impossible");
    }
  };

  const clientLabel = (row) => {
    if (row.userId?.fname || row.userId?.lname) {
      return `${row.userId.fname || ""} ${row.userId.lname || ""}`.trim();
    }
    return row.guestName || row.guestEmail || row.guestPhone || "—";
  };

  return (
    <div className="userPage">
      <Title name="Demandes / réservations projet" />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          type="button"
          className={`btn btn-sm ${tab === "inbox" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("inbox")}
        >
          Inbox ({counts.open})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${tab === "config" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("config")}
        >
          Config parcours
        </button>
        {counts.review > 0 && (
          <span className="badge bg-warning text-dark align-self-center">
            {counts.review} à valider
          </span>
        )}
        {counts.paid > 0 && (
          <span className="badge bg-success align-self-center">
            {counts.paid} acompte payé
          </span>
        )}
      </div>

      {tab === "config" && (
        <div className="card mb-4 p-3">
          <div className="mb-4 p-3 border rounded">
            <h5 className="mb-2">Mise en route (3 étapes)</h5>
            <ol className="mb-0 ps-3">
              <li className="mb-2">
                <span
                  className={`badge me-2 ${
                    onboarding?.hasProjectService ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {onboarding?.hasProjectService ? "OK" : "1"}
                </span>
                Configurer une prestation projet (ex. seed Knotless S2)
              </li>
              <li className="mb-2">
                <span
                  className={`badge me-2 ${
                    onboarding?.flowEnabled ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {onboarding?.flowEnabled ? "OK" : "2"}
                </span>
                Activer la réservation sur mesure sur la page publique
              </li>
              <li className="mb-2">
                <span
                  className={`badge me-2 ${
                    onboarding?.stripeReady ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {onboarding?.stripeReady ? "OK" : "3"}
                </span>
                Stripe Connect prêt pour encaisser l’acompte
                {!onboarding?.stripeReady && (
                  <>
                    {" "}
                    —{" "}
                    <a href="/salonpanel/paymentSettings">Configurer les paiements</a>
                  </>
                )}
              </li>
            </ol>
            <p className="small text-muted mt-2 mb-0">
              Puis copiez le lien ci-dessous et collez-le dans WhatsApp / Instagram.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h5 className="mb-1">Parcours projet (dans « Réserver »)</h5>
              <p className="text-muted mb-0 small">
                Active questions + estimation + acompte dans le tunnel « Réserver » (pas de second bouton).
              </p>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="afroFlowSwitch"
                checked={!!afroEnabled}
                disabled={configLoading}
                onChange={(e) => toggleFlow(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="afroFlowSwitch">
                {afroEnabled ? "Activé" : "Désactivé"}
              </label>
            </div>
          </div>

          <div className="mb-3 p-3 border rounded bg-light">
            <label className="form-label fw-semibold">Lien WhatsApp / Instagram</label>
            <div className="input-group">
              <input className="form-control" readOnly value={publicUrl || "…"} />
              <button type="button" className="btn btn-outline-secondary" onClick={copyLink}>
                Copier
              </button>
            </div>
            <small className="text-muted">
              À coller en bio ou dans la conversation : la cliente ouvre la réservation (estimation incluse).
            </small>
          </div>

          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-6">
              <label className="form-label">Prestation pour seed Knotless S2</label>
              <select
                className="form-select"
                value={seedServiceId}
                onChange={(e) => setSeedServiceId(e.target.value)}
              >
                {(afroServices || []).map((s) => (
                  <option key={String(s.serviceId)} value={String(s.serviceId)}>
                    {s.name} ({currency}
                    {Number(s.price || 0).toFixed(0)}) · {s.complexityTier}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <button type="button" className="btn btn-primary" onClick={seedKnotless}>
                Appliquer démo Knotless + activer
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Prestation</th>
                  <th>Tier</th>
                  <th>Questions</th>
                  <th>Acompte %</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(afroServices || []).map((s) => {
                  const pct = s.depositPolicy?.enabled
                    ? Number(s.depositPolicy.value || 0)
                    : 0;
                  return (
                    <tr key={String(s.serviceId)}>
                      <td>{s.name}</td>
                      <td>
                        <span
                          className={`badge ${
                            s.usesProjectFlow ? "bg-info text-dark" : "bg-secondary"
                          }`}
                        >
                          {s.complexityTier}
                        </span>
                      </td>
                      <td>{s.schemaFieldCount}</td>
                      <td style={{ maxWidth: 120 }}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="form-control form-control-sm"
                          defaultValue={pct}
                          disabled={!s.afroConfig}
                          onBlur={(e) => {
                            if (!s.afroConfig) return;
                            if (Number(e.target.value) === pct) return;
                            setDepositPercent(s.serviceId, e.target.value);
                          }}
                        />
                      </td>
                      <td>
                        {s.afroConfig && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => clearConfig(s.serviceId)}
                          >
                            Retirer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!configLoading && (!afroServices || afroServices.length === 0) && (
                  <tr>
                    <td colSpan={5}>Ajoutez d’abord des prestations au salon.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "inbox" && (
        <>
          <div className="row mb-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tableMain">
            <div className="tablePrime">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Prestation</th>
                    <th>Statut</th>
                    <th>Prix</th>
                    <th>Durée</th>
                    <th>Acompte / reste</th>
                    <th>Réponses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={9}>Chargement…</td>
                    </tr>
                  )}
                  {!isLoading && (!demands || demands.length === 0) && (
                    <tr>
                      <td colSpan={9}>Aucune demande pour le moment.</td>
                    </tr>
                  )}
                  {(demands || []).map((row, index) => (
                    <tr key={row._id}>
                      <td>{index + 1}</td>
                      <td>
                        {clientLabel(row)}
                        <br />
                        <small className="text-muted">
                          {row.guestEmail || row.userId?.email || ""}
                        </small>
                      </td>
                      <td>{row.serviceId?.name || "—"}</td>
                      <td>
                        <span className="badge bg-secondary">{row.status}</span>
                      </td>
                      <td>
                        {currency}
                        {Number(row.estimatedPrice || 0).toFixed(2)}
                      </td>
                      <td>{row.estimatedDurationMinutes || "—"} min</td>
                      <td>
                        {currency}
                        {Number(row.depositAmount || 0).toFixed(2)}
                        <br />
                        <small>
                          {row.depositStatus} · reste {currency}
                          {Number(row.balanceDue || 0).toFixed(2)}
                        </small>
                      </td>
                      <td>
                        <small style={{ whiteSpace: "pre-wrap" }}>
                          {row.answers
                            ? Object.entries(row.answers)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join("\n")
                            : "—"}
                        </small>
                      </td>
                      <td className="text-nowrap">
                        {row.status !== "converted" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openEdit(row)}
                          >
                            Ajuster
                          </button>
                        )}
                        {row.status !== "converted" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning me-1"
                            onClick={() => onAskQuestion(row)}
                          >
                            Question
                          </button>
                        )}
                        {row.status === "needs_salon_review" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => onApprove(row)}
                          >
                            Valider
                          </button>
                        )}
                        {row.salonQuestion ? (
                          <div className="small text-muted mt-1" style={{ maxWidth: 180 }}>
                            Q: {row.salonQuestion}
                            {row.clientReply ? (
                              <>
                                <br />R: {row.clientReply}
                              </>
                            ) : null}
                          </div>
                        ) : null}
                        {row.depositAmount > 0 &&
                          row.depositStatus === "unpaid" &&
                          row.status !== "converted" && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => onWaiveDeposit(row)}
                            >
                              Exonérer
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {editing && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.35)" }}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ajuster l’estimation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditing(null)}
                />
              </div>
              <div className="modal-body">
                <p className="small text-muted mb-3">
                  {editing.serviceId?.name || "Prestation"} · {editing.status}
                </p>
                <div className="mb-2">
                  <label className="form-label">Prix estimé</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.estimatedPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, estimatedPrice: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Durée (min)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.estimatedDurationMinutes}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        estimatedDurationMinutes: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Acompte</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.depositAmount}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, depositAmount: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Note interne</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editForm.reviewNote}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, reviewNote: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Question à la cliente (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ex. Qui apporte les mèches ?"
                    value={editForm.salonQuestion || ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, salonQuestion: e.target.value }))
                    }
                  />
                  {editing.clientReply ? (
                    <p className="small text-success mt-1 mb-0">
                      Réponse cliente : {editing.clientReply}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setEditing(null)}
                >
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" onClick={saveEdit}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demand;
