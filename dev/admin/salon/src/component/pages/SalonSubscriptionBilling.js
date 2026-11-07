import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../extras/Button";
import { apiInstanceFetch } from "../api/axiosApi";

/**
 * Salon self-serve SaaS plans — select a plan, pay via Stripe Checkout,
 * or switch plan in place when already subscribed.
 */
const SalonSubscriptionBilling = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [interval, setInterval] = useState("month");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiInstanceFetch.get("salon/subscription/status");
      if (res?.status) {
        setData(res.data);
        const current = res.data?.subscription?.planId || "free";
        setSelectedPlanId((prev) => prev || current);
      } else {
        setError(res?.message || "Impossible de charger l'abonnement");
      }
    } catch (e) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    const billing = params.get("billing");
    if (billing === "success") {
      setNotice("Paiement reçu — votre abonnement sera activé sous peu.");
      navigate("/salonpanel/profile?tab=subscription", { replace: true });
      setTimeout(() => load(), 1500);
    } else if (billing === "cancelled") {
      setNotice("Checkout annulé — vous pouvez choisir un autre plan.");
      navigate("/salonpanel/profile?tab=subscription", { replace: true });
    } else if (billing === "portal") {
      setNotice("Retour du portail de facturation.");
      navigate("/salonpanel/profile?tab=subscription", { replace: true });
      load();
    }
  }, [load, navigate]);

  const sub = data?.subscription || {};
  const plans = data?.plans || [];
  const currentId = sub.planId || "free";

  const selectedPlan = useMemo(
    () => plans.find((p) => p.planId === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const selectedPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return interval === "year"
      ? Number(selectedPlan.priceYearly) || 0
      : Number(selectedPlan.priceMonthly) || 0;
  }, [selectedPlan, interval]);

  const isSelectedCurrent = selectedPlanId === currentId;
  const selectedIsFree =
    selectedPlan?.isFree ||
    selectedPlan?.tier === "free" ||
    !(selectedPrice > 0);

  const canCheckoutSelected = useMemo(() => {
    if (!selectedPlan || isSelectedCurrent) return false;
    if (selectedIsFree) return !sub.stripeSubscriptionId;
    return interval === "year"
      ? Boolean(selectedPlan.hasCheckoutYearly)
      : Boolean(selectedPlan.hasCheckoutMonthly);
  }, [
    selectedPlan,
    isSelectedCurrent,
    selectedIsFree,
    sub.stripeSubscriptionId,
    interval,
  ]);

  const ctaLabel = useMemo(() => {
    if (busy) return "Traitement…";
    if (!selectedPlan) return "Sélectionnez un plan";
    if (isSelectedCurrent) return "Plan déjà actif";
    if (selectedIsFree) {
      return sub.stripeSubscriptionId
        ? "Annulez d'abord via Gérer / factures"
        : "Activer le plan gratuit";
    }
    if (sub.stripeSubscriptionId) return "Changer de plan";
    if (selectedPlan.trialDays > 0) {
      return `Essai ${selectedPlan.trialDays} j. puis payer`;
    }
    return `Choisir et payer · ${selectedPrice} €`;
  }, [
    busy,
    selectedPlan,
    isSelectedCurrent,
    selectedIsFree,
    sub.stripeSubscriptionId,
    selectedPrice,
  ]);

  const startCheckout = async (planId) => {
    const targetId = planId || selectedPlanId;
    if (!targetId) {
      setError("Sélectionnez un plan");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await apiInstanceFetch.post("salon/subscription/checkout", {
        planId: targetId,
        interval,
      });
      if (res?.status && res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      if (res?.status && (res?.data?.mode === "updated" || res?.data?.mode === "assigned")) {
        setNotice(res.message || res.data?.message || "Plan mis à jour.");
        await load();
        return;
      }
      if (res?.status && res?.data?.mode === "unchanged") {
        setNotice(res.message || "Ce plan est déjà actif.");
        return;
      }
      setError(res?.message || "Impossible d'activer ce plan");
    } catch (e) {
      setError(e?.message || "Erreur checkout");
    } finally {
      setBusy(false);
    }
  };

  const openPortal = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await apiInstanceFetch.post(
        "salon/subscription/billing-portal",
        {}
      );
      if (res?.status && res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      setError(res?.message || "Portail indisponible");
    } catch (e) {
      setError(e?.message || "Erreur portail");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-3 text-muted">Chargement de l&apos;abonnement…</div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 mb-3">
        <div
          className="p-3 rounded"
          style={{ background: "#f5f7f5", border: "1px solid #dce5dc" }}
        >
          <div className="d-flex flex-wrap justify-content-between gap-2 align-items-start">
            <div>
              <h5 className="mb-1" style={{ color: "#1c2b20" }}>
                Abonnement Skedisy
              </h5>
              <p className="mb-1 text-muted">
                Plan actuel :{" "}
                <strong>
                  {plans.find((p) => p.planId === currentId)?.name || currentId}
                </strong>
                {sub.status ? ` · ${sub.status}` : ""}
                {sub.currentPeriodEnd
                  ? ` · jusqu’au ${new Date(
                      sub.currentPeriodEnd
                    ).toLocaleDateString("fr-FR")}`
                  : ""}
              </p>
              <p className="mb-0 small text-muted">
                Sélectionnez un plan ci-dessous, puis validez pour activer et
                payer.
              </p>
              {data?.partnero?.attributed ? (
                <small className="text-muted d-block mt-1">
                  Affiliation Ambassadeur liée
                  {data.partnero.signupSynced ? " (sync OK)" : ""}
                </small>
              ) : null}
            </div>
            {sub.stripeSubscriptionId ? (
              <Button
                text="Gérer / factures"
                className="bg-secondary text-white"
                onClick={openPortal}
                disabled={busy}
              />
            ) : null}
          </div>
        </div>
      </div>

      {notice ? (
        <div className="col-12 mb-2">
          <div className="alert alert-success py-2 mb-0">{notice}</div>
        </div>
      ) : null}
      {error ? (
        <div className="col-12 mb-2">
          <div className="alert alert-warning py-2 mb-0">{error}</div>
        </div>
      ) : null}

      <div className="col-12 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div className="btn-group" role="group" aria-label="Période">
          <button
            type="button"
            className={`btn btn-sm ${
              interval === "month" ? "btn-success" : "btn-outline-secondary"
            }`}
            onClick={() => setInterval("month")}
          >
            Mensuel
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              interval === "year" ? "btn-success" : "btn-outline-secondary"
            }`}
            onClick={() => setInterval("year")}
          >
            Annuel
          </button>
        </div>
        <Button
          text={ctaLabel}
          className={`${
            canCheckoutSelected ||
            (selectedIsFree && !isSelectedCurrent && !sub.stripeSubscriptionId)
              ? "bg-theme"
              : "bg-secondary"
          } text-white`}
          onClick={() => startCheckout(selectedPlanId)}
          disabled={
            busy ||
            !selectedPlan ||
            isSelectedCurrent ||
            (selectedIsFree && Boolean(sub.stripeSubscriptionId)) ||
            (!selectedIsFree && !canCheckoutSelected)
          }
        />
      </div>

      {plans.map((plan) => {
        const isCurrent = plan.planId === currentId;
        const isSelected = plan.planId === selectedPlanId;
        const price =
          interval === "year" ? plan.priceYearly : plan.priceMonthly;
        const isFree = plan.isFree || plan.tier === "free" || !(Number(price) > 0);
        const featurePreview = (plan.features || []).slice(0, 5);

        return (
          <div className="col-md-6 col-lg-4 mb-3" key={plan.planId}>
            <button
              type="button"
              className="h-100 w-100 text-start p-3 rounded"
              onClick={() => setSelectedPlanId(plan.planId)}
              style={{
                border: isSelected
                  ? "2px solid #1ebc1e"
                  : plan.isHighlighted
                    ? "2px solid #9ad49a"
                    : "1px solid #dde3dd",
                background: isCurrent ? "#eef8ee" : "#fff",
                boxShadow: isSelected ? "0 0 0 3px rgba(30,188,30,0.15)" : "none",
                cursor: "pointer",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    aria-hidden
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: isSelected ? "5px solid #1ebc1e" : "2px solid #9aa89a",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <h6 className="mb-0">{plan.name}</h6>
                </div>
                <div className="d-flex flex-column align-items-end gap-1">
                  {isCurrent ? (
                    <span className="badge bg-success">Actuel</span>
                  ) : null}
                  {isSelected && !isCurrent ? (
                    <span className="badge bg-dark">Sélectionné</span>
                  ) : null}
                </div>
              </div>
              {plan.tagline ? (
                <p className="small text-muted mb-2">{plan.tagline}</p>
              ) : null}
              <p className="mb-2">
                {isFree ? (
                  <strong>Gratuit</strong>
                ) : (
                  <>
                    <strong>{Number(price) || "—"} €</strong>
                    <span className="text-muted">
                      {" "}
                      / {interval === "year" ? "an" : "mois"}
                    </span>
                  </>
                )}
                {!isFree && plan.trialDays > 0 ? (
                  <span className="d-block small text-muted">
                    Essai {plan.trialDays} jours
                  </span>
                ) : null}
              </p>
              {featurePreview.length ? (
                <ul className="small text-muted mb-2 ps-3">
                  {featurePreview.map((f) => (
                    <li key={f.key || f}>{f.label || f}</li>
                  ))}
                  {(plan.features || []).length > featurePreview.length ? (
                    <li>
                      +{(plan.features || []).length - featurePreview.length}{" "}
                      autres
                    </li>
                  ) : null}
                </ul>
              ) : null}
              {!isCurrent ? (
                <span
                  className="btn btn-sm w-100"
                  style={{
                    background: isSelected ? "#1ebc1e" : "#e8efe8",
                    color: isSelected ? "#fff" : "#1c2b20",
                    pointerEvents: "none",
                  }}
                >
                  {isSelected ? "Sélectionné — validez en haut" : "Sélectionner"}
                </span>
              ) : (
                <span className="small text-muted">Votre plan en cours</span>
              )}
            </button>
          </div>
        );
      })}

      <div className="col-12 mt-1">
        <p className="small text-muted mb-0">
          Le paiement sécurisé est géré par Stripe. Après validation, votre plan
          est activé automatiquement (ou sous quelques secondes via webhook).
        </p>
      </div>
    </div>
  );
};

export default SalonSubscriptionBilling;
