import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import Title from "../../extras/Title";
import {
  deleteService,
  getAllServices,
  getParticularSalonService,
} from "../../../redux/slice/serviceSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ServiceDialogue from "./ServiceDialogue";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import { confirmAction } from "../../../util/Alert";
import ServiceEditDialogue from "./ServiceEditDialogue";

const Service = () => {
  const dispatch = useDispatch();

  const { service, particularService } = useSelector((state) => state.service);
  const { setting } = useSelector((state) => state.setting);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  const [data, setData] = useState([]);
  const [particular, setParticular] = useState([]);

  useEffect(() => {
    dispatch(getAllServices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getParticularSalonService());
  }, [dispatch]);

  useEffect(() => {
    setData(service);
  }, [service]);

  useEffect(() => {
    setParticular(particularService);
  }, [particularService]);

  const handleDelete = (id) => {
    confirmAction(ui.servicesPage.removeConfirm, ui.servicesPage.removeBtn).then(
      (result) => {
        if (result.isConfirmed) {
          dispatch(deleteService(id));
          dispatch(getAllServices());
          dispatch(getParticularSalonService());
        }
      }
    );
  };

  return (
    <div className="mainCategory sq-service-page">
      <Title name={ui.nav.services} />

      <div className="row g-3">
        <div className="col-lg-4 col-12">
          <div className="sq-service-panel card-sq">
            <div className="sq-service-panel__head">
              <h3 className="sq-service-panel__title">{ui.servicesPage.catalogTitle}</h3>
              <p className="sq-service-panel__hint">{ui.servicesPage.catalogHint}</p>
            </div>
            <div className="sq-service-panel__body sq-service-panel__body--y">
              {data?.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className="sq-service-pick-item"
                  onClick={() =>
                    dispatch(openDialog({ type: "service", data: item }))
                  }
                >
                  <img
                    src={item?.image}
                    alt=""
                    className="sq-service-pick-item__img"
                  />
                  <div className="sq-service-pick-item__meta">
                    <span className="sq-service-pick-item__name">{item?.name}</span>
                    <span className="sq-service-pick-item__sub">
                      {item?.duration} {ui.servicesPage.minutes}
                    </span>
                  </div>
                  <span className="sq-service-pick-item__action" aria-hidden>
                    <i className="ri-add-line" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8 col-12">
          <div className="sq-service-panel card-sq">
            <div className="sq-service-panel__head">
              <h3 className="sq-service-panel__title">{ui.servicesPage.salonListTitle}</h3>
              <p className="sq-service-panel__hint">{ui.servicesPage.salonListHint}</p>
            </div>
            <div className="sq-service-panel__body sq-service-panel__body--y">
              {particular?.map((item) => (
                <div key={item?.id?._id || item?._id} className="sq-service-salon-item">
                  <img
                    src={item?.id?.image}
                    alt=""
                    className="sq-service-salon-item__img"
                  />
                  <div className="sq-service-salon-item__meta">
                    <span className="sq-service-salon-item__name">{item?.id?.name}</span>
                    <span className="sq-service-salon-item__sub">
                      {setting?.currencySymbol} {item?.price} · {item?.id?.duration}{" "}
                      {ui.servicesPage.minutes}
                    </span>
                  </div>
                  <div className="sq-service-salon-item__actions">
                    <button
                      type="button"
                      className="sq-service-salon-item__btn sq-service-salon-item__btn--edit"
                      aria-label="Modifier"
                      onClick={() =>
                        dispatch(
                          openDialog({
                            type: "serviceEdit",
                            data: {
                              _id: item?.id?._id,
                              name: item?.id?.name,
                              price: item?.price,
                              duration: item?.id?.duration,
                              cities: item?.allowCities || [],
                            },
                          })
                        )
                      }
                    >
                      <i className="ri-pencil-line" />
                    </button>
                    <button
                      type="button"
                      className="sq-service-salon-item__btn sq-service-salon-item__btn--delete"
                      aria-label="Retirer"
                      onClick={() => handleDelete(item?.id?._id)}
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {dialogue && dialogueType === "service" && <ServiceDialogue />}
      {dialogue && dialogueType === "serviceEdit" && <ServiceEditDialogue />}
    </div>
  );
};

export default Service;
