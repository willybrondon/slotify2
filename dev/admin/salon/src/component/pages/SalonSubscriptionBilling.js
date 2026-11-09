import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiInstanceFetch } from "../api/axiosApi";
import "./SalonSubscriptionBilling.css";

const FALLBACK_PACKS = [
  {
    packId: "1m",
    months: 1,
    label: "1 mois",
    price: 18.99,
    compareAt: 37.97,
    discountPct: 50,
    popular: false,
    perDay: 0.63,
  },
  {
    packId: "3m",
    months: 3,
    label: "3 mois",
    price: 29.99,
    compareAt: 74.97,
    discountPct: 60,
    popular: true,
    perDay: 0.33,
  },
  {
    packId: "12m",
    months: 12,
    label: "12 mois",
    price: 69.99,
    compareAt: 149.97,
    discountPct: 53,
    popular: false,
    perDay: 0.19,
  },
];

const formatEuro = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

/**
 * Blow Up–style salon billing: 1 / 3 / 12 mois, €/jour, réduction, renouvellement.
 */
const SalonSubscriptionBilling = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [data, setData] = useState(null);
  const [selectedPackId, setSelectedPackId] = useState("3m");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiInstanceFetch.get("salon/subscription/status");
      if (res?.status) {
        setData(res.data);
        const currentPack = res.data?.subscription?.packId;
        if (currentPack) {
          setSelectedPackId(currentPack);
        } else {
          const popular =
            (res.data?.billingPacks || []).find((p) => p.popular)?.packId || "3m";
          setSelectedPackId((prev) => prev || popular);
        }
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
  const packs = data?.billingPacks?.length ? data.billingPacks : FALLBACK_PACKS;
  const checkoutPlanId = data?.checkoutPlanId || "premium";
  const currentPackId = sub.packId || "";
  const plans = data?.plans || [];
  const currentPlanName =
    plans.find((p) => p.planId === (sub.planId || "free"))?.name ||
    sub.planId ||
    "free";

  const selectedPack = useMemo(
    () => packs.find((p) => p.packId === selectedPackId) || packs[0],
    [packs, selectedPackId]
  );

  const isSelectedCurrent =
    Boolean(currentPackId) &&
    selectedPackId === currentPackId &&
    ["active", "trialing"].includes(String(sub.status || ""));

  const ctaLabel = useMemo(() => {
    if (busy) return "Traitement…";
    if (isSelectedCurrent) return "Plan déjà actif";
    if (sub.stripeSubscriptionId) return "Continuer — changer de durée";
    return "Continuer";
  }, [busy, isSelectedCurrent, sub.stripeSubscriptionId]);

  const startCheckout = async () => {
    if (!selectedPackId) {
      setError("Sélectionnez une durée");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await apiInstanceFetch.post("salon/subscription/checkout", {
        planId: checkoutPlanId,
        packId: selectedPackId,
      });
      if (res?.status && res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      if (
        res?.status &&
        (res?.data?.mode === "updated" || res?.data?.mode === "assigned")
      ) {
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
      <div className="ssb-wrap">
        <p className="ssb-muted">Chargement de l&apos;abonnement…</p>
      </div>
    );
  }

  const renewalFullPrice = selectedPack?.compareAt ?? 74.97;

  return (
    <div className="ssb-wrap">
      <div className="ssb-status">
        <div>
          <p className="ssb-status-label">Abonnement actuel</p>
          <p className="ssb-status-value">
            {currentPlanName}
            {currentPackId
              ? ` · ${
                  packs.find((p) => p.packId === currentPackId)?.label ||
                  currentPackId
                }`
              : ""}
            {sub.status ? ` · ${sub.status}` : ""}
            {sub.currentPeriodEnd
              ? ` · jusqu’au ${new Date(sub.currentPeriodEnd).toLocaleDateString(
                  "fr-FR"
                )}`
              : ""}
          </p>
          {data?.partnero?.attributed ? (
            <p className="ssb-muted ssb-tiny">
              Affiliation Ambassadeur liée
              {data.partnero.signupSynced ? " (sync OK)" : ""}
            </p>
          ) : null}
        </div>
        {sub.stripeSubscriptionId ? (
          <button
            type="button"
            className="ssb-link-btn"
            onClick={openPortal}
            disabled={busy}
          >
            Gérer / factures
          </button>
        ) : null}
      </div>

      {notice ? <div className="ssb-alert ssb-alert-ok">{notice}</div> : null}
      {error ? <div className="ssb-alert ssb-alert-warn">{error}</div> : null}

      <h3 className="ssb-title">Choisis ton plan</h3>

      <div className="ssb-plans" role="radiogroup" aria-label="Durée d'abonnement">
        {packs.map((pack) => {
          const isSelected = pack.packId === selectedPackId;
          const isCurrent = pack.packId === currentPackId;
          const perDay =
            Number(pack.perDay) ||
            Number(pack.price) / (Math.max(1, Number(pack.months)) * 30);

          return (
            <button
              key={pack.packId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={[
                "ssb-plan",
                isSelected ? "is-selected" : "",
                pack.popular ? "is-popular" : "",
                isCurrent ? "is-current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setSelectedPackId(pack.packId)}
            >
              {pack.popular ? (
                <span className="ssb-popular-badge">Plus populaire</span>
              ) : null}

              <span
                className={`ssb-radio${isSelected ? " is-on" : ""}`}
                aria-hidden
              >
                {isSelected ? (
                  <svg viewBox="0 0 16 16" width="12" height="12">
                    <path
                      fill="currentColor"
                      d="M6.2 11.4 2.8 8l1.1-1.1 2.3 2.3 5-5L12.3 5.3z"
                    />
                  </svg>
                ) : null}
              </span>

              <span className="ssb-plan-main">
                <span className="ssb-plan-top">
                  <span className="ssb-plan-name">{pack.label}</span>
                  {pack.discountPct > 0 ? (
                    <span className="ssb-discount">-{pack.discountPct}%</span>
                  ) : null}
                  {isCurrent ? (
                    <span className="ssb-current-badge">Actuel</span>
                  ) : null}
                </span>
                <span className="ssb-plan-prices">
                  <span className="ssb-price-was">
                    {formatEuro(pack.compareAt)}
                  </span>
                  <span className="ssb-price-now">{formatEuro(pack.price)}</span>
                </span>
              </span>

              <span className="ssb-per-day">
                <strong>{formatEuro(perDay)}</strong>
                <span>/jour</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="ssb-legal">
        Le prix réduit s&apos;applique à ton premier abonnement. Ton abonnement
        sera automatiquement renouvelé au prix plein de{" "}
        <strong>{formatEuro(renewalFullPrice)}</strong> à la fin de la période
        d&apos;abonnement choisie, jusqu&apos;à annulation dans ton compte.
      </p>

      <button
        type="button"
        className="ssb-cta"
        onClick={startCheckout}
        disabled={busy || isSelectedCurrent}
      >
        {ctaLabel}
      </button>

      <div className="ssb-secure">
        <div className="ssb-secure-title">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="currentColor"
              d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm0 10.9 4.2-4.2 1.4 1.4L12 16.7 6.4 11l1.4-1.4L12 12.9z"
            />
          </svg>
          Paiement sécurisé
        </div>
        <p className="ssb-secure-copy">
          Via Stripe : carte bancaire, Apple Pay et Google Pay selon ton
          appareil. Skedisy ne stocke pas ton numéro de carte.
        </p>
        <div className="ssb-pay-methods" aria-label="Moyens de paiement Stripe">
          <span className="ssb-pay-chip ssb-pay-visa" title="Visa">
            Visa
          </span>
          <span className="ssb-pay-chip ssb-pay-mc" title="Mastercard">
            Mastercard
          </span>
          <span className="ssb-pay-chip ssb-pay-amex" title="American Express">
            Amex
          </span>
          <span className="ssb-pay-chip ssb-pay-apple" title="Apple Pay">
            Apple Pay
          </span>
          <span className="ssb-pay-chip ssb-pay-gpay" title="Google Pay">
            Google Pay
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalonSubscriptionBilling;
