import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const { status, isLoading } = useSelector((state) => state.stripeConnect);

  useEffect(() => {
    dispatch(fetchStripeConnectStatus());
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "return" || params.get("stripe") === "refresh") {
      dispatch(refreshStripeConnect());
    }
  }, [dispatch]);

  const acceptCash = status?.paymentMethods?.acceptCash !== false;
  const acceptStripe = status?.paymentMethods?.acceptStripe === true;
  const platformStripe = status?.platformStripeEnabled !== false;
  const stripeReady = status?.options?.acceptStripe === true;

  const stripeStatusLabel = stripeReady
    ? portalCopy.stripeConnectReady
    : status?.stripeConnect?.accountId
    ? portalCopy.stripeConnectPending
    : portalCopy.stripeConnectDisabled;

  const handleCashToggle = () => {
    dispatch(
      updateSalonPaymentMethods({
        acceptCash: !acceptCash,
        acceptStripe,
      })
    );
  };

  const handleStripeToggle = () => {
    if (!platformStripe) return;
    dispatch(
      updateSalonPaymentMethods({
        acceptCash,
        acceptStripe: !acceptStripe,
      })
    );
  };

  const handleStripeOnboard = async () => {
    const result = await dispatch(startStripeOnboarding()).unwrap();
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="row mt-3">
      <div className="col-12">
        <h5 style={{ marginBottom: "12px", color: "#1c2b20" }}>
          {portalCopy.paymentSettingsTitle}
        </h5>
      </div>
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
            value={acceptStripe}
            onClick={handleStripeToggle}
            disabled={!platformStripe}
          />
        </div>
      </div>
      {acceptStripe && platformStripe && (
        <div className="col-12">
          <div
            className="p-3 rounded"
            style={{ backgroundColor: "#f0f4ff", border: "1px solid #d6e0ff" }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {portalCopy.stripeConnectTitle}
            </div>
            <p style={{ fontSize: "13px", marginBottom: 12 }}>{stripeStatusLabel}</p>
            <Button
              text={portalCopy.stripeConnectButton}
              className="text-white"
              style={{ backgroundColor: "#635bff" }}
              onClick={handleStripeOnboard}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
      {acceptStripe && !platformStripe && (
        <div className="col-12">
          <p style={{ fontSize: "13px", color: "#b45309" }}>
            {portalCopy.stripeConnectPlatformOff}
          </p>
        </div>
      )}
    </div>
  );
};

export default SalonPaymentSettings;
