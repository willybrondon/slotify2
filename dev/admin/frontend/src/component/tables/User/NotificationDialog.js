import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import {
  allUserNotification,
  expertNotification,
  userNotification,
} from "../../../redux/slice/notificationSlice";


const NotificationDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");
;

  const [error, setError] = useState({
    title: "",
    message: "",
  });

  const handleSubmit = () => {

    if (!title || !message) {
      let error = {};
      if (!title) error.title = "Title is Required";
      if (!message) error.message = "Message is Required";
      return setError({ ...error });
    } else {
      if (image?.length !== 0) {
        let payload;
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("image", image);
        if (dialogueData.type === "user") {
          payload = {
            data: formData,
            userId: dialogueData.id,
          };
          dispatch(userNotification(payload)).unwrap();
        } else if (dialogueData.type === "expert") {
          payload = {
            data: formData,
            expertId: dialogueData.id,
          };
          dispatch(expertNotification(payload)).unwrap();
        }
      } else {
        let payload;
        if (dialogueData.type === "user") {
          payload = {
            data: {
              title,
              message,
            },
            userId: dialogueData.id,
          };
          dispatch(userNotification(payload)).unwrap();
        } else if (dialogueData.type === "expert") {
          payload = {
            data: {
              title,
              message,
            },
            expertId: dialogueData.id,
          };
          dispatch(expertNotification(payload)).unwrap();
        }
      }
      dispatch(closeDialog());
    }
  };

  const handleAllUser = () => {

    let payload;
    if (!title || !message) {
      let error = {};
      if (!title) error.title = "Title is Required";
      if (!message) error.message = "Message is Required";
      return setError({ ...error });
    } else {
      if (image.length !== 0) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("image", image);

        dispatch(allUserNotification(formData)).unwrap();
      } else {
        payload = {
          title,
          message,
        };
        dispatch(allUserNotification(payload)).unwrap();
      }
      dispatch(closeDialog());
    }
  };

  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-md-6 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">
                    {dialogueData == null
                      ? "User Notification"
                      : "Notification"}
                  </h2>
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
              <div className="row align-items-start formBody">
                <div className="col-6">
                  <ExInput
                    type={`text`}
                    id={`title`}
                    name={`title`}
                    value={title}
                    label={`Title`}
                    placeholder={`Title`}
                    errorMessage={error && error.title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!e.target.value) {
                        setError({
                          title: "Title is required",
                        });
                      } else {
                        setError({
                          title: "",
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-6">
                  <ExInput
                    type={`text`}
                    id={`message`}
                    name={`message`}
                    value={message}
                    label={`Message`}
                    placeholder={`Message`}
                    errorMessage={error && error.message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (!e.target.value) {
                        setError({
                          message: "Message is required",
                        });
                      } else {
                        setError({
                          message: "",
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-6">
                  <ExInput
                    label={`Image`}
                    id={`image`}
                    type={`file`}
                    onChange={(e) => handleImage(e)}
                    errorMessage={error.image && error.image}
                    accept={"image/*"}
                  />
                  <img
                    src={imagePath !== "" ? imagePath : null}
                    alt=""
                    draggable="false"
                    className={`${
                      (!imagePath || imagePath === "") && "d-none"
                    } `}
                    data-class={`showImage`}
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
              </div>
              <div className="row  formFooter">
                <div className="col-12 text-end m0">
                  <Button
                    className={`bg-gray text-light`}
                    text={`Cancel`}
                    type={`button`}
                    onClick={() => dispatch(closeDialog())}
                  />
                  {dialogueData && (
                    <Button
                      type={`submit`}
                      className={`text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text={`Submit`}
                      onClick={(e) => handleSubmit(e)}
                    />
                  )}
                  {dialogueData == null && (
                    <Button
                      type={`submit`}
                      className={`text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text={`Submit`}
                      onClick={(e) => handleAllUser(e)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;