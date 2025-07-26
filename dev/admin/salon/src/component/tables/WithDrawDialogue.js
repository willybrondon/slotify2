import { useDispatch, useSelector } from "react-redux";
import Button from "../extras/Button";
import Input from "../extras/Input";
import { useEffect, useState } from "react";
import { closeDialog } from "../../redux/slice/dialogueSlice";
import { addWithDraw, getWithDraw, updateWithDraw } from "../../redux/slice/withDrawSlice";
import { toast } from "react-toastify";

const WithDrawDialogue = ({ page, rowsPerPage }) => {
    const { dialogueData } = useSelector((state) => state.dialogue);
    const [mongoId, setMongoId] = useState("");
    const [name, setName] = useState();
    const [addDetail, setAddDetail] = useState([]);
    const [image, setImage] = useState([]);
    const [imagePath, setImagePath] = useState("");

    const [detail, setDetail] = useState("");

    const [error, setError] = useState({
        name: "",
        imagePath: "",
        addDetail: [],
    });

    useEffect(() => {
        setMongoId(dialogueData?._id);
        setName(dialogueData?.name);
        setImagePath(dialogueData?.image);
        setImage(dialogueData?.image);
        setAddDetail(dialogueData?.details);
    }, [dialogueData]);
    const dispatch = useDispatch();

    const handleImage = (e) => {
        setImage(e.target.files[0]);
        setImagePath(URL.createObjectURL(e.target.files[0]));
        setError((prevErrors) => ({
            ...prevErrors,
            image: "",
        }));
    };
    const addCountryList = (e) => {
        e.preventDefault();
        setAddDetail((old) => {
            if (!Array.isArray(old)) {
                old = [];
            }
            return [...old, detail];
        });
        setDetail("");
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addCountryList(event);
        }
    };

    const onRemove = (id) => {
        setAddDetail((old) => {
            if (!Array.isArray(old)) {
                old = [];
            }
            return old.filter((array, index) => {
                return index !== id;
            });
        });
    };

    const validate = () => {
        let errors = {};
        let isValid = true;

        if (!name) {
            errors.name = "Name is required!";
            isValid = false;
        }
        if (!image || image?.length === 0) {
            errors.image = "Image is required!";
            isValid = false;
        }
        if (!addDetail || addDetail.length === 0) {
            errors.detail = "Details are required!";
            isValid = false;
        }

        setError(errors); // Set errors after validation
        return isValid;
    };
    console.log("imaggggee", image)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("image", image);
            formData.append("details", addDetail);
            if (mongoId) {
                const payload = {
                    formData,
                    id: mongoId,
                }
                dispatch(updateWithDraw(payload))
                    .then((res) => {
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message);
                            const payload = {
                                start: page, limit: rowsPerPage
                            }
                            dispatch(getWithDraw(payload))
                            dispatch(closeDialog());
                        } else {
                            toast.error(res?.payload?.message)
                        }
                    })
            } else {
                dispatch(addWithDraw(formData))
                    .then((res) => {
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message);
                            const payload = {
                                start: page, limit: rowsPerPage
                            }
                            dispatch(getWithDraw(payload))
                            dispatch(closeDialog());
                        } else {
                            toast.error(res?.payload?.message)
                        }
                    })
            }
        }
    };
    return (
        <>
        
        <div className="dialog">
            <div className="w-100">
                <div className="row justify-content-center">
                    <div className="col-xl-5 col-md-8 col-11">
                        <div className="mainDiaogBox">
                            <div className="row justify-content-between align-items-center formHead">
                                <div className="col-8">
                                    <h2 className="text-theme m0">WithDraw dialog</h2>
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
                            <form onSubmit={handleSubmit} id="expertForm">
                                <div className="row align-items-start formBody">
                                    <div className="inputData text">
                                        <label
                                            htmlFor="name"
                                            className="ms-2 order-1"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            className="rounded-2"
                                            name="name"
                                            value={name}
                                            placeholder="Enter name"
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                setError({ ...error, name: "" });
                                            }}
                                        />
                                        {error?.name && (
                                            <div className="error-message" style={{ color: "red", fontSize: "12px" }}> {error.name}</div>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <div className="d-flex align-items-center">
                                            <div className="inputData text flex-row justify-content-start text-start w-75">
                                                <label
                                                    htmlFor="detail"
                                                    className="ms-2 order-1"
                                                >
                                                    Details
                                                </label>
                                                <input
                                                    type="text"
                                                    className="rounded-2"
                                                    name="detail"
                                                    value={detail}
                                                    placeholder="Enter detail"
                                                    onChange={(e) => {
                                                        setDetail(e.target.value);
                                                        setError({ ...error, detail: "" });
                                                    }}
                                                />
                                                {error?.detail && (
                                                    <div className="error-message" style={{ color: "red", fontSize: "12px" }}> {error.detail}</div>
                                                )}
                                            </div>
                                            {detail !== "" && (
                                                <div
                                                    className="px-3 text-white d-flex align-items-center justify-content-center ms-3 "
                                                    style={{
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        backgroundColor: "#1C2B20",
                                                        padding: "6px 0px",
                                                        marginTop: "30px"
                                                    }}
                                                    onClick={addCountryList}
                                                >
                                                    <span>ADD</span>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 pe-1">
                                        <div className="displayCountry form-control border p-3">
                                            {addDetail?.map((item, id) => {
                                                return (
                                                    <>
                                                        <span
                                                            className="mx-1"
                                                            style={{
                                                                backgroundColor: " #1C2B20",
                                                                padding: "5px",
                                                                color: " #fff",
                                                                borderRadius: "5px",
                                                            }}
                                                        >
                                                            {item}
                                                            <i
                                                                className="fa-solid fa-circle-xmark ms-2 my-2"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => {
                                                                    onRemove(id);
                                                                }}
                                                            ></i>
                                                        </span>
                                                    </>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="inputData file  flex-row justify-content-start text-start">
                                    <label
                                        htmlFor="image"
                                        className="ms-2 order-1"
                                    >
                                        Image
                                    </label>
                                    <input
                                        type="file"
                                        className="rounded-2"
                                        id="image"
                                        onChange={(e) => handleImage(e)}
                                        accept="image/*"
                                    />
                                    {error?.image && (
                                        <div className="error-message" style={{ color: "red", fontSize: "12px" }}> {error.image}</div>
                                    )}
                                    {imagePath && (
                                        <div className="image-start">
                                            <img
                                                src={imagePath}
                                                alt="ServiceImage"
                                                draggable="false"
                                                className={`${(!imagePath || imagePath == "") && "d-none"
                                                    }`}
                                                width={"100px"}
                                                height={"100px"}
                                                // data-image={name}
                                                data-class={`showImage`}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="row  formFooter">
                                    <div className="col-12 text-end m0">
                                        <Button
                                            className={`bg-gray text-light`}
                                            text={`Cancel`}
                                            type={`button`}
                                            onClick={() => dispatch(closeDialog())}
                                        />
                                        <Button
                                            type={`submit`}
                                            className={` text-white m10-left`}
                                            style={{ backgroundColor: "#1ebc1e" }}
                                            text={`Submit`}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
export default WithDrawDialogue;