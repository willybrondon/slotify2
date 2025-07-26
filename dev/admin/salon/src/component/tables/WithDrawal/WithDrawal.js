import { useState } from "react";
import Analytics from "../../extras/Analytics"
import Title from "../../extras/Title";
import PendingSalonReq from "./PendingSalonReq";
import AcceptSalonReq from "./AcceptSalonReq";
import RejectSalonReq from "./RejectSalonReq";


const WithDrawal = () => {
    const [type, setType] = useState("pending")
    const [status, setStatus] = useState("1")
    const getCurrentMonthDates = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based

        const startOfMonth = `${currentYear}-${currentMonth
            .toString()
            .padStart(2, "0")}-01`;
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const endOfMonth = `${currentYear}-${currentMonth
            .toString()
            .padStart(2, "0")}-${lastDay}`;

        return { startOfMonth, endOfMonth };
    };
    const { startOfMonth, endOfMonth } = getCurrentMonthDates();
    const [startDate, setStartDate] = useState("ALL");
    const [endDate, setEndDate] = useState("ALL");
    return (
        <div className="mainSetting">
            <div className="row">
                <Title name="Salon Withdrawal Request" className="mt-4" />
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
                    <PendingSalonReq status={status} startDate={startDate} endDate={endDate} />
                )
            }
            {
                type === "accepted" && (
                    <AcceptSalonReq status={status} startDate={startDate} endDate={endDate} />
                )
            }
            {
                type === "declined" && (
                    <RejectSalonReq status={status} startDate={startDate} endDate={endDate} />
                )
            }

        </div>
    )
}
export default WithDrawal;  