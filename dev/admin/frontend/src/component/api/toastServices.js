import React from "react";
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Success(msg) {
  toast.success(
    <p className="text-dark tx-16 mb-0">
      Success: {msg}
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
      <p className=" tx-16 mb-0">Oops! {msg}</p>,
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
      <p className=" tx-16 mb-0">Warning: {msg}</p>,
      {
        position: toast.POSITION.TOP_LEFT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}

export function CenterInfo(msg) {
    toast.info(<p className=" tx-16 mb-0">Info: {msg}</p>, {
      position: toast.POSITION.TOP_CENTER,
      hideProgressBar: false,
      autoClose: 2000,
      theme: "light",
    });
}

export const CenterDanger = (msg) => {
  toast.error(<p className=" tx-16 mb-0">Error: {msg}</p>, {
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
        <h3>Notice!</h3>{msg}
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
        <h3>Warning!</h3>{msg}
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
  toast.error(
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

// Gradient Side Alerts Notifications

export function GradientSuccess(msg) {
    toast.success(
      <p className=" tx-16 mb-0">
        <h3>Error!</h3>please check Your details ...file is missing
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
        <h3>Error!</h3>please check Your details ...file is missing
      </p>,

      {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: false,
        autoClose: 2000,
        theme: "light",
      }
    );
}



