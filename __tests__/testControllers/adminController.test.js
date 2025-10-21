// __tests__/controllers/adminController.test.js
import { jest } from "@jest/globals";

// ========== MOCK ADMIN SERVICE ==========
jest.unstable_mockModule("../../services/adminService.js", () => ({
  AdminService: {
    createAdmin: jest.fn(),
    getAdminWithRoleAndPermissions: jest.fn(),
    updateAdmin: jest.fn(),
    updateAdminStatus: jest.fn(),
  },
}));

const { AdminService } = await import("../../services/adminService.js");
const adminController = await import("../../controllers/adminController.js");

describe("AdminController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ================= ADD ADMIN =================
  test("addAdmin - success", async () => {
    const mockAdmin = { id: 1, name: "Admin1" };
    AdminService.createAdmin.mockResolvedValue(mockAdmin);
    req.body = { name: "Admin1" };

    await adminController.addAdmin(req, res);

    expect(AdminService.createAdmin).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Admin created successfully",
      data: mockAdmin,
    });
  });

  test("addAdmin - failure", async () => {
    AdminService.createAdmin.mockRejectedValue(new Error("Error creating"));
    req.body = { name: "Admin1" };

    await adminController.addAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error creating",
    });
  });

  // =============== GET ADMIN WITH ROLE =================
  test("getAdminWithRoleAndPermissionsById - success", async () => {
    const mockData = [{ id: 1, name: "Admin1" }];
    AdminService.getAdminWithRoleAndPermissions.mockResolvedValue(mockData);
    req.query = { role: "ADMIN", status: true, search: "Alok" };

    await adminController.getAdminWithRoleAndPermissionsById(req, res);

    expect(AdminService.getAdminWithRoleAndPermissions).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Fetched successfully",
      data: mockData,
    });
  });

  test("getAdminWithRoleAndPermissionsById - failure", async () => {
    AdminService.getAdminWithRoleAndPermissions.mockRejectedValue(new Error("Not found"));

    await adminController.getAdminWithRoleAndPermissionsById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Admin not found",
    });
  });

  // =============== UPDATE ADMIN WITH ROLES =================
  test("updateAdminWithRoles - success with array roles", async () => {
    const updatedAdmin = { id: 5, roles: [1, 2] };
    AdminService.updateAdmin.mockResolvedValue(updatedAdmin);
    req.params.id = 5;
    req.body = { roles: [1, 2] };

    await adminController.updateAdminWithRoles(req, res);

    expect(AdminService.updateAdmin).toHaveBeenCalledWith(5, { roles: [1, 2] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  });

  test("updateAdminWithRoles - success with string roles", async () => {
    const updatedAdmin = { id: 5, roles: [1, 2] };
    AdminService.updateAdmin.mockResolvedValue(updatedAdmin);
    req.params.id = "5";
    req.body = { roles: "1,2" };

    await adminController.updateAdminWithRoles(req, res);

    expect(AdminService.updateAdmin).toHaveBeenCalledWith("5", { roles: [1, 2] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  });

  test("updateAdminWithRoles - admin not found", async () => {
    AdminService.updateAdmin.mockResolvedValue(null);
    req.params.id = 5;
    req.body = { roles: [1, 2] };

    await adminController.updateAdminWithRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin not found" });
  });

  test("updateAdminWithRoles - internal error", async () => {
    AdminService.updateAdmin.mockRejectedValue(new Error("DB error"));
    req.params.id = 5;
    req.body = { roles: [1, 2] };

    await adminController.updateAdminWithRoles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  // =============== UPDATE ADMIN STATUS =================
  test("updateAdminStatusController - success", async () => {
    AdminService.updateAdminStatus.mockResolvedValue(true);
    req.params.id = 5;
    req.body.status = true;

    await adminController.updateAdminStatusController(req, res);

    expect(AdminService.updateAdminStatus).toHaveBeenCalledWith(5, true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Admin status updated successfully",
    });
  });

  test("updateAdminStatusController - admin not found", async () => {
    AdminService.updateAdminStatus.mockResolvedValue(false);
    req.params.id = 5;
    req.body.status = true;

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin not found" });
  });

  test("updateAdminStatusController - status required error", async () => {
    AdminService.updateAdminStatus.mockRejectedValue(new Error("Status is required"));
    req.params.id = 5;
    req.body.status = null;

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Status is required" });
  });

  test("updateAdminStatusController - internal error", async () => {
    AdminService.updateAdminStatus.mockRejectedValue(new Error("DB error"));
    req.params.id = 5;
    req.body.status = true;

    await adminController.updateAdminStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
