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
              {particular?.map((item) => {
                const dc = item?.detailCard;
                const hasDetail =
                  Boolean(dc) &&
                  Boolean(
                    (dc.shortDescription && String(dc.shortDescription).trim()) ||
                      (Array.isArray(dc.includes) && dc.includes.length) ||
                      (Array.isArray(dc.prepMust) && dc.prepMust.length) ||
                      (Array.isArray(dc.prepAvoid) && dc.prepAvoid.length) ||
                      (Array.isArray(dc.addons) && dc.addons.length) ||
                      dc.inspirationPhotoEnabled ||
                      (dc.importantNote && String(dc.importantNote).trim()) ||
                      (dc.depositPercent != null && dc.depositPercent !== "")
                  );
                return (
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
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: hasDetail ? "#1b7a3d" : "#8a6a00",
                        background: hasDetail ? "#e8f7ee" : "#fff7e0",
                        borderRadius: 999,
                        padding: "2px 8px",
                      }}
                    >
                      {hasDetail
                        ? ui.servicesPage.detailCardConfigured
                        : ui.servicesPage.detailCardEmpty}
                    </span>
                  </div>
                  <div className="sq-service-salon-item__actions">
                    <button
                      type="button"
                      className="sq-service-salon-item__btn sq-service-salon-item__btn--edit"
                      aria-label={ui.servicesPage.editService}
                      title={ui.servicesPage.editService}
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
                              detailCard: item?.detailCard || null,
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
                );
              })}
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
