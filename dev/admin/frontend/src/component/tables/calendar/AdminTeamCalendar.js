import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import {
  fetchAdminTeamSchedule,
  rescheduleAdminPlanningBooking,
  resizeAdminPlanningBooking,
} from "../../../redux/slice/teamScheduleSlice";
import { getAllSalons } from "../../../redux/slice/salonSlice";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";
import { warning } from "../../../util/Alert";
import { parseWallClockDate } from "../../../util/scheduleDate";
import AdminPlanningBookingModal from "./AdminPlanningBookingModal";
import AdminPlanningBookingDetailModal from "./AdminPlanningBookingDetailModal";
import "./TeamCalendar.css";
import "./PlanningCalendar.css";

moment.locale("fr");
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const STATUS_COLORS = {
  booking: { pending: "#3be4ed", confirm: "#c45c26", completed: "#a84d1f", cancel: "#ef4444" },
  busy: "#94a3b8",
  break: "#fbbf24",
  free: "#fdf6f0",
};

const OPERATIONAL_LABELS = {
  available: "Disponible",
  busy: "Occupé",
  off: "Hors service",
  break: "Pause",
  blocked: "Bloqué",
};

const OPERATIONAL_COLORS = {
  available: "#c45c26",
  busy: "#ef4444",
  off: "#9ca3af",
  break: "#f59e0b",
  blocked: "#64748b",
};

function eventStyleGetter(event) {
  let backgroundColor = "#c45c26";
  let color = "#fff";
  let border = "none";
  let opacity = 0.92;
  const className = `sq-event sq-event--${event.type || "booking"}`;

  if (event.type === "free") {
    backgroundColor = STATUS_COLORS.free;
    color = "#7c4a2e";
    opacity = 0.9;
    border = "1px dashed rgba(196, 92, 38, 0.35)";
  } else if (event.type === "busy") backgroundColor = STATUS_COLORS.busy;
  else if (event.type === "break") {
    backgroundColor = STATUS_COLORS.break;
    color = "#78350f";
  } else if (event.type === "booking") {
    backgroundColor = STATUS_COLORS.booking[event.status] || STATUS_COLORS.booking.confirm;
  }

  return {
    className,
    style: {
      backgroundColor,
      opacity,
      color,
      border,
      borderRadius: "8px",
      fontSize: "12px",
      padding: "2px 6px",
      boxShadow: event.type === "booking" ? "0 2px 8px rgba(196, 92, 38, 0.2)" : "none",
    },
  };
}

function normalizeSchedule(schedule, focusDate) {
  if (!schedule) return null;
  if (schedule.events && schedule.stats) return schedule;
  if (schedule.days?.length) {
    const focusDay = schedule.days.find((d) => d.date === focusDate) || schedule.days[0];
    return {
      ...schedule,
      events: schedule.events || schedule.days.flatMap((d) => d.events || []),
      resources: schedule.resources?.length ? schedule.resources : focusDay?.resources || [],
      stats: focusDay?.stats || schedule.stats,
      calendarBounds: focusDay?.calendarBounds || schedule.calendarBounds,
      isHoliday: focusDay?.isHoliday ?? schedule.isHoliday,
    };
  }
  return schedule;
}

function formatSlotTime(date) {
  return moment(date).locale("en").format("hh:mm A");
}

