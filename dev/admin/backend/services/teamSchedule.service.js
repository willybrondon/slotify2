const moment = require("moment");
const Expert = require("../models/expert.model");
const Booking = require("../models/booking.model");
const BusyExpert = require("../models/busyExpert.model");
const Holiday = require("../models/salonClose.model");

const SLOT_FALLBACK_MINUTES = 15;
const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getEnglishDayName(dateStr) {
  const dayIndex = moment(dateStr, "YYYY-MM-DD", true).day();
  return WEEKDAYS_EN[dayIndex] || moment(dateStr, "YYYY-MM-DD").locale("en").format("dddd");
}

function normalizeTimeString(timeStr) {
  if (!timeStr) return null;
  const trimmed = String(timeStr).trim();
  const parsed = moment(trimmed, ["hh:mm A", "h:mm A", "HH:mm", "H:mm"], true);
  if (!parsed.isValid()) return null;
  return parsed.format("hh:mm A");
}

function getCalendarBounds(salonTime) {
  const fallback = { minHour: 8, minMinute: 0, maxHour: 21, maxMinute: 0, slotMinutes: SLOT_FALLBACK_MINUTES };
  if (!salonTime?.openTime || !salonTime?.closedTime) return fallback;

  const open = moment(salonTime.openTime, ["hh:mm A", "h:mm A", "HH:mm"], true);
  const close = moment(salonTime.closedTime, ["hh:mm A", "h:mm A", "HH:mm"], true);
  if (!open.isValid() || !close.isValid()) return fallback;

  return {
    minHour: open.hour(),
    minMinute: open.minute(),
    maxHour: close.hour(),
    maxMinute: close.minute(),
    slotMinutes: salonTime.time || SLOT_FALLBACK_MINUTES,
  };
}

function generateTimeSlots(startTime, endTime, slotSize) {
  const slots = [];
  if (!startTime || !endTime) return slots;
  let start = moment(startTime, "hh:mm A");
  const end = moment(endTime, "hh:mm A");
  if (!start.isValid() || !end.isValid()) return slots;
  while (start < end) {
    slots.push(start.format("hh:mm A"));
    start.add(slotSize || SLOT_FALLBACK_MINUTES, "minutes");
  }
  return slots;
}

function getSalonSlotsForDay(salonTime) {
  if (!salonTime) return [];
  const { openTime, closedTime, breakStartTime, breakEndTime, time, isBreak } = salonTime;
  const slotSize = time || SLOT_FALLBACK_MINUTES;
  const morning = isBreak
    ? generateTimeSlots(openTime, (breakStartTime || "").trim(), slotSize)
    : generateTimeSlots(openTime, (closedTime || "").trim(), slotSize);
  const evening = isBreak ? generateTimeSlots((breakEndTime || "").trim(), closedTime, slotSize) : [];
  return [...morning, ...evening];
}

function slotToDateTime(dateStr, timeStr, durationMinutes = SLOT_FALLBACK_MINUTES) {
  const normalized = normalizeTimeString(timeStr);
  if (!normalized) return null;
  const start = moment(`${dateStr} ${normalized}`, "YYYY-MM-DD hh:mm A");
  if (!start.isValid()) return null;
  return {
    start: start.toDate(),
    end: start.clone().add(durationMinutes, "minutes").toDate(),
  };
}

function computeOperationalStatus({ dateStr, salonTime, holiday, bookedSlots, busySlots, isAttend }) {
  if (holiday) return "off";
  if (!salonTime || salonTime.isActive === false) return "off";

  const allSlots = getSalonSlotsForDay(salonTime);
  if (!allSlots.length) return "off";

  const occupied = new Set([...(bookedSlots || []), ...(busySlots || [])]);
  const freeSlots = allSlots.filter((s) => !occupied.has(s));

  const today = moment().format("YYYY-MM-DD");
  if (dateStr !== today) {
    if (freeSlots.length > 0) return "available";
    return bookedSlots?.length ? "busy" : "available";
  }

  const now = moment();
  const open = moment(salonTime.openTime, "hh:mm A");
  const close = moment(salonTime.closedTime, "hh:mm A");
  const nowClock = moment(now.format("hh:mm A"), "hh:mm A");

  if (!nowClock.isValid() || nowClock.isBefore(open) || nowClock.isAfter(close)) {
    return "off";
  }

  if (salonTime.isBreak) {
    const bStart = moment(salonTime.breakStartTime, "hh:mm A");
    const bEnd = moment(salonTime.breakEndTime, "hh:mm A");
    if (nowClock.isSameOrAfter(bStart) && nowClock.isBefore(bEnd)) {
      return "break";
    }
  }

  const slotSize = salonTime.time || SLOT_FALLBACK_MINUTES;
  for (const slot of allSlots) {
    const slotStart = moment(slot, "hh:mm A");
    const slotEnd = slotStart.clone().add(slotSize, "minutes");
    if (nowClock.isSameOrAfter(slotStart) && nowClock.isBefore(slotEnd)) {
      if (bookedSlots?.includes(slot)) return "busy";
      if (busySlots?.includes(slot)) return "blocked";
      return "available";
    }
  }

  if (freeSlots.length > 0) return "available";
  if (isAttend === false) return "off";
  return bookedSlots?.length ? "busy" : "available";
}

