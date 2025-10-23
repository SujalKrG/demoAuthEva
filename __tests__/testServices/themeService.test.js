// __tests__/testServices/themeService.test.js
import { jest } from "@jest/globals";

// ========== MOCK REPOSITORIES ==========
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

// ========== MOCK QUEUES ==========
jest.unstable_mockModule("../../jobs/queues.js", () => ({
  imageUploadQueue: { add: jest.fn() },
  videoUploadQueue: { add: jest.fn() },
}));

// ========== MOCK UTILS ==========
jest.unstable_mockModule("../../utils/requiredMethods.js", () => ({
  slug: jest.fn((s) => `slug-${s}`),
  capitalizeSentence: jest.fn((s) => s.toUpperCase()),
  sanitizeFileName: jest.fn((s) => s),
  normalizeDecimal: jest.fn((v) => v),
}));

// ========== MOCK MODELS ==========
jest.unstable_mockModule("../../models/remote/occasion.js", () => ({
  OccasionModelFactory: jest.fn().mockReturnValue({
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: "Occasion1" }]),
  }),
}));

// ========== IMPORTS AFTER MOCKS ==========
const {
  countryCodeRepo,
  findThemeWithCategory,
  updateThemeStatusRepo,
  getThemesRepo,
  createThemeRepo,
  findOccasionById,
  findThemeCategoryById,
  updateThemeRepo,
  findThemeTypeRepo,
} = await import("../../repositories/themeRepository.js");

const { imageUploadQueue, videoUploadQueue } = await import(
  "../../jobs/queues.js"
);
const { slug, capitalizeSentence, sanitizeFileName, normalizeDecimal } =
  await import("../../utils/requiredMethods.js");
const { OccasionModelFactory } = await import(
  "../../models/remote/occasion.js"
);

const {
  countryCodeService,
  updateThemeStatusService,
  getAllThemeService,
  createThemeService,
  updateThemeService,
} = await import("../../services/themeService.js");

describe("Theme Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("countryCodeService returns data", async () => {
    countryCodeRepo.mockResolvedValue([{ code: "+91" }]);
    const result = await countryCodeService();
    expect(countryCodeRepo).toHaveBeenCalled();
    expect(result).toEqual([{ code: "+91" }]);
  });

  test("updateThemeStatusService updates status", async () => {
    const mockTheme = { id: 1, name: "Theme1" };
    findThemeWithCategory.mockResolvedValue(mockTheme);
    updateThemeStatusRepo.mockResolvedValue();

    const result = await updateThemeStatusService(1, true, {
      id: 1,
      name: "Admin",
      emp_id: "EMP001",
    });
    expect(findThemeWithCategory).toHaveBeenCalledWith(1);
    expect(updateThemeStatusRepo).toHaveBeenCalledWith(mockTheme, true);
    expect(result).toEqual(mockTheme);
  });

  test("getAllThemeService returns formatted data", async () => {
    getThemesRepo.mockResolvedValue({
      rows: [
        {
          id: 1,
          name: "Theme1",
          occasion_id: 1,
          category_id: 1,
          themeCategory: { name: "Cat1" },
          theme_type_id: null,
          themeType: null,
          preview_image: "img.jpg",
          preview_video: null,
          component_name: "Comp",
          base_price: 100,
          offer_price: 80,
          currency: "INR",
          status: true,
        },
      ],
      count: 1,
    });

    const result = await getAllThemeService({ page: 1, limit: 10 });
    expect(getThemesRepo).toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.data[0].name).toBe("Theme1");
  });

  test("createThemeService creates theme and queues image/video", async () => {
    findThemeCategoryById.mockResolvedValue({ id: 1, type: "video" });
    findThemeTypeRepo.mockResolvedValue({ id: 1 });
    findOccasionById.mockResolvedValue({ id: 1 });
    createThemeRepo.mockResolvedValue({ id: 1 });

    const files = {
      preview_image: [
        {
          buffer: Buffer.from("img"),
          originalname: "img.png",
          mimetype: "image/png",
        },
      ],
      preview_video: [
        {
          buffer: Buffer.from("vid"),
          originalname: "vid.mp4",
          mimetype: "video/mp4",
        },
      ],
    };

    const result = await createThemeService(
      { name: "Theme1", occasion_id: 1, category_id: 1, theme_type_id: 1 },
      files
    );

    expect(findThemeCategoryById).toHaveBeenCalled();
    expect(findThemeTypeRepo).toHaveBeenCalled();
    expect(findOccasionById).toHaveBeenCalled();
    expect(createThemeRepo).toHaveBeenCalled();
    expect(imageUploadQueue.add).toHaveBeenCalled();
    expect(videoUploadQueue.add).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });
});
