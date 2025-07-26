import React, { useEffect, useState } from "react";
import Button from "../../extras/Button";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog } from "../../../redux/slice/dialogueSlice";
import Multiselect from "multiselect-react-dropdown";
import { ExInput } from "../../extras/Input";
import { getAllCity } from "../../../redux/slice/citySlice";
import { allowCity, blockCity } from "../../../redux/slice/productSlice";
import { getProducts } from "../../../redux/slice/productSlice";

const ProductCityDialogue = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const { city } = useSelector((state) => state.city);
  const { admin } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    selectedCities: [],
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [citiesToBlock, setCitiesToBlock] = useState([]);

  useEffect(() => {
    dispatch(getAllCity());
  }, [dispatch]);

  useEffect(() => {
    if (city?.data) {
      const formattedCities = city.data.map((cityData) => ({
        name: cityData.city,
        id: cityData.city,
        country: cityData.country,
      }));
      setCityOptions(formattedCities);
    }
  }, [city]);

  useEffect(() => {
    if (dialogueData) {
      const formattedSelectedCities = dialogueData?.allowCities?.map(city => ({
        name: city.city,
        id: city.city,
        country: city.country
      })) || [];
      
      setFormData({
        name: dialogueData?.productName || "",
        selectedCities: formattedSelectedCities
      });
    }
  }, [dialogueData]);

  useEffect(() => {
    if (dialogueData?.allowCities) {
      const currentAllowedCities = dialogueData.allowCities.map(city => ({
        name: city.city,
        id: city.city,
        country: city.country
      }));
      setCitiesToBlock([]);
    }
  }, [dialogueData]);

  function onSelect(selectedList, selectedItem) {
    setFormData({
      ...formData,
      selectedCities: selectedList,
    });
  }

  function onRemove(selectedList, removedItem) {
    setFormData({
      ...formData,
      selectedCities: selectedList,
    });
  }

  function onSelectBlock(selectedList, selectedItem) {
    setCitiesToBlock(selectedList);
  }

  function onRemoveBlock(selectedList, removedItem) {
    setCitiesToBlock(selectedList);
  }

  const handleSubmit = async () => {
    const existingCities = dialogueData?.allowCities || [];
    
    const newCities = formData.selectedCities.filter(selectedCity => 
      !existingCities.some(existingCity => 
        existingCity.city === selectedCity.name && 
        existingCity.country === selectedCity.country
      )
    );
    
    const citiesToRemove = citiesToBlock.map(city => ({
      city: city.name,
      country: city.country
    }));

    const promises = [];

    if (newCities.length > 0) {
      const allowPayload = {
        productId: dialogueData?._id,
        allowCities: newCities.map((city) => ({
          city: city.name,
          country: city.country
        })),
      };
      promises.push(dispatch(allowCity(allowPayload)));
    }

    if (citiesToRemove.length > 0) {
      const blockPayload = {
        productId: dialogueData?._id,
        blockedCities: citiesToRemove,
      };
      promises.push(dispatch(blockCity(blockPayload)));
    }

    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          dispatch(closeDialog());
          dispatch(getProducts());
        })
        .catch((error) => {
          console.error("Error updating product:", error);
        });
    } else {
      dispatch(closeDialog());
    }
  };

  return (
    <div className="dialog">
      <div className="" style={{ width: "1200px" }}>
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-8 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0" style={{ fontSize: "1.5rem" }}>Manage Product Cities</h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => dispatch(closeDialog())}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>

              <div className="row align-items-start formBody">
                <div className="col-12 mb-3">
                  <ExInput
                    type="text"
                    value={formData.name}
                    label="Product Name"
                    readOnly={true}
                  />
                </div>
                <div className="col-12 mb-3">
                  <div className="inputData text flex-row justify-content-start text-start">
                    <label className="mb-2">Allow Cities</label>
                  </div>
                  <Multiselect
                    options={cityOptions}
                    selectedValues={formData.selectedCities}
                    onSelect={onSelect}
                    onRemove={onRemove}
                    displayValue="name"
                    hideOnClickOutside={false}
                  />
                </div>

                <div className="col-12 mb-3">
                  <div className="inputData text flex-row justify-content-start text-start">
                    <label className="mb-2">Block Cities</label>
                  </div>
                  <Multiselect
                    options={dialogueData?.allowCities?.map(city => ({
                      name: city.city,
                      id: city.city,
                      country: city.country
                    })) || []}
                    selectedValues={citiesToBlock}
                    onSelect={onSelectBlock}
                    onRemove={onRemoveBlock}
                    displayValue="name"
                    hideOnClickOutside={false}
                  />
                </div>

                <div className="row formFooter mt-4">
                  <div className="col-12 text-end m0">
                    <Button
                      className="bg-gray text-light"
                      text="Cancel"
                      type="button"
                      onClick={() => dispatch(closeDialog())}
                    />
                    <Button
                      type="submit"
                      className="text-white m10-left"
                      style={{ backgroundColor: "#1ebc1e" }}
                      text="Update"
                      onClick={handleSubmit}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCityDialogue;