import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import Button from "../../extras/Button";
import Pagination from "../../extras/Pagination";
import Title from "../../extras/Title";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { useNavigate } from "react-router-dom";
import Male from "../../../assets/images/male.png";
import { getProducts, updateOutOfStockProduct } from "../../../redux/slice/productSlice";
import { toast } from "react-toastify";
import ProductCityDialogue from "./ProductCityDialogue";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const p = ui.productsPage;
  const { product, total } = useSelector((state) => state.product);
  const { setting } = useSelector((state) => state.setting);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getProducts({ start: page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    setData(product || []);
  }, [product]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (value) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  const statusBadge = (status) => {
    if (status === "Pending") {
      return <span className="sq-badge sq-badge--pending">{p.statusPending}</span>;
    }
    if (status === "Approved") {
      return <span className="sq-badge sq-badge--success">{p.statusApproved}</span>;
    }
    if (status === "Rejected") {
      return <span className="sq-badge sq-badge--danger">{p.statusRejected}</span>;
    }
    return null;
  };

  const stockLabel = (item) => {
    if (item?.isOutOfStock) return p.outOfStock;
    const qty = Number(item?.quantity ?? 0);
    if (qty <= 5) return p.lowStock;
    return p.inStock;
  };

  const handleAddProduct = (row) => {
    navigate("/salonpanel/addProduct", row ? { state: { row } } : undefined);
  };

  const handleInfo = (id) => {
    navigate("/salonpanel/productDetails", { state: { id } });
  };

  const handleCities = (row) => {
    dispatch(
      openDialog({
        type: "productCities",
        data: {
          _id: row._id,
          productName: row.productName,
          allowCities: row.allowCities || [],
        },
      })
    );
  };

  const handleStockToggle = (row) => {
    dispatch(updateOutOfStockProduct(row?._id)).then((res) => {
      if (res?.payload?.status) {
        toast.success(res?.payload?.message || ui.toast.stockUpdated);
        dispatch(getProducts({ start: page, limit: rowsPerPage }));
      } else {
        toast.error(res?.payload?.message || ui.toast.oops);
      }
    });
  };

  const canEdit = (row) => row?.createStatus !== "Rejected";

  return (
    <div className="mainCategory sq-service-page sq-table-page">
      <Title name={ui.pages.products} />

      <div className="sq-page-toolbar">
        <Button
          className="sq-btn-add"
          text={ui.labels.addProducts}
          bIcon="fa-solid fa-plus"
          onClick={() => handleAddProduct()}
        />
      </div>

      <div className="sq-service-panel card-sq">
        <div className="sq-service-panel__head">
          <h3 className="sq-service-panel__title">{p.listTitle}</h3>
          <p className="sq-service-panel__hint">{p.listHint}</p>
        </div>
        <div className="sq-service-panel__body sq-service-panel__body--y">
          {data?.length === 0 && (
            <p className="text-muted small px-2 py-3 mb-0">Aucun produit pour le moment.</p>
          )}
          {data?.map((item) => (
            <div key={item._id} className="sq-service-salon-item sq-product-item">
              <img
                src={item?.mainImage || Male}
                alt=""
                className="sq-service-salon-item__img"
                onError={(e) => {
                  e.target.src = Male;
                }}
              />
              <div className="sq-service-salon-item__meta">
                <span className="sq-service-salon-item__name">{item?.productName}</span>
                <span className="sq-service-salon-item__sub">
                  {setting?.currencySymbol} {item?.price}
                  {item?.mrp ? ` · MRP ${item.mrp}` : ""}
                  {item?.category?.name ? ` · ${item.category.name}` : ""}
                </span>
                <span className="sq-service-salon-item__sub d-flex flex-wrap align-items-center gap-1">
                  {p.stock}: {item?.quantity ?? 0} · {stockLabel(item)}
                </span>
                <span className="sq-service-salon-item__sub">{statusBadge(item?.createStatus)}</span>
              </div>
              <div className="sq-service-salon-item__actions sq-product-item__actions">
                <ToggleSwitch
                  value={item?.isOutOfStock}
                  onClick={() => handleStockToggle(item)}
                />
                <button
                  type="button"
                  className="sq-service-salon-item__btn sq-service-salon-item__btn--edit"
                  aria-label={p.cities}
                  title={p.cities}
                  onClick={() => handleCities(item)}
                >
                  <i className="ri-map-pin-line" />
                </button>
                <button
                  type="button"
                  className="sq-service-salon-item__btn sq-service-salon-item__btn--edit"
                  aria-label={p.details}
                  onClick={() => handleInfo(item._id)}
                >
                  <i className="ri-information-line" />
                </button>
                <button
                  type="button"
                  className="sq-service-salon-item__btn sq-service-salon-item__btn--edit"
                  aria-label={p.edit}
                  disabled={!canEdit(item)}
                  title={!canEdit(item) ? p.pendingEditHint : p.edit}
                  onClick={() => canEdit(item) && handleAddProduct(item)}
                >
                  <i className="ri-pencil-line" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Pagination
        type="server"
        serverPage={page}
        setServerPage={setPage}
        serverPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalData={total ?? 0}
      />

      {dialogue && dialogueType === "productCities" && <ProductCityDialogue />}
    </div>
  );
};

export default Products;
