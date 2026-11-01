import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../extras/Button";
import { apiInstanceFetch } from "../api/axiosApi";

/**
 * SaaS plan upgrade — Stripe Checkout uses Price IDs configured in admin.
 * Partnero commission is recorded server-side on invoice.paid (not Stripe↔Partnero app).
 */
const SalonSubscriptionBilling = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [interval, setInterval] = useState("month");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiInstanceFetch.get("salon/subscription/status");
      if (res?.status) {
        setData(res.data);
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
      setNotice("Checkout annulé.");
      navigate("/salonpanel/profile?tab=subscription", { replace: true });
    }
  }, [load, navigate]);

  const startCheckout = async (planId) => {
    setBusy(true);
    setError("");
    try {
      const res = await apiInstanceFetch.post("salon/subscription/checkout", {
        planId,
        interval,
      });
      if (res?.status && res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      setError(res?.message || "Checkout indisponible pour ce plan");
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

  const sub = data?.subscription || {};
  const plans = data?.plans || [];
  const currentId = sub.planId || "free";

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
              <p className="mb-0 text-muted">
                Plan actuel : <strong>{currentId}</strong>
                {sub.status ? ` · ${sub.status}` : ""}
                {sub.currentPeriodEnd
                  ? ` · jusqu’au ${new Date(
                      sub.currentPeriodEnd
                    ).toLocaleDateString("fr-FR")}`
                  : ""}
              </p>
              {data?.partnero?.attributed ? (
                <small className="text-muted">
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

      <div className="col-12 mb-3">
        <div className="btn-group" role="group">
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
      </div>

      {plans.map((plan) => {
        const isCurrent = plan.planId === currentId;
        const price =
          interval === "year" ? plan.priceYearly : plan.priceMonthly;
        const canPay =
          interval === "year"
            ? plan.hasCheckoutYearly
            : plan.hasCheckoutMonthly;
        const isFree = plan.tier === "free" || !(Number(price) > 0);

        return (
          <div className="col-md-6 col-lg-4 mb-3" key={plan.planId}>
            <div
              className="h-100 p-3 rounded"
              style={{
                border: plan.isHighlighted
                  ? "2px solid #1ebc1e"
                  : "1px solid #dde3dd",
                background: isCurrent ? "#eef8ee" : "#fff",
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="mb-0">{plan.name}</h6>
                {isCurrent ? (
                  <span className="badge bg-success">Actuel</span>
                ) : null}
              </div>
              {plan.tagline ? (
                <p className="small text-muted mb-2">{plan.tagline}</p>
              ) : null}
              <p className="mb-3">
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
              </p>
              {!isFree && !isCurrent ? (
                <Button
                  text={
                    canPay
                      ? busy
                        ? "Redirection…"
                        : "Souscrire"
                      : "Bientôt (Price ID admin)"
                  }
                  className={`${
                    canPay ? "bg-theme" : "bg-secondary"
                  } text-white w-100`}
                  onClick={() => canPay && startCheckout(plan.planId)}
                  disabled={!canPay || busy}
                />
              ) : null}
              {isFree && !isCurrent ? (
                <p className="small text-muted mb-0">
                  Plan d&apos;entrée — contactez le support pour rétrograder.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalonSubscriptionBilling;
