// __tests__/controllers/admin.controller.test.js
import { jest } from "@jest/globals";

// ===================== MOCKS =====================
jest.unstable_mockModule("../../services/adminService.js", () => ({
  AdminService: {
    createAdmin: jest.fn(),
    getAdminWithRoleAndPermissions: jest.fn(),
    updateAdmin: jest.fn(),
    updateAdminStatus: jest.fn(),
  },
}));

jest.unstable_mockModule("../../utils/logger.js", () => ({
  logger: { error: jest.fn() },
}));

// ===================== IMPORTS =====================
const { AdminService } = await import("../../services/adminService.js");
const { logger } = await import("../../utils/logger.js");
const adminController = await import("../../controllers/adminController.js");

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

// Mock request object
const mockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
});

// ===================== TESTS =====================
describe("AdminController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addAdmin - success", async () => {
    const req = mockReq({ name: "Admin1" });
    const res = mockRes();

    AdminService.createAdmin.mockResolvedValue({ id: 1, name: "Admin1" });

    await adminController.addAdmin(req, res);

    expect(AdminService.createAdmin).toHaveBeenCalledWith({ name: "Admin1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Admin created successfully",
      data: { id: 1, name: "Admin1" },
    });
  });

  test("addAdmin - failure", async () => {
    const req = mockReq({ name: "Admin1" });
    const res = mockRes();

    AdminService.createAdmin.mockRejectedValue(new Error("Create failed"));

    await adminController.addAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Create failed",
    });
  });

  test("getAdminWithRoleAndPermissionsById - success", async () => {
    const req = mockReq({}, {}, { role: "ADMIN", status: "active", search: "A" });
    const res = mockRes();

    AdminService.getAdminWithRoleAndPermissions.mockResolvedValue([{ id: 1, name: "Admin1" }]);

    await adminController.getAdminWithRoleAndPermissionsById(req, res);

    expect(AdminService.getAdminWithRoleAndPermissions).toHaveBeenCalledWith({
      role: "ADMIN",
      status: "active",
      search: "A",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Fetched successfully",
      data: [{ id: 1, name: "Admin1" }],
    });
  });

  test("getAdminWithRoleAndPermissionsById - failure", async () => {
    const req = mockReq();
    const res = mockRes();

    AdminService.getAdminWithRoleAndPermissions.mockRejectedValue(new Error("Not found"));

    await adminController.getAdminWithRoleAndPermissionsById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Admin not found",
    });
  });

  test("updateAdminWithRoles - success with string roles", async () => {
    const req = mockReq({ roles: "[1,2]" }, { id: "5" });
    const res = mockRes();

    AdminService.updateAdmin.mockResolvedValue({ id: 5, roles: [1, 2] });

    await adminController.updateAdminWithRoles(req, res);

    expect(AdminService.updateAdmin).toHaveBeenCalledWith("5", { roles: [1, 2] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin updated successfully",
      data: { id: 5, roles: [1, 2] },
    });
  });

  test("updateAdminWithRoles - admin not found", async () => {
    const req = mockReq({ roles: "[1,2]" }, { id: 5 });
    const res = mockRes();

    AdminService.updateAdmin.mockResolvedValue(null);

    await adminController.updateAdminWithRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin not found" });
  });

  test("updateAdminWithRoles - error logged", async () => {
    const req = mockReq({ roles: "[1,2]" }, { id: 5 });
    const res = mockRes();

    const error = new Error("Unexpected error");
    AdminService.updateAdmin.mockRejectedValue(error);

    await adminController.updateAdminWithRoles(req, res);

    expect(logger.error).toHaveBeenCalledWith(`[updateAdminController] ${error.message}`);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  test("updateAdminStatusController - success", async () => {
    const req = mockReq({ status: true }, { id: 5 });
    const res = mockRes();

    AdminService.updateAdminStatus.mockResolvedValue(true);

    await adminController.updateAdminStatusController(req, res);

    expect(AdminService.updateAdminStatus).toHaveBeenCalledWith(5, true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Admin status updated successfully",
    });
  });

  test("updateAdminStatusController - admin not found", async () => {
    const req = mockReq({ status: true }, { id: 5 });
    const res = mockRes();

    AdminService.updateAdminStatus.mockResolvedValue(null);

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin not found" });
  });

  test("updateAdminStatusController - validation error", async () => {
    const req = mockReq({ status: undefined }, { id: 5 });
    const res = mockRes();

    const error = new Error("Status is required");
    AdminService.updateAdminStatus.mockRejectedValue(error);

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Status is required" });
  });

  test("updateAdminStatusController - internal server error", async () => {
    const req = mockReq({ status: true }, { id: 5 });
    const res = mockRes();

    const error = new Error("DB connection failed");
    AdminService.updateAdminStatus.mockRejectedValue(error);

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
