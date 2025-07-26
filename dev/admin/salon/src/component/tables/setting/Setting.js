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
  const [data, setData] = useState([]);
  console.log("withDrawwithDraw", withDraw)
  // box 5
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [minWithdrawalRequestedAmount, setMinWithdrawalRequestedAmount] = useState("");
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
      setAdminCommissionCharges(setting?.adminCommissionCharges);
      setCancelOrderCharges(setting?.cancelOrderCharges);
    }
  }, [setting]);

  const onsubmit = async (e) => {
    e.preventDefault();

    ;
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
      !cancelOrderCharges
    ) {
      let error = {};
      if (!privacyPolicyLink)
        error.privacyPolicyLink = "Privacy Policy Link is required";
      if (!tnc) error.tnc = "T&C is required";
      if (!stripePublishableKey)
        error.stripePublishableKey = "Stripe Publishable Key is required";
      if (!stripeSecretKey)
        error.stripeSecretKey = "Stripe Secret Key is required";
      if (!razorPayId) error.razorPayId = "Razor Pay Id is required";
      if (!razorSecretKey)
        error.razorSecretKey = "Razor Secret Key is required";
      if (!tax) error.tax = "Tax is required";
      if (!currencyName) error.currencyName = "Currency Name is required";
      if (!currencySymbol) error.currencySymbol = "Currency Symbol is required";
      if (!flutterWaveKey)
        error.flutterWaveKey = "Flutter Wave Key is required";
      if (!firebaseKey) error.firebaseKey = "Firebase Key is required";
      if (!adminCommissionCharges) error.commissionPerProductQuantity = "commissionPerProductQuantity Key is required";
      if (!cancelOrderCharges) error.cancelOrderCharges = "cancelOrderCharges Key is required";
      if (!minWithdrawalRequestedAmount) error.minWithdrawalRequestedAmount = "withDrawReq is required";
      return setError({ ...error });
    } else {
      const data = {
        privacyPolicyLink,
        tnc,
        stripePublishableKey,
        stripeSecretKey,
        razorPayId,
        razorSecretKey,
        tax,
        currencyName,
        currencySymbol,
        flutterWaveKey,
        firebaseKey,
        minWithdrawalRequestedAmount,
        cancelOrderCharges,
        adminCommissionCharges 
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
        console.log("yes", yes);
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
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Image",
      Cell: ({ row }) => (
        <img src={row?.image} alt={"image"} width="50px" height="50px" />
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Details",
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
      Header: "Created At",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.createdAt?.split("T")[0]}</span>
      ),
    },
    {
      Header: "Is Active",
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
      Header: "Action",
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
        >
          Setting
        </button>
        <button
          type="button"
          className={`${type === "paymentSetting" ? "activeBtn" : "disabledBtn"}`}
          onClick={() => setType("paymentSetting")}
        >
          Payment
        </button>
        <button
          type="button"
          className={`${type === "withdraw" ? "activeBtn" : "disabledBtn"
            } ms-1`}
          onClick={() => setType("withdraw")}
        >
          WithDraw
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
                    text={`Submit`}
                    style={{ backgroundColor: "#1ebc1e" }}
                    onClick={onsubmit}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader">
                      <h4>STRIPE PAY SETTING</h4>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label
                          htmlFor="stripePublishableKey"
                          className="ms-2 order-1"
                        >
                          Stripe publishable key
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="stripePublishableKey"
                          value={stripePublishableKey}
                          placeholder="Enter Stripe Publishable Key"
                          onChange={(e) => {
                            setStripePublishableKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                stripePublishableKey: ` stripePublishableKey Is Required`,
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
                          Stripe secret key
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="stripeSecretKey"
                          value={stripeSecretKey}
                          placeholder="Enter Stripe Secret Key"
                          onChange={(e) => {
                            setStripeSecretKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                stripeSecretKey: ` Stripe Secret Key Is Required`,
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
                        <label className="my-3">Stripe pay active (enable/disable stripe pay)</label>
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
                      <h4>RAZOR PAY SETTING</h4>
                    </div>
                    <div className="col-12 ">
                      <div className="inputData text  flex-row justify-content-start text-start">
                        <label className="my-3">Razor pay active (enable/disable razor pay)</label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="razorSecretKey"
                          value={razorSecretKey}
                          placeholder="Enter Razorpay Secret Key"
                          onChange={(e) => {
                            setRazorSecretKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                razorSecretKey: ` Razorpay Secret Key Is Required`,
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
                          placeholder="Enter razorPay Id"
                          onChange={(e) => {
                            setRazorPayId(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                razorPayId: ` razorPay Id Is Required`,
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
                        <label className="my-3">Razor pay active</label>
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
                      <h4>FLUTTER WAVE SETTING</h4>
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
                          placeholder="EnterFlutterWave Key"
                          onChange={(e) => {
                            setFlutterWaveKey(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                flutterWaveKey: `FlutterWave Key Is Required`,
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
                        <label className="my-3">flutterwave payment (enable/disable)</label>
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
                    text={`Submit`}
                    style={{ backgroundColor: "#1ebc1e" }}
                    onClick={onsubmit}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mt-3">
                  <div className="settingBoxOuter">
                    <div className="settingBoxHeader d-flex justify-content-between">
                      <h4>APP SETTING</h4>
                      <div className="inputData">
                        <label className="me-2">Maintenance Mode</label>
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
                          placeholder="Enter privacyPolicyLink"
                          onChange={(e) => {
                            setPrivacyPolicyLink(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                privacyPolicyLink: ` privacyPolicyLink Is Required`,
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
                          placeholder="Enter tnc"
                          onChange={(e) => {
                            setTnc(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                tnc: ` Terms And Condition Is Required`,
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
                          placeholder="Enter tax"
                          onChange={(e) => {
                            setTax(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                tax: ` tax Is Required`,
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
                        <h4>Add Product Request</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 6)}
                        value={setting?.isAddProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>New product request enable/disable for seller</label>
                      </div>
                    </div>
                  </div>
                  <div className="settingBoxOuter mt-5">
                    <div className="d-flex justify-content-between">
                      <div className="settingBoxHeader">
                        <h4>Update  Product Request</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 7)}
                        value={setting?.isUpdateProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>Enable/disable product request update for seller</label>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="col-12 col-md-6 mt-3 ">
                  <div className="settingBoxOuter ">
                    <div className="d-flex justify-content-between">
                      <div className="settingBoxHeader">
                        <h4>Update  Product Request</h4>
                      </div>
                      <ToggleSwitch
                        onClick={() => handleSettingSwitch(setting?._id, 7)}
                        value={setting?.isUpdateProductRequest}
                      />
                    </div>

                    <div className="inputData">
                      <div>
                        <label className="my-3" style={{ fontSize: "20px" }}>Enable/disable product request update for seller</label>
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
                          Cancel Order Charges (%)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="cancelOrderCharges"
                          value={cancelOrderCharges}
                          placeholder="Enter Cancel Order Charges"
                          onChange={(e) => {
                            setCancelOrderCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                cancelOrderCharges: ` Cancel Order Charges Is Required`,
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
                        <label htmlFor="Admin Commission Charges (%)" className="ms-2 order-1">
                          Admin Commission Charges (%)
                        </label>
                        <input
                          type="text"
                          className="rounded-2"
                          id="adminCommissionCharges"
                          value={adminCommissionCharges}
                          placeholder="Enter Admin Commission"
                          onChange={(e) => {
                            setAdminCommissionCharges(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                adminCommissionCharges: ` Admin Commission Is Required`,
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
                          placeholder="Enter currency Name"
                          onChange={(e) => {
                            setCurrencyName(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                currencyName: ` currency Name Is Required`,
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
                          placeholder="Enter Currency Symbol"
                          onChange={(e) => {
                            setCurrencySymbol(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                currencySymbol: ` Currency Symbol Is Required`,
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
                              firebaseKey: "Invalid JSON input",
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
                        <label style={{fontWeight:"bold"}}>Minimum Withdrawal request amount</label>
                      </div>
                      <Button
                        type={`submit`}
                        className={`text-light d-flex justify-end fw-bold`}
                        text={`Submit`}
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
                          placeholder="Enter minWithdrawalRequestedAmount"
                          onChange={(e) => {
                            setMinWithdrawalRequestedAmount(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                razorSecretKey: `WithdrawalRequestedAmount Key Is Required`,
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
                  className={`bg-button p-10 text-white m20-bottom`}
                  text={`Add New`}
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
