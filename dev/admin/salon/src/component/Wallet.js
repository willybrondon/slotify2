import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "./extras/Title";
import Button from "./extras/Button";
import { depositToWallet, getWalletHistory } from "../redux/slice/withDrawSlice";
import { toast } from "react-toastify";
import { getCurrency, getSetting } from "../redux/slice/settingSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import withDrawBanner from "../assets/images/withDraw.png";
import { baseURL, secretKey } from "../util/config";

const Wallet = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setting } = useSelector((state) => state.setting);
    const { admin } = useSelector((state) => state.auth);
    const { walletBalance, isSkeleton } = useSelector((state) => state.withDraw);
    const { currency } = useSelector((state) => state.setting);
    const [searchParams] = useSearchParams();
    
    const [amount, setAmount] = useState("");
    const [selectedAmount, setSelectedAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [amountError, setAmountError] = useState(false);
    
    const quickAmounts = ["50", "100", "150", "200", "250", "300", "500"];
    
    // Get available payment methods from settings
    // Both currency and setting come from salon/getCurrency (which includes payment flags)
    // Priority: currency > setting
    const settingsData = currency || setting || {};
    
    const availablePaymentMethods = [];
    if (settingsData?.isStripePay) {
        availablePaymentMethods.push({ value: "Stripe", label: "Stripe" });
    }
    if (settingsData?.isZitopay) {
        availablePaymentMethods.push({ value: "Zitopay", label: "Zitopay" });
    }
    if (settingsData?.isMtnMomo) {
        availablePaymentMethods.push({ value: "MTN MoMo", label: "MTN Mobile Money" });
    }

    const handleStripePaymentSuccess = async (sessionId) => {
        try {
            setIsProcessing(true);
            const response = await fetch(
                `${baseURL}/salon/handleStripePaymentSuccess?session_id=${sessionId}`,
                {
                    method: "GET",
                    headers: {
                        "key": secretKey,
                        "Authorization": sessionStorage.getItem("token") || "",
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (data.status) {
                toast.success(data.message || "Payment successful! Wallet credited.");
                setAmount("");
                setSelectedAmount("");
                // Refresh wallet history and balance
                dispatch(getWalletHistory({ type: "All", startDate: "All", endDate: "All", start: 0, limit: 1 }));
                // Remove query params from URL
                navigate("/salonpanel/wallet", { replace: true });
            } else {
                toast.error(data.message || "Payment verification failed");
            }
        } catch (error) {
            console.error("Payment success handler error:", error);
            toast.error("An error occurred while processing payment");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        dispatch(getWalletHistory({ type: "All", startDate: "All", endDate: "All", start: 0, limit: 1 }));
        dispatch(getCurrency());
        dispatch(getSetting()); // Also fetch from salon/getCurrency to ensure we have all data

        // Handle Stripe payment callback
        const paymentStatus = searchParams.get("payment");
        const sessionId = searchParams.get("session_id");

        if (paymentStatus === "success" && sessionId) {
            // Call backend to verify and process payment
            handleStripePaymentSuccess(sessionId);
        } else if (paymentStatus === "cancelled") {
            toast.info("Payment was cancelled. You can try again when ready.");
            // Remove query params from URL
            navigate("/salonpanel/wallet", { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, searchParams, navigate]);

    // Set default payment method if available
    useEffect(() => {
        if (availablePaymentMethods.length > 0) {
            // If no payment method is set, or if current payment method is not in available methods, set to first available
            if (!paymentMethod || !availablePaymentMethods.find(m => m.value === paymentMethod)) {
                setPaymentMethod(availablePaymentMethods[0].value);
            }
        } else {
            // If no payment methods are available, clear the selection
            setPaymentMethod("");
        }
    }, [availablePaymentMethods.length, currency, setting]);

    const handleAmountSelect = (amt) => {
        setSelectedAmount(amt);
        setAmount(amt);
        setAmountError(false);
    };

    const handleRecharge = async () => {
        const rechargeAmount = amount.trim();
        
        if (!rechargeAmount || rechargeAmount === "0" || parseFloat(rechargeAmount) <= 0) {
            toast.error("Please enter a valid amount to recharge");
            setAmountError(true);
            return;
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        if (availablePaymentMethods.length === 0) {
            toast.error("No payment methods are enabled. Please contact admin.");
            return;
        }

        setIsProcessing(true);
        setAmountError(false);

        try {
            if (paymentMethod === "Stripe") {
                // Create Stripe Checkout Session
                const response = await fetch(
                    `${baseURL}/salon/createStripeCheckoutSession?amount=${rechargeAmount}`,
                    {
                        method: "GET",
                        headers: {
                            "key": secretKey,
                            "Authorization": sessionStorage.getItem("token") || "",
                            "Content-Type": "application/json",
                        },
                    }
                );

                // Check if response is ok
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = "Failed to create payment session";
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        errorMessage = errorText || `Server error: ${response.status}`;
                    }
                    toast.error(errorMessage);
                    setIsProcessing(false);
                    return;
                }

                const data = await response.json();

                if (data.status && data.checkoutUrl) {
                    // Redirect to Stripe Checkout
                    window.location.href = data.checkoutUrl;
                } else {
                    toast.error(data.message || data.error || "Failed to create payment session");
                    setIsProcessing(false);
                }
            } else if (paymentMethod === "Zitopay") {
                // TODO: Implement Zitopay payment flow for web
                toast.info("Zitopay payment integration for web is coming soon. Please use Stripe for now.");
                setIsProcessing(false);
            } else if (paymentMethod === "MTN MoMo") {
                // TODO: Implement MTN MoMo payment flow for web
                toast.info("MTN Mobile Money payment integration for web is coming soon. Please use Stripe for now.");
                setIsProcessing(false);
            } else {
                toast.error("Selected payment method is not supported");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Wallet recharge error:", error);
            const errorMessage = error.message || "An error occurred during wallet recharge";
            toast.error(errorMessage);
            setIsProcessing(false);
        }
    };

    const minSalonWalletBalance = settingsData?.minSalonWalletBalance || 0;
    const isBalanceInsufficient = walletBalance < minSalonWalletBalance;
    const deficit = minSalonWalletBalance - walletBalance;

    return (
        <>
            <div className="mainExpert">
                <Title name="Wallet" />

                <div className="row">
                    {/* Left Column - Balance Banner */}
                    <div className="col-md-6" style={{ position: "relative" }}>
                        {/* Text positioned on top of the image */}
                        <div style={{ position: "absolute", top: "14%", left: "29%", transform: "translateX(-50%)", color: "white", fontSize: "30px", zIndex: 2, fontWeight: "bold" }}>
                            My Wallet Balance
                        </div>
                        <div style={{ position: "absolute", top: "20%", left: "16%", transform: "translateX(-50%)", color: "white", fontSize: "40px", zIndex: 2, fontWeight: "bold" }}>
                            {currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""} {isSkeleton ? "Loading..." : (walletBalance?.toFixed(2) || "0.00")}
                        </div>

                        {/* Image */}
                        <img src={withDrawBanner} alt="Wallet Banner" height={200} className="rounded-4" style={{ width: "100%", position: "relative" }} />

                        {/* Minimum Balance Info */}
                        {minSalonWalletBalance > 0 && (
                            <div className="mt-4">
                                <div className={`alert ${isBalanceInsufficient ? "alert-warning" : "alert-info"}`} role="alert">
                                    <strong>Minimum Required Balance:</strong> {currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""} {minSalonWalletBalance.toFixed(2)}
                                    <br />
                                    <small>
                                        {isBalanceInsufficient ? (
                                            <>
                                                Your wallet balance is below the minimum required amount. 
                                                You need to add at least <strong>{currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""} {deficit.toFixed(2)}</strong> to accept bookings.
                                            </>
                                        ) : (
                                            "Your wallet must have at least this amount plus the commission fee to accept new bookings."
                                        )}
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Wallet Recharge Instructions */}
                        <div className="row mt-4">
                            <div className="inputData mt-4 col-md-11">
                                <label className="styleForTitle fw-bold" style={{ color: "#1C2B20", fontSize: "24px" }}>
                                    Wallet Recharge Instructions :
                                </label>
                                <div style={{ fontSize: "14px", lineHeight: "25px", color: "#A5A5A5" }}>
                                    <div>
                                        To recharge your wallet, select or enter the desired amount and choose your preferred payment method (Stripe, Zitopay, or MTN MoMo). 
                                        Once the payment is processed successfully, the amount will be automatically credited to your wallet. 
                                        Your wallet balance must meet the minimum required amount plus commission fees to accept new bookings.
                                    </div>
                                    <div style={{ wordWrap: "break-word", marginTop: "10px" }}>
                                        You can view your wallet transaction history in the "Wallet History" section. 
                                        All transactions including recharges, commission deductions, and refunds will be recorded there.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Recharge Form */}
                    <div className="col-md-6">
                        <div className="inputData mt-2">
                            <label className="styleForTitle" htmlFor="rechargeAmount">
                                Enter Recharge Amount
                            </label>
                            <div className="input-group mt-2" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <span className="input-group-text fw-bold" style={{ position: "relative", display: "flex", alignItems: "center", background: "#1C2B20", color: "white" }}>
                                    {currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""}
                                </span>
                                <input
                                    type="number"
                                    name="rechargeAmount"
                                    className="form-control fw-bold p-3"
                                    id="rechargeAmount"
                                    style={{
                                        paddingLeft: "2.5rem",
                                        borderTopLeftRadius: "0",
                                        borderBottomLeftRadius: "0",
                                    }}
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setAmount(value);
                                        setSelectedAmount("");
                                        setAmountError(false);
                                    }}
                                    min="1"
                                    step="0.01"
                                />
                            </div>
                            {amountError && (
                                <label className="d-flex justify-content-end mt-1" style={{ color: "red", fontSize: "15px" }}>
                                    *Please enter a valid amount
                                </label>
                            )}
                        </div>

                        {/* Quick Amount Selection */}
                        <div className="inputData mt-4">
                            <label className="styleForTitle">Or Select Quick Amount</label>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`btn ${selectedAmount === amt ? "btn-primary" : "btn-outline-primary"}`}
                                        onClick={() => handleAmountSelect(amt)}
                                        style={{ minWidth: "80px", padding: "8px 16px" }}
                                    >
                                        {currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""} {amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        {availablePaymentMethods.length > 0 ? (
                            <div className="inputData mt-4">
                                <label className="styleForTitle" htmlFor="paymentMethod">
                                    Select Payment Method
                                </label>
                                <select
                                    name="paymentMethod"
                                    className="rounded-2 fw-bold"
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    {availablePaymentMethods.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="alert alert-warning mt-4" role="alert">
                                <strong>No Payment Methods Available</strong>
                                <br />
                                <small>Please contact admin to enable payment methods (Stripe, Zitopay, or MTN MoMo).</small>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="row formFooter">
                            <div className="col-12 text-end mt-4">
                                <Button
                                    type="submit"
                                    className="text-white m10-left"
                                    style={{ backgroundColor: "#1ebc1e" }}
                                    text={isProcessing ? "Processing..." : "Recharge Wallet"}
                                    onClick={handleRecharge}
                                    disabled={isProcessing || !amount || parseFloat(amount) <= 0 || availablePaymentMethods.length === 0}
                                />
                            </div>
                        </div>

                        {/* Info Message */}
                        <div className="alert alert-info mt-4" role="alert">
                            <small>
                                <strong>Note:</strong> Payment gateway integration is required. 
                                After successful payment, the amount will be credited to your wallet automatically. 
                                You can view your transaction history in the "Wallet History" section.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Wallet;

