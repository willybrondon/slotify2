import { useState } from "react";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import Title from "../../extras/Title";
import PageStatusDateFilters from "../../extras/PageStatusDateFilters";
import PendingRequest from "./PendingRequest";
import AcceptRequest from "./AcceptRequest";
import RejectRequest from "./RejectRequest";

const ExpertRequest = () => {
  const [type, setType] = useState("pending");
  const [status, setStatus] = useState("1");
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  return (
    <div className="mainSetting">
      <div className="row">
        <Title name={ui.labels.expertWithdrawRequest} className="mt-4" />
      </div>
      <div className="mb-3">
        <PageStatusDateFilters
        type={type}
        setType={setType}
        setStatus={setStatus}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        />
      </div>

      {type === "pending" && (
        <PendingRequest status={status} startDate={startDate} endDate={endDate} />
      )}
      {type === "accepted" && (
        <AcceptRequest status={status} startDate={startDate} endDate={endDate} />
      )}
      {type === "declined" && (
        <RejectRequest status={status} startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
};

export default ExpertRequest;
