import { useDispatch, useSelector } from "react-redux";
import { openDialog } from "../../../redux/slice/dialogueSlice";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import { useEffect, useState } from "react";
import { getAllAttributes } from "../../../redux/slice/attributeSlice";
import Table from "../../extras/Table";
import Pagination from "../../extras/Pagination";
import AttributeDialogue from "./AttributeDialogue";
import { ReactComponent as Edit } from "../../../../src/assets/icon/edit.svg";

const Attribute = () => {
  const dispatch = useDispatch();
  const { attributes } = useSelector((state) => state.attributes);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const [page, setPage] = useState(0);
  useEffect(() => {
    dispatch(getAllAttributes());
  }, []);
  useEffect(() => {
    setData(attributes);
  }, [attributes]);
  const handleChangePage = (event, newPage) => {

    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };
  const attributeTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Details",
      Cell: ({ row }) => {
        const details = row?.value?.join(', ');
        const words = details.split(' ');
        const trimmedDetails = words.length > 10 ? words.slice(0, 10).join(' ') + "..." : details;

        return (
          <span className="text-capitalize fw-bold">
            {trimmedDetails}
          </span>
        );
      },
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
              dispatch(openDialog({ type: "attribute", data: row }));
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
      <Title name="Attribute" />
      <Button
        className={`bg-button p-10 text-white m20-bottom`}
        text={`Add Attribute`}
        bIcon={`fa-solid fa-user-plus`}
        onClick={() => {
          dispatch(openDialog({ type: "attribute" }));
        }}
      />
      <div>
        <Table
          data={data}
          mapData={attributeTable}
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
      {dialogue && dialogueType === "attribute" && (
        <AttributeDialogue
          setData={setData}
          data={data}
        />
      )}
    </div>
  );
};
export default Attribute;
