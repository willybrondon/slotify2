import { useState } from "react";
import Title from "../../extras/Title";
import PendingRequest from "./PendingRequest";
import AcceptRequest from "./AcceptRequest";
import RejectRequest from "./RejectRequest";
import Analytics from "../../extras/Analytics";

const ExpertRequest = () => {
    const [type, setType] = useState("pending")
    const [status, setStatus] = useState("1")
    const [startDate, setStartDate] = useState("ALL");
    const [endDate, setEndDate] = useState("ALL");
    return (
        <div className="mainSetting">
            <div className="row">
                <Title name="Expert Withdrawal Request" className="mt-4" />
            </div>
            <div className="d-flex justify-content-between">
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
                        className={`${type === "pending" ? "activeBtn" : "disabledBtn"}`}
                        onClick={() => {
                            setType("pending")
                            setStatus("1")
                        }}
                    >
                        Pending
                    </button>
                    <button
                        type="button"
                        className={`${type === "accepted" ? "activeBtn" : "disabledBtn"
                            } ms-1`}
                        onClick={() => {
                            setType("accepted")
                            setStatus("2")
                        }

                        }
                    >
                        Accepted
                    </button>
                    <button
                        type="button"
                        className={`${type === "declined" ? "activeBtn" : "disabledBtn"
                            } ms-1`}
                        onClick={() => {
                            setType("declined")
                            setStatus("3")
                        }}
                    >
                        Declline
                    </button>
                </div>
                <Analytics
                    analyticsStartDate={startDate}
                    analyticsStartEnd={endDate}
                    placeholder="Wallet"
                    analyticsStartDateSet={setStartDate}
                    analyticsStartEndSet={setEndDate}
                />
            </div>
           
            {
                type === "pending" && (
                    <PendingRequest status={status} startDate={startDate} endDate={endDate}/>
                )
            }
            {
                type === "accepted" && (
                    <AcceptRequest status={status} startDate={startDate} endDate={endDate} />
                )
            }
            {
                type === "declined" && (
                    <RejectRequest status={status} startDate={startDate} endDate={endDate} />
                )
            }
           
        </div>
    )
}
export default ExpertRequest;