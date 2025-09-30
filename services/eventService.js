import {
  getEventsRepo,
  getUsersByIds,
  getOccasionsByIds,
  searchRemoteUsers,
} from "../repositories/eventRepository.js";
import { Op } from "sequelize";

export const getAllEventsService = async (query) => {
  const {
    page = 1,
    limit = 10,
    q,
    occasion,
    startDate,
    endDate,
    status,
  } = query;

  const offset = (page - 1) * limit;
  const whereConditions = {};

  // Occasion filter
  if (occasion) whereConditions.occasion_id = occasion;

  // --- Build user-supplied date range (inclusive)
  let rangeStart = null;
  let rangeEnd = null;

  if (startDate) {
    const sd = new Date(startDate);
    rangeStart = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), 0, 0, 0, 0);
  }
  if (endDate) {
    const ed = new Date(endDate);
    rangeEnd = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate(), 23, 59, 59, 999);
  }

  // --- Status-based constraints (expressed as a date-range or deleted flag)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Status-derived min/max (null means "no bound from status side")
  let statusStart = null;
  let statusEnd = null;

  if (status) {
    switch (status.toString().toLowerCase()) {
      case "today":
        statusStart = startOfToday;
        statusEnd = endOfToday;
        break;

      case "upcoming":
        // events strictly after today
        statusStart = new Date(endOfToday.getTime() + 1);
        // keep only non-deleted for upcoming
        whereConditions.deleted_at = null;
        break;

      case "completed":
        // events strictly before today
        statusEnd = new Date(startOfToday.getTime() - 1);
        // keep only non-deleted for completed
        whereConditions.deleted_at = null;
        break;

      case "deleted":
        // deleted events only — do NOT force any event_datetime range
        whereConditions.deleted_at = { [Op.ne]: null };
        break;

      default:
        // unknown status - ignore
        break;
    }
  }

  // --- Intersect user date-range and status date-range
  // finalStart = max(rangeStart, statusStart)
  // finalEnd = min(rangeEnd, statusEnd)
  let finalStart = rangeStart ?? null;
  let finalEnd = rangeEnd ?? null;

  if (statusStart) {
    finalStart = finalStart ? (finalStart > statusStart ? finalStart : statusStart) : statusStart;
  }
  if (statusEnd) {
    finalEnd = finalEnd ? (finalEnd < statusEnd ? finalEnd : statusEnd) : statusEnd;
  }

  // If intersection is impossible (start > end) -> return empty early
  if (finalStart && finalEnd && finalStart.getTime() > finalEnd.getTime()) {
    return {
      total: 0,
      currentPage: parseInt(page, 10),
      totalPages: 0,
      limit: parseInt(limit, 10),
      count: 0,
      data: [],
    };
  }

  // Attach effective event_datetime filter
  if (finalStart && finalEnd) {
    whereConditions.event_datetime = { [Op.between]: [finalStart, finalEnd] };
  } else if (finalStart) {
    whereConditions.event_datetime = { [Op.gte]: finalStart };
  } else if (finalEnd) {
    whereConditions.event_datetime = { [Op.lte]: finalEnd };
  }

  // --- Search filter (kept intact)
  if (q && q.trim() !== "") {
    const term = q.trim();
    const userIds = await searchRemoteUsers(term);

    whereConditions[Op.or] = [
      { title: { [Op.like]: `%${term}%` } },
      { slug: { [Op.like]: `%${term}%` } },
      { venue_name: { [Op.like]: `%${term}%` } },
      { venue_address: { [Op.like]: `%${term}%` } },
      ...(userIds.length > 0 ? [{ user_id: { [Op.in]: userIds } }] : []),
    ];
  }

  // --- Fetch events
  const { rows: events, count: total } = await getEventsRepo({
    whereConditions,
    limit: parseInt(limit, 10),
    offset,
  });

  // --- Fetch and attach related data
  const fetchedUserIds = events.map((e) => e.user_id).filter(Boolean);
  const fetchedOccasionIds = events.map((e) => e.occasion_id).filter(Boolean);

  const users = fetchedUserIds.length ? await getUsersByIds(fetchedUserIds) : [];
  const occasions = fetchedOccasionIds.length ? await getOccasionsByIds(fetchedOccasionIds) : [];

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const occasionMap = Object.fromEntries(occasions.map((o) => [o.id, o]));

  // --- Compute status for each event (for display)
  const result = events.map((e) => {
    let eventStatus = "upcoming";
    const eventDate = new Date(e.event_datetime);
    const today = new Date();
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (e.deleted_at) eventStatus = "deleted";
    else if (eventDay.getTime() === todayDay.getTime()) eventStatus = "today";
    else if (eventDay.getTime() > todayDay.getTime()) eventStatus = "upcoming";
    else eventStatus = "completed";

    return {
      ...e.toJSON(),
      status: eventStatus,
      user: userMap[e.user_id] || null,
      occasion: occasionMap[e.occasion_id] || null,
    };
  });

  return {
    total,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(total / limit),
    limit: parseInt(limit, 10),
    count: result.length,
    data: result,
  };
};
