// __tests__/controllers/themeController.test.js
import { jest } from "@jest/globals";

// ========== MOCK SERVICES ==========
jest.unstable_mockModule("../../services/themeService.js", () => ({
  updateThemeService: jest.fn(),
  createThemeService: jest.fn(),
  countryCodeService: jest.fn(),
  updateThemeStatusService: jest.fn(),
  getAllThemeService: jest.fn(),
}));

jest.unstable_mockModule("../../utils/logActivity.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../../utils/logger.js", () => ({
  logger: { error: jest.fn() },
}));

const {
  updateThemeService,
  createThemeService,
  countryCodeService,
  updateThemeStatusService,
  getAllThemeService,
} = await import("../../services/themeService.js");

const logActivity = (await import("../../utils/logActivity.js")).default;
const { logger } = await import("../../utils/logger.js");

const {
  updateTheme,
  createTheme,
  countryCode,
  updateStatus,
  getAllTheme,
} = await import("../../controllers/themeController.js");

describe("ThemeController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, files: [], admin: { id: 1, name: "Admin", emp_id: "EMP001" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("updateTheme - success", async () => {
    updateThemeService.mockResolvedValue({ id: 1, name: "Theme1" });
    await updateTheme(req, res);

    expect(updateThemeService).toHaveBeenCalledWith(req.params.id, req.body, req.files);
    expect(logActivity).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Theme updated successfully",
    });
  });

  test("createTheme - success", async () => {
    createThemeService.mockResolvedValue({ id: 1, name: "Theme1" });
    await createTheme(req, res);

    expect(createThemeService).toHaveBeenCalledWith(req.body, req.files);
    expect(logActivity).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Theme created successfully",
      data: { id: 1, name: "Theme1" },
    });
  });

  test("countryCode - success", async () => {
    countryCodeService.mockResolvedValue([{ code: "+91" }]);
    await countryCode(req, res);

    expect(countryCodeService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ code: "+91" }]);
  });

  test("updateStatus - success", async () => {
    updateThemeStatusService.mockResolvedValue({ id: 1, status: true });
    req.params.id = 1;
    req.body.status = true;

    await updateStatus(req, res);

    expect(updateThemeStatusService).toHaveBeenCalledWith(1, true, req.admin);
    expect(logActivity).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Theme status updated successfully",
      data: { id: 1, status: true },
    });
  });

  test("getAllTheme - success", async () => {
    getAllThemeService.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });
    await getAllTheme(req, res);

    expect(getAllThemeService).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      rows: [{ id: 1 }],
    });
  });
});
