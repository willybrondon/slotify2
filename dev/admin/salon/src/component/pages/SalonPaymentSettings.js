import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../extras/ToggleSwitch";
import Button from "../extras/Button";
import { SKEDISY_SALON_PORTAL_COPY as portalCopy } from "../../constants/skedisyPortalCopy";
import {
  fetchStripeConnectStatus,
  updateSalonPaymentMethods,
  startStripeOnboarding,
  refreshStripeConnect,
} from "../../redux/slice/stripeConnectSlice";

const SalonPaymentSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, isLoading } = useSelector((state) => state.stripeConnect);

  useEffect(() => {
    dispatch(fetchStripeConnectStatus());
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "return" || params.get("stripe") === "refresh") {
      dispatch(refreshStripeConnect()).then(() => {
        navigate("/salonpanel/paymentSettings", { replace: true });
      });
    }
  }, [dispatch, navigate]);

  const acceptCash = status?.paymentMethods?.acceptCash !== false;
  const acceptStripePref = status?.paymentMethods?.acceptStripe === true;
  const platformStripe = status?.platformStripeEnabled === true;
  const stripeReady = status?.options?.acceptStripe === true;
  const chargesEnabled = status?.stripeConnect?.chargesEnabled === true;
  const payoutsEnabled = status?.stripeConnect?.payoutsEnabled === true;

  const stripeStatusLabel = stripeReady
    ? portalCopy.stripeConnectReady
    : status?.stripeConnect?.accountId
    ? portalCopy.stripeConnectPending
    : portalCopy.stripeConnectDisabled;

  const handleCashToggle = () => {
    dispatch(
      updateSalonPaymentMethods({
        acceptCash: !acceptCash,
        acceptStripe: acceptStripePref,
      })
    );
  };

  const handleStripeToggle = () => {
    if (!platformStripe) return;
    dispatch(
      updateSalonPaymentMethods({
        acceptCash,
        acceptStripe: !acceptStripePref,
      })
    );
  };

  const handleStripeOnboard = async () => {
    try {
      const result = await dispatch(startStripeOnboarding()).unwrap();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      console.error("[Stripe onboarding]", e);
    }
  };

  if (isLoading && !status) {
    return (
      <div className="row mt-3">
        <div className="col-12">
          <p style={{ color: "#666" }}>Chargement des paramètres de paiement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row mt-3">
      <div className="col-12">
        <h5 style={{ marginBottom: "12px", color: "#1c2b20" }}>
          {portalCopy.paymentSettingsTitle}
        </h5>
      </div>

      {!platformStripe && (
        <div className="col-12 mb-3">
          <div
            className="p-3 rounded"
            style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412" }}
          >
            {portalCopy.stripeConnectPlatformOff}
          </div>
        </div>
      )}

      <div className="col-12 mb-2">
        <div
          className="d-flex justify-content-between align-items-center p-3 rounded"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{portalCopy.paymentCashLabel}</div>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: 0 }}>
              {portalCopy.paymentCashHint}
            </p>
          </div>
          <ToggleSwitch value={acceptCash} onClick={handleCashToggle} />
        </div>
      </div>

      <div className="col-12 mb-2">
        <div
          className="d-flex justify-content-between align-items-center p-3 rounded"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{portalCopy.paymentStripeLabel}</div>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: 0 }}>
              {portalCopy.paymentStripeHint}
            </p>
          </div>
          <ToggleSwitch
            value={acceptStripePref}
            onClick={handleStripeToggle}
            disabled={!platformStripe}
          />
        </div>
      </div>

      {acceptStripePref && platformStripe && (
        <div className="col-12 sq-stripe-connect-block">
          <p style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
            {portalCopy.paymentAdminStripeNote}
          </p>
          <div
            className="p-3 rounded"
            style={{ backgroundColor: "#f0f4ff", border: "1px solid #d6e0ff" }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {portalCopy.stripeConnectTitle}
            </div>
            <p style={{ fontSize: "13px", marginBottom: 8 }}>
              <strong>{stripeStatusLabel}</strong>
            </p>
            {!stripeReady && (
              <ul style={{ fontSize: "13px", paddingLeft: "1.2rem", marginBottom: 12 }}>
                <li>{portalCopy.stripeConnectStep1}</li>
                <li>{portalCopy.stripeConnectStep2}</li>
                <li>{portalCopy.stripeConnectStep3}</li>
              </ul>
            )}
            {status?.stripeConnect?.accountId && !chargesEnabled && (
              <p style={{ fontSize: "12px", color: "#b45309", marginBottom: 8 }}>
                {portalCopy.stripeConnectChargesOff}
              </p>
            )}
            {status?.stripeConnect?.accountId && chargesEnabled && !payoutsEnabled && (
              <p style={{ fontSize: "12px", color: "#b45309", marginBottom: 8 }}>
                {portalCopy.stripeConnectPayoutsOff}
              </p>
            )}
            <Button
              text={portalCopy.stripeConnectButton}
              className="text-white sq-stripe-connect-btn"
              style={{ backgroundColor: "#635bff" }}
              onClick={handleStripeOnboard}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonPaymentSettings;
