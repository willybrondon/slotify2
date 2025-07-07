import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookings } from "../../../redux/slice/bookingSlice";
import { getHoliday } from "../../../redux/slice/holidaySlice";

const Appointment = () => {
  const [calendarWeekends, setCalendarWeekends] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState([
    // initial event data
    { title: "Event Now", start: new Date() },
  ]);
  const calendarComponentRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [appointmentId, setAppointmentId] = useState("");
  const [date, setDate] = useState("    ");

  const { booking } = useSelector((state) => state.booking);
  const { holiday } = useSelector((state) => state.holiday);
  const dispatch = useDispatch();

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      type: "ALL",
      startDate,
      endDate,
    };
    dispatch(getAllBookings(payload));
  }, []);
  useEffect(() => {
    const payload = {
      start: 0,
      limit: 10000,
      startDate,
      endDate,
    };
    dispatch(getHoliday(payload));
  }, [page, rowsPerPage, startDate, endDate]);

  const events = booking?.map((item) => ({
    title: item.user.fname + " " + item.user.lname,
    start: item.createdAt,
    end: item.end,
    backgroundColor:
      (item.status === "pending" && "#3be4ed") ||
      (item.status === "confirm" && "#ffd400") ||
      (item.status === "completed" && "green") ||
      (item.status === "cancel" && "red"),
    plugins: [timeGridPlugin],
    initialView: "timeGridFourDay",
    views: {
      timeGridFourDay: {
        type: "timeGrid",
        duration: { days: 4 },
      },
    },
  }));

  const handleDateClick = (arg) => {
    console.log("arg.date", arg.date);
    if (
      window.confirm("Would you like to add an event to " + arg.dateStr + " ?")
    ) {
      setCalendarEvents([
        ...calendarEvents,
        { title: "New Event", start: arg.date, allDay: arg.allDay },
      ]);
    }

  };

  const eventDrop = (info) => {
    const { start, end } = info.oldEvent._instance.range;
    console.log(start, end);
    const { start: newStart, end: newEnd } = info.event._instance.range;
    console.log(newStart, newEnd);
    if (new Date(start).getDate() === new Date(newStart).getDate()) {
      info.revert();
    }
  };


  return (
    <>
      <div className="mainCategory">
        <div className="userTable">
          <div className="demo-app">
            <div className="demo-app-calendar">
              <FullCalendar
                editable={true}
                defaultView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                header={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                ref={calendarComponentRef}
                weekends={calendarWeekends}
                events={events}
                dateClick={handleDateClick}
                eventDrop={eventDrop}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Appointment;
