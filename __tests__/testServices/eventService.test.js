// __tests__/services/eventService.test.js
import { jest } from "@jest/globals";

// ===================== MOCKS =====================
jest.unstable_mockModule("../../repositories/eventRepository.js", () => ({
  getEventsRepo: jest.fn(),
  getUsersByIds: jest.fn(),
  getOccasionsByIds: jest.fn(),
  searchRemoteUsers: jest.fn(),
}));

// ===================== IMPORT SERVICE =====================
const {
  getAllEventsService,
} = await import("../../services/eventService.js");

const {
  getEventsRepo,
  getUsersByIds,
  getOccasionsByIds,
  searchRemoteUsers,
} = await import("../../repositories/eventRepository.js");

// ===================== TESTS =====================
describe("eventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAllEventsService - basic fetch without filters", async () => {
    const events = [
      { id: 1, title: "Event1", user_id: 10, occasion_id: 100, event_datetime: new Date(), toJSON: function(){ return this; } },
    ];
    const users = [{ id: 10, name: "User1" }];
    const occasions = [{ id: 100, name: "Occ1" }];

    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue(users);
    getOccasionsByIds.mockResolvedValue(occasions);
    searchRemoteUsers.mockResolvedValue([]);

    const query = { page: 1, limit: 10 };
    const result = await getAllEventsService(query);

    expect(getEventsRepo).toHaveBeenCalledWith({
      whereConditions: {},
      limit: 10,
      offset: 0,
    });

    expect(getUsersByIds).toHaveBeenCalledWith([10]);
    expect(getOccasionsByIds).toHaveBeenCalledWith([100]);

    expect(result.data[0]).toMatchObject({
      id: 1,
      title: "Event1",
      user: users[0],
      occasion: occasions[0],
    });
    expect(result.total).toBe(1);
  });

  test("getAllEventsService - search filter with remote user IDs", async () => {
    const events = [
      { id: 2, title: "Birthday Party", user_id: 20, occasion_id: 200, event_datetime: new Date(), toJSON: function(){ return this; } },
    ];
    const users = [{ id: 20, name: "User2" }];
    const occasions = [{ id: 200, name: "Occ2" }];

    searchRemoteUsers.mockResolvedValue([20]);
    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue(users);
    getOccasionsByIds.mockResolvedValue(occasions);

    const query = { q: "User2" };
    const result = await getAllEventsService(query);

    expect(searchRemoteUsers).toHaveBeenCalledWith("User2");
    expect(getEventsRepo).toHaveBeenCalled();
    expect(result.data[0].user).toEqual(users[0]);
    expect(result.data[0].occasion).toEqual(occasions[0]);
  });

  test("getAllEventsService - status 'deleted'", async () => {
    const events = [
      { id: 3, title: "Deleted Event", user_id: null, occasion_id: null, deleted_at: new Date(), event_datetime: new Date(), toJSON: function(){ return this; } },
    ];

    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue([]);
    getOccasionsByIds.mockResolvedValue([]);
    searchRemoteUsers.mockResolvedValue([]);

    const query = { status: "deleted" };
    const result = await getAllEventsService(query);

    expect(result.data[0].status).toBe("deleted");
    expect(result.total).toBe(1);
  });

  test("getAllEventsService - empty result when date-range invalid", async () => {
    const query = { startDate: "2025-10-20", endDate: "2025-10-10" };
    const result = await getAllEventsService(query);

    expect(result.total).toBe(0);
    expect(result.count).toBe(0);
    expect(result.data).toEqual([]);
  });

  test("getAllEventsService - upcoming event status", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    const events = [
      { id: 4, title: "Future Event", user_id: null, occasion_id: null, event_datetime: futureDate, toJSON: function(){ return this; } },
    ];

    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue([]);
    getOccasionsByIds.mockResolvedValue([]);
    searchRemoteUsers.mockResolvedValue([]);

    const query = { status: "upcoming" };
    const result = await getAllEventsService(query);

    expect(result.data[0].status).toBe("upcoming");
  });

  test("getAllEventsService - today event status", async () => {
    const today = new Date();
    const events = [
      { id: 5, title: "Today Event", user_id: null, occasion_id: null, event_datetime: today, toJSON: function(){ return this; } },
    ];

    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue([]);
    getOccasionsByIds.mockResolvedValue([]);
    searchRemoteUsers.mockResolvedValue([]);

    const query = { status: "today" };
    const result = await getAllEventsService(query);

    expect(result.data[0].status).toBe("today");
  });

  test("getAllEventsService - completed event status", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
    const events = [
      { id: 6, title: "Past Event", user_id: null, occasion_id: null, event_datetime: pastDate, toJSON: function(){ return this; } },
    ];

    getEventsRepo.mockResolvedValue({ rows: events, count: 1 });
    getUsersByIds.mockResolvedValue([]);
    getOccasionsByIds.mockResolvedValue([]);
    searchRemoteUsers.mockResolvedValue([]);

    const query = { status: "completed" };
    const result = await getAllEventsService(query);

    expect(result.data[0].status).toBe("completed");
  });
});
