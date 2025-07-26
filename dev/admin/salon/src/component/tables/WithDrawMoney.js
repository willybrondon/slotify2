import { useEffect, useState } from "react";
import Analytics from "../extras/Analytics";
import moment from "moment";
import withDrawBanner from "../../../src/assets/images/withDraw.png";
import Button from "../extras/Button";
import Title from "../extras/Title";
import { useDispatch, useSelector } from "react-redux";
import { addWithDrawMethod, getWithDrawMethod } from "../../redux/slice/withDrawSlice";
import { toast } from "react-toastify";
import { getCurrency } from "../../redux/slice/settingSlice";
import { useNavigate } from "react-router-dom";


const WithDrawMoney = () => {
    const { withDraw } = useSelector((state) => state.withDraw);
    const { admin } = useSelector((state) => state.auth);
    const { currency } = useSelector((state) => state.setting);
    const navigate = useNavigate()
  
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("");
    const [selectedDetails, setSelectedDetails] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState([]);
    const [amountError, setAmountError] = useState(false);

    useEffect(() => {
        if (withDraw && withDraw.length > 0) {
            setType(withDraw[0]?.name);
            setSelectedDetails(withDraw[0]?.details || []);
        }
    }, [withDraw]);

    const handleTypeChange = (e) => {
        
        const selectedType = e.target.value;
        setType(selectedType);

        const selectedPayment = withDraw.find((item) => item.name === selectedType);
        if (selectedPayment && Array.isArray(selectedPayment.details)) {
            setSelectedDetails(selectedPayment.details);
            setPaymentDetails([]);
        } else {
            setSelectedDetails([]);
        }
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getWithDrawMethod());
        dispatch(getCurrency())
    }, [dispatch]);

    const handleDetailChange = (detail, value) => {

        setPaymentDetails((prevDetails) => {
            const newDetail = { [detail]: value };

            const existingDetailIndex = prevDetails.findIndex((item) => Object.keys(item)[0] === detail);
            if (existingDetailIndex > -1) {
                const updatedDetails = [...prevDetails];
                updatedDetails[existingDetailIndex] = newDetail;
                return updatedDetails;
            } else {
                return [...prevDetails, newDetail];
            }
        });
    };

    const handleSubmit = () => {
    
        if (!amount) {
            setAmountError(true);
            return;
        }

        if (paymentDetails.length === 0) {
            toast.error("Please select at least one payment detail.");
            return;
        }

        const formattedPaymentDetails = paymentDetails.map((detail) => {
            const key = Object.keys(detail)[0];
            const value = detail[key];
            return `${key}: ${value}`;
        });

        const payload = {
            amount: amount,
            salonId: admin?._id,
            paymentGateway: type,
            paymentDetails: formattedPaymentDetails,
        };

        dispatch(addWithDrawMethod(payload))
            .then((res) => {
                if (res?.payload?.status) {
                    dispatch(getWithDrawMethod());
                    toast.success(res?.payload?.message);
                    navigate("/salonPanel/salonDashboard")
                } else {
                    toast.error(res?.payload?.message);
                }
            });
    };


    return (
        <>
            <div className="mainExpert">
                <Title name="Withdraw Money" />

                <div className="row">
                    <div className="col-md-6" style={{ position: "relative" }}>
                        {/* Text positioned on top of the image */}
                        <div style={{ position: "absolute", top: "14%", left: "29%", transform: "translateX(-50%)", color: "white", fontSize: "30px", zIndex: 2, fontWeight: "bold" }}>
                            My Available Balance
                        </div>
                        <div style={{ position: "absolute", top: "20%", left: "16%", transform: "translateX(-50%)", color: "white", fontSize: "40px", zIndex: 2, fontWeight: "bold" }}>{currency?.currencySymbol} {admin?.earning}</div>

                        {/* Image */}
                        <img src={withDrawBanner} alt="Withdraw Banner" height={200} className="rounded-4" style={{ width: "100%", position: "relative" }} />

                        <div className="inputData">
                            <label className="styleForTitle mt-2" htmlFor="withdrawAmount">
                                Enter Withdraw Amount
                            </label>
                            <div className="input-group mt-2" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <span className="input-group-text fw-bold" style={{ position: "relative", display: "flex", alignItems: "center", background: "#1C2B20", color: "white" }}>{currency?.currencySymbol} </span>
                                <input
                                    type="number"
                                    name="withdrawAmount"
                                    className="form-control fw-bold p-3"
                                    id="withdrawAmount"
                                    style={{
                                        paddingLeft: "2.5rem",
                                        borderTopLeftRadius: "0",
                                        borderBottomLeftRadius: "0",
                                    }}
                                    placeholder="Enter amount"
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (value < currency?.minWithdrawalRequestedAmount) {
                                            setAmountError(true);
                                        } else {
                                            setAmountError(false);
                                            setAmount(value);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        {amountError && (
                            <label className="d-flex justify-content-end mt-1" style={{ color: "red", fontSize: "15px" }}>
                                *Amount should be greater than or equal to ${currency?.minWithdrawalRequestedAmount}
                            </label>
                        )}
                        <label className="d-flex justify-content-end mt-1" style={{ color: "red", fontSize: "15px" }}>
                            *Maximum Withdraw amount is {currency?.currencySymbol}{currency?.minWithdrawalRequestedAmount}
                        </label>



                        <div className="row mt-4">
                            <div className="inputData mt-4 col-md-11">
                                <label className="styleForTitle fw-bold" style={{ color: "#1C2B20", fontSize: "24px" }}>
                                    Withdraw Instruction :
                                </label>
                                <div style={{ fontSize: "14px", lineHeight: "25px", color: "#A5A5A5" }}>
                                    <div>To initiate a withdrawal, please enter the desired amount in the withdrawal field. Ensure that the amount meets or exceeds the minimum withdrawal limit of $[Insert Minimum Amount]. Once the request is submitted, it will be processed within [Insert Time Frame], and funds will be transferred to your registered account. Please verify that your account details are up-to-date to avoid any delays. If you encounter any issues during the process, feel free to contact our support team for assistance.</div>
                                    <div style={{ wordWrap: "break-word" }}>To withdraw funds, enter the amount you wish to withdraw, ensuring it meets the minimum withdrawal limit of $[Insert Minimum Amount]. Verify that your account details are correct to avoid delays. Once submitted, your request will be processed within [Insert Time Frame], and any applicable fees may be deducted. If you encounter any issues or delays, please contact our support team for assistance.</div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="col-md-6">


                        <div className="inputData mt-2">
                            <label className="styleForTitle" htmlFor="paymentType">
                                Select Payment Option
                            </label>
                            <select
                                name="paymentType"
                                className="rounded-2 fw-bold"
                                id="paymentType"
                                value={type}
                                onChange={handleTypeChange}
                            >
                                {withDraw?.map((data) => (
                                    <option key={data._id} value={data.name}>
                                        {data.name}
                                    </option>
                                ))}
                            </select>

                            {/* Display dynamic input fields based on selected payment details */}
                            {selectedDetails?.map((detail, index) => (
                                <div className="inputData mt-4" key={index}>
                                    <label className="styleForTitle">Enter Your {detail}</label>
                                    <input
                                        type="text"
                                        className="rounded-2 fw-bold p-4"
                                        placeholder={`Enter your ${detail.toLowerCase()}`}
                                        onChange={(e) => handleDetailChange(detail, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="row formFooter">
                            <div className="col-12 text-end mt-4">
                                <Button
                                    type={`submit`}
                                    className={`text-white m10-left`}
                                    style={{ backgroundColor: "#1ebc1e" }}
                                    text={`Submit`}
                                    onClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WithDrawMoney;
