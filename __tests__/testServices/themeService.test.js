// __tests__/services/themeService.test.js
import { jest } from "@jest/globals";

// ===================== MOCKS =====================
// Repositories
jest.unstable_mockModule("../../repositories/themeRepository.js", () => ({
  countryCodeRepo: jest.fn(),
  findThemeWithCategory: jest.fn(),
  updateThemeStatusRepo: jest.fn(),
  getThemesRepo: jest.fn(),
  createThemeRepo: jest.fn(),
  findOccasionById: jest.fn(),
  findThemeCategoryById: jest.fn(),
  updateThemeRepo: jest.fn(),
  findThemeTypeRepo: jest.fn(),
}));

// Queues
jest.unstable_mockModule("../../jobs/queues.js", () => ({
  imageUploadQueue: { add: jest.fn() },
  videoUploadQueue: { add: jest.fn() },
}));

// Utils
jest.unstable_mockModule("../../utils/requiredMethods.js", () => ({
  slug: jest.fn((s) => s.toLowerCase().replace(/\s+/g, "-")),
  capitalizeSentence: jest.fn((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  sanitizeFileName: jest.fn((s) => s),
  normalizeDecimal: jest.fn((n) => n),
}));

// Models
jest.unstable_mockModule("../../models/index.js", () => ({
  remoteSequelize: {},
  Sequelize: { DataTypes: {} },
}));

// Remote Occasion Model
const findAllMock = jest.fn().mockResolvedValue([{ id: 10, name: "Occ1" }]);
jest.unstable_mockModule("../../models/remote/occasion.js", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    findAll: findAllMock,
  })),
}));

// ===================== IMPORTS =====================
const themeRepo = await import("../../repositories/themeRepository.js");
const queues = await import("../../jobs/queues.js");
const utils = await import("../../utils/requiredMethods.js");
const { remoteSequelize, Sequelize } = await import("../../models/index.js");
const OccasionModelFactory = (await import("../../models/remote/occasion.js")).default;
const themeService = await import("../../services/themeService.js");

// Instantiate mock OccasionModel (same instance service uses)
OccasionModelFactory(remoteSequelize, Sequelize.DataTypes);

// ===================== TESTS =====================
describe("themeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("countryCodeService - returns country codes", async () => {
    themeRepo.countryCodeRepo.mockResolvedValue(["IN", "US"]);
    const result = await themeService.countryCodeService();
    expect(result).toEqual(["IN", "US"]);
  });

  test("updateThemeStatusService - success", async () => {
    const fakeTheme = { id: 1, name: "Test Theme" };
    themeRepo.findThemeWithCategory.mockResolvedValue(fakeTheme);
    themeRepo.updateThemeStatusRepo.mockResolvedValue(true);

    const result = await themeService.updateThemeStatusService(1, true, { id: 10, name: "Admin", emp_id: "E1" });

    expect(themeRepo.findThemeWithCategory).toHaveBeenCalledWith(1);
    expect(themeRepo.updateThemeStatusRepo).toHaveBeenCalledWith(fakeTheme, true);
    expect(result).toBe(fakeTheme);
  });

  test("getAllThemeService - success with occasions from remote DB", async () => {
    const fakeThemes = [
      {
        id: 1,
        occasion_id: 10,
        category_id: 100,
        themeCategory: { name: "Cat1" },
        themeType: { name: "Type1" },
        preview_image: "img.png",
        preview_video: null,
        component_name: "comp",
        base_price: 100,
        offer_price: 80,
        currency: "INR",
        status: true,
      },
    ];
    themeRepo.getThemesRepo.mockResolvedValue({ rows: fakeThemes, count: 1 });

    const result = await themeService.getAllThemeService({ page: 1, limit: 10 });

    expect(findAllMock).toHaveBeenCalled(); // Use the mocked findAll
    expect(result.data[0].occasion.name).toBe("Occ1");
    expect(result.total).toBe(1);
  });

  test("createThemeService - success enqueues image/video jobs", async () => {
    themeRepo.findThemeCategoryById.mockResolvedValue({ id: 1, type: "video" });
    themeRepo.findThemeTypeRepo.mockResolvedValue({ id: 1 });
    themeRepo.findOccasionById.mockResolvedValue({ id: 1 });
    const fakeTheme = { id: 1, preview_image: null, preview_video: null };
    themeRepo.createThemeRepo.mockResolvedValue(fakeTheme);

    const files = {
      preview_image: [{ buffer: Buffer.from("img"), originalname: "img.png", mimetype: "image/png" }],
      preview_video: [{ buffer: Buffer.from("vid"), originalname: "vid.mp4", mimetype: "video/mp4" }],
    };

    const result = await themeService.createThemeService(
      { occasion_id: 1, category_id: 1, theme_type_id: 1, name: "Test Theme" },
      files
    );

    expect(themeRepo.createThemeRepo).toHaveBeenCalled();
    expect(queues.imageUploadQueue.add).toHaveBeenCalled();
    expect(queues.videoUploadQueue.add).toHaveBeenCalled();
    expect(result).toBe(fakeTheme);
  });

  test("updateThemeService - success enqueues image/video jobs", async () => {
    const fakeTheme = {
      id: 1,
      category_id: 1,
      occasion_id: 1,
      theme_type_id: 1,
      preview_image: null,
      preview_video: null,
      name: "Old",
      slug: "old",
      component_name: null,
      config: {},
      base_price: 100,
      offer_price: 90,
      currency: "INR",
      status: true,
    };
    themeRepo.findThemeWithCategory.mockResolvedValue(fakeTheme);
    themeRepo.findThemeCategoryById.mockResolvedValue({ type: "video" });
    themeRepo.findOccasionById.mockResolvedValue({ id: 1 });
    themeRepo.updateThemeRepo.mockResolvedValue(true);

    const files = {
      preview_image: [{ buffer: Buffer.from("img"), originalname: "img.png", mimetype: "image/png" }],
      preview_video: [{ buffer: Buffer.from("vid"), originalname: "vid.mp4", mimetype: "video/mp4" }],
    };

    const result = await themeService.updateThemeService(1, { name: "New Name" }, files);

    expect(themeRepo.updateThemeRepo).toHaveBeenCalled();
    expect(queues.imageUploadQueue.add).toHaveBeenCalled();
    expect(queues.videoUploadQueue.add).toHaveBeenCalled();
    expect(result).toBe(fakeTheme);
  });
});
