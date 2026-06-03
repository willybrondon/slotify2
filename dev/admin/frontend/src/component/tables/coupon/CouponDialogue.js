import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { closeDialog } from "../../../redux/slice/dialogueSlice";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createCoupon } from "../../../redux/slice/couponSlice";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";

const c = ui.coupon;

const CouponDialogue = () => {

  const { dialogue, dialogueData } = useSelector(
    (state) => state.dialogue
  );
//   const { coupon } = useSelector((state) => state.coupon);

  const dispatch = useDispatch();

  const [title, setTitle] = useState();
  const [prefix, setPrefix] = useState();
  const [description, setDescription] = useState();
  const [expiryDate, setExpiryDate] = useState();
  const [minAmountToApply, setMinAmountToApply] = useState();
  const [couponType, setCouponType] = useState();

  const [discountType, setDiscountType] = useState();
  const [maxDiscount, setMaxDiscount] = useState();
  const [discountPercent, setDiscountPercent] = useState();

  const [error, setError] = useState({
    title: "",
    description: "",
    expiryDate: "",
    couponType: "",
    minAmountToApply: "",
    discountType: "",
    maxDiscount: "",
    discountPercent: "",
    prefix: "",
  });


  const handleSubmit = (e) => {

    if (
      !title ||
      !prefix ||
      !description ||
      !expiryDate ||
      !discountType ||
      !couponType ||
      (discountType == 1 && !maxDiscount) ||
      (discountType == 2 && !discountPercent) ||
      (discountType == 2 && discountPercent > 99) ||
      !minAmountToApply
    ) {
      let error = {}
      if (!title) error.title = c.titleRequired;
      if (!prefix) error.prefix = c.prefixRequired;
      if (!description) error.description = c.descriptionRequired;
      if (!expiryDate) error.expiryDate = c.expiryRequired;
      if (!couponType) error.couponType = c.couponTypeRequired;
      if (!discountType) error.discountType = c.discountTypeRequired;
      if (discountType == 1 && !maxDiscount)
        error.maxDiscount = c.maxDiscountRequired;
      if (discountType == 2 && !discountPercent)
        error.discountPercent = c.discountPercentRequired;
      if (discountType == 2 && discountPercent > 99)
        error.discountPercent = c.discountPercentRange;
      return setError({ ...error });
    } else {
      const data = {
        title,
        prefix,
        description,
        expiryDate,
        type: couponType,
        discountType,
        maxDiscount,
        discountPercent,
        minAmountToApply,
      };

      dispatch(createCoupon(data));
      dispatch(closeDialog());
    }
  };

  const types = [
    { value: 1, name: c.typeWallet },
    { value: 2, name: c.typeAppointment },
  ];

  const discountTypes = [
    { value: 1, name: c.discountFlat },
    { value: 2, name: c.discountPercentType },
  ];
  return (
    <>
      <div className="dialog">
        <div className="w-100">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-md-8 col-11">
              <div className="mainDiaogBox">
                <div className="row justify-content-between align-items-center formHead">
                  <div className="col-8">
                    <h2 className="text-theme m0">{c.dialogTitle}</h2>
                  </div>
                  <div className="col-4">
                    <div
                      className="closeButton"
                      onClick={() => {
                        dispatch(closeDialog());
                      }}
                    >
                      <i className="ri-close-line"></i>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <ExInput
                      type={`text`}
                      id={`title`}
                      name={`title`}
                      value={title}
                      label={c.title}
                      placeholder={c.title}
                      defaultValue={dialogueData && dialogueData?.title}
                      errorMessage={error.title && error.title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            title: c.titleRequired,
                          });
                        } else {
                          return setError({
                            ...error,
                            title: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <ExInput
                      type={`text`}
                      id={`prefix`}
                      name={`prefix`}
                      value={prefix}
                      label={c.prefixHint}
                      placeholder={c.prefix}
                      defaultValue={dialogueData && dialogueData?.prefix}
                      errorMessage={error.prefix && error.prefix}
                      onChange={(e) => {
                        setPrefix(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            prefix: c.prefixRequired,
                          });
                        } else {
                          return setError({
                            ...error,
                            prefix: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-md-6">
                    <ExInput
                      type={`text`}
                      id={`description`}
                      name={`description`}
                      value={description}
                      label={c.description}
                      placeholder={c.description}
                      defaultValue={dialogueData && dialogueData?.description}
                      errorMessage={error.description && error.description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            description: c.descriptionRequired,
                          });
                        } else {
                          return setError({
                            ...error,
                            description: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-md-6">
                    <ExInput
                      type={`number`}
                      id={`minAmountToApply`}
                      name={`minAmountToApply`}
                      value={minAmountToApply}
                      label={c.minAmount}
                      placeholder={c.minAmount}
                      defaultValue={
                        dialogueData && dialogueData?.minAmountToApply
                      }
                      errorMessage={
                        error.minAmountToApply && error.minAmountToApply
                      }
                      onChange={(e) => {
                        setMinAmountToApply(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            minAmountToApply: c.minAmountRequired,
                          });
                        } else {
                          return setError({
                            ...error,
                            minAmountToApply: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="inputData">
                      <label className=" " htmlFor="category">
                        {c.couponType}
                      </label>
                      <select
                        name="category"
                        className="rounded-2"
                        id="category"
                        value={couponType}
                        onChange={(e) => {
                          setCouponType(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              couponType: c.couponTypeRequired,
                            });
                          } else {
                            setError({
                              ...error,
                              couponType: "",
                            });
                          }
                        }}
                      >
                        <option value="" disabled selected>
                          {c.selectCouponType}
                        </option>
                        {types?.map((data) => {
                          return (
                            <option value={data?.value}>{data?.name}</option>
                          );
                        })}
                      </select>
                      {error?.couponType && (
                        <p className="errorMessage text-start">
                          {error && error?.couponType}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="inputData">
                      <label className=" " htmlFor="category">
                        {c.discountType}
                      </label>
                      <select
                        name="category"
                        className="rounded-2"
                        id="category"
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              discountType: c.discountTypeRequired,
                            });
                          } else {
                            setError({
                              ...error,
                              discountType: "",
                            });
                          }
                        }}
                      >
                        <option value="" disabled selected>
                          {c.selectDiscountType}
                        </option>
                        {discountTypes?.map((data) => {
                          return (
                            <option value={data?.value}>{data?.name}</option>
                          );
                        })}
                      </select>
                      {error?.discountType && (
                        <p className="errorMessage text-start">
                          {error && error?.discountType}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`inputData flex-row justify-content-start text-start`}
                    >
                      <label htmlFor="gender">{c.expiryDate}</label>
                      <input
                        type={`date`}
                        id={`expiryDate`}
                        name={`expiryDate`}
                        value={expiryDate}
                        defaultValue={dialogueData && dialogueData?.expiryDate}
                        placeholder={c.expiryDate}
                        onChange={(e) => {
                          setExpiryDate(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              expiryDate: c.expiryRequired,
                            });
                          } else {
                            return setError({
                              ...error,
                              expiryDate: "",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <ExInput
                      type={`number`}
                      id={`maxDiscount`}
                      name={`maxDiscount`}
                      value={maxDiscount}
                      label={c.maxDiscount}
                      placeholder={c.maxDiscount}
                      defaultValue={dialogueData && dialogueData?.maxDiscount}
                      errorMessage={error.maxDiscount && error.maxDiscount}
                      onChange={(e) => {
                        setMaxDiscount(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            maxDiscount: c.maxDiscountRequired,
                          });
                        } else {
                          return setError({
                            ...error,
                            maxDiscount: "",
                          });
                        }
                      }}
                    />
                    {discountType == 2 && (
                      <ExInput
                        type={`number`}
                        id={`discountPercent`}
                        name={`discountPercent`}
                        value={discountPercent}
                        label={c.discountPercent}
                        placeholder={c.discountPercent}
                        defaultValue={
                          dialogueData && dialogueData?.discountPercent
                        }
                        errorMessage={
                          error.discountPercent && error.discountPercent
                        }
                        onChange={(e) => {
                          setDiscountPercent(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              discountPercent: c.discountPercentRequired,
                            });
                          } else {
                            return setError({
                              ...error,
                              discountPercent: "",
                            });
                          }
                        }}
                      />
                    )}
                  </div>

                  <span className="text-danger">
                    Note :-This coupon is not editable , so create it carefully
                  </span>
                </div>
                <div className="row  formFooter mt-3">
                  <div className="col-12 text-end m0">
                    <Button
                      className={`bg-gray text-light`}
                      text="Annuler"
                      type={`button`}
                      onClick={() => dispatch(closeDialog())}
                    />
                    <Button
                      type={`submit`}
                      className={` text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text="Enregistrer"
                      onClick={(e) => handleSubmit(e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponDialogue;
