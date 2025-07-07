// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import {
  getSetting,
  handleSetting,
  maintenanceMode,
  updateSetting,
} from "../../../redux/slice/settingSlice";
import ToggleSwitch from "../../extras/ToggleSwitch";


const Setting = (props) => {
  const dispatch = useDispatch();
  const { setting } = useSelector((state) => state.setting);
;

  const [privacyPolicyLink, setPrivacyPolicyLink] = useState();
  const [tnc, setTnc] = useState();
  const [tax, setTax] = useState();
  const [razorPayId, setRazorPayId] = useState("");
  const [razorSecretKey, setRazorSecretKey] = useState("");
  // box 5
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

  const [currencyName, setCurrencyName] = useState();
  const [currencySymbol, setCurrencySymbol] = useState();
  const [flutterWaveKey, setFlutterWaveKey] = useState();

  const [firebaseKey, setfirebaseKey] = useState();
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
    dispatch(getSetting());
  }, [dispatch]);

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
      !firebaseKey
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

  const handleAppActive = (id) => {

    dispatch(maintenanceMode(id));
  };

  return (
    <div className="mainSetting">
      <Title name="Setting" />
      <div className="settingBox">
        <div className=" d-flex justify-content-end">
          <div className="  formFooter">
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
              <div className="inputData">
                <div>
                  <label className="my-3">Cash after service</label>
                </div>
                <ToggleSwitch
                  onClick={() => handleSettingSwitch(setting?._id, 5)}
                  value={setting?.cashAfterService}
                />
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
    </div>
  );
};
export default Setting;
