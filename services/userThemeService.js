import { getUserThemeRepo, getUsersByIdsRepo } from "../repositories/userThemeRepo.js";
import AppError from "../utils/AppError.js";

export const getUserThemeService = async (query) => {
  const { status, user_id, page = 1, limit = 10 } = query;

  // Validate status filter
  if (status && !["purchased", "not_purchased"].includes(status)) {
    throw new AppError(
      "Invalid status value. Use 'purchased' or 'not_purchased'.",
      400
    );
  }

  // Validate pagination params
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const filters = {
    user_id,
    status,
    limit: limitNum,
    offset,
  };

  // Fetch paginated data
  const { rows: userThemes, count } = await getUserThemeRepo(filters);

  // Fetch users from remote DB
  const userIds = [...new Set(userThemes.map((ut) => ut.user_id))];
  const remoteUsers = await getUsersByIdsRepo(userIds);

  // Map user_id → user
  const userMap = Object.fromEntries(remoteUsers.map((u) => [u.id, u]));

  // Merge user data
  const mergedData = userThemes.map((ut) => {
    const json = ut.toJSON();
    json.user = userMap[ut.user_id] || null;
    return json;
  });

  // Pagination metadata
  const totalPages = Math.ceil(count / limitNum);

  return {
    pagination: {
      totalRecords: count,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
    count: mergedData.length,
    data: mergedData,
  };
};