const AdminTeamCalendar = () => {
  const dispatch = useDispatch();
  const { schedule: rawSchedule, isLoading } = useSelector((state) => state.teamSchedule);
  const { salon } = useSelector((state) => state.salon);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [view, setView] = useState("day");
  const [showFreeSlots, setShowFreeSlots] = useState(true);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [detailBookingId, setDetailBookingId] = useState(null);

  const dateStr = moment(currentDate).format("YYYY-MM-DD");
  const schedule = useMemo(() => normalizeSchedule(rawSchedule, dateStr), [rawSchedule, dateStr]);

  useEffect(() => {
    dispatch(getAllSalons({ start: 0, limit: 200, search: "ALL" }));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedSalon && salon?.length) setSelectedSalon(salon[0]._id);
  }, [salon, selectedSalon]);

  const loadSchedule = useCallback(() => {
    if (!selectedSalon) return;
    dispatch(fetchAdminTeamSchedule({ salonId: selectedSalon, date: dateStr, view }));
  }, [dispatch, selectedSalon, dateStr, view]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const mainAdmin = document.querySelector(".mainAdmin");
    const adminStart = document.querySelector(".adminStart");
    mainAdmin?.classList.add("sq-planning-active");
    adminStart?.classList.add("sq-planning-active");
    return () => {
      mainAdmin?.classList.remove("sq-planning-active");
      adminStart?.classList.remove("sq-planning-active");
    };
  }, []);

  const calendarBounds = useMemo(() => {
    const bounds = schedule?.calendarBounds;
    return {
      min: new Date(1970, 0, 1, bounds?.minHour ?? 8, bounds?.minMinute ?? 0),
      max: new Date(1970, 0, 1, bounds?.maxHour ?? 21, bounds?.maxMinute ?? 0),
      slotMinutes: bounds?.slotMinutes ?? 15,
    };
  }, [schedule]);

  const resourceTitleById = useMemo(() => {
    const map = {};
    (schedule?.resources || []).forEach((r) => {
      map[r.resourceId] = r.resourceTitle;
    });
    return map;
  }, [schedule]);

  const calendarEvents = useMemo(() => {
    if (!schedule?.events) return [];
    return schedule.events
      .filter((e) => showFreeSlots || e.type !== "free")
      .map((e) => ({
        ...e,
        resourceId: e.resourceId || e.expertId,
        start: parseWallClockDate(e.start),
        end: parseWallClockDate(e.end),
        title: e.type === "booking" ? `${e.title} (${e.status === "confirm" ? "Confirmé" : e.status})` : e.title,
      }))
      .filter((e) => !Number.isNaN(e.start?.getTime()) && !Number.isNaN(e.end?.getTime()));
  }, [schedule, showFreeSlots]);

  const resources = useMemo(
    () => (schedule?.resources || []).map((r) => ({ resourceId: r.resourceId, resourceTitle: r.resourceTitle })),
    [schedule]
  );

  const handleSelectSlot = ({ start, resourceId }) => {
    if (!resourceId || view !== "day" || !selectedSalon) return;
    setBookingSlot({
      expertId: resourceId,
      expertName: resourceTitleById[resourceId],
      date: dateStr,
      startTime: formatSlotTime(start),
    });
  };

  const handleSelectEvent = (event) => {
    if (event.type === "booking" && event.id) {
      setDetailBookingId(event.id);
    }
  };

  const handleEventDrop = async ({ event, start, resourceId }) => {
    if (event.type !== "booking" || !event.id || !selectedSalon) return;
    const confirm = await warning("Déplacer ce rendez-vous ?");
    if (!confirm?.isConfirmed) {
      loadSchedule();
      return;
    }
    try {
      await dispatch(
        rescheduleAdminPlanningBooking({
          salonId: selectedSalon,
          bookingId: event.id,
          expertId: resourceId || event.expertId,
          date: moment(start).format("YYYY-MM-DD"),
          startTime: formatSlotTime(start),
        })
      ).unwrap();
      loadSchedule();
    } catch (error) {
      console.error(error);
      loadSchedule();
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    if (event.type !== "booking" || !event.id || !selectedSalon) return;
    const durationMinutes = Math.max(
      calendarBounds.slotMinutes,
      moment(end).diff(moment(start), "minutes")
    );
    const roundedDuration =
      Math.round(durationMinutes / calendarBounds.slotMinutes) *
      calendarBounds.slotMinutes;
    try {
      await dispatch(
        resizeAdminPlanningBooking({
          salonId: selectedSalon,
          bookingId: event.id,
          expertId: event.expertId,
          date: moment(start).format("YYYY-MM-DD"),
          startTime: formatSlotTime(start),
          durationMinutes: roundedDuration,
        })
      ).unwrap();
      loadSchedule();
    } catch (error) {
      console.error(error);
      loadSchedule();
    }
  };

  const hasExperts = (schedule?.stats?.totalExperts ?? resources.length) > 0;

  return (
    <div className="team-calendar-page sq-planning-page">
      <div className="sq-planning-top">
        <Title name={ui.pages.teamCalendar} />

        <div className="sq-planning-toolbar card-sq mb-0">
          <div className="sq-planning-toolbar__left d-flex flex-wrap align-items-center gap-3">
            <span className="sq-planning-toolbar__label">Salon</span>
            <select
              className="form-select w-auto"
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
          <div className="sq-planning-toolbar__right d-flex flex-wrap align-items-center gap-3">
            <label className="sq-check-label">
              <input
                type="checkbox"
                checked={showFreeSlots}
                onChange={(e) => setShowFreeSlots(e.target.checked)}
              />
              Créneaux libres
            </label>
            <button type="button" className="btn btn-sm sq-btn-outline" onClick={loadSchedule}>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {hasExperts && (
        <div className={`sq-planning-calendar-zone team-calendar-wrap card-sq ${isLoading ? "is-loading" : ""}`}>
          <DnDCalendar
            localizer={localizer}
            culture="fr"
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
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
            min={calendarBounds.min}
            max={calendarBounds.max}
            step={calendarBounds.slotMinutes}
            timeslots={1}
            selectable={view === "day"}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            draggableAccessor={(event) => view === "day" && event.type === "booking"}
            resizable={view === "day"}
            resizableAccessor={(event) => view === "day" && event.type === "booking"}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            className="sq-calendar-body"
            popup
            tooltipAccessor={(event) => event.title}
          />
        </div>
      )}

      <div className="sq-planning-meta">
        {schedule && hasExperts && (
          <div className="team-calendar-stats row g-2 mb-2">
            {[
              ["Pros", schedule.stats?.totalExperts ?? 0, ""],
              ["Disponibles", schedule.stats?.availableCount ?? 0, "stat-available"],
              ["Occupés", schedule.stats?.busyCount ?? 0, "stat-busy"],
              ["Hors service", schedule.stats?.offCount ?? 0, "stat-off"],
            ].map(([label, value, cls]) => (
              <div key={label} className="col-3 col-md-3">
                <div className={`stat-card ${cls}`}>
                  <span className="stat-label">{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {schedule?.isHoliday && (
          <span className="badge bg-warning text-dark mb-2">Salon fermé (congé)</span>
        )}

        {!isLoading && schedule && hasExperts && !calendarEvents.length && (
          <div className="team-calendar-empty alert alert-light border sq-planning-alert mb-2">
            Aucun créneau pour cette date. Vue <strong>Jour</strong> puis cliquez sur un créneau libre.
          </div>
        )}

        {!isLoading && schedule && hasExperts && view !== "day" && (
          <div className="alert alert-info sq-planning-alert mb-2">
            Création et déplacement de RDV en vue <strong>Jour</strong> uniquement.
          </div>
        )}

        <div className="team-expert-status row g-2 mb-2 sq-planning-meta-chips">
          {(schedule?.resources || []).map((r) => (
            <div key={r.resourceId} className="col-md-4 col-lg-3">
              <div className="expert-status-chip">
                <span
                  className="status-dot"
                  style={{
                    backgroundColor: OPERATIONAL_COLORS[r.operationalStatus] || "#9ca3af",
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

        <div className="sq-planning-legend sq-planning-meta-legend">
          <span><i className="legend-swatch" style={{ background: STATUS_COLORS.booking.confirm }} /> Confirmé</span>
          <span><i className="legend-swatch" style={{ background: STATUS_COLORS.booking.pending }} /> En attente</span>
          <span><i className="legend-swatch" style={{ background: STATUS_COLORS.busy }} /> Indisponible</span>
          <span><i className="legend-swatch legend-free" /> Libre</span>
        </div>
      </div>

      {bookingSlot && selectedSalon && (
        <AdminPlanningBookingModal
          salonId={selectedSalon}
          slot={bookingSlot}
          onClose={() => setBookingSlot(null)}
          onSuccess={loadSchedule}
        />
      )}

      {detailBookingId && selectedSalon && (
        <AdminPlanningBookingDetailModal
          salonId={selectedSalon}
          bookingId={detailBookingId}
          onClose={() => setDetailBookingId(null)}
          onUpdated={loadSchedule}
        />
      )}
    </div>
  );
};

export default AdminTeamCalendar;
