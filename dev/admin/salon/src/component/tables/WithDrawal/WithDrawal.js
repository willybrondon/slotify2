import { useState } from "react";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import Title from "../../extras/Title";
import PageStatusDateFilters from "../../extras/PageStatusDateFilters";
import PendingSalonReq from "./PendingSalonReq";
import AcceptSalonReq from "./AcceptSalonReq";
import RejectSalonReq from "./RejectSalonReq";

const WithDrawal = () => {
  const [type, setType] = useState("pending");
  const [status, setStatus] = useState("1");
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  return (
    <div className="mainSetting">
      <div className="row">
        <Title name={ui.labels.salonWithdrawRequest} className="mt-4" />
      </div>
      <PageStatusDateFilters
        type={type}
        setType={setType}
        setStatus={setStatus}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />

      {type === "pending" && (
        <PendingSalonReq status={status} startDate={startDate} endDate={endDate} />
      )}
      {type === "accepted" && (
        <AcceptSalonReq status={status} startDate={startDate} endDate={endDate} />
      )}
      {type === "declined" && (
        <RejectSalonReq status={status} startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
};

export default WithDrawal;
