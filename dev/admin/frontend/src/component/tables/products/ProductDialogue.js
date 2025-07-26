/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "../../extras/Title";
import { getAttribute, getProductsCategory, productCategoryAdd, updateProductCategory } from "../../../redux/slice/productSlice";
import { FormGroup, Input } from "reactstrap";
import FormControl from "@mui/material/FormControl";
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select, useTheme } from "@mui/material";
import { toast } from "react-toastify";
import ReactDropzone from "react-dropzone";

const ProductDialogue = () => {
    const dispatch = useDispatch();
    const { s } = useLocation();
    const navigate = useNavigate();
    const { productCategory, attribute } = useSelector((s) => s.product);
    const [mongoId, setMongoId] = useState()
    const [productCode, setProductcode] = useState("")
    const [productName, setProductName] = useState("")
    const [description, setDescription] = useState("")
    const [brand, setBrand] = useState("")
    const [values, setValues] = useState({})
    const [price, setPrice] = useState("")
    const [mrp, setMrp] = useState("")
    const [shippingCharges, setShippingCharges] = useState("")
    const [category, setCategory] = useState("")

    const [image, setImage] = useState([]);
    const [mainImagePath, setMainImagePath] = useState("");
    const [mainImage, setMainImage] = useState([]);

    const [personNames, setPersonNames] = useState([
        {
            name: "",
            value: [],
        },
    ]);
    const { state } = useLocation();

    useEffect(() => {
        setPersonNames(
            attribute?.map((res) => ({
                name: res?.name,
                value: [],
            })) || []
        );
    }, []);
    const [selectErrors, setSelectErrors] = useState(
        Array(attribute.length).fill("")
    );
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    const theme = useTheme();

    useEffect(() => {
        if (state) {
            setProductcode(state?.row?.productCode || "");
            setProductName(state?.row?.productName || "");
            setDescription(state?.row?.description || "");
            setBrand(state?.row?.brand || "");
            setPrice(state?.row?.price || "");
            setMrp(state?.row?.mrp || "");
            setShippingCharges(state?.row?.shippingCharges || "");
            setCategory(state?.row?.category?._id || "");
            setImage(state?.row?.images);
            setMainImage(state?.row?.mainImage);
            setMainImagePath(state?.row?.mainImage);
            setMongoId(state?.row?._id);

            // Initialize personNames state based on the attribute array and state data
            const initialPersonNames = attribute?.map((attr) => {
                const matchingAttribute = state?.row?.attributes?.find(
                    (item) => item.name === attr.name
                );
                return {
                    name: attr.name,
                    value: matchingAttribute ? matchingAttribute.value : [],
                };
            }) || [];

            setPersonNames(initialPersonNames);
        }
    }, [state, attribute]);


    const [error, setError] = useState({});

    const validate = () => {
        let error = {};
        let isValid = true;
        if (!productCode) {
            error.productCode = "Product code is required";
            isValid = false;
        }
        if (!productName) {
            error.productName = "Product name is required";
            isValid = false;
        }
        if (!description) {
            error.description = "Description is required";
            isValid = false;
        }
        if (!brand) {
            error.brand = "Brand is required";
            isValid = false;
        }
        if (!category) {
            error.category = "Category is required";
            isValid = false;
        }
        const hasAtLeastOneAttributeValue = personNames?.some(
            (attribute) => attribute?.value && attribute?.value?.length > 0
        );

        if (!hasAtLeastOneAttributeValue) {
            error.personNames = "At least one attribute is required!";
            isValid = false;
        }
        if (!price) {
            error.price = "Price is required";
            isValid = false;
        }
        if (!mrp) {
            error.mrp = "MRP is required";
            isValid = false;
        }
        if (!shippingCharges) {
            error.shippingCharges = "Shipping Charges is required";
            isValid = false;
        }
        if (!mainImage) {
            error.mainImage = "Main Image is required";
            isValid = false;
        }
        if (!image) {
            error.images = "Image is required";
            isValid = false;
        }
        setError(error)
        return isValid
    }
    const handlePersonNameChange = (index, selectedValues, attributeName) => {
        const updatedPersonNames = [...personNames];
        updatedPersonNames[index] = {
            ...updatedPersonNames[index],
            value: selectedValues,
            name: attributeName,
        };
        setPersonNames(updatedPersonNames);
        const newErrors = [...selectErrors];

        setSelectErrors(newErrors);
        if (personNames[0]?.value?.length === 0 && index === 0) {
            return setError({
                ...error,
                // personNames: "Attributes is Required !",
            });
        } else {
            setError({
                ...error,
                personNames: "",
            });
        }
    };
    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("productCode", productCode);
        formData.append("productName", productName);
        formData.append("description", description);
        formData.append("brand", brand);
        formData.append("category", category);
        formData.append("price", price);
        formData.append("mrp", mrp);
        formData.append("shippingCharges", shippingCharges);
        formData.append("mainImage", mainImage);
        for (let i = 0; i < image?.length; i++) {
            formData.append("images", image[i]);
        }
        const filterData = personNames?.filter((data) => data?.value?.length > 0);
        formData.append("attributes", JSON.stringify(filterData));
        if (validate()) {
            if (mongoId) {
                const payload = { formData, productId: mongoId, salonId: state?.row?.salon?._id, productCode: productCode };
                dispatch(updateProductCategory(payload))
                    .then((res) => {
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message)
                            navigate(-1)
                        }
                        else {
                            toast.error(res?.payload?.message)
                        }
                    })
            } else {
                dispatch(productCategoryAdd(formData))
                    .then((res) => {
                        if (res?.payload?.status) {
                            toast.success(res?.payload?.message)
                            navigate(-1)
                        }
                        else {
                            toast.error(res?.payload?.message)
                        }
                    })
            }
        }
    }

    function getStyles(name, personName, theme) {
        // return {
        //   fontWeight:
        //     personName(name) === -1
        //       ? theme.typography.fontWeightRegular
        //       : theme.typography.fontWeightMedium,
        // };
    }

    const createCode = () => {
        const randomChars = "0123456789";
        let code_ = "";
        for (let i = 0; i < 6; i++) {
            code_ += randomChars.charAt(
                Math.floor(Math.random() * randomChars.length)
            );
        }
        setProductcode(code_)
        setError({ ...error, productCode: "" });
    };


    useEffect(() => {
        dispatch(getProductsCategory())
        dispatch(getAttribute())
    }, []);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        setError({ ...error, [name]: "" })
    }

    useEffect(() => {
        const addData = s?.row?.serviceData?.map((item) => {
            const { _id, ...rest } = item;
            return { id: _id, ...rest };
        });
        // setAllService(addData);
    }, [s]);



    const handleImage = (e) => {
        setMainImage(e.target.files[0]);
        setMainImagePath(URL.createObjectURL(e.target.files[0]));
        setError((prevErrors) => ({
            ...prevErrors,
            mainImage: "",
        }));
    };

    const removeImage = (file) => {
        if (file.preview) {
            const updatedImages = image?.filter(
                (ele) => ele.preview !== file.preview
            );
            setImage(updatedImages);
        } else {
            const updatedImages = image?.filter((ele) => ele !== file);
            setImage(updatedImages);
        }
    };
    const onPreviewDrop = (acceptedFiles) => {
        setImage(acceptedFiles?.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })));
        setError((prevErrors) => ({
            ...prevErrors,
            images: "",
        }));
    }


    return (
        <div className="p-3">
            <Title name={`Add product`} />
            <div className="card">
                <div className="card-body">
                    <div className="">
                            <div className="row align-items-start formBody">
                                <div className="row my-2">
                                    {error.allService && (
                                        <p className="errorMessage">{error?.allService}</p>
                                    )}
                                </div>
                                <div className="col-12 col-md-6">
                                    <label style={{ color: "#7E7E7E" }}>Product Code</label>

                                    <div className="row d-flex">
                                        <div className={`${mongoId ? "col-12" : "col-md-10"}`}>
                                            <Input
                                                label={`Product Code (6 digit)`}
                                                id={`productCode`}
                                                name="productCode"
                                                type="number"
                                                value={productCode}
                                                readOnly
                                                disabled={state?.row ? true : false}
                                                onChange={(e) => {
                                                    setProductcode(e.target.value)
                                                    if (!e.target.value) {
                                                        return setError({ ...error, productCode: "Product code is required" });
                                                    } else {
                                                        return setError({ ...error, productCode: "" });
                                                    }
                                                }}
                                            />
                                            {
                                                error.productCode && (
                                                    <p style={{ color: "red", fontSize: "15px" }}>{error.productCode}</p>
                                                )
                                            }
                                        </div>
                                        {!mongoId && (
                                            <div
                                                className="col-md-2 pl-0 d-flex justify-content-end align-items-center"
                                            >
                                                <button
                                                    type="button"
                                                    className="btn text-white"
                                                    style={{
                                                        borderRadius: 5,
                                                        fontSize: "14px",
                                                        padding: "7px",
                                                        backgroundColor: "#b93160",
                                                    }}
                                                    onClick={createCode}
                                                >
                                                    Generate
                                                </button>
                                            </div>
                                        )}


                                    </div>
                                </div>


                                <div className="col-12 col-md-6">
                                    <ExInput
                                        type={`text`}
                                        id={`productName`}
                                        name={`productName`}
                                        value={productName}
                                        label={`Product Name`}
                                        placeholder={`Product name`}
                                        onChange={(e) => {
                                            setProductName(e.target.value)
                                            setError({ ...error, productName: "" });
                                        }
                                        }
                                    />
                                    {
                                        error.productName && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.productName}</p>
                                        )
                                    }
                                </div>

                                <div className="col-12 col-md-6">
                                    <ExInput
                                        type={`text`}
                                        value={description}
                                        id={`description`}
                                        name={`description`}
                                        label={`Description`}
                                        placeholder={`Description`}
                                        onChange={(e) => {
                                            setDescription(e.target.value)
                                            setError({ ...error, description: "" })

                                        }}
                                    />
                                    {
                                        error.description && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.description}</p>
                                        )
                                    }

                                </div>

                                <div className="col-12 col-md-6">
                                    <ExInput
                                        type={`text`}
                                        value={brand}
                                        id={`brand`}
                                        name={`brand`}
                                        label={`Brand`}
                                        placeholder={`brand`}
                                        onChange={(e) => {
                                            setBrand(e.target.value)
                                            setError({ ...error, brand: "" })
                                        }}
                                    />
                                    {
                                        error.brand && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.brand}</p>
                                        )
                                    }
                                </div>
                                <div className="col-12 col-md-6">
                                    <ExInput
                                        type={`number`}
                                        id={`price`}
                                        name={`price`}
                                        label={`Price`}
                                        value={price}
                                        placeholder={`Price`}
                                        onChange={(e) => {
                                            setPrice(e.target.value)

                                            setError({ ...error, price: "" })

                                        }}
                                    />
                                    {
                                        error.price && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.price}</p>
                                        )
                                    }
                                </div>

                                <div className="col-12 col-md-6">
                                    <ExInput
                                        type={`text`}
                                        value={mrp}
                                        id={`mrp`}
                                        name={`mrp`}
                                        label={`Mrp`}
                                        placeholder={`MRP`}
                                        onChange={(e) => {
                                            setMrp(e.target.value)
                                            setError({ ...error, mrp: "" })
                                        }}
                                    />
                                    {
                                        error.mrp && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.mrp}</p>
                                        )
                                    }
                                </div>
                                <div className="col-12 ">
                                    <ExInput
                                        type={`number`}
                                        id={`shippingCharges`}
                                        name={`shippingCharges`}
                                        value={shippingCharges}
                                        label={`Shipping Charges`}
                                        placeholder={`Shipping Charges`}
                                        onChange={(e) => {
                                            setShippingCharges(e.target.value)

                                            setError({ ...error, shippingCharges: "" })

                                        }}
                                    />
                                    {
                                        error.shippingCharges && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.shippingCharges}</p>
                                        )
                                    }
                                </div>
                                <div className="col-12">
                                    <div className="inputData text  flex-row justify-content-start text-start">
                                        <label htmlFor="categorySelect" className="false">
                                            Select Category
                                        </label>
                                    </div>
                                    <FormGroup>
                                        <Input id="categorySelect" name="category" type="select" defaultValue="select"
                                            onChange={(e) => {
                                                setCategory(e.target.value)
                                                setError({ ...error, category: "" })

                                            }}
                                            value={category}>
                                            <option value="" disabled>
                                                Select a category
                                            </option>
                                            {productCategory?.map((list) => (
                                                <option key={list?._id} value={list?._id}>
                                                    {list?.name}
                                                </option>
                                            ))}
                                        </Input>
                                        {error?.category && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error?.category}</p>
                                        )}
                                    </FormGroup>

                                </div>
                                <div className="col-12">
                                    <label style={{ color: "#7E7E7E" }}>Select Attribute</label>
                                </div>
                                {attribute?.map((data, index) => {
                                    return (
                                        <>
                                            <div className="col-xl-3 col-md-6 col-12">
                                                <FormControl sx={{ m: 1, width: 300 }}>
                                                    <InputLabel
                                                        id="demo-multiple-chip-label"
                                                        style={{ width: "auto" }}
                                                    >
                                                        {data.name}
                                                    </InputLabel>

                                                    <Select
                                                        labelId={`demo-multiple-chip-label`}
                                                        id={`demo-multiple-chip-${index}`}
                                                        multiple
                                                        value={personNames[index]?.value || []} // Use personNames[index]?.value as the value prop
                                                        onChange={(event) =>
                                                            handlePersonNameChange(
                                                                index,
                                                                event.target.value,
                                                                data?.name
                                                            )
                                                        }
                                                        input={
                                                            <OutlinedInput
                                                                id={`select-multiple-chip-${index}`}
                                                                label="Chip"
                                                                required={true}
                                                            />
                                                        }
                                                        renderValue={(selected) => (
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                {Array.isArray(selected) ? (
                                                                    selected.map((value) => (
                                                                        <Chip key={value} label={value} />
                                                                    ))
                                                                ) : (
                                                                    <Chip key={selected} label={selected} />
                                                                )}
                                                            </Box>
                                                        )}
                                                        MenuProps={MenuProps}
                                                    >
                                                        {data?.value?.map((name) => (
                                                            <MenuItem
                                                                key={name}
                                                                value={name}
                                                                style={getStyles(
                                                                    name,
                                                                    personNames &&
                                                                        personNames[0] &&
                                                                        Array.isArray(personNames[0].value)
                                                                        ? personNames[0].value[index] || []
                                                                        : [],
                                                                    theme
                                                                )}
                                                            >
                                                                {name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {error.personNames &&
                                                        error.personNames.length > 0 && (
                                                            <div className="ml-2 mt-1">
                                                                <div className="pl-1 text__left">
                                                                    <span className="errorMessage" style={{ color: "red", fontSize: "15px   " }}>
                                                                        {error.personNames}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                </FormControl>

                                                {selectErrors[index] && (
                                                    <div className="ml-2 mt-1">
                                                        <div className="pl-1 text__left">
                                                            <span className="errorMessage">
                                                                {selectErrors[index]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })}

                                <div className="col-12">
                                    <ExInput
                                        label={`Main Image`}
                                        id={`mainImage`}
                                        type={`file`}
                                        name="mainImage"
                                        onChange={(e) => {
                                            handleImage(e)
                                        }}
                                        accept={"image/*"}
                                        multiple={false}
                                    />
                                    {
                                        mainImagePath && (
                                            <img
                                                src={mainImagePath}
                                                alt=""
                                                draggable="false"
                                                className={`${(!mainImagePath || mainImagePath === "") && "d-none"} `}
                                                data-class={`showImage`}
                                                style={{ width: "100px", height: "100px" }}
                                            />
                                        )
                                    }

                                    {
                                        error.mainImage && (
                                            <p style={{ color: "red", fontSize: "15px" }}>{error.mainImage}</p>
                                        )
                                    }
                                </div>

                                <div className="col-12">
                                    <label className="float-left dialog__input__title">
                                        Select (Multiple) Image
                                    </label>

                                    <ReactDropzone
                                        onDrop={(acceptedFiles) => {
                                            onPreviewDrop(acceptedFiles);
                                        }}
                                        accept="image/*"
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <section className="mt-4">
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <div
                                                        style={{
                                                            height: "130px",
                                                            width: "130px",
                                                            border: "2px dashed gray",
                                                            textAlign: "center",
                                                            marginTop: "10px",
                                                            marginBottom: "10px", // Add space below input box
                                                        }}
                                                    >
                                                        <i
                                                            className="fas fa-plus"
                                                            style={{
                                                                paddingTop: "30px",
                                                                fontSize: "70px",
                                                            }}
                                                        ></i>
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </ReactDropzone>
                                </div>
                                {error.images && (
                                    <p style={{ color: "red", fontSize: "15px" }}>{error.images}</p>
                                )}

                                <div className="col-12" style={{ clear: "both", paddingTop: "20px" }}>
                                    {image?.map((file, index) =>
                                    (
                                        file?.type?.split("image")[0] === "" ? (
                                            <div
                                                key={index}
                                                style={{
                                                    position: "relative",
                                                    display: "inline-block",
                                                    margin: "10px 15px 0 0",
                                                    verticalAlign: "bottom",
                                                }}
                                            >
                                                <img
                                                    height="100px"
                                                    width="100px"
                                                    alt="app"
                                                    src={file.preview}
                                                    style={{
                                                        borderRadius: "10px",
                                                        objectFit: "contain",
                                                    }}
                                                    draggable="false"
                                                />
                                                <i
                                                    className="fas fa-times-circle text-danger"
                                                    style={{
                                                        position: "absolute",
                                                        right: "5px",
                                                        top: "5px",
                                                        cursor: "pointer",
                                                        backgroundColor: "#fff", // Background to make it more visible
                                                        borderRadius: "50%",
                                                    }}
                                                    onClick={() => removeImage(file)}
                                                ></i>
                                            </div>
                                        ) : (
                                            <div
                                                key={index}
                                                style={{
                                                    position: "relative",
                                                    display: "inline-block",
                                                    margin: "10px 15px 0 0",
                                                    verticalAlign: "bottom",
                                                }}
                                            >
                                                <img
                                                    height="100px"
                                                    width="100px"
                                                    alt="app"
                                                    src={file}
                                                    style={{
                                                        borderRadius: "10px",
                                                        objectFit: "contain",
                                                    }}
                                                    draggable="false"
                                                />
                                                <i
                                                    className="fas fa-times-circle text-danger"
                                                    style={{
                                                        position: "absolute",
                                                        right: "5px",
                                                        top: "5px",
                                                        cursor: "pointer",
                                                        backgroundColor: "#fff", // Background to make it more visible
                                                        borderRadius: "50%",
                                                    }}
                                                    onClick={() => removeImage(file)}
                                                ></i>
                                            </div>
                                        )
                                    )
                                    )}
                                </div>

                            </div>

                        <div className="row  formFooter">
                            <div className="col-12 text-end m0">
                                <Button
                                    className={`bg-gray text-light`}
                                    text={`Cancel`}
                                    type={`button`}
                                    onClick={() => navigate(-1)}
                                />
                                <Button
                                    type={`submit`}
                                    className={` text-white m10-left`}
                                    style={{ backgroundColor: "#1ebc1e" }}
                                    text={`Submit`}
                                    onClick={(e) => {

                                        handleSubmit(e)

                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductDialogue