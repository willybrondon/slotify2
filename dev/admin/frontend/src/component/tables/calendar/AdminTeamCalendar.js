import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import { fetchAdminTeamSchedule } from "../../../redux/slice/teamScheduleSlice";
import { getAllSalons } from "../../../redux/slice/salonSlice";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import "./TeamCalendar.css";

const localizer = momentLocalizer(moment);

const STATUS_COLORS = {
  booking: {
    pending: "#3be4ed",
    confirm: "#22c55e",
    completed: "#6366f1",
    cancel: "#ef4444",
  },
  busy: "#94a3b8",
  break: "#fbbf24",
  free: "#e8f5e9",
};

const OPERATIONAL_LABELS = {
  available: "Disponible",
  busy: "Occupé",
  off: "Hors service",
  break: "Pause",
  blocked: "Bloqué",
};

const OPERATIONAL_COLORS = {
  available: "#22c55e",
  busy: "#ef4444",
  off: "#9ca3af",
  break: "#f59e0b",
  blocked: "#64748b",
};

function eventStyleGetter(event) {
  let backgroundColor = "#22c55e";
  let opacity = 0.92;
  let color = "#fff";
  let border = "none";

  if (event.type === "free") {
    backgroundColor = STATUS_COLORS.free;
    color = "#166534";
    opacity = 0.55;
    border = "1px dashed #86efac";
  } else if (event.type === "busy") {
    backgroundColor = STATUS_COLORS.busy;
  } else if (event.type === "break") {
    backgroundColor = STATUS_COLORS.break;
    color = "#78350f";
  } else if (event.type === "booking") {
    backgroundColor =
      STATUS_COLORS.booking[event.status] || STATUS_COLORS.booking.confirm;
  }

  return {
    style: { backgroundColor, opacity, color, border, borderRadius: "6px", fontSize: "12px" },
  };
}

const AdminTeamCalendar = () => {
  const dispatch = useDispatch();
  const { schedule, isLoading } = useSelector((state) => state.teamSchedule);
  const { salon } = useSelector((state) => state.salon);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [view, setView] = useState("day");
  const [showFreeSlots, setShowFreeSlots] = useState(true);

  const dateStr = moment(currentDate).format("YYYY-MM-DD");

  useEffect(() => {
    dispatch(getAllSalons({ start: 0, limit: 200, search: "ALL" }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSalon && salon?.length) {
      setSelectedSalon(salon[0]._id);
    }
  }, [salon, selectedSalon]);

  const loadSchedule = useCallback(() => {
    if (!selectedSalon) return;
    dispatch(fetchAdminTeamSchedule({ salonId: selectedSalon, date: dateStr, view }));
  }, [dispatch, selectedSalon, dateStr, view]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const calendarEvents = useMemo(() => {
    if (!schedule?.events) return [];
    return schedule.events
      .filter((e) => showFreeSlots || e.type !== "free")
      .map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        title:
          e.type === "booking"
            ? `${e.title} (${e.status === "confirm" ? "Confirmé" : e.status})`
            : e.title,
      }));
  }, [schedule, showFreeSlots]);

  const resources = useMemo(() => {
    return (schedule?.resources || []).map((r) => ({
      resourceId: r.resourceId,
      resourceTitle: r.resourceTitle,
    }));
  }, [schedule]);

  return (
    <div className="team-calendar-page">
      <Title name={ui.pages.teamCalendar} />

      <div className="mb-3">
        <label className="me-2">Salon</label>
        <select
          className="form-select w-auto d-inline-block"
          value={selectedSalon}
          onChange={(e) => setSelectedSalon(e.target.value)}
        >
          {(salon || []).map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {schedule && (
        <div className="team-calendar-stats row g-3 mb-3">
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <span className="stat-label">Pros</span>
              <strong>{schedule.stats?.totalExperts ?? 0}</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card stat-available">
              <span className="stat-label">Disponibles</span>
              <strong>{schedule.stats?.availableCount ?? 0}</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card stat-busy">
              <span className="stat-label">Occupés</span>
              <strong>{schedule.stats?.busyCount ?? 0}</strong>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card stat-off">
              <span className="stat-label">Hors service</span>
              <strong>{schedule.stats?.offCount ?? 0}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="team-expert-status row g-2 mb-3">
        {(schedule?.resources || []).map((r) => (
          <div key={r.resourceId} className="col-md-4 col-lg-3">
            <div className="expert-status-chip">
              <span
                className="status-dot"
                style={{
                  backgroundColor:
                    OPERATIONAL_COLORS[r.operationalStatus] || "#9ca3af",
                }}
              />
              <span className="expert-name">{r.resourceTitle}</span>
              <span className="status-text">
                {OPERATIONAL_LABELS[r.operationalStatus] || r.operationalStatus}
                {r.occupancyRate != null ? ` · ${r.occupancyRate}%` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={`team-calendar-wrap ${isLoading ? "is-loading" : ""}`}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          resources={view === "day" ? resources : undefined}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          defaultView="day"
          view={view}
          onView={setView}
          views={["day", "week", "agenda"]}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          min={new Date(1970, 0, 1, 8, 0)}
          max={new Date(1970, 0, 1, 21, 0)}
          style={{ height: 720 }}
          popup
        />
      </div>
    </div>
  );
};

export default AdminTeamCalendar;
