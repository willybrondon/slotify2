import { useState } from "react";
import { useLocation } from "react-router-dom";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import Title from "../../extras/Title";
import SalonExpertSettlements from "./SalonExpertSettlements";
import PendingRequest from "../WithDrawal/PendingRequest";
import AcceptRequest from "../WithDrawal/AcceptRequest";
import RejectRequest from "../WithDrawal/RejectRequest";
import Analytics from "../../extras/Analytics";

const SalonExpertPayments = () => {
  const location = useLocation();
  const salonId = location?.state?.salonId || location?.state?.id;
  const salonName = location?.state?.salonName || "";

  const [view, setView] = useState("settlements");
  const [withdrawStatus, setWithdrawStatus] = useState("1");
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  if (!salonId) {
    return (
      <div className="mainSetting">
        <Title name={ui.labels.expertPayments} />
        <p className="text-muted">Sélectionnez un salon pour gérer les paiements experts.</p>
      </div>
    );
  }

  return (
    <div className="mainSetting">
      <Title name={`${ui.labels.expertPayments}${salonName ? ` — ${salonName}` : ""}`} />
      <p className="text-muted mb-2">
        Les demandes de retrait sont validées par le salon. Consultation seule côté admin.
      </p>
      <div
        className="my-3"
        style={{
          width: "480px",
          border: "1px solid #1c2b20",
          padding: "8px 20px",
          borderRadius: "40px",
        }}
      >
        <button
          type="button"
          className={`${view === "settlements" ? "activeBtn" : "disabledBtn"}`}
          onClick={() => setView("settlements")}
        >
          Règlements
        </button>
        <button
          type="button"
          className={`${view === "withdrawals" ? "activeBtn" : "disabledBtn"} ms-1`}
          onClick={() => setView("withdrawals")}
        >
          Historique retraits
        </button>
      </div>

      {view === "settlements" && <SalonExpertSettlements salonId={salonId} />}

      {view === "withdrawals" && (
        <>
          <div className="d-flex justify-content-between mb-2">
            <div
              className="my-2"
              style={{
                width: "334px",
                border: "1px solid #1c2b20",
                padding: "8px 20px",
                borderRadius: "40px",
              }}
            >
              <button
                type="button"
                className={`${withdrawStatus === "1" ? "activeBtn" : "disabledBtn"}`}
                onClick={() => setWithdrawStatus("1")}
              >
                En attente
              </button>
              <button
                type="button"
                className={`${withdrawStatus === "2" ? "activeBtn" : "disabledBtn"} ms-1`}
                onClick={() => setWithdrawStatus("2")}
              >
                Validées
              </button>
              <button
                type="button"
                className={`${withdrawStatus === "3" ? "activeBtn" : "disabledBtn"} ms-1`}
                onClick={() => setWithdrawStatus("3")}
              >
                Refusées
              </button>
            </div>
            <Analytics
              analyticsStartDate={startDate}
              analyticsStartEnd={endDate}
              placeholder={ui.form.wallet}
              analyticsStartDateSet={setStartDate}
              analyticsStartEndSet={setEndDate}
            />
          </div>
          {withdrawStatus === "1" && (
            <PendingRequest readOnly salonId={salonId} status={withdrawStatus} startDate={startDate} endDate={endDate} />
          )}
          {withdrawStatus === "2" && (
            <AcceptRequest salonId={salonId} status={withdrawStatus} startDate={startDate} endDate={endDate} />
          )}
          {withdrawStatus === "3" && (
            <RejectRequest salonId={salonId} status={withdrawStatus} startDate={startDate} endDate={endDate} />
          )}
        </>
      )}
    </div>
  );
};

export default SalonExpertPayments;
