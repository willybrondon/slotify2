/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Button from "../../extras/Button";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import ToggleSwitch from "../../extras/ToggleSwitch";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Title from "../../extras/Title";
import {
  getAllCategory,
  categoryDelete,
} from "../../../redux/slice/categorySlice";
import {  warning } from "../../../util/Alert";
import { ReactComponent as Delete } from "../../../assets/icon/delete.svg";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryDialogue from "./CategoryDialogue";
import { ReactComponent as Edit } from "../../../../src/assets/icon/edit.svg";

const Category = () => {
  const { category, total } = useSelector((state) => state.category);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const [data, setData] = useState([]);
;
  useEffect(() => {
    dispatch(getAllCategory());
  }, []);

  useEffect(() => {
    setData(category);
  }, [category]);

  const dispatch = useDispatch();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const [search, setSearch] = useState("");

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  function openImage(imageUrl) {
    window.open(imageUrl, "_blank");
  }

  const categoryTable = [
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
            src={row?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            onClick={() => openImage(row?.image)}
            height={`100%`}
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
      Header: "Action",
      Cell: ({ row }) => (
        <span>
          <button
            className="py-1 me-2"
            style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
            onClick={() => {
              dispatch(openDialog({ type: "category", data: row }));
            }}
          >
            <Edit />
          </button>
          <button
            className="py-1"
            style={{ backgroundColor: "#FFF1F1", borderRadius: "8px" }}
            onClick={() => handleDelete(row?._id)}
          >
            <Delete />
          </button>
        </span>
      ),
    },
  ];

  const handleDelete = (id) => {

    const data = warning("Delete");
    data
      .then((logouts) => {
        const yes = logouts.isConfirmed;
        if (yes) {
          dispatch(categoryDelete(id));
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="mainCategory">
      <Title name="Category" />
      <Button
        className={`bg-button p-10 text-white m20-bottom`}
        text={`Add category`}
        bIcon={`fa-solid fa-user-plus`}
        onClick={() => {
          dispatch(openDialog({ type: "category" }));
        }}
      />
      <div>
        <Table
          data={data}
          mapData={categoryTable}
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
      {dialogue && dialogueType === "category" && (
        <CategoryDialogue
          setData={setData}
          data={data}
        />
      )}
    </div>
  );
};

export default Category;
