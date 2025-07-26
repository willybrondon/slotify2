import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProductCategory,
  productCategoryStatus,
} from "../../../redux/slice/productCategorySlice";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import ProductCategoryDialogue from "./ProductCategoryDialogue";
import ToggleSwitch from "../../extras/ToggleSwitch";

import noImage from "../../../assets/images/female.png";
import { ReactComponent as Edit } from "../../../../src/assets/icon/edit.svg";
import { toast } from "react-toastify";

const ProductCategory = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const { productCategory } = useSelector((state) => state.productCategory);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
;

  useEffect(() => {
    dispatch(getAllProductCategory());
  }, []);
  useEffect(() => {
    setData(productCategory);
  }, [productCategory]);
  const handleChangePage = (event,newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  function openImage(imageUrl) {
    window.open(imageUrl, "_blank");
  }
  const handleStatus = (id) => {


    dispatch(productCategoryStatus(id)).then((res) => {
      if (res?.payload?.status) {
        dispatch(getAllProductCategory());
        toast.success(res?.payload?.message);
      }
    });
  };
  const productCategoryTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image ? row?.image : noImage}
            alt="Product Category"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", objectFit: "cover" }}
            onClick={() => openImage(row?.image)}
          />
        </div>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.createdAt.split("T")[0]}</span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => handleStatus(row?._id)}
        />
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => {
              dispatch(openDialog({ type: "productCategory", data: row }));
            }}
          >
            <Edit />
          </button>
        </span>
      ),
    },
  ];
  return (
    <div className="mainCategory">
      <Title name="Product Category" />
      <Button
        className={`bg-button p-10 text-white m20-bottom`}
        text={`Add Product Category`}
        bIcon={`fa-solid fa-user-plus`}
        onClick={() => {
          dispatch(openDialog({ type: "productCategory" }));
        }}
      />
      <div>
        <Table
          data={data}
          mapData={productCategoryTable}
          PerPage={rowsPerPage}
          Page={page}
          type={"client"}
        />
        <Pagination
          type={"client"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={data?.length}
        />
      </div>
      {dialogue && dialogueType === "productCategory" && (
        <ProductCategoryDialogue
          setData={setData}
          data={data}
        />
      )}
    </div>
  );
};
export default ProductCategory;
