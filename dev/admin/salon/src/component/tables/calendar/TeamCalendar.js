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
  fetchTeamSchedule,
  removeExpertBusySlots,
  reschedulePlanningBooking,
  resizePlanningBooking,
  setExpertBusySlots,
} from "../../../redux/slice/teamScheduleSlice";
import { SKEDISY_SALON_UI as ui } from "../../../constants/skedisyUiCopy";
import { warning } from "../../../util/Alert";
import PlanningBookingModal from "./PlanningBookingModal";
import PlanningBookingDetailModal from "./PlanningBookingDetailModal";
import "./TeamCalendar.css";
import "./PlanningCalendar.css";

moment.locale("fr");
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const STATUS_COLORS = {
  booking: {
    pending: "#3be4ed",
    confirm: "#c45c26",
    completed: "#a84d1f",
    cancel: "#ef4444",
  },
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
  let opacity = 0.92;
  let color = "#fff";
  let border = "none";

  if (event.type === "free") {
    backgroundColor = STATUS_COLORS.free;
    color = "#7c4a2e";
    opacity = 0.9;
    border = "1px dashed rgba(196, 92, 38, 0.35)";
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
    const focusDay =
      schedule.days.find((day) => day.date === focusDate) || schedule.days[0];
    return {
      ...schedule,
      date: focusDay?.date || focusDate,
      events: schedule.events || schedule.days.flatMap((day) => day.events || []),
      resources: schedule.resources?.length
        ? schedule.resources
        : focusDay?.resources || [],
      stats: focusDay?.stats || schedule.stats,
      salonTime: focusDay?.salonTime || schedule.salonTime,
      calendarBounds: focusDay?.calendarBounds || schedule.calendarBounds,
      isSalonOpen: focusDay?.isSalonOpen ?? schedule.isSalonOpen,
      isHoliday: focusDay?.isHoliday ?? schedule.isHoliday,
    };
  }

  return schedule;
}