async function buildExpertDaySchedule(expert, salon, dateStr, { holiday, salonTime, bookings, busyRecord }) {
  const bookedSlots = (bookings || []).flatMap((b) => b.time || []);
  const busySlots = busyRecord?.time || [];
  const allSlots = getSalonSlotsForDay(salonTime);
  const occupied = new Set([...bookedSlots, ...busySlots]);
  const freeSlots = allSlots.filter((s) => !occupied.has(s));

  const slotSize = salonTime?.time || SLOT_FALLBACK_MINUTES;
  const durationByBooking = (booking) => {
    const slots = booking.time?.length || 1;
    return booking.duration || slots * slotSize;
  };

  const bookingEvents = (bookings || []).map((booking) => {
    const firstSlot = booking.time?.[0];
    const range = slotToDateTime(dateStr, firstSlot, durationByBooking(booking));
    const user = booking.userId;
    const clientName = user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "Client";
    return {
      id: booking._id?.toString(),
      type: "booking",
      expertId: expert._id.toString(),
      resourceId: expert._id.toString(),
      bookingId: booking.bookingId,
      status: booking.status,
      title: clientName || booking.bookingId || "RDV",
      start: range?.start,
      end: range?.end,
      timeSlots: booking.time,
      amount: booking.amount,
      paymentType: booking.paymentType,
    };
  });

  const busyEvents = busySlots.map((slot, idx) => {
    const range = slotToDateTime(dateStr, slot, slotSize);
    return {
      id: `busy-${expert._id}-${idx}`,
      type: "busy",
      expertId: expert._id.toString(),
      resourceId: expert._id.toString(),
      title: "Indisponible",
      timeSlots: [slot],
      start: range?.start,
      end: range?.end,
    };
  });

  const freeSlotEvents = freeSlots.map((slot, idx) => {
    const range = slotToDateTime(dateStr, slot, slotSize);
    return {
      id: `free-${expert._id}-${idx}`,
      type: "free",
      expertId: expert._id.toString(),
      resourceId: expert._id.toString(),
      title: "Libre",
      start: range?.start,
      end: range?.end,
    };
  });

  let breakEvent = null;
  if (salonTime?.isBreak && salonTime.breakStartTime && salonTime.breakEndTime) {
    const bStart = moment(`${dateStr} ${salonTime.breakStartTime}`, "YYYY-MM-DD hh:mm A");
    const bEnd = moment(`${dateStr} ${salonTime.breakEndTime}`, "YYYY-MM-DD hh:mm A");
    if (bStart.isValid() && bEnd.isValid()) {
      breakEvent = {
        id: `break-${expert._id}`,
        type: "break",
        expertId: expert._id.toString(),
        resourceId: expert._id.toString(),
        title: "Pause",
        start: bStart.toDate(),
        end: bEnd.toDate(),
      };
    }
  }

  const operationalStatus = computeOperationalStatus({
    dateStr,
    salonTime,
    holiday,
    bookedSlots,
    busySlots,
    isAttend: expert.isAttend,
  });

  const occupancyRate =
    allSlots.length > 0 ? Math.round((bookedSlots.length / allSlots.length) * 100) : 0;

  return {
    expert: {
      _id: expert._id,
      fname: expert.fname,
      lname: expert.lname,
      image: expert.image,
      isAttend: expert.isAttend,
      operationalStatus,
      occupancyRate,
    },
    isOpen: !holiday && !!salonTime && salonTime.isActive !== false,
    allSlots: { morning: [], evening: [], combined: allSlots },
    bookedSlots,
    busySlots,
    freeSlots,
    events: [
      ...bookingEvents,
      ...busyEvents,
      ...(breakEvent ? [breakEvent] : []),
      ...freeSlotEvents,
    ],
    bookings: bookingEvents,
  };
}

