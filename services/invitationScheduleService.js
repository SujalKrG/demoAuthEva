import AppError from "../utils/AppError.js";
import moment from "moment-timezone";
import {
  findSchedules,
  findScheduleWithPayment,
  getUserDetails,
  findGuestsWithMessages,
} from "../repositories/invitationScheduleRepo.js";

// ✅ Fetch all schedules (optimized)
export const getSchedulesService = async (
  userId,
  page,
  limit,
  filters = {}
) => {
  const offset = (page - 1) * limit;
  const whereClause = {};

  if (userId) whereClause.user_id = userId;
  if (filters.status) whereClause.status = filters.status;

  const schedules = await findSchedules(whereClause, limit, offset, filters);
  if (!schedules.rows || schedules.rows.length === 0)
    throw new AppError("No invitation schedules found", 404);

  // ✅ Fetch users in one go (remote DB)
  let usersMap = {};
  if (userId) {
    const user = await getUserDetails(userId);
    if (!user) throw new AppError("User not found", 404);
    usersMap[userId] = user;
  } else {
    const uniqueUserIds = [...new Set(schedules.rows.map((s) => s.user_id))];
    const users = await getUserDetails(uniqueUserIds);
    usersMap = users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});
  }

  // ✅ Format response
  const formatted = schedules.rows.map((schedule) => ({
    id: schedule.id,
    user: usersMap[schedule.user_id] || null,
    event:
      {
        schedule_event_id: schedule.event.id,
        title: schedule.event.title,
        slug: schedule.event.slug,
        event_datetime: moment(schedule.event.event_datetime)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
        venue_name: schedule.event.venue_name,
        venue_address: schedule.event.venue_address,
      } || null,
    user_theme:
      {
        id: schedule.userTheme.id,
        purchased_price: schedule.userTheme.purchased_price,
        file_url: schedule.userTheme.file_url,
        name: schedule.userTheme.theme.name,
        purchased_date: moment(schedule.userTheme.purchased_date)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss"),
        file_type: schedule.userTheme.file_type,
        theme:{
          base_price:schedule.userTheme.theme.base_price,
          offer_price:schedule.userTheme.theme.offer_price,
        }
      } || null,
    schedule_no: schedule.schedule_no,
    guest_schedule_channel: schedule.guest_schedule_channel,
    total_guests: schedule.total_guests,
    total_messages: schedule.total_messages,
    wallet_used: schedule.wallet_used,
    payable_amount: schedule.payable_after_wallet,
    currency_code: schedule.currency_code,
    status: schedule.status,
    created_at: moment(schedule.created_at)
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss"),
  }));

  return {
    message: "Invitation schedules fetched successfully",
    pagination: {
      total: schedules.count,
      page: Number(page),
      limit: Number(limit),
      total_pages: Math.ceil(schedules.count / limit),
    },
    count: schedules.rows.length,
    data: formatted,
  };
};

// ✅ Payment summary
export const getPaymentSummaryService = async (scheduleNo) => {
  const schedule = await findScheduleWithPayment(scheduleNo);
  if (!schedule) throw new AppError("Invitation schedule not found", 404);

  return {
    schedule_summary: schedule,
    user_theme_price:"123",
    theme_price:"12",
    payment_summary: schedule.payment || null,
  };
};

// ✅ Guests + messages
export const getGuestWithMessagesService = async (scheduleNo) => {
  const MESSAGE_STATUS = {
    0: "PENDING",
    1: "QUEUED",
    2: "SENDING",
    3: "SENT",
    4: "FAILED",
    5: "DELIVERED",
    6: "READ",
    7: "CANCELLED",
  };
  // ✅ 1. Find schedule
  const schedule = await findScheduleWithPayment(scheduleNo);
  if (!schedule) throw new AppError("Invitation schedule not found", 404);

  // ✅ 2. Find all guests with nested messages
  const guests = await findGuestsWithMessages(schedule.id);
  if (!guests || guests.length === 0)
    throw new AppError("No guests found for this schedule", 404);

  // ✅ 3. Map each message's status number → text
  const guestsWithMappedMessages = guests.map((guest) => {
    const guestJson = guest.toJSON();
    const messages = (guestJson.messages || []).map((msg) => ({
      ...msg,
      status_text: MESSAGE_STATUS[msg.status] || "UNKNOWN",
    }));

    return {
      ...guestJson,
      messages,
    };
  });

  // ✅ 4. Group guests by group_name
  const groupedGuests = guestsWithMappedMessages.reduce((acc, guest) => {
    const groupKey =
      guest.group_name && guest.group_name.trim() !== ""
        ? guest.group_name
        : "Individual";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(guest);
    return acc;
  }, {});

  // ✅ 5. Format final response
  return Object.keys(groupedGuests).map((groupName) => ({
    group_name: groupName,
    members: groupedGuests[groupName],
  }));
};
