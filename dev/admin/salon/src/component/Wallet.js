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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneError, setPhoneError] = useState(false);
    const [paymentReference, setPaymentReference] = useState(null);
    
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
            // Fix URL construction to avoid double slashes
            const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
            const successUrl = `${baseUrlClean}/salon/handleStripePaymentSuccess?session_id=${sessionId}`;
            
            const response = await fetch(
                successUrl,
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
                // Refresh wallet history and balance - wait for it to complete
                await dispatch(getWalletHistory({ type: "All", startDate: "All", endDate: "All", start: 0, limit: 1 }));
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
            // Payment was cancelled - show message and clean up
            toast.info("Payment was cancelled. You can try again when ready.");
            setIsProcessing(false);
            setAmount("");
            setSelectedAmount("");
            setPhoneNumber("");
            setPaymentReference(null);
            
            // Remove query params from URL and navigate to clean wallet page
            // Use replace to avoid adding to history
            const cleanPath = window.location.pathname.split('?')[0];
            navigate(cleanPath, { replace: true });
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

    const pollPaymentStatus = (reference) => {
        const maxAttempts = 30; // Poll for up to 30 attempts (about 1.5 minutes)
        let attempts = 0;

        const checkStatus = async () => {
            if (attempts >= maxAttempts) {
                toast.error("Payment timeout. Please check your phone or try again.");
                setIsProcessing(false);
                setPaymentReference(null);
                return;
            }

            attempts++;

            try {
                const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
                const statusUrl = `${baseUrlClean}/salon/checkMTNMomoPaymentStatus?reference=${reference}`;
                
                const response = await fetch(
                    statusUrl,
                    {
                        method: "GET",
                        headers: {
                            "key": secretKey,
                            "Authorization": sessionStorage.getItem("token") || "",
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    // If error, wait a bit and try again
                    setTimeout(checkStatus, 3000);
                    return;
                }

                const data = await response.json();

                if (data.status && data.paymentStatus === "SUCCESSFUL") {
                    // Payment successful
                    toast.success(data.message || "Payment successful! Wallet credited.");
                    setAmount("");
                    setSelectedAmount("");
                    setPhoneNumber("");
                    setPaymentReference(null);
                    setIsProcessing(false);
                    
                    // Refresh wallet history and balance - wait for it to complete
                    await dispatch(getWalletHistory({ type: "All", startDate: "All", endDate: "All", start: 0, limit: 1 }));
                } else if (data.paymentStatus === "FAILED" || data.paymentStatus === "CANCELLED") {
                    // Payment failed or cancelled
                    toast.error(data.message || `Payment ${data.paymentStatus}`);
                    setIsProcessing(false);
                    setPaymentReference(null);
                } else {
                    // Still pending - check again in 3 seconds
                    setTimeout(checkStatus, 3000);
                }
            } catch (error) {
                console.error("Payment status check error:", error);
                // Continue polling on error
                setTimeout(checkStatus, 3000);
            }
        };

        // Start polling
        checkStatus();
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
                // Fix URL construction to avoid double slashes
                const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
                const stripeUrl = `${baseUrlClean}/salon/createStripeCheckoutSession?amount=${rechargeAmount}`;
                
                const response = await fetch(
                    stripeUrl,
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
                // Validate phone number
                if (!phoneNumber || phoneNumber.trim() === "") {
                    toast.error("Please enter your MTN MoMo phone number");
                    setPhoneError(true);
                    setIsProcessing(false);
                    return;
                }

                // Clean phone number (remove spaces, dashes, etc.)
                const cleanPhone = phoneNumber.replace(/\D/g, "");
                if (cleanPhone.length < 9) {
                    toast.error("Please enter a valid phone number");
                    setPhoneError(true);
                    setIsProcessing(false);
                    return;
                }

                setPhoneError(false);

                // Create MTN MoMo payment request
                const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
                const momoUrl = `${baseUrlClean}/salon/createMTNMomoPaymentRequest?amount=${rechargeAmount}&phoneNumber=${encodeURIComponent(cleanPhone)}`;
                
                const response = await fetch(
                    momoUrl,
                    {
                        method: "GET",
                        headers: {
                            "key": secretKey,
                            "Authorization": sessionStorage.getItem("token") || "",
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = "Failed to create payment request";
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

                if (data.status && data.reference) {
                    toast.success(data.message || "Payment request sent. Please approve on your phone.");
                    setPaymentReference(data.reference);
                    
                    // Start polling for payment status
                    pollPaymentStatus(data.reference);
                } else {
                    toast.error(data.message || data.error || "Failed to create payment request");
                setIsProcessing(false);
                }
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
            <style>
                {`
                    .wallet-balance-container {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 2;
                        width: 90%;
                        text-align: center;
                    }
                    .wallet-balance-label {
                        color: white;
                        font-size: 30px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    }
                    .wallet-balance-amount {
                        color: white;
                        font-size: 40px;
                        font-weight: bold;
                        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                    }
                    @media (max-width: 768px) {
                        .wallet-balance-container {
                            width: 90%;
                        }
                        .wallet-balance-label {
                            font-size: 24px;
                            margin-bottom: 8px;
                        }
                        .wallet-balance-amount {
                            font-size: 32px;
                        }
                    }
                    @media (max-width: 480px) {
                        .wallet-balance-container {
                            width: 85%;
                        }
                        .wallet-balance-label {
                            font-size: 20px;
                            margin-bottom: 6px;
                        }
                        .wallet-balance-amount {
                            font-size: 28px;
                        }
                    }
                `}
            </style>
            <div className="mainExpert">
                <Title name="Wallet" />

                <div className="row">
                    {/* Left Column - Balance Banner */}
                    <div className="col-md-6" style={{ position: "relative" }}>
                        {/* Image */}
                        <img src={withDrawBanner} alt="Wallet Banner" height={200} className="rounded-4" style={{ width: "100%", position: "relative" }} />
                        
                        {/* Text positioned at center of the image */}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 2, textAlign: "center", width: "90%" }}>
                            <div style={{ color: "white", fontSize: "30px", fontWeight: "bold", marginBottom: "10px", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
                                My Wallet Balance
                            </div>
                            <div style={{ color: "white", fontSize: "40px", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
                                {currency?.currencySymbol || setting?.currencySymbol || settingsData?.currencySymbol || ""} {isSkeleton ? "Loading..." : (walletBalance?.toFixed(2) || "0.00")}
                            </div>
                        </div>

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
                            <>
                            <div className="inputData mt-4">
                                    <label className="styleForTitle">
                                    Select Payment Method
                                </label>
                                    <div className="mt-2">
                                        {availablePaymentMethods.map((method) => (
                                            <div
                                                key={method.value}
                                                onClick={() => {
                                                    if (!isProcessing) {
                                                        setPaymentMethod(method.value);
                                                        setPhoneNumber("");
                                                        setPhoneError(false);
                                                    }
                                                }}
                                                style={{
                                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                                    padding: "12px 15px",
                                                    marginBottom: "10px",
                                                    border: `2px solid ${paymentMethod === method.value ? "#1ebc1e" : "#e0e0e0"}`,
                                                    borderRadius: "10px",
                                                    backgroundColor: paymentMethod === method.value ? "#f0fdf4" : "#ffffff",
                                                    transition: "all 0.3s ease",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    opacity: isProcessing ? 0.6 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isProcessing && paymentMethod !== method.value) {
                                                        e.currentTarget.style.borderColor = "#1ebc1e";
                                                        e.currentTarget.style.backgroundColor = "#f9fafb";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (paymentMethod !== method.value) {
                                                        e.currentTarget.style.borderColor = "#e0e0e0";
                                                        e.currentTarget.style.backgroundColor = "#ffffff";
                                                    }
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    {/* Payment Method Logo */}
                                                    <div
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "#f3f4f6",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        {method.value === "Stripe" ? (
                                                            <img
                                                                src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg"
                                                                alt="Stripe"
                                                                style={{ width: "30px", height: "30px" }}
                                                                onError={(e) => {
                                                                    e.target.outerHTML = '<span style="font-weight: bold; color: #635BFF; font-size: 14px;">S</span>';
                                                                }}
                                                            />
                                                        ) : method.value === "MTN MoMo" ? (
                                                            <div style={{ position: "relative", width: "30px", height: "30px" }}>
                                                                <img
                                                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MTN_Logo.svg/512px-MTN_Logo.svg.png"
                                                                    alt="MTN MoMo"
                                                                    style={{ 
                                                                        width: "30px", 
                                                                        height: "30px", 
                                                                        objectFit: "contain",
                                                                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                                                                    }}
                                                                    onError={(e) => {
                                                                        // Fallback to styled text with MTN colors
                                                                        e.target.style.display = "none";
                                                                        const fallback = document.createElement("div");
                                                                        fallback.innerHTML = '<span style="font-weight: bold; color: #FFCC00; font-size: 11px; background: linear-gradient(135deg, #FFCC00 0%, #FFD700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">MTN</span>';
                                                                        fallback.style.cssText = "display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;";
                                                                        e.target.parentElement.appendChild(fallback);
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : method.value === "Zitopay" ? (
                                                            <span style={{ fontWeight: "bold", color: "#1ebc1e", fontSize: "14px" }}>ZP</span>
                                                        ) : (
                                                            <span style={{ fontWeight: "bold", color: "#6b7280", fontSize: "14px" }}>{method.label.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: "16px",
                                                            fontWeight: "600",
                                                            color: "#1f2937",
                                                        }}
                                                    >
                                            {method.label}
                                                    </span>
                                                </div>
                                                {/* Selection Indicator */}
                                                <div
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        borderRadius: "6px",
                                                        border: `2px solid ${paymentMethod === method.value ? "#1ebc1e" : "#d1d5db"}`,
                                                        backgroundColor: paymentMethod === method.value ? "#1ebc1e" : "transparent",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {paymentMethod === method.value && (
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                                                                fill="white"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* MTN MoMo Phone Number Input */}
                                {paymentMethod === "MTN MoMo" && (
                                    <div className="inputData mt-4">
                                        <label className="styleForTitle" htmlFor="phoneNumber">
                                            MTN MoMo Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            className={`form-control fw-bold p-3 ${phoneError ? "border-danger" : ""}`}
                                            id="phoneNumber"
                                            placeholder="Enter your MTN MoMo phone number (e.g., 237612345678)"
                                            value={phoneNumber}
                                            onChange={(e) => {
                                                setPhoneNumber(e.target.value);
                                                setPhoneError(false);
                                            }}
                                            disabled={isProcessing}
                                        />
                                        {phoneError && (
                                            <label className="d-flex justify-content-end mt-1" style={{ color: "red", fontSize: "15px" }}>
                                                *Please enter a valid phone number
                                            </label>
                                        )}
                                        <small className="text-muted mt-1 d-block">
                                            Enter your MTN Mobile Money registered phone number
                                        </small>
                            </div>
                                )}
                            </>
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
                                    disabled={isProcessing || !amount || parseFloat(amount) <= 0 || availablePaymentMethods.length === 0 || (paymentMethod === "MTN MoMo" && (!phoneNumber || phoneNumber.trim() === ""))}
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

