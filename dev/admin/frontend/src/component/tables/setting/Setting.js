import { col } from "../../../constants/tableHeaders";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import {
  addProductRequest,
  getSetting,
  handleSetting,
  maintenanceMode,
  updateSetting,
} from "../../../redux/slice/settingSlice";
import ToggleSwitch from "../../extras/ToggleSwitch";
import {  warning } from "../../../util/Alert";
import Table from "../../extras/Table";
import { getWithDraw, statusWithDraw, withDrawDelete } from "../../../redux/slice/withDrawSlice";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import WithDrawDialogue from "../WithDrawDialogue";
import { ReactComponent as Edit } from "../../../../src/assets/icon/edit.svg";
import { ReactComponent as Delete } from "../../../../src/assets/icon/delete.svg";
import { toast } from "react-toastify";
import Pagination from "../../extras/Pagination";


const Setting = (props) => {
  const dispatch = useDispatch();
  const { setting } = useSelector((state) => state.setting);
  const { withDraw } = useSelector((state) => state.withDraw);

;
  const [type, setType] = useState("setting")
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState();
  const [tnc, setTnc] = useState();
  const [tax, setTax] = useState();
  const [razorPayId, setRazorPayId] = useState("");
  const [razorSecretKey, setRazorSecretKey] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const [cancelOrderCharges,setCancelOrderCharges] = useState("");
  const [adminCommissionCharges, setAdminCommissionCharges] = useState("");
  const [customerCommissionCharges, setCustomerCommissionCharges] = useState("");
  const [salonCommissionCharges, setSalonCommissionCharges] = useState("");
  const [data, setData] = useState([]);
  // box 5
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [mtnMomoSubscriptionKey, setMtnMomoSubscriptionKey] = useState("");
  const [mtnMomoApiUserId, setMtnMomoApiUserId] = useState("");
  const [mtnMomoApiKey, setMtnMomoApiKey] = useState("");
  const [mtnMomoCallbackHost, setMtnMomoCallbackHost] = useState("");
  const [mtnMomoEnvironment, setMtnMomoEnvironment] = useState("sandbox");
  // Legacy fields (kept for backward compatibility)
  const [mtnMomoPrimaryKey, setMtnMomoPrimaryKey] = useState("");
  const [mtnMomoSecondaryKey, setMtnMomoSecondaryKey] = useState("");
  const [minWithdrawalRequestedAmount, setMinWithdrawalRequestedAmount] = useState("");
  const [minSalonWalletBalance, setMinSalonWalletBalance] = useState("");
  const [reservationNotificationEmails, setReservationNotificationEmails] = useState("");
  const [currencyName, setCurrencyName] = useState();
  const [currencySymbol, setCurrencySymbol] = useState();
  const [flutterWaveKey, setFlutterWaveKey] = useState();

  const [firebaseKey, setfirebaseKey] = useState();
  const [isAddProduct, setIsAddProduct] = useState(false)
  const [isUpdateProduct, setIsUpdateProduct] = useState(false)
  const [error, setError] = useState({
    firebaseKey: "",
    privacyPolicyLink: "",
    tnc: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    razorPayId: "",
    razorSecretKey: "",
    tax: "",
    currencyName: "",
    currencySymbol: "",
    flutterWaveKey: "",
    mtnMomoPrimaryKey: "",
    mtnMomoSecondaryKey: "",
    mtnMomoApiKey: "",
    mtnMomoApiUserId: "",
    mtnMomoEnvironment: "",
    adminCommissionCharges: "",
    customerCommissionCharges: "",
    salonCommissionCharges: "",
  });

  useEffect(() => {
    const payload = {
      start: page, limit: rowsPerPage
    }
    dispatch(getWithDraw(payload))
  }, [type, page, rowsPerPage]);
  useEffect(() => {
    dispatch(getSetting());
  }, [type]);

  useEffect(() => {
    setData(withDraw)
  }, [withDraw])
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {

    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };


  useEffect(() => {
    if (setting) {
      setCurrencyName(setting.currencyName);
      setCurrencySymbol(setting.currencySymbol);
      setStripePublishableKey(setting.stripePublishableKey);
      setStripeSecretKey(setting.stripeSecretKey);
      setMtnMomoSubscriptionKey(setting.mtnMomoSubscriptionKey || "");
      setMtnMomoApiUserId(setting.mtnMomoApiUserId || "");
      setMtnMomoApiKey(setting.mtnMomoApiKey || "");
      setMtnMomoCallbackHost(setting.mtnMomoCallbackHost || "");
      setMtnMomoEnvironment(setting.mtnMomoEnvironment || "sandbox");
      // Legacy fields (for backward compatibility - migrate if needed)
      setMtnMomoPrimaryKey(setting.mtnMomoPrimaryKey || "");
      setMtnMomoSecondaryKey(setting.mtnMomoSecondaryKey || "");
      // If Subscription Key is empty but Primary Key exists, migrate it
      if (!setting.mtnMomoSubscriptionKey && setting.mtnMomoPrimaryKey) {
        setMtnMomoSubscriptionKey(setting.mtnMomoPrimaryKey);
      }
      setRazorPayId(setting.razorPayId);
      setRazorSecretKey(setting.razorSecretKey);
      setTax(setting.tax);
      setPrivacyPolicyLink(setting?.privacyPolicyLink);
      setTnc(setting.tnc);
      setFlutterWaveKey(setting.flutterWaveKey);
      setfirebaseKey(JSON.stringify(setting.firebaseKey));
      setIsAddProduct(setting?.isAddProductRequest);
      setIsUpdateProduct(setting?.isUpdateProductRequest);
      setMinWithdrawalRequestedAmount(setting?.minWithdrawalRequestedAmount);
      setMinSalonWalletBalance(setting?.minSalonWalletBalance || "");
      setReservationNotificationEmails(setting?.reservationNotificationEmails || "");
      setAdminCommissionCharges(setting?.adminCommissionCharges);
      setCustomerCommissionCharges(setting?.customerCommissionCharges || "");
      setSalonCommissionCharges(setting?.salonCommissionCharges || "");
      setCancelOrderCharges(setting?.cancelOrderCharges);
    }
  }, [setting]);

  const onsubmit = async (e) => {
    e.preventDefault();

    if (
      !privacyPolicyLink ||
      !tnc ||
      !stripePublishableKey ||
      !stripeSecretKey ||
      !razorPayId ||
      !razorSecretKey ||
      !tax ||
      !currencyName ||
      !currencySymbol ||
      !flutterWaveKey ||
      !firebaseKey || 
      !adminCommissionCharges || 
      !customerCommissionCharges ||
      !salonCommissionCharges ||
      !cancelOrderCharges
    ) {
      let error = {};
      if (!privacyPolicyLink)
        error.privacyPolicyLink = ui.settings.privacyPolicyRequired;
      if (!tnc) error.tnc = ui.settings.tncRequired;
      if (!stripePublishableKey)
        error.stripePublishableKey = ui.settings.stripePublishableRequired;
      if (!stripeSecretKey)
        error.stripeSecretKey = ui.settings.stripeSecretRequired;
      if (!razorPayId) error.razorPayId = ui.settings.razorIdRequired;
      if (!razorSecretKey)
        error.razorSecretKey = ui.settings.razorSecretRequired;
      if (!tax) error.tax = ui.settings.taxRequired;
      if (!currencyName) error.currencyName = ui.settings.currencyNameRequired;
      if (!currencySymbol) error.currencySymbol = ui.settings.currencySymbolRequired;
      if (!flutterWaveKey)
        error.flutterWaveKey = ui.settings.flutterWaveRequired;
      if (!firebaseKey) error.firebaseKey = ui.settings.firebaseRequired;
      if (!adminCommissionCharges) error.commissionPerProductQuantity = ui.settings.adminCommissionRequired;
      if (!customerCommissionCharges) error.customerCommissionCharges = ui.settings.customerCommissionRequired;
      if (!salonCommissionCharges) error.salonCommissionCharges = ui.settings.salonCommissionRequired;
      if (!cancelOrderCharges) error.cancelOrderCharges = ui.settings.cancelOrderRequired;
      if (!minWithdrawalRequestedAmount) error.minWithdrawalRequestedAmount = ui.settings.minWithdrawRequired;
      return setError({ ...error });
    } else {
      const data = {
        privacyPolicyLink,
        tnc,
        stripePublishableKey,
        stripeSecretKey,
        mtnMomoSubscriptionKey,
        mtnMomoApiUserId,
        mtnMomoApiKey,
        mtnMomoCallbackHost,
        mtnMomoEnvironment,
        // Legacy fields (kept for backward compatibility)
        mtnMomoPrimaryKey,
        mtnMomoSecondaryKey,
        razorPayId,
        razorSecretKey,
        tax,
        currencyName,
        currencySymbol,
        flutterWaveKey,
        firebaseKey,
        minWithdrawalRequestedAmount,
        minSalonWalletBalance,
        reservationNotificationEmails,
        cancelOrderCharges,
        adminCommissionCharges,
        customerCommissionCharges,
        salonCommissionCharges
      };
      const payload = { data: data, id: setting?._id };
      await dispatch(updateSetting(payload)).unwrap();
    }
  };

  const handleSettingSwitch = (id, type) => {

    const payload = {
      id,
      type,
    };
    dispatch(handleSetting(payload));
  };


  const handleDelete = (id) => {

    const data = warning("Delete");
    data
      .then((logouts) => {
        const yes = logouts.isConfirmed;
        if (yes) {
          dispatch(withDrawDelete(id))
            .then((res) => {
              if (res?.payload?.status) {
                toast.success(res?.payload?.message);
                const payload = {
                  start: page, limit: rowsPerPage
                }
                dispatch(getWithDraw(payload))
              }
            })
        }
      })
      .catch((err) => console.log(err));
  };


  const handleAppActive = (id) => {

    dispatch(maintenanceMode(id));
  };

  const withDrawTable = [
    {
      Header: col.no,
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: col.image,
      Cell: ({ row }) => (
        <img src={row?.image} alt={"image"} width="50px" height="50px" />
      ),
    },
    {
      Header: col.name,
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: col.details,
      Cell: ({ row }) => {
        const details = row?.
          details
          ?.join(', ');
        const words = details?.split(' ');
        const trimmedDetails = words?.length > 10 ? words?.slice(0, 10)?.join(' ') + "..." : details;

        return (
          <span className="text-capitalize fw-bold">
            {trimmedDetails}
          </span>
        );
      },
    },
    {
      Header: col.createdAt,
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.createdAt?.split("T")[0]}</span>
      ),
    },
    {
      Header: col.isActive,
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isEnabled}
          onClick={() => {
            dispatch(statusWithDraw(row?._id))
              .then((res) => {
                if (res?.payload?.status) {
                  toast.success(res?.payload?.message);
                  dispatch(getWithDraw({ start: page, limit: rowsPerPage }))
                }
              })
          }}
        />
      ),
    },
    {
      Header: col.action,
      Cell: ({ row }) => (
        <>
          <span>
            <button
              className="py-1 me-2"
              style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
              onClick={() => {
                dispatch(openDialog({ type: "withdraw", data: row }));
              }}
            >
              <Edit />
            </button>
          </span>
          <span>
            <button
              className="py-1 me-2"
              style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
              onClick={() => {
                handleDelete(row?._id)
              }}
            >
              <Delete />
            </button>
          </span>
        </>
      ),
    },
  ];

  return (
    <div className="mainSetting">
      <div
        className="my-2"
        style={{
          width: "350px",
          border: "1px solid #1c2b20",
          padding: "8px 20px",
          borderRadius: "40px",
        }}
      >
        <button
          type="button"
          className={`${type === "setting" ? "activeBtn" : "disabledBtn"}`}
          onClick={() => setType("setting")}
        >{ui.settings.tabSettings}</button>
        <button
          type="button"
          className={`${type === "paymentSetting" ? "activeBtn" : "disabledBtn"}`}
          onClick={() => setType("paymentSetting")}
        >
          {ui.settings.tabPayments}
        </button>
        <button
          type="button"
          className={`${type === "withdraw" ? "activeBtn" : "disabledBtn"
            } ms-1`}
          onClick={() => setType("withdraw")}
        >
          {ui.settings.tabWithdraw}
        </button>
      </div>

      {
        type === "paymentSetting" && (
          <>
            <div className="settingBox">
              <div className=" d-flex justify-content-end">
                <div className="formFooter">
                  <Button
                    type={`submit`}
                    className={`text-light m10-left fw-bold`}
                    text="Enregistrer"
                    style={{ backgroundColor: "#1ebc1e" }}
                    onClick={onsubmit}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>{ui.settings.stripeSection}</h4>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label
                          htmlFor="stripePublishableKey"
                          className="ms-2 order-1"
                        >
                          {ui.settings.stripePublishableLabel}
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="stripePublishableKey"
                          value={stripePublishableKey}
                          placeholder={ui.settings.stripePublishablePh}
                          onChange={(e) => {
                            setStripePublishableKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                stripePublishableKey: ui.settings.stripePublishableRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                stripePublishableKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.stripePublishableKey}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="stripeSecretKey" className="ms-2 order-1">
                          {ui.settings.stripeSecretLabel}
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="stripeSecretKey"
                          value={stripeSecretKey}
                          placeholder={ui.settings.stripeSecretPh}
                          onChange={(e) => {
                            setStripeSecretKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                stripeSecretKey: ui.settings.stripeSecretRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                stripeSecretKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.stripeSecretKey}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="inputData">
                      <div>
                        <label className="my-3">{ui.settings.stripeActive}</label>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 2)}
                        value={setting?.isStripePay}
                      />
                    </div>
                  </div>
                </div>


                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>{ui.settings.mtnSection}</h4>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label
                          htmlFor="mtnMomoSubscriptionKey"
                          className="ms-2 order-1"
                        >
                          MTN MoMo Subscription Key (Required)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="mtnMomoSubscriptionKey"
                          value={mtnMomoSubscriptionKey}
                          placeholder={ui.settings.mtnSubscriptionPh}
                          onChange={(e) => {
                            setMtnMomoSubscriptionKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                mtnMomoSubscriptionKey: ui.settings.mtnSubscriptionRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                mtnMomoSubscriptionKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.mtnMomoSubscriptionKey}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Get this from MTN Developer Portal &gt; Products &gt; Collection &gt; Subscription (Primary or Secondary Key)
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="mtnMomoApiUserId" className="ms-2 order-1">
                          MTN MoMo API User ID (Required)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="mtnMomoApiUserId"
                          value={mtnMomoApiUserId}
                          placeholder={ui.settings.mtnApiUserPh}
                          onChange={(e) => {
                            setMtnMomoApiUserId(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                mtnMomoApiUserId: ui.settings.mtnApiUserRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                mtnMomoApiUserId: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.mtnMomoApiUserId}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          UUID created when creating an API User in MTN Developer Portal. Used for Basic Auth (Authorization: Basic base64(API_USER_ID:API_KEY))
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="mtnMomoApiKey" className="ms-2 order-1">
                          MTN MoMo API Key (Required)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="mtnMomoApiKey"
                          value={mtnMomoApiKey}
                          placeholder={ui.settings.mtnApiKeyPh}
                          onChange={(e) => {
                            setMtnMomoApiKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                mtnMomoApiKey: ui.settings.mtnApiKeyRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                mtnMomoApiKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.mtnMomoApiKey}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Generated for your API User in MTN Developer Portal. Used for Basic Auth (Authorization: Basic base64(API_USER_ID:API_KEY))
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="mtnMomoCallbackHost" className="ms-2 order-1">
                          MTN MoMo Callback Host (Optional)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="mtnMomoCallbackHost"
                          value={mtnMomoCallbackHost}
                          placeholder={ui.settings.mtnCallbackPh}
                          onChange={(e) => {
                            setMtnMomoCallbackHost(e.target.value);
                              return setError({
                                ...error,
                              mtnMomoCallbackHost: "",
                              });
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.mtnMomoCallbackHost}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Optional: Callback host that matches providerCallbackHost in MTN Developer Portal. 
                          If not set, will use main domain from baseURL. Example: "skedisy.com" or "api.skedisy.com" (without https://)
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          {ui.settings.mtnSubKeyHint} 
                          You can also use Secondary Key if needed - both work as subscription keys.
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="mtnMomoEnvironment" className="ms-2 order-1">
                          MTN MoMo Environment
                        </label>
                        <select
                          className="rounded-2"
                          id="mtnMomoEnvironment"
                          value={mtnMomoEnvironment}
                          onChange={(e) => {
                            setMtnMomoEnvironment(e.target.value);
                          }}
                        >
                          <option value="sandbox">{ui.settings.mtnEnvSandbox}</option>
                          <option value="production">{ui.settings.mtnEnvProduction}</option>
                        </select>
                      </div>
                    </div>
                    <div className="inputData">
                      <div>
                        <label className="my-3">{ui.settings.mtnActive}</label>
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px", display: "block" }}>
                          {ui.settings.mtnEnableHint} 
                          The payment will not work if this is disabled, even if all keys are configured.
                        </label>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 8)}
                        value={setting?.isMtnMomo}
                      />
                      {setting?.isMtnMomo ? (
                        <span style={{ color: "#1ebc1e", fontSize: "12px", marginLeft: "10px" }}>{ui.settings.mtnEnabled}</span>
                      ) : (
                        <span style={{ color: "#dc3545", fontSize: "12px", marginLeft: "10px" }}>{ui.settings.mtnDisabled}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>{ui.settings.razorSection}</h4>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label className="my-3">{ui.settings.razorActive}</label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="razorSecretKey"
                          value={razorSecretKey}
                          placeholder={ui.settings.razorSecretPh}
                          onChange={(e) => {
                            setRazorSecretKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                razorSecretKey: ui.settings.razorSecretRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                razorSecretKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.razorSecretKey}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="razorPayId" className="ms-2 order-1">
                          Razorpay id
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="razorPayId"
                          value={razorPayId}
                          placeholder={ui.settings.razorIdPh}
                          onChange={(e) => {
                            setRazorPayId(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                razorPayId: ui.settings.razorIdRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                razorPayId: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.razorPayId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="inputData">
                      <div>
                        <label className="my-3">{ui.settings.razorActive}</label>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 1)}
                        value={setting?.isRazorPay}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>{ui.settings.flutterSection}</h4>
                    </div>

                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="flutterWaveKey" className="ms-2 order-1">
                          Flutterwave key
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="flutterWaveKey"
                          value={flutterWaveKey}
                          placeholder={ui.settings.flutterWavePh}
                          onChange={(e) => {
                            setFlutterWaveKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                flutterWaveKey: ui.settings.flutterWaveRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                flutterWaveKey: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.flutterWaveKey}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="inputData">
                      <div>
                        <label className="my-3">{ui.settings.flutterActive}</label>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 4)}
                        value={setting?.isFlutterWave}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }

      {
        type === "setting" && (
          <>
            {/* <Title name="Setting Data" /> */}
            <div className="settingBox">
              <div className=" d-flex justify-content-end">
                <div className="formFooter">
                  <Button
                    type={`submit`}
                    className={`text-light m10-left fw-bold`}
                    text="Enregistrer"
                    style={{ backgroundColor: "#1ebc1e" }}
                    onClick={onsubmit}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mt-3">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader d-flex justify-content-between">
                      <h4>{ui.settings.appSection}</h4>
                      <div className="inputData">
                        <label className="me-2">{ui.settings.maintenanceMode}</label>
                        <ToggleSwitch
                          onClick={() => handleAppActive(setting?._id)}
                          value={setting?.maintenanceMode}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="privacyPolicyLink" className="ms-2 order-1">
                          Privacy policy link (redirect user to this link from app)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="privacyPolicyLink"
                          value={privacyPolicyLink}
                          placeholder={ui.settings.privacyPolicyPh}
                          onChange={(e) => {
                            setPrivacyPolicyLink(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                privacyPolicyLink: ui.settings.privacyPolicyRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                privacyPolicyLink: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.privacyPolicyLink}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="tnc" className="ms-2 order-1">
                          Terms and condition
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="tnc"
                          value={tnc}
                          placeholder={ui.settings.tncPh}
                          onChange={(e) => {
                            setTnc(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                tnc: ui.settings.tncRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                tnc: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.tnc}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="tax" className="ms-2 order-1">
                          Tax (%)
                        </label>
                        <input
                          type="number"
                          className="rounded-2"
                          id="tax"
                          value={tax}
                          placeholder={ui.settings.taxPh}
                          onChange={(e) => {
                            setTax(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                tax: ui.settings.taxRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                tax: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.tax}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>



                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter ">
                    <div className="d-flex justify-content-between">
                      <div className="settingBoxHeader">
                        <h4>{ui.settings.addProductRequest}</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 6)}
                        value={setting?.isAddProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>{ui.settings.productRequestNew}</label>
                      </div>
                    </div>
                  </div>
                  <div className="settingBoxOuter mt-5">
                    <div className="d-flex justify-content-between">
                      <div className="settingBoxHeader">
                        <h4>{ui.settings.updateProductRequest}</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 7)}
                        value={setting?.isUpdateProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>{ui.settings.productRequestUpdate}</label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter ">
                    <div className="d-flex justify-content-between">
                      <div className="settingBoxHeader">
                        <h4>{ui.settings.updateProductRequest}</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 7)}
                        value={setting?.isUpdateProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>{ui.settings.productRequestUpdate}</label>
                      </div>
                    </div>
                  </div>
                </div> */}


                


                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>Charges Setting</h4>
                    </div>

                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="cancelOrderCharges" className="ms-2 order-1">
                          {ui.labels.cancelOrderChargesPct}
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="cancelOrderCharges"
                          value={cancelOrderCharges}
                          placeholder={ui.settings.cancelOrderPh}
                          onChange={(e) => {
                            setCancelOrderCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                cancelOrderCharges: ui.settings.cancelOrderRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                cancelOrderCharges: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.cancelOrderCharges}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="{ui.settings.adminCommissionLabel}" className="ms-2 order-1">
                          {ui.settings.adminCommissionLabel} - For Products
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="adminCommissionCharges"
                          value={adminCommissionCharges}
                          placeholder={ui.settings.adminCommissionPh}
                          onChange={(e) => {
                            setAdminCommissionCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                adminCommissionCharges: ui.settings.adminCommissionRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                adminCommissionCharges: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.adminCommissionCharges}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Commission percentage charged on product orders
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="Customer Commission Charges (%)" className="ms-2 order-1">
                          Admin Commission Charge Customer (%) - For Bookings
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="customerCommissionCharges"
                          value={customerCommissionCharges}
                          placeholder={ui.settings.customerCommissionPh}
                          onChange={(e) => {
                            setCustomerCommissionCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                customerCommissionCharges: ui.settings.customerCommissionRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                customerCommissionCharges: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.customerCommissionCharges}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Commission percentage charged from customers on bookings
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="Salon Commission Charges (%)" className="ms-2 order-1">
                          Admin Commission Charge Salon (%) - For Bookings
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="salonCommissionCharges"
                          value={salonCommissionCharges}
                          placeholder={ui.settings.salonCommissionPh}
                          onChange={(e) => {
                            setSalonCommissionCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                salonCommissionCharges: ui.settings.salonCommissionRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                salonCommissionCharges: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.salonCommissionCharges}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Commission percentage charged from salon owners on bookings
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="minSalonWalletBalance" className="ms-2 order-1">
                          Minimum Salon Wallet Balance
                        </label>
                        <input
                          type="number"
                          className="rounded-2"
                          id="minSalonWalletBalance"
                          value={minSalonWalletBalance}
                          placeholder={ui.settings.minWalletPh}
                          onChange={(e) => {
                            setMinSalonWalletBalance(e.target.value);
                            if (e.target.value && parseFloat(e.target.value) < 0) {
                              return setError({
                                ...error,
                                minSalonWalletBalance: ` Minimum Salon Wallet Balance must be 0 or greater`,
                              });
                            } else {
                              return setError({
                                ...error,
                                minSalonWalletBalance: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.minSalonWalletBalance}
                          </p>
                        )}
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Salon owners must maintain this minimum wallet balance plus expected commission to accept bookings
                        </label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="inputData text flex-row justify-content-start text-start">
                        <label htmlFor="reservationNotificationEmails" className="ms-2 order-1">
                          Reservation notification emails
                        </label>
                        <textarea
                          className="rounded-2"
                          style={{ width: "100%", minHeight: "72px" }}
                          id="reservationNotificationEmails"
                          value={reservationNotificationEmails}
                          placeholder="test@gmail.com, toto@gmail.com, admin@skedisy.com"
                          onChange={(e) => setReservationNotificationEmails(e.target.value)}
                        />
                        <label style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                          Comma-separated addresses. They receive new booking emails (with Accept/Decline links) and emails when a customer cancels a reservation, including the same booking details as the expert notification plus the customer&apos;s reason.
                          If empty, new booking emails fall back to ADMIN_BOOKING_EMAIL, SUPPORT_EMAIL, or EMAIL in server .env.
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>CURRENCY SETTING</h4>
                    </div>

                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="currencyName" className="ms-2 order-1">
                          Currency name
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="currencyName"
                          value={currencyName}
                          placeholder={ui.settings.currencyNamePh}
                          onChange={(e) => {
                            setCurrencyName(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                currencyName: ui.settings.currencyNameRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                currencyName: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.currencyName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label htmlFor="currencySymbol" className="ms-2 order-1">
                          Currency symbol
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="currencySymbol"
                          value={currencySymbol}
                          placeholder={ui.settings.currencySymbolPh}
                          onChange={(e) => {
                            setCurrencySymbol(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                currencySymbol: ui.settings.currencySymbolRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                currencySymbol: "",
                              });
                            }
                          }}
                        />
                        {error && (
                          <p className="errorMessage text-start">
                            {error && error?.currencySymbol}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>FIREBASE NOTIFICATION SETTING</h4>
                    </div>

                    <div className="inputData text  flex-row justify-content-start text-start">
                      <label className="float-left" htmlFor="firebaseKey">
                        Private key JSON (use for firebase push notification in app)
                      </label>
                      <textarea
                        name="firebaseKey"
                        className=" mt-2"
                        id="firebaseKey"
                        rows={10}
                        value={firebaseKey}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          try {
                            const newData = JSON.parse(newValue);
                            setfirebaseKey(newValue);
                            setError("");
                          } catch (error) {
                            // Handle invalid JSON input
                            console.error("Invalid JSON input:", error);
                            setfirebaseKey(newValue);
                            return setError({
                              ...error,
                              firebaseKey: ui.settings.invalidJson,
                            });
                          }
                        }}
                      ></textarea>

                      {error.firebaseKey && (
                        <div className="pl-1 text-left">
                          <p className="errorMessage">{error.firebaseKey}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )
      }
      {
        type === "withdraw" && (
          <>
            <div className="mainCategory">
              <div className="settingBox">
                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className=" d-flex justify-content-between">
                      <div>
                        <label style={{fontWeight:"bold"}}>{ui.labels.minWithdrawLabel}</label>
                      </div>
                      <Button
                        type={`submit`}
                        className={`text-light d-flex justify-end fw-bold`}
                        text="Enregistrer"
                        style={{ backgroundColor: "#1ebc1e" }}
                        onClick={onsubmit}
                      />
                    </div>
                    <div className="col-12 mt-2">
                      <div className="inputData text  flex-row justify-content-start text-start">

                        <input
                          type="text"
                          className="rounded-2"
                          id="minWithdrawalRequestedAmount"
                          value={minWithdrawalRequestedAmount}
                          placeholder={ui.settings.minWithdrawPh}
                          onChange={(e) => {
                            setMinWithdrawalRequestedAmount(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                minWithdrawalRequestedAmount: ui.settings.minWithdrawRequired,
                              });
                            } else {
                              return setError({
                                ...error,
                                razorSecretKey: "",
                              });
                            }
                          }}
                        />
                        <label style={{ fontSize: "15px" }}>User can not post withdraw request less than this amount</label>

                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <Button
                  className={`bg-button p-10 text-black m20-bottom`}
                  text={ui.labels.addNew}
                  bIcon={`fa-solid fa-user-plus`}
                  onClick={() => {
                    dispatch(openDialog({ type: "withdraw" }));
                  }}
                />

              </div>

              <div>
                <Table
                  data={data}
                  mapData={withDrawTable}
                  PerPage={rowsPerPage}
                  Page={page}
                  type={"client"}
                />
                <Pagination
                  type={"client"}
                  serverPage={page}
                  setServerPage={setPage}
                  serverPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  totalData={data?.length}
                />
              </div>
              {dialogue && dialogueType === "withdraw" && (
                <WithDrawDialogue
                  setData={setData}
                  data={data}
                  page={page}
                  rowsPerPage={rowsPerPage}
                />
              )}
            </div>
          </>
        )
      }

    </div>
  );
};
export default Setting;
