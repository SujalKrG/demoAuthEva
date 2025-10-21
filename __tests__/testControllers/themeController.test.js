import { expect, jest } from "@jest/globals";

jest.unstable_mockModule("../../services/themeService.js", () => ({
  createThemeService: jest.fn(),
}));
jest.unstable_mockModule("../../utils/logActivity.js", () => jest.fn());

const { createTheme } = await import("../../controllers/themeController.js");
const { createTheme: createThemeService } = await import(
  "../../services/themeService.js"
);

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

test("should create a theme successfully", async () => {
  const req = {
    body: { name: "alice", file: {}, admin: { admin: mockAdmin } },
  };
  const res = makeRes();

  createThemeService.mockResolvedValue({ id: 1, name: "alice" });

  await createTheme(req, res);

  expect(createAdminService).toHaveBeenCalledWith(req.body);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    success: true,
    message: "Theme created successfully",
    data: { id: 1, name: "alice" },
  });
});

test("should return 400 if field missing", async () => {
  const req = { body: { email: "" } };
  const res = makeRes();

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ success: false, message: "missing fields" })
  );
});

test("should return 500 if server fails", async () => {
    const req = { body: { name: "alice" } };
    const res = makeRes()

    createAdminService.mockRejectedValue(new Error("DB Error"));

    await createTheme(req)
});
