import { useState } from "react";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import Title from "../../extras/Title";
import PendingRequest from "./PendingRequest";
import AcceptRequest from "./AcceptRequest";
import RejectRequest from "./RejectRequest";
import Analytics from "../../extras/Analytics";
import SqSegmentTabs from "../../extras/SqSegmentTabs";

const ExpertRequest = () => {
    const [type, setType] = useState("pending")
    const [status, setStatus] = useState("1")
    const [startDate, setStartDate] = useState("ALL");
    const [endDate, setEndDate] = useState("ALL");

    const handleTabChange = (tabId) => {
        setType(tabId);
        if (tabId === "pending") setStatus("1");
        if (tabId === "accepted") setStatus("2");
        if (tabId === "declined") setStatus("3");
    };

    return (
        <div className="mainSetting sq-table-page">
            <Title name={ui.labels.expertWithdrawHistory} />
            <p className="text-muted small mb-3">Consultation seule — les salons valident les retraits de leurs pros.</p>
            <div className="sq-page-filters card-sq sq-filter-toolbar mb-3">
                <SqSegmentTabs
                    tabs={[
                        { id: "pending", label: "En attente" },
                        { id: "accepted", label: "Validées" },
                        { id: "declined", label: "Refusées" },
                    ]}
                    value={type}
                    onChange={handleTabChange}
                />
                <div className="sq-page-filters__date">
                    <Analytics
                        analyticsStartDate={startDate}
                        analyticsStartEnd={endDate}
                        placeholder={ui.form.wallet}
                        analyticsStartDateSet={setStartDate}
                        analyticsStartEndSet={setEndDate}
                    />
                </div>
            </div>
           
            {
                type === "pending" && (
                    <PendingRequest readOnly showSalon status={status} startDate={startDate} endDate={endDate}/>
                )
            }
            {
                type === "accepted" && (
                    <AcceptRequest showSalon status={status} startDate={startDate} endDate={endDate} />
                )
            }
            {
                type === "declined" && (
                    <RejectRequest showSalon status={status} startDate={startDate} endDate={endDate} />
                )
            }
           
        </div>
    )
}
export default ExpertRequest;
