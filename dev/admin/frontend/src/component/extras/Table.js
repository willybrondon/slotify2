/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { isSkeleton } from "../../util/allSelector";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function Table(props) {
  const roleSkeleton = useSelector(isSkeleton);
  const { data, mapData, Page, PerPage, onChildValue, className, id, thClick } =
    props;
  const location = useLocation();
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleColumnClick = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData =
    data?.length > 0 &&
    [...data]?.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

  const handleClick = (value) => {
    // Replace with your actual value
    onChildValue(value); // Invoke the callback function in the parent component
  };

  return (
    <div className="mainTable" id={id}>
      <table width="100%" border className={`primeTable  ${className}`}>
        {roleSkeleton ? (
          <>
            <thead>
              <tr>
                {mapData.map((res, i) => {
                  return (
                    <th className={` ${res.thClass}`} key={i} width={res.width} style={{ minWidth: res.width ? res.width : "100px" }}>
                      <div className={`${res.thClass}`} style={{height:"20px"}}>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {Array(6)
                .fill()
                .map((res, i) => {
                  return (
                    <>
                      <tr key={i} style={{ height: "80px" }}>
                        {mapData?.map((res, ind) => {
                          return (
                            <td key={ind}>
                              <div
                                className="skeleton"
                                style={{ height: "20px", width: "70%" }}
                              ></div>
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  );
                })}
            </tbody>
          </>
        ) : (
          <>
            <thead>
              <tr>
                {mapData.map((res, i) => {
                  return (
                    <th
                      className={`text-uppercase ${res.thClass}`}
                      key={i}
                      width={res.width}
                      onClick={res?.thClick}
                    >
                      {`${" "}${res.Header}`}
                      {res?.sorting?.type === "server" && (
                        <i
                          className="ri-expand-up-down-fill deg90 ms-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClick(res.body)}
                        ></i>
                      )}
                      {res?.sorting?.type === "client" && (
                        <i
                          className="ri-expand-up-down-fill deg90 ms-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleColumnClick(res.body)}
                        ></i>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                <>
                  {(PerPage > 0
                    ? sortedData.slice(Page * PerPage, Page * PerPage + PerPage)
                    : sortedData
                  ).map((i, k) => {
                    return (
                      <>
                        <tr key={k}>
                          {mapData?.map((res, ind) => {
                            return (
                              <td key={ind} className={res.tdClass}>
                                {res.Cell ? (
                                  <res.Cell row={i} index={k} />
                                ) : (
                                  <span>{i[res?.body]}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    );
                  })}
                </>
              ) : (
                <tr>
                  <td colSpan="25" className="text-center">
                    No Data Found !
                  </td>
                </tr>
              )}
            </tbody>
          </>
        )}
      </table>
    </div>
  );
}

export default Table;
