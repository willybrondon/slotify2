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

const WithDrawMoney = () => {
    const { withDraw } = useSelector((state) => state.withDraw);
    const { admin } = useSelector((state) => state.auth);
    const { currency } = useSelector((state) => state.setting);

    const [amount, setAmount] = useState("");
    const [type, setType] = useState(""); // Selected payment type (using name now)
    const [selectedDetails, setSelectedDetails] = useState([]); // Dynamic details for selected type
    const [paymentDetails, setPaymentDetails] = useState([]); // Store details as key-value pairs

    // Initialize with the first payment option and its details on component mount
    useEffect(() => {
        if (withDraw && withDraw.length > 0) {
            setType(withDraw[0]?.name); // Set first payment option's name as default selected
            setSelectedDetails(withDraw[0]?.details || []); // Set its details
        }
    }, [withDraw]);

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        setType(selectedType); // Set selected payment option's name

        // Find the selected payment option's details
        const selectedPayment = withDraw.find((item) => item.name === selectedType);
        if (selectedPayment && Array.isArray(selectedPayment.details)) {
            setSelectedDetails(selectedPayment.details); // Set details for the selected payment option
            setPaymentDetails([]); // Reset payment details when type changes
        } else {
            setSelectedDetails([]); // Reset if no details found
        }
    };

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getWithDrawMethod());
        dispatch(getCurrency())
    }, [dispatch]);

    const handleDetailChange = (detail, value) => {
        // Update the paymentDetails state with the input values
        setPaymentDetails((prevDetails) => {
            // Create a new object for the current detail
            const newDetail = { [detail]: value };

            // Find the index of the existing detail
            const existingDetailIndex = prevDetails.findIndex((item) => Object.keys(item)[0] === detail);
            if (existingDetailIndex > -1) {
                // If it exists, update the value
                const updatedDetails = [...prevDetails];
                updatedDetails[existingDetailIndex] = newDetail; // Replace the existing detail with the new one
                return updatedDetails;
            } else {
                // If it doesn't exist, add a new entry
                return [...prevDetails, newDetail];
            }
        });
    };

    const handleSubmit = () => {
        // Convert paymentDetails from array of objects to an array of strings
        const formattedPaymentDetails = paymentDetails.map((detail) => {
            const key = Object.keys(detail)[0];
            const value = detail[key];
            return `${key}: ${value}`;
        });

        const payload = {
            amount: amount,
            salonId: admin?._id,
            paymentGateway: type, // Send the name of the payment option
            paymentDetails: formattedPaymentDetails, // Send the formatted details as strings
        };

        dispatch(addWithDrawMethod(payload))
            .then((res) => {
                if (res?.payload?.status) {
                    dispatch(getWithDrawMethod());
                    toast.success(res?.payload?.message);
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
                        <div style={{ position: "absolute", top: "14%", left: "20%", transform: "translateX(-50%)", color: "white", fontSize: "24px", zIndex: 2 }}>
                            My Available Balance
                        </div>
                        <div style={{ position: "absolute", top: "20%", left: "13%", transform: "translateX(-50%)", color: "white", fontSize: "40px", zIndex: 2 }}>{currency?.currencySymbol} {admin?.earning}</div>

                        {/* Image */}
                        <img src={withDrawBanner} alt="Withdraw Banner" height={200} className="rounded-4" style={{ width: "100%", position: "relative" }} />

                        <div className="inputData">
                            <label className="styleForTitle mt-2" htmlFor="withdrawAmount">
                                Enter Withdraw Amount
                            </label>
                            <div className="input-group mt-2">
                                <span className="input-group-text fw-bold">$</span>
                                <input
                                    type="number"
                                    name="withdrawAmount"
                                    className="form-control fw-bold p-3"
                                    id="withdrawAmount"
                                    placeholder="Enter amount"
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                    }}
                                />
                            </div>
                        </div>


                        <div className="row mt-4">
                            <div className="inputData mt-4 col-md-11">
                                <label className="styleForTitle fw-bold" style={{ color: "#1C2B20", fontSize: "24px" }}>
                                    Withdraw Instruction :
                                </label>
                                <div style={{ fontSize: "14px", lineHeight: "25px", color: "#A5A5A5" }}>
                                    <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</div>
                                    <div style={{ wordWrap: "break-word" }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</div>
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
                                        onChange={(e) => handleDetailChange(detail, e.target.value)} // Capture both name and value
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
