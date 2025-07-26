import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../extras/Pagination";
import Table from "../../extras/Table";
import { useEffect, useState } from "react";
import { getSalonWithDraw } from "../../../redux/slice/withDrawSlice";
import moment from "moment";

const RejectSalonReq = ({ status, startDate, endDate }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { expertWithDraw, total, salonWithDraw } = useSelector((state) => state.withDraw);
    const dispatch = useDispatch()
    const { setting } = useSelector((state) => state.setting)

    useEffect(() => {
        const payload = {
            start: page, limit: rowsPerPage, status: status, startDate: startDate === "ALL" ? "All" : startDate, endDate: endDate === "ALL" ? "All" : endDate
        }
        dispatch(getSalonWithDraw(payload))
    }, [startDate, endDate, page, rowsPerPage, status])
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

    const rejectedTable = [
        {
            Header: "SR NO",
            Cell: ({ index }) => (
                <span>{page * rowsPerPage + parseInt(index) + 1}</span>
            )
        },
        {
            Header: "Salon Image",
            Cell: ({ row }) => (
                <>
                    <img src={row?.expert?.image} alt="expert" width="80" height="80" style={{ objectFit: "contain", cursor: "pointer" }} onClick={(e) => {
                        handleOpenImgae(row?.expert?.image)
                    }} />
                </>
            )
        },
        {
            Header: "Salon Name",
            Cell: ({ row }) => (
                <>
                    <div>{row?.salon?.name  ? row?.salon?.name  : "-"}</div>
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
                data={salonWithDraw}
                mapData={rejectedTable}
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
export default RejectSalonReq