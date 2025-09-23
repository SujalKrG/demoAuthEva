import {
  getEventsRepo,
  getUsersByIds,
  getOccasionsByIds,
  searchRemoteUsers,
} from "../repositories/eventRepository.js";
import { Op, Sequelize } from "sequelize";

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

  // Event filters (applies to event_datetime)
  if (occasion) whereConditions.occasion_id = occasion;
  if (startDate && endDate) {
    whereConditions.event_datetime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  } else if (startDate) {
    whereConditions.event_datetime = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    whereConditions.event_datetime = { [Op.lte]: new Date(endDate) };
  }

  // Status filter
  if (status) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));

    switch (status.toLowerCase()) {
      case "today":
        whereConditions.event_datetime = { [Op.between]: [startOfDay, endOfDay] };
        break;
      case "upcoming":
        whereConditions.event_datetime = { [Op.gt]: endOfDay };
        whereConditions.deleted_at = null;
        break;
      case "completed":
        whereConditions.event_datetime = { [Op.lt]: startOfDay };
        whereConditions.deleted_at = null;
        break;
      case "deleted":
        whereConditions.deleted_at = { [Op.ne]: null };
        break;
    }
  }

  // Search filter
  let userIds = [];
  if (q && q.trim() !== "") {
    userIds = await searchRemoteUsers(q);
    whereConditions[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { slug: { [Op.like]: `%${q}%` } },
      { venue_name: { [Op.like]: `%${q}%` } },
      { venue_address: { [Op.like]: `%${q}%` } },
      ...(userIds.length > 0 ? [{ user_id: { [Op.in]: userIds } }] : []),
    ];
  }

  const { rows: events, count: total } = await getEventsRepo({
    whereConditions,
    limit: parseInt(limit),
    offset,
  });

  // Fetch related user & occasion data
  const fetchedUserIds = events.map(e => e.user_id).filter(Boolean);
  const fetchedOccasionIds = events.map(e => e.occasion_id).filter(Boolean);

  const users = await getUsersByIds(fetchedUserIds);
  const occasions = await getOccasionsByIds(fetchedOccasionIds);

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const occasionMap = Object.fromEntries(occasions.map(o => [o.id, o]));

  // Map event status
  const result = events.map(e => {
    let eventStatus = "upcoming";
    const eventDate = new Date(e.event_datetime);
    const today = new Date();
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (e.deleted_at) eventStatus = "deleted";
    else if (eventDay.getTime() === todayDay.getTime()) eventStatus = "today";
    else if (eventDay.getTime() > todayDay.getTime()) eventStatus = "upcoming";
    else if (eventDay.getTime() < todayDay.getTime()) eventStatus = "completed";

    return {
      ...e.toJSON(),
      status: eventStatus,
      user: userMap[e.user_id] || null,
      occasion: occasionMap[e.occasion_id] || null,
    };
  });

  return {
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    limit: parseInt(limit),
    count: result.length,
    data: result,
  };
};
