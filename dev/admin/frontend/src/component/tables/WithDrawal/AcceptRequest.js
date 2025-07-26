import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptWithDraw, getExpertWithDraw, rejectedWithDraw } from "../../../redux/slice/withDrawSlice";
import Table from "../../extras/Table";
import { toast } from "react-toastify";
import Button from "../../extras/Button";
import { ExInput } from "../../extras/Input";
import Pagination from "../../extras/Pagination";
import moment from "moment";



const AcceptRequest = ({ status, startDate, endDate }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { expertWithDraw, total } = useSelector((state) => state.withDraw);
    const dispatch = useDispatch()
    const { setting } = useSelector((state) => state.setting)

    useEffect(() => {
        const payload = {
            start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
        }
        dispatch(getExpertWithDraw(payload))
    }, [startDate, endDate])
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };
    const handleOpenImgae = (image) => {
        window.open(image, "_blank");
    }

    const acceptTable = [
        {
            Header: "SR NO",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            )
        },
        {
            Header: "Expert Image",
            Cell: ({ row }) => (
                <>
                    <img src={row?.expert?.image} alt="expert" width="80" height="80" style={{ objectFit: "contain", cursor: "pointer" }} onClick={(e) => {
                        handleOpenImgae(row?.expert?.image)
                    }} />
                </>
            )
        },
        {
            Header: "Expert Name",
            Cell: ({ row }) => (
                <>
                    <div>{row?.expert?.fname + " " + row?.expert?.lname ? row?.expert?.fname + " " + row?.expert?.lname : "-"}</div>
                </>
            )
        },
        {
            Header: `Amount (${setting?.currencySymbol})`,
            Cell: ({ row }) => (
                <>
                    <div>{row?.amount ? row?.amount : "-"}</div>
                </>
            )
        },
        {
            Header: "Date",
            Cell: ({ row }) => (
                <>
                    <div>{row?.paymentDate ? row?.paymentDate : "-"}</div>
                </>
            )
        },
    ]
    return (
        <>
            <Table
                data={expertWithDraw}
                mapData={acceptTable}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
            />
            <Pagination
                type={"server"}
                serverPage={page}
                setServerPage={setPage}
                serverPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                totalData={total}
            />
        </>
    )
}
export default AcceptRequest;   