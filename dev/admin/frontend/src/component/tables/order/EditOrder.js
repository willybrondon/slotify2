import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Button from "../../extras/Button";
import { getOrder, updateOrderOutOfStatus, updateOrderStatus } from "../../../redux/slice/orderSlice"; // Import your update action
import { ExInput } from "../../extras/Input";
import { toast } from "react-toastify";


const EditOrder = ({ page, rowsPerPage, type }) => {
    const { dialogueData, dialogueMainData, dialogueType } = useSelector(
        (state) => state.dialogue
    );
    const { setting } = useSelector((state) => state.setting)
  ;

    const [statusData, setStatusData] = useState("Select status");
    const dispatch = useDispatch();
    const [deliveredServiceName, setDeliveredServiceName] = useState("");
    const [trackingId, setTrackingId] = useState("");
    const [trackingLink, setTrackingLink] = useState("");
    const [error, setError] = useState({
        deliveredServiceName: "",
        imagetrackingId: "",
        trackingLink: "",
    });
    const orderType = [
        { name: "Pending", value: "Pending" },
        { name: "Confirmed", value: "Confirmed" },
        { name: "Out Of Delivery", value: "Out Of Delivery" },
        { name: "Delivered", value: "Delivered" },
        { name: "Cancelled", value: "Cancelled" },
    ];
    const filteredOrderType = orderType.filter((option) => {
        if (dialogueData?.status === "Pending") {
            return true; // Show all options for "Pending"
        }
        if (dialogueData?.status === "Confirmed") {
            return option.value === "Confirmed" || option.value === "Out Of Delivery";
        }
        if (dialogueData?.status === "Out Of Delivery") {
            return option.value === "Out Of Delivery" || option.value === "Delivered";
        }
        return true; // Default case, show all options
    });
    const handleBlur = () => {
        if (statusData === "Select Status") {
            setStatusData(""); // Clear selection if nothing valid is chosen
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the page from refreshing
    

        if (statusData === "Select status" || !statusData) {
            // You can add a validation message here if needed
            return;
        }
        else if (statusData === "Out Of Delivery") {
            dispatch(updateOrderOutOfStatus({
                orderId: dialogueMainData?._id,
                itemId: dialogueData?._id,
                status: statusData,
                userId: dialogueMainData?.userId?._id,
                data: {
                    deliveredServiceName: deliveredServiceName,
                    trackingId: trackingId,
                    trackingLink: trackingLink,
                }
            }))
                .then((res) => {
                    if (res?.payload?.status) {
                        const payload = {
                            start: page, limit: rowsPerPage, status: type
                        }
                        dispatch(getOrder(payload))
                        toast.success(res?.payload?.message)
                        dispatch(closeDialog())
                    } else {
                        toast.error(res?.payload?.message)
                    }
                })
        } else {
            dispatch(
                updateOrderStatus({
                    orderId: dialogueMainData?._id,
                    itemId: dialogueData?._id,
                    status: statusData,
                    userId: dialogueMainData?.userId?._id,
                })
            )
                .then((res) => {
                    if (res?.payload?.status) {
                        const payload = {
                            start: page, limit: rowsPerPage, status: type
                        }
                        dispatch(getOrder(payload))
                        toast.success(res?.payload?.message)
                        dispatch(closeDialog())
                    }
                    else {
                        toast.error(res?.payload?.message)
                    }
                })
        }
        // Call your action to update the order status


        // Close the dialog after successful update
        // dispatch(closeDialog());
    };

    useEffect(() => {
        setStatusData(dialogueData?.status || "Select status");
    }, [dialogueData]);

    return (
        <>
            {dialogueType === "order" && (
                <div className="dialog">
                    <div className="w-100">
                        <div className="row justify-content-center">
                            <div className="col-xl-5 col-md-8 col-11">
                                <div className="mainDiaogBox">
                                    <div className="row justify-content-between align-items-center formHead">
                                        <div className="col-8">
                                            <h2 className="text-theme m0">Edit Order</h2>
                                        </div>
                                        <div className="col-4">
                                            <div
                                                className="closeButton"
                                                onClick={() => dispatch(closeDialog())}
                                            >
                                                <i className="ri-close-line"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="inputData pb-2">
                                            <label className="styleForTitle">Order Status</label>
                                            <select
                                                name="statusData"
                                                className="rounded-2 fw-bold"
                                                value={statusData}
                                                onChange={(e) => setStatusData(e.target.value)}
                                                onBlur={handleBlur}
                                            >
                                                <option value="" disabled>
                                                    --select status--
                                                </option>
                                                {filteredOrderType?.map((data) => (
                                                    <option key={data?.value} value={data?.value}>
                                                        {data?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {statusData === "Out Of Delivery" && dialogueData?.status !== "Out Of Delivery" && (
                                            <div className="row mt-2">
                                                <div className="col-6">

                                                    <ExInput
                                                        type={"text"}
                                                        id={deliveredServiceName}
                                                        name={"deliveredServiceName"}
                                                        value={deliveredServiceName}
                                                        label={"Delivered Service Name"}
                                                        placeholder={"Delivered service name"}
                                                        errorMessage={error.deliveredServiceName && error.deliveredServiceName}
                                                        onChange={(e) => {
                                                            setDeliveredServiceName(e.target.value);
                                                            if (!e.target.value) {
                                                                return setError({
                                                                    ...error,
                                                                    // deliveredServiceName: Name is required,
                                                                });
                                                            } else {
                                                                return setError({
                                                                    ...error,
                                                                    deliveredServiceName: "",
                                                                });
                                                            }
                                                        }}
                                                    />

                                                </div>
                                                <div className="col-6">
                                                    <ExInput
                                                        type={"text"}
                                                        id={trackingId}
                                                        name={"trackingId"}
                                                        value={trackingId}
                                                        label={"Tracking Id"}
                                                        placeholder={"Tracking Id"}
                                                        // errorMessage={error.trackingId && error.trackingId}
                                                        onChange={(e) => {
                                                            setTrackingId(e.target.value);
                                                            if (!e.target.value) {
                                                                return setError({
                                                                    ...error,
                                                                    // trackingId: Name is required,
                                                                });
                                                            } else {
                                                                return setError({
                                                                    ...error,
                                                                    trackingId: "",
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <ExInput
                                                        type={"text"}
                                                        id={"trackingLink"}
                                                        name={"trackingLink"}
                                                        value={trackingLink}
                                                        label={"Tracking Link"}
                                                        placeholder={"Tracking Link"}
                                                        // errorMessage={error.trackingLink && error.trackingLink}
                                                        onChange={(e) => {
                                                            setTrackingLink(e.target.value);
                                                            if (!e.target.value) {
                                                                return setError({
                                                                    ...error,
                                                                    // trackingLink: Name is required,
                                                                });
                                                            } else {
                                                                return setError({
                                                                    ...error,
                                                                    trackingLink: "",
                                                                });
                                                            }
                                                        }}
                                                    />

                                                </div>
                                            </div>
                                        )}

                                        {statusData === "Cancelled" && (
                                            <>
                                                <div className="row mt-2">
                                                    <div className="col-12">
                                                        <ExInput
                                                            type={"text"}
                                                            id={"subTotal"}
                                                            name={"subTotal"}
                                                            value={dialogueData?.finalTotal}
                                                            disabled
                                                            label={"SubTotal"}
                                                            placeholder={"SubTotal"}
                                                        // errorMessage={
                                                        //     error.subTotal && error.subTotal ||
                                                        //     (dialogueData?.finalTotal < setting?.cancelOrderCharges
                                                        //         ? `SubTotal must be greater than or equal to cancel order charges ($${setting?.cancelOrderCharges})`
                                                        //         : ""
                                                        //     )
                                                        // }
                                                        />
                                                        {/* {dialogueData?.finalTotal >= setting?.cancelOrderCharges ? (
                                                            <span className="d-flex justify-content-end" style={{ color: "red", fontSize: "14px" }}>
                                                                Your Cancel Order Charges ${setting?.cancelOrderCharges}
                                                            </span>
                                                        ) : (
                                                            <span className="d-flex justify-content-end" style={{ color: "red", fontSize: "14px" }}>
                                                                You cannot cancel the order as the SubTotal is less than the Cancel Order Charges
                                                            </span>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </>
                                        )}


                                        <div className="row formFooter">
                                            <div className="col-12 text-end m0">
                                                <Button
                                                    className={`bg-gray text-light`}
                                                    text={`Cancel`}
                                                    type={`button`}
                                                    onClick={() => dispatch(closeDialog())}
                                                />
                                                <Button
                                                    type={`submit`}
                                                    className={`text-white m10-left`}
                                                    style={{ backgroundColor: "#1ebc1e" }}
                                                    text={`Update`}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditOrder;