async function getTeamScheduleForSalon(salon, dateStr) {
  const dayOfWeek = getEnglishDayName(dateStr);
  const salonTime = salon.salonTime?.find((t) => t.day === dayOfWeek) || null;
  const calendarBounds = getCalendarBounds(salonTime);

  const holiday = await Holiday.findOne({ date: dateStr, salonId: salon._id });

  const experts = await Expert.find({
    salonId: salon._id,
    isDelete: false,
    isBlock: false,
  }).sort({ fname: 1 });

  const expertIds = experts.map((e) => e._id);

  const [bookingsRaw, busyRecords] = await Promise.all([
    Booking.find({
      salonId: salon._id,
      expertId: { $in: expertIds },
      date: dateStr,
      status: { $in: ["pending", "confirm", "completed"] },
    })
      .populate("userId", "fname lname image mobile")
      .lean(),
    BusyExpert.find({ expertId: { $in: expertIds }, date: dateStr }).lean(),
  ]);

  const bookingsByExpert = {};
  bookingsRaw.forEach((b) => {
    const key = b.expertId.toString();
    if (!bookingsByExpert[key]) bookingsByExpert[key] = [];
    bookingsByExpert[key].push(b);
  });

  const busyByExpert = {};
  busyRecords.forEach((b) => {
    busyByExpert[b.expertId.toString()] = b;
  });

  const expertSchedules = await Promise.all(
    experts.map((expert) =>
      buildExpertDaySchedule(expert, salon, dateStr, {
        holiday,
        salonTime,
        bookings: bookingsByExpert[expert._id.toString()] || [],
        busyRecord: busyByExpert[expert._id.toString()],
      })
    )
  );

  const resources = expertSchedules.map((s) => ({
    resourceId: s.expert._id.toString(),
    resourceTitle: `${s.expert.fname} ${s.expert.lname}`.trim(),
    image: s.expert.image,
    operationalStatus: s.expert.operationalStatus,
    occupancyRate: s.expert.occupancyRate,
    isAttend: s.expert.isAttend,
  }));

  const events = expertSchedules.flatMap((s) => s.events).filter((e) => e.start && e.end);

  const salonOpen = !holiday && !!salonTime && salonTime.isActive !== false;

  return {
    date: dateStr,
    isSalonOpen: salonOpen,
    isHoliday: !!holiday,
    salonTime,
    calendarBounds,
    resources,
    experts: expertSchedules,
    events,
    stats: {
      totalExperts: experts.length,
      availableCount: expertSchedules.filter((s) => s.expert.operationalStatus === "available").length,
      busyCount: expertSchedules.filter((s) => s.expert.operationalStatus === "busy").length,
      offCount: expertSchedules.filter((s) => ["off", "blocked"].includes(s.expert.operationalStatus)).length,
    },
  };
}

async function getTeamScheduleRange(salon, startDate, endDate) {
  const start = moment(startDate, "YYYY-MM-DD");
  const end = moment(endDate, "YYYY-MM-DD");
  const days = [];
  const cursor = start.clone();
  while (cursor.isSameOrBefore(end, "day")) {
    days.push(cursor.format("YYYY-MM-DD"));
    cursor.add(1, "day");
  }
  const schedules = await Promise.all(days.map((d) => getTeamScheduleForSalon(salon, d)));
  const events = schedules.flatMap((s) => s.events);
  const resourcesMap = new Map();
  schedules.forEach((daySchedule) => {
    (daySchedule.resources || []).forEach((resource) => {
      resourcesMap.set(resource.resourceId, resource);
    });
  });
  const resources = Array.from(resourcesMap.values());
  const focusDay = schedules.find((s) => s.date === startDate) || schedules[0];
  return {
    startDate,
    endDate,
    date: startDate,
    isSalonOpen: schedules.some((s) => s.isSalonOpen),
    isHoliday: schedules.some((s) => s.isHoliday),
    salonTime: focusDay?.salonTime || null,
    calendarBounds: focusDay?.calendarBounds || getCalendarBounds(null),
    resources,
    events,
    days: schedules,
    stats: focusDay?.stats || {
      totalExperts: resources.length,
      availableCount: 0,
      busyCount: 0,
      offCount: 0,
    },
  };
}

module.exports = {
  generateTimeSlots,
  getEnglishDayName,
  normalizeTimeString,
  getCalendarBounds,
  getSalonSlotsForDay,
  computeOperationalStatus,
  buildExpertDaySchedule,
  getTeamScheduleForSalon,
  getTeamScheduleRange,
};
