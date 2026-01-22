import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "./extras/Title";
import { depositToWallet, getWalletHistory } from "../redux/slice/withDrawSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setting } = useSelector((state) => state.setting);
    const { admin } = useSelector((state) => state.auth);
    const { walletBalance } = useSelector((state) => state.withDraw);
    
    const [amount, setAmount] = useState("");
    const [selectedAmount, setSelectedAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Stripe");
    const [isProcessing, setIsProcessing] = useState(false);
    
    const quickAmounts = ["50", "100", "150", "200", "250", "300", "500"];
    const paymentMethods = [
        { value: "Stripe", label: "Stripe" },
        { value: "Zitopay", label: "Zitopay" }
    ];

    useEffect(() => {
        // Fetch current wallet balance
        dispatch(getWalletHistory({ type: "All", startDate: "All", endDate: "All", start: 0, limit: 1 }));
    }, [dispatch]);

    const handleAmountSelect = (amt) => {
        setSelectedAmount(amt);
        setAmount(amt);
    };

    const handleRecharge = async () => {
        const rechargeAmount = amount.trim();
        
        if (!rechargeAmount || rechargeAmount === "0" || parseFloat(rechargeAmount) <= 0) {
            toast.error("Please enter a valid amount to recharge");
            return;
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setIsProcessing(true);

        try {
            // Map payment method to gateway number
            const paymentGatewayMap = {
                "Stripe": 1,
                "Zitopay": 4
            };

            const paymentGateway = paymentGatewayMap[paymentMethod] || 1;

            // For now, we'll use a simple approach - redirect to payment gateway
            // In a real implementation, you'd integrate Stripe/Zitopay payment flow here
            // For Stripe/Zitopay, you'd typically:
            // 1. Create a payment intent/session
            // 2. Redirect user to payment page
            // 3. Handle callback/webhook
            // 4. Call depositToWallet API on success

            // For now, we'll show a message that payment integration is needed
            toast.info(`Redirecting to ${paymentMethod} payment...`);
            
            // TODO: Implement actual payment gateway integration
            // This is a placeholder - you'll need to integrate with Stripe/Zitopay
            // Similar to how it's done in the Flutter customer app
            
            // After successful payment, call:
            // const result = await dispatch(depositToWallet({
            //     amount: parseFloat(rechargeAmount),
            //     paymentGateway: paymentGateway
            // }));
            
            // if (result.payload?.status) {
            //     toast.success("Wallet recharged successfully!");
            //     navigate("/salonpanel/walletHistory");
            // } else {
            //     toast.error(result.payload?.message || "Failed to recharge wallet");
            // }

        } catch (error) {
            console.error("Wallet recharge error:", error);
            toast.error("An error occurred during wallet recharge");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="orderDetails mt-2">
            <div className="row">
                <Title name="Wallet" className="mt-4" />
            </div>
            
            <div className="betBox mt-4">
                {/* Current Wallet Balance */}
                <div className="col-12 mb-4">
                    <div className="betBox p-4" style={{ background: "#f8f9fa", borderRadius: "8px", border: "2px solid #14AF14" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-2" style={{ color: "#666" }}>Current Wallet Balance</h5>
                                <h2 className="mb-0" style={{ color: "#14AF14", fontWeight: "bold" }}>
                                    {setting?.currencySymbol || ""} {walletBalance?.toFixed(2) || "0.00"}
                                </h2>
                            </div>
                            <div style={{ fontSize: "3rem" }}>💰</div>
                        </div>
                    </div>
                </div>

                {/* Minimum Balance Info */}
                {setting?.minSalonWalletBalance > 0 && (
                    <div className="col-12 mb-4">
                        <div className="alert alert-info" role="alert">
                            <strong>Minimum Required Balance:</strong> {setting?.currencySymbol || ""} {setting.minSalonWalletBalance.toFixed(2)}
                            <br />
                            <small>Your wallet must have at least this amount plus the commission fee to accept new bookings.</small>
                        </div>
                    </div>
                )}

                {/* Recharge Section */}
                <div className="col-12">
                    <h4 className="mb-3">Recharge Your Wallet</h4>
                    
                    {/* Quick Amount Selection */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Select Amount</label>
                        <div className="d-flex flex-wrap gap-2">
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    className={`btn ${selectedAmount === amt ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => handleAmountSelect(amt)}
                                    style={{ minWidth: "80px" }}
                                >
                                    {setting?.currencySymbol || ""} {amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="mb-4">
                        <label htmlFor="customAmount" className="form-label fw-bold">
                            Or Enter Custom Amount
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="customAmount"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setSelectedAmount("");
                            }}
                            min="1"
                            step="0.01"
                        />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                        <label htmlFor="paymentMethod" className="form-label fw-bold">
                            Payment Method
                        </label>
                        <select
                            className="form-select"
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Recharge Button */}
                    <div className="mb-3">
                        <button
                            type="button"
                            className="btn btn-primary btn-lg w-100"
                            onClick={handleRecharge}
                            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                            style={{ padding: "12px", fontSize: "1.1rem" }}
                        >
                            {isProcessing ? "Processing..." : `Recharge ${setting?.currencySymbol || ""} ${amount || "0.00"}`}
                        </button>
                    </div>

                    {/* Info Message */}
                    <div className="alert alert-warning" role="alert">
                        <small>
                            <strong>Note:</strong> Payment gateway integration is required. 
                            After successful payment, the amount will be credited to your wallet automatically.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;

