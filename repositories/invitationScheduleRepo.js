import { includes } from "zod";
import db from "../models/index.js";
import { remoteSequelize } from "../models/index.js";
import userModelFactory from "../models/remote/user.js";
import { Op, Sequelize } from "sequelize";

const {
  UserTheme,
  Event,
  InvitationSchedule,
  InvitationPayment,
  GuestSchedule,
  MessageSchedule,

} = db;
const User = userModelFactory(remoteSequelize, db.Sequelize.DataTypes);

// ✅ 1️⃣ Fetch schedules with joined user, theme, and event (single query)
export const findSchedules = (whereClause, limit, offset, filters = {}) => {
  const include = [
    {
      model: UserTheme,
      as: "userTheme",
      attributes: [
        "id",
        "file_url",
        "purchased_price",
        "purchased_date",
        "occasion_id",
        "file_type",
      ],
      required: false,
      include: [
        {
          model: db.Theme,
          as: "theme",
          attributes: [
            "id",
            "name",
            "base_price",
            "offer_price",
           
          ],
          required: false,
        },
      ],
    },

    {
      model: Event,
      as: "event",
      attributes: [
        "id",
        "title",
        "slug",
        "event_datetime",
        "venue_name",
        "venue_address",
      ],
      required: false,
    },
  ];

  // ✅ Theme Type filter
  if (filters.themeType) {
    include[0].where = { file_type: filters.themeType };
    include[0].required = true;
  }

  // ✅ Search Filter (cross-table)
  if (filters.search && filters.search.trim() !== "") {
    const q = `%${filters.search.trim()}%`;

    whereClause[Op.or] = [
      { schedule_no: { [Op.like]: q } },
      { currency_code: { [Op.like]: q } },
      Sequelize.where(Sequelize.col("event.title"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("event.venue_name"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("event.venue_address"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("event.event_datetime"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("userTheme.file_type"), { [Op.like]: q }),
      Sequelize.where(Sequelize.col("userTheme.purchased_price"), {
        [Op.like]: q,
      }),
      Sequelize.where(Sequelize.col("userTheme.purchased_date"), {
        [Op.like]: q,
      }),
    ];
  }

  return InvitationSchedule.findAndCountAll({
    where: whereClause,
    include,
    attributes: [
      "id",
      "schedule_no",
      "user_id",
      "event_id",
      "user_theme_id",
      "guest_schedule_channel",
      "currency_code",
      "status",
      "total_guests",
      "total_messages",
      "net_amount",
      "payable_after_wallet",
      "wallet_used",
      "created_at",
    ],
    order: [["created_at", "DESC"]],
    subQuery: false,
    distinct: true,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
};

// ✅ 2️⃣ Fetch single schedule with payment (single join)
export const findScheduleWithPayment = (scheduleNo) => {
  return InvitationSchedule.findOne({
    where: { schedule_no: scheduleNo },
    include: [
      {
        model: InvitationPayment,
        as: "payment",
        attributes: [
          "payment_type",
          "payment_mode",
          "gateway_amount",
          "gateway_name",
          "gateway_payment_id",
          "status",
        ],
      },
      {
        model: UserTheme,
        as: "userTheme",
        attributes: ["id", "purchased_price"],
      },
    ],

    attributes: [
      "id",
      "user_theme_id",
      "user_id",
      "currency_code",
      "base_price",
      "coupon_discount",
      "tax_amount",
      "service_charge",
      "total_guests",
      "total_messages",
      "net_amount",
      "wallet_used",
      "payable_after_wallet",
      "status",
    ],
  });
};

// ✅ 3️⃣ Guests + messages in one nested join (no N+1)
export const findGuestsWithMessages = (scheduleId) => {
  return GuestSchedule.findAll({
    where: { invitation_schedule_id: scheduleId },
    include: [
      {
        model: MessageSchedule,
        as: "messages",
        attributes: [
          "id",
          "guest_schedule_id",
          "channel_type",
          "message_template_id",
          "language_code",
          "scheduled_at",
          "sent_at",
          "status",
          "retry_count",
          "last_retry_at",
          "response",
        ],
      },
    ],
    attributes: [
      "id",
      "invitation_schedule_id",
      "name",
      "country_code",
      "mobile",
      "with_family",
      "invitation_from",
      "group_name",
      "created_at",
    ],
    order: [["created_at", "ASC"]],
  });
};
export const getUserDetails = (userIds) => {
  if (Array.isArray(userIds)) {
    return User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "mobile"],
    });
  }
  return User.findOne({
    where: { id: userIds },
    attributes: ["id", "name", "mobile"],
  });
};
