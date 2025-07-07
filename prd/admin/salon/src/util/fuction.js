/* eslint-disable eqeqeq */
/* eslint-disable no-redeclare */
import { baseURL } from "./config";
import $ from "jquery"

export const submitData = (e) => {
  

  e.preventDefault();
  const formDataObject = {};
  var hasEmptyField = false;

  // normal text field error
  const textBox = e.target.querySelectorAll('input[type="text"]');
  const numberBox = e.target.querySelectorAll('input[type="number"]');
  const passwordBox = e.target.querySelectorAll('input[type="password"]');
  const hiddenBox = e.target.querySelectorAll('input[type="hidden"]');
  const textareaBox = e.target.querySelectorAll("textarea");

  const allData = [...textBox, ...numberBox, ...textareaBox, ...passwordBox, ...hiddenBox];

  for (let i = 0; i < allData.length; i++) {


    const key = allData[i].name;
    var value = allData[i].value.trim()
    const title = allData[i].title;
    const validation = allData[i].getAttribute("data-validation");
    const ignore = allData[i].getAttribute("data-ignore");
    console.log("key", key);
    console.log("value", value);
    console.log("validation", validation);
    console.log("ignore", ignore);
    var errorData = e.target.querySelectorAll(`#error-${key}`)[0].classList;
    var errorMessages = e.target.querySelectorAll(`#error-${key}`)[0];


    if (!value && ignore !== "true") {

      errorData.remove("d-none");
      errorData.add("d-block");
      hasEmptyField = true;
    } else {
      if (validation) {
        
        let regex = new RegExp(validation);
        const pattern = regex.test(value);
        if (!pattern) {
          
          errorMessages.textContent = title;
          errorData.remove("d-none");
          errorData.add("d-block");
          hasEmptyField = true;
        } else {
          allData[i].setCustomValidity("");
          errorData.remove("d-block");
          errorData.add("d-none");
          formDataObject[key] = value;
        }
      } else {

        allData[i].setCustomValidity("");
        errorData.remove("d-block");
        errorData.add("d-none");
        formDataObject[key] = value;
      }
    }
  }
  // Image Validation
  const file = e.target.querySelectorAll('input[type="file"]');
  console.log("file99999999999", file);

  if (file) {
    for (let i = 0; i < file.length; i++) {
      const key = file[i].name;
      var errorData = e.target.querySelectorAll(`#error-${key}`)[0].classList;

      if (!file[i].multiple) {
        const value = file[i].files[0];
        const imgSrc = e.target.querySelectorAll(`#file-${key}`)[0].src;
        if (imgSrc == "") {
          errorData.remove("d-none");
          errorData.add("d-block");
          hasEmptyField = true;
        } else {
          errorData.remove("d-block");
          errorData.add("d-none");
          if (value == "" || value == undefined) {
            formDataObject[key] = imgSrc;
          } else {
            formDataObject[key] = value;
          }
        }
      } else {
        const value = file[i].files;
        const multiImage = e.target.querySelectorAll(
          `#${key}-multiImage`
        )[0].children;
        const multiImageArray = [];
        for (let i = 0; i < multiImage.length; i++) {
          const newAttre = multiImage[i]?.children;
          if (!newAttre[0].attributes["data-new"]) {
            multiImageArray.push(multiImage[i].children[0].src);
          }
        }
        const finalValue = [...multiImageArray, ...value];
        console.log("finalValue", finalValue);

        if (finalValue <= 0) {
          errorData.remove("d-none");
          errorData.add("d-block");
          hasEmptyField = true;
        } else {
          errorData.remove("d-block");
          errorData.add("d-none");
          formDataObject[key] = finalValue;
        }
      }
    }
  }

  // Radio Buttons Validation
  const radio = e.target.querySelectorAll('input[type="radio"]');
  console.log("radio==========", radio);
  var radioBtn = [];
  for (let i = 0; i < radio.length; i++) {
    radioBtn.push(radio[i].name);
  }
  console.log("radioBtn==========", Array.from(new Set(radioBtn)));
  const radioArray = Array.from(new Set(radioBtn));
  for (let i = 0; i < radioArray.length; i++) {
    const allRadio = e.target.elements[radioArray[i]];
    if (allRadio.value == "") {
      for (let i = 0; i < allRadio.length; i++) {
        allRadio[i].classList.add("error-radio");
        allRadio[i].previousSibling.classList.add("text-danger");
      }
      hasEmptyField = true;
    } else {
      for (let i = 0; i < allRadio.length; i++) {
        allRadio[i].classList.remove("error-radio");
        allRadio[i].previousSibling.classList.remove("text-danger");
        console.log("radioArray", radioArray);
        console.log("allRadio.value", allRadio.value);
      }
      formDataObject[radioArray[i]] = allRadio.value;
    }
  }


  if (hasEmptyField) {
    return; // Prevent form submission if there are empty fields
  }
 
  return formDataObject;
};

export const editData = (editData) => {
  for (const key in editData) {
    if (editData.hasOwnProperty(key)) {
      const value = editData[key];

      const inputElements = document.querySelectorAll(`[name="${key}"]`);



      if (inputElements.length > 0) {
        const inputType = inputElements[0].type;
        console.log("inputType", inputType);

        if (inputType === "radio" || inputType === "checkbox") {
          for (const radio of inputElements) {
            if (radio.value === value || radio.value == value.toString()) {
              radio.checked = true;
            }
          }
        } else if (inputType === "file") {
          if (typeof value == "string") {
            const imgSibling = document.querySelector(`[data-image="${key}"]`);

            if (imgSibling) {
              // imgSibling.src = baseURL + value;
              imgSibling.src = value;
              imgSibling.className = "showImage d-block";
            }
          } else {
            const imageValue = document.getElementById(`${key}-multiImage`);
            if (imageValue.children.length <= 0) {
              for (let i = 0; i < value.length; i++) {

                const imageTag = document.createElement("img");
                const divTag = document.createElement("div");
                const removeDiv = document.createElement("div");
                // imageTag.src = baseURL + value[i];
                imageTag.src = value[i];
                imageTag.setAttribute("data-class", "showImage");
                divTag.appendChild(imageTag);
                divTag.appendChild(removeDiv);
                removeDiv.setAttribute("data-remove", "remove");
                removeDiv.classList.add("ri-close-line");
                divTag.setAttribute("data-index", "index");
                imageValue.appendChild(divTag);
              }
            }
          }
        } else {
          console.log("inputElements-----", inputElements[0].value);
          console.log("inputElements-----[0].value", value);
          inputElements[0].value = value;
        }
      }
    }
  }
};




export function objectToFormData(obj) {
  const formData = new FormData();

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((fileSet, index) => {
        if (Array.isArray(fileSet)) {
          fileSet.forEach((file, fileIndex) => {
            formData.append(`${key}[${index}][${fileIndex}]`, file);
          });
        } else {
          // Handle non-array case (e.g., profileImage: Array(2))
          formData.append(`${key}[${index}]`, fileSet);
        }
      });
    } else {
      formData.append(key, obj[key]);
    }
  }

  return formData;
}

export const generateNum = (length, id) => {
  const createId = parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
  $(`#${id}`)[0].value = createId
}