function formatSlotTime(date) {
  return moment(date).format("hh:mm A");
}

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { schedule: rawSchedule, isLoading } = useSelector(
    (state) => state.teamSchedule
  );
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [view, setView] = useState("day");
  const [showFreeSlots, setShowFreeSlots] = useState(true);
  const [plannerMode, setPlannerMode] = useState("booking");
  const [bookingSlot, setBookingSlot] = useState(null);
  const [detailBookingId, setDetailBookingId] = useState(null);

  const dateStr = moment(currentDate).format("YYYY-MM-DD");
  const schedule = useMemo(
    () => normalizeSchedule(rawSchedule, dateStr),
    [rawSchedule, dateStr]
  );

  const loadSchedule = useCallback(() => {
    dispatch(fetchTeamSchedule({ date: dateStr, view }));
  }, [dispatch, dateStr, view]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

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
        start: new Date(e.start),
        end: new Date(e.end),
        title:
          e.type === "booking"
            ? `${e.title} (${e.status === "confirm" ? "Confirmé" : e.status})`
            : e.title,
      }))
      .filter((e) => !Number.isNaN(e.start?.getTime()) && !Number.isNaN(e.end?.getTime()));
  }, [schedule, showFreeSlots]);

  const resources = useMemo(() => {
    return (schedule?.resources || []).map((r) => ({
      resourceId: r.resourceId,
      resourceTitle: r.resourceTitle,
    }));
  }, [schedule]);

  const handleSelectSlot = async ({ start, resourceId }) => {
    if (!resourceId || view !== "day") return;
    const slotLabel = formatSlotTime(start);

    if (plannerMode === "booking") {
      setBookingSlot({
        expertId: resourceId,
        expertName: resourceTitleById[resourceId],
        date: dateStr,
        startTime: slotLabel,
      });
      return;
    }

    const confirm = await warning(
      `Bloquer le créneau ${slotLabel} pour ce professionnel ?`
    );
    if (!confirm?.isConfirmed) return;

    try {
      await dispatch(
        setExpertBusySlots({
          expertId: resourceId,
          date: dateStr,
          time: slotLabel,
        })
      ).unwrap();
      loadSchedule();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectEvent = async (event) => {
    if (event.type === "booking" && event.id) {
      setDetailBookingId(event.id);
      return;
    }

    if (event.type === "busy" && event.expertId) {
      const confirm = await warning("Débloquer ce créneau indisponible ?");
      if (!confirm?.isConfirmed) return;
      const slotLabel = event.timeSlots?.[0] || formatSlotTime(event.start);
      try {
        await dispatch(
          removeExpertBusySlots({
            expertId: event.expertId,
            date: dateStr,
            time: slotLabel,
          })
        ).unwrap();
        loadSchedule();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEventDrop = async ({ event, start, resourceId }) => {
    if (event.type !== "booking" || !event.id) return;

    const confirm = await warning("Déplacer ce rendez-vous ?");
    if (!confirm?.isConfirmed) {
      loadSchedule();
      return;
    }

    const targetDate = moment(start).format("YYYY-MM-DD");
    const startTime = formatSlotTime(start);

    try {
      await dispatch(
        reschedulePlanningBooking({
          bookingId: event.id,
          expertId: resourceId || event.expertId,
          date: targetDate,
          startTime,
        })
      ).unwrap();
      loadSchedule();
    } catch (error) {
      console.error(error);
      loadSchedule();
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    if (event.type !== "booking" || !event.id) return;

    const durationMinutes = Math.max(
      calendarBounds.slotMinutes,
      moment(end).diff(moment(start), "minutes")
    );
    const roundedDuration =
      Math.round(durationMinutes / calendarBounds.slotMinutes) *
      calendarBounds.slotMinutes;

    try {
      await dispatch(
        resizePlanningBooking({
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
      <Title name={ui.pages.teamCalendar || "Planning équipe"} />

      <div className="sq-planning-toolbar card-sq mb-3">
        <div className="sq-planning-toolbar__left">
          <span className="sq-planning-toolbar__label">Mode</span>
          <div className="sq-segmented">
            <button
              type="button"
              className={plannerMode === "booking" ? "is-active" : ""}
              onClick={() => setPlannerMode("booking")}
            >
              Créer RDV
            </button>
            <button
              type="button"
              className={plannerMode === "block" ? "is-active" : ""}
              onClick={() => setPlannerMode("block")}
            >
              Bloquer
            </button>
          </div>
        </div>
        <div className="sq-planning-toolbar__right d-flex flex-wrap align-items-center gap-3">
          <label className="d-flex align-items-center gap-2 mb-0 small">
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

      {schedule && hasExperts && (
        <div className="team-calendar-stats row g-3 mb-3">
          {[
            ["Pros", schedule.stats?.totalExperts ?? 0, ""],
            ["Disponibles", schedule.stats?.availableCount ?? 0, "stat-available"],
            ["Occupés", schedule.stats?.busyCount ?? 0, "stat-busy"],
            ["Hors service", schedule.stats?.offCount ?? 0, "stat-off"],
          ].map(([label, value, cls]) => (
            <div key={label} className="col-md-3 col-6">
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
        <div className="team-calendar-empty alert alert-light border mb-3">
          Aucun créneau pour cette date. Cliquez sur un créneau libre pour créer un RDV ou bloquer.
        </div>
      )}

      <div className="team-expert-status row g-2 mb-3">
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

      <div className="legend mb-2 d-flex flex-wrap gap-3 small">
        <span><i className="legend-swatch" style={{ background: STATUS_COLORS.booking.confirm }} /> Confirmé</span>
        <span><i className="legend-swatch" style={{ background: STATUS_COLORS.booking.pending }} /> En attente</span>
        <span><i className="legend-swatch" style={{ background: STATUS_COLORS.busy }} /> Indisponible</span>
        <span><i className="legend-swatch legend-free" /> Libre · glisser / redimensionner les RDV</span>
      </div>

      {hasExperts && (
        <div className={`team-calendar-wrap card-sq ${isLoading ? "is-loading" : ""}`}>
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
            draggableAccessor={(event) => event.type === "booking"}
            resizable={view === "day"}
            resizableAccessor={(event) => event.type === "booking"}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            style={{ height: 720 }}
            popup
            tooltipAccessor={(event) => event.title}
          />
        </div>
      )}

      {bookingSlot && (
        <PlanningBookingModal
          slot={bookingSlot}
          onClose={() => setBookingSlot(null)}
          onSuccess={loadSchedule}
        />
      )}

      {detailBookingId && (
        <PlanningBookingDetailModal
          bookingId={detailBookingId}
          onClose={() => setDetailBookingId(null)}
          onUpdated={loadSchedule}
        />
      )}
    </div>
  );
};

export default TeamCalendar;
