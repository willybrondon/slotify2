import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SKEDISY_ADMIN_UI as ui } from "../../constants/skedisyUiCopy";
import { translateApiMessage } from "../../constants/skedisyApiMessage";

export function Success(msg) {
  const text = typeof msg === "string" ? translateApiMessage(msg) : msg;
  toast.success(
    <p className="text-dark tx-16 mb-0">
      {ui.toast.success} : {text}
    </p>,
    {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      autoClose: 2000,
      theme: "light",
    }
  );
}

export function Secondary(msg) {
    toast.error(
      <p className=" tx-16 mb-0">{ui.toast.oops} — {msg}</p>,
      {
        position: toast.POSITION.TOP_CENTER,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function LeftNotifier(msg) {
    toast.warn(
      <p className=" tx-16 mb-0">{ui.toast.warning} : {msg}</p>,
      {
        position: toast.POSITION.TOP_LEFT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function CenterInfo(msg) {
    toast.info(<p className=" tx-16 mb-0">{ui.toast.info} : {msg}</p>, {
      position: toast.POSITION.TOP_CENTER,
      hideProgressBar: false,
      autoClose: 2000,
      theme: "light",
    });
}

export const CenterDanger = (msg) => {
  toast.error(<p className=" tx-16 mb-0">{ui.toast.error} : {msg}</p>, {
    position: toast.POSITION.TOP_CENTER,
    hideProgressBar: false,
    autoClose: 2000,
    theme: "light",
  });
};

export function Centerwarning(msg) {
    toast.warn(<p className=" tx-16 mb-0">{msg}</p>, {
      position: toast.POSITION.TOP_CENTER,
      hideProgressBar: false,
      autoClose: 2000,
      theme: "light",
    });
}

// Side Alerts Notifications

export function SuccessLeft(msg) {
    toast.success(
      <p className=" tx-16 mb-0">
        <h3>{ui.toast.notice}</h3>
        {msg}
      </p>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function WarningLeft(msg) {
    toast.warn(
      <p className=" tx-16 mb-0">
        <h3>{ui.toast.warning}</h3>
        {msg}
      </p>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function DangerRight(msg) {
  const text = typeof msg === "string" ? translateApiMessage(msg) : msg;
  toast.error(
    <p className=" tx-16 mb-0">
      {text}
    </p>,
    {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: false,
      autoClose: 2000,
      theme: "light",
    }
  );
}

// Gradient Side Alerts Notifications

export function GradientSuccess(msg) {
    toast.success(
      <p className=" tx-16 mb-0">
        <h3>{ui.toast.error}</h3>
        {ui.toast.missingFile}
      </p>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function GradientWarning(msg) {
    toast.warn(
      <p className=" tx-16 mb-0">
        {msg}
      </p>,
      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function GradientDanger() {
    toast.error(
      <p className=" tx-16 mb-0">
        <h3>{ui.toast.error}</h3>
        {ui.toast.missingFile}
      </p>,

      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}



