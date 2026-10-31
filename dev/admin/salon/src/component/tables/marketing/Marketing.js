import React, { useCallback, useEffect, useMemo, useState } from "react";
import Title from "../../extras/Title";
import { apiInstanceFetch } from "../../api/axiosApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const todayIso = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const addDaysIso = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const weekBounds = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Mon=0
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const p = (n) => String(n).padStart(2, "0");
  const fmt = (x) =>
    `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
  return { from: fmt(mon), to: fmt(sun) };
};

const emptyPackForm = () => ({
  id: "",
  name: "Pack beauté",
  description: "",
  visitCount: 3,
  priceHint: "",
  serviceIds: [],
  extrasText: "",
  active: true,
});

const Marketing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [lastPromo, setLastPromo] = useState(null);

  const [promoType, setPromoType] = useState("percent");
  const [promoPercent, setPromoPercent] = useState(15);
  const [promoAmount, setPromoAmount] = useState(10);
  const [promoServiceId, setPromoServiceId] = useState("");
  const [promoDate, setPromoDate] = useState(todayIso());
  const [promoTitle, setPromoTitle] = useState("");

  const wb = useMemo(() => weekBounds(), []);
  const [rebookFrom, setRebookFrom] = useState(wb.from);
  const [rebookTo, setRebookTo] = useState(wb.to);

  const [packModalOpen, setPackModalOpen] = useState(false);
  const [packForm, setPackForm] = useState(emptyPackForm());

  const load = useCallback(async (range) => {
    try {
      const from = range?.from || rebookFrom;
      const to = range?.to || rebookTo;
      const qs = new URLSearchParams();
      if (from) qs.set("rebookFrom", from);
      if (to) qs.set("rebookTo", to);
      const res = await apiInstanceFetch.get(
        `salon/marketing/insights?${qs.toString()}`
      );
      if (res?.status) setData(res);
      else toast.error(res?.message || "Impossible de charger le marketing");
    } catch (e) {
      toast.error("Erreur marketing");
    } finally {
      setLoading(false);
    }
  }, [rebookFrom, rebookTo]);

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const services = data?.salonServices || [];
  const selectedService = services.find((s) => s.id === promoServiceId);

  const createPromo = async (e) => {
    e?.preventDefault?.();
    if (!promoDate) {
      toast.error("Choisis une date");
      return;
    }
    setBusy("promo");
    try {
      const payload = {
        discountType: promoType,
        title: promoTitle || undefined,
        expiryDate: promoDate,
        validOnDate: promoDate,
        serviceId: promoServiceId || undefined,
        serviceName: selectedService?.name || "",
        daysValid: 1,
      };
      if (promoType === "flat") payload.discountAmount = Number(promoAmount);
      else payload.discountPercent = Number(promoPercent);

      const res = await apiInstanceFetch.post("salon/marketing/promo", payload);
      if (!res?.status) throw new Error(res?.message || "Erreur");
      setLastPromo(res);
      toast.success(`Promo créée : ${res.coupon?.code}`);
      load();
    } catch (err) {
      toast.error(err.message || "Création promo impossible");
    } finally {
      setBusy("");
    }
  };

  const refreshRebook = async () => {
    setBusy("rebook-load");
    await load({ from: rebookFrom, to: rebookTo });
    setBusy("");
  };

  const launchRebook = async () => {
    if (
      !window.confirm(
        `Envoyer les SMS de rebooking du ${rebookFrom} au ${rebookTo} ?`
      )
    ) {
      return;
    }
    setBusy("rebook");
    try {
      const res = await apiInstanceFetch.post("salon/marketing/rebook-campaign", {
        from: rebookFrom,
        to: rebookTo,
      });
      if (!res?.status) throw new Error(res?.message || "Erreur");
      toast.success(res.message || "Campagne lancée");
      load({ from: rebookFrom, to: rebookTo });
    } catch (err) {
      toast.error(err.message || "Campagne impossible");
    } finally {
      setBusy("");
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié");
    } catch {
      toast.info(text);
    }
  };

  const formatPromoLabel = (p) => {
    if (!p) return "";
    if (Number(p.discountType) === 1) return `−${p.maxDiscount}€`;
    return `−${p.discountPercent}%`;
  };

  const openNewPack = () => {
    setPackForm(emptyPackForm());
    setPackModalOpen(true);
  };

  const openEditPack = (pkg) => {
    setPackForm({
      id: pkg.id,
      name: pkg.name || "Pack beauté",
      description: pkg.description || "",
      visitCount: pkg.visitCount || 1,
      priceHint: pkg.priceHint || "",
      serviceIds: Array.isArray(pkg.serviceIds) ? pkg.serviceIds.map(String) : [],
      extrasText: Array.isArray(pkg.extras) ? pkg.extras.join("\n") : "",
      active: pkg.active !== false,
    });
    setPackModalOpen(true);
  };

  const togglePackService = (id) => {
    setPackForm((prev) => {
      const set = new Set(prev.serviceIds || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, serviceIds: [...set] };
    });
  };

  const savePack = async (e) => {
    e?.preventDefault?.();
    if (!packForm.name?.trim()) {
      toast.error("Nom du pack requis");
      return;
    }
    setBusy("pack");
    try {
      const current = [...(data?.packages || [])];
      const nextPack = {
        id: packForm.id || `pkg_${Date.now()}`,
        name: packForm.name.trim(),
        description: packForm.description || "",
        visitCount: Math.max(1, Number(packForm.visitCount) || 1),
        priceHint: packForm.priceHint || "",
        serviceIds: packForm.serviceIds || [],
        extrasText: packForm.extrasText || "",
        active: packForm.active !== false,
      };
      const idx = current.findIndex((p) => p.id === nextPack.id);
      if (idx >= 0) current[idx] = nextPack;
      else current.push(nextPack);

      const res = await apiInstanceFetch.put("salon/marketing/packages", {
        packages: current,
      });
      if (!res?.status) throw new Error(res?.message || "Erreur");
      toast.success("Pack enregistré");
      setPackModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || "Erreur pack");
    } finally {
      setBusy("");
    }
  };

  const deletePack = async (id) => {
    if (!window.confirm("Supprimer ce pack ?")) return;
    setBusy("pack");
    try {
      const next = (data?.packages || []).filter((p) => p.id !== id);
      const res = await apiInstanceFetch.put("salon/marketing/packages", {
        packages: next,
      });
      if (!res?.status) throw new Error(res?.message || "Erreur");
      toast.success("Pack supprimé");
      load();
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <Title name="Marketing" />
        <p>Chargement…</p>
      </div>
    );
  }

  const rebook = data?.rebook;
  const sub = data?.subscription;
  const canSendRebook = sub?.canSendRebook !== false && !rebook?.sendLocked;
  const canCreatePromo = sub?.canCreatePromo !== false;
  const promos = data?.recentPromos || [];

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name="Marketing" />
        <p style={{ color: "#666", maxWidth: 640, marginBottom: 12 }}>
          Crée des promotions, relance tes clientes et propose des packs beauté sur ta fiche
          publique.
        </p>
        {sub && (
          <p className="mb-3" style={{ fontSize: 14 }}>
            Abonnement : <strong>{sub.planName || sub.planId || "Free"}</strong>
            {sub.upgradeHint ? (
              <span className="text-muted"> — {sub.upgradeHint}</span>
            ) : null}
          </p>
        )}

        <div className="row g-3">
          {/* Création de promotion */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-3">Création de promotion</h5>
                {!canCreatePromo ? (
                  <div className="alert alert-warning py-2" role="status">
                    {sub?.upgradeHint ||
                      "Passez à Premium pour créer des promotions."}
                  </div>
                ) : (
                  <form onSubmit={createPromo}>
                    <div className="mb-2">
                      <label className="form-label">Type de réduction</label>
                      <div className="d-flex gap-3">
                        <label className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            checked={promoType === "percent"}
                            onChange={() => setPromoType("percent")}
                          />{" "}
                          Pourcentage (%)
                        </label>
                        <label className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            checked={promoType === "flat"}
                            onChange={() => setPromoType("flat")}
                          />{" "}
                          Montant (€)
                        </label>
                      </div>
                    </div>

                    {promoType === "percent" ? (
                      <div className="mb-2">
                        <label className="form-label">Pourcentage</label>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          className="form-control"
                          value={promoPercent}
                          onChange={(e) => setPromoPercent(e.target.value)}
                          required
                        />
                      </div>
                    ) : (
                      <div className="mb-2">
                        <label className="form-label">Montant (€)</label>
                        <input
                          type="number"
                          min={1}
                          step="0.01"
                          className="form-control"
                          value={promoAmount}
                          onChange={(e) => setPromoAmount(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label">Prestation</label>
                      <select
                        className="form-select"
                        value={promoServiceId}
                        onChange={(e) => setPromoServiceId(e.target.value)}
                      >
                        <option value="">Toutes les prestations</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                            {s.price != null ? ` (${s.price}€)` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Date (validité / RDV ciblé)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={promoDate}
                        min={todayIso()}
                        onChange={(e) => setPromoDate(e.target.value)}
                        required
                      />
                      <div className="form-text">
                        Le code expire à cette date. Tu peux cibler un jour précis pour
                        remplir ton agenda.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Titre (optionnel)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={promoTitle}
                        onChange={(e) => setPromoTitle(e.target.value)}
                        placeholder="Ex. Offre mardi"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={busy === "promo"}
                    >
                      {busy === "promo" ? "Création…" : "Créer le code promo"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Rebooking */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-3">Rebooking</h5>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label">Du</label>
                    <input
                      type="date"
                      className="form-control"
                      value={rebookFrom}
                      onChange={(e) => setRebookFrom(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Au</label>
                    <input
                      type="date"
                      className="form-control"
                      value={rebookTo}
                      onChange={(e) => setRebookTo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      const w = weekBounds();
                      setRebookFrom(w.from);
                      setRebookTo(w.to);
                      load({ from: w.from, to: w.to });
                    }}
                  >
                    Cette semaine
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      const from = todayIso();
                      const to = addDaysIso(from, 14);
                      setRebookFrom(from);
                      setRebookTo(to);
                      load({ from, to });
                    }}
                  >
                    14 prochains jours
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    disabled={busy === "rebook-load"}
                    onClick={refreshRebook}
                  >
                    Actualiser
                  </button>
                </div>

                <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>
                  {rebook?.headline || "—"}
                </p>
                <p className="text-muted mb-3">
                  Période {rebook?.weekStart || rebookFrom} → {rebook?.weekEnd || rebookTo}
                  {rebook?.alreadySent
                    ? ` · ${rebook.alreadySent} déjà relancée(s)`
                    : ""}
                </p>

                {rebook?.sendLocked || !canSendRebook ? (
                  <div className="alert alert-warning py-2" role="status">
                    {rebook?.lockReason ||
                      sub?.upgradeHint ||
                      "Passez à Basic pour envoyer des SMS de rebooking."}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={
                    !canSendRebook ||
                    rebook?.sendLocked ||
                    !rebook?.suggestCampaign ||
                    busy === "rebook"
                  }
                  onClick={launchRebook}
                >
                  {busy === "rebook" ? "Envoi…" : "Lancer la campagne SMS"}
                </button>
                <p className="mt-2 mb-0" style={{ fontSize: 13 }}>
                  <Link to="/salonpanel/clients">Voir mes clientes</Link>
                </p>

                {rebook?.clients?.length > 0 && (
                  <div className="mt-3" style={{ maxHeight: 240, overflowY: "auto" }}>
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Presta</th>
                          <th>SMS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rebook.clients.slice(0, 20).map((c) => (
                          <tr key={c.bookingId}>
                            <td>{c.name}</td>
                            <td>{c.serviceName}</td>
                            <td>{c.reminderSent ? "Envoyé" : "En attente"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Promotions salon — below creation + rebooking */}
        <div className="card mt-3">
          <div className="card-body">
            <h5>Promotions salon</h5>
            {lastPromo?.coupon && (
              <div className="alert alert-success d-flex flex-wrap align-items-center gap-2">
                <span>
                  Nouveau code <strong>{lastPromo.coupon.code}</strong> (
                  {formatPromoLabel(lastPromo.coupon)}) jusqu&apos;au{" "}
                  {lastPromo.coupon.expiryDate}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={() => copyText(lastPromo.coupon.code)}
                >
                  Copier le code
                </button>
                {lastPromo.shareText ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark"
                    onClick={() => copyText(lastPromo.shareText)}
                  >
                    Copier le message
                  </button>
                ) : null}
              </div>
            )}
            {promos.length === 0 ? (
              <p className="text-muted mb-0">Aucune promotion pour l’instant.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {promos.map((p) => (
                  <li
                    key={p._id}
                    className="d-flex flex-wrap align-items-center gap-2 py-2 border-bottom"
                  >
                    <code className="fs-6">{p.code}</code>
                    <span>
                      {p.title} ({formatPromoLabel(p)}) · expire {p.expiryDate}
                      {!p.isActive ? " (inactif)" : ""}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary ms-auto"
                      onClick={() => copyText(p.code)}
                    >
                      Copier le code
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pack beauté */}
        <div className="card mt-3">
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <h5 className="mb-0">Pack beauté</h5>
              <button type="button" className="btn btn-dark btn-sm" onClick={openNewPack}>
                Ajouter un pack
              </button>
            </div>
            <p className="text-muted">
              Les packs s’affichent sur ta fiche publique après les prestations. Choisis les
              prestations incluses et ajoute des mentions écrites (ex. shampoing offert).
            </p>
            {(data?.packages || []).length === 0 ? (
              <p className="text-muted">Aucun pack pour l’instant.</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {(data.packages || []).map((p) => (
                  <li
                    key={p.id}
                    className="border rounded p-3 mb-2 d-flex flex-wrap justify-content-between gap-2"
                  >
                    <div>
                      <strong>{p.name}</strong>
                      {p.priceHint ? ` · ${p.priceHint}` : ""}
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        {p.visitCount} visite(s)
                        {Array.isArray(p.serviceIds) && p.serviceIds.length
                          ? ` · ${p.serviceIds.length} prestation(s)`
                          : ""}
                        {Array.isArray(p.extras) && p.extras.length
                          ? ` · ${p.extras.length} ajout(s)`
                          : ""}
                      </div>
                      {p.description ? (
                        <div style={{ fontSize: 13 }}>{p.description}</div>
                      ) : null}
                    </div>
                    <div className="d-flex gap-2 align-items-start">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => openEditPack(p)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePack(p.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Fiche publique</h5>
                <p className="text-muted">{data?.site?.hint}</p>
                {data?.site?.publicUrl && (
                  <a
                    href={data.site.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm"
                  >
                    Ouvrir ma fiche publique
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Fidélité</h5>
                <p className="text-muted">{data?.loyalty?.hint}</p>
                <Link to="/salonpanel/profile" className="btn btn-outline-secondary btn-sm">
                  Configurer dans Profil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {packModalOpen && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.45)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={savePack}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {packForm.id ? "Modifier le pack" : "Nouveau pack beauté"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={() => setPackModalOpen(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Nom</label>
                    <input
                      className="form-control"
                      value={packForm.name}
                      onChange={(e) =>
                        setPackForm((p) => ({ ...p, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Nombre de visites</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        value={packForm.visitCount}
                        onChange={(e) =>
                          setPackForm((p) => ({
                            ...p,
                            visitCount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Prix indicatif</label>
                      <input
                        className="form-control"
                        value={packForm.priceHint}
                        onChange={(e) =>
                          setPackForm((p) => ({
                            ...p,
                            priceHint: e.target.value,
                          }))
                        }
                        placeholder="ex. 180€ ou sur devis"
                      />
                    </div>
                  </div>
                  <div className="mb-2 mt-2">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={packForm.description}
                      onChange={(e) =>
                        setPackForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Prestations incluses</label>
                    <div
                      className="border rounded p-2"
                      style={{ maxHeight: 180, overflowY: "auto" }}
                    >
                      {services.length === 0 ? (
                        <span className="text-muted">Aucune prestation salon</span>
                      ) : (
                        services.map((s) => (
                          <label key={s.id} className="d-block form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={(packForm.serviceIds || []).includes(s.id)}
                              onChange={() => togglePackService(s.id)}
                            />{" "}
                            {s.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Ajouts écrits (un par ligne)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={packForm.extrasText}
                      onChange={(e) =>
                        setPackForm((p) => ({
                          ...p,
                          extrasText: e.target.value,
                        }))
                      }
                      placeholder={"Shampoing offert\nConseil personnalisé"}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPackModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={busy === "pack"}
                  >
                    {busy === "pack" ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
