import React from "react";
import Title from "../extras/Title";
import SalonPaymentSettings from "./SalonPaymentSettings";
import { SKEDISY_SALON_PORTAL_COPY as portalCopy } from "../../constants/skedisyPortalCopy";

const PaymentSettingsPage = () => {
  return (
    <div className="p-3">
      <Title name={portalCopy.paymentSettingsPageTitle} />
      <div className="card">
        <div className="card-body">
          <p style={{ fontSize: "14px", color: "#666", marginBottom: 8 }}>
            {portalCopy.paymentSettingsPageIntro}
          </p>
          <SalonPaymentSettings />
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
