// __tests__/services/authService.test.js
import { jest } from "@jest/globals";

// ===================== Mocks =====================
jest.unstable_mockModule("../../repositories/authRepository.js", () => ({
  findAdminByEmail: jest.fn(),
  findAdminById: jest.fn(),
  saveAdmin: jest.fn(),
  findAdminById1: jest.fn(),
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

jest.unstable_mockModule("../../utils/requiredMethods.js", () => ({
  generateToken: jest.fn(() => "MOCK_TOKEN"),
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
    decode: jest.fn(),
  },
}));

// ===================== Imports =====================
const { findAdminByEmail, findAdminById, saveAdmin, findAdminById1 } =
  await import("../../repositories/authRepository.js");

const {
  loginService,
  logoutService,
  changePasswordService,
  getProfileService,
} = await import("../../services/authService.js");

// Import mocked modules with .default to match service's default import
const bcryptModule = await import("bcryptjs");
const bcrypt = bcryptModule.default;

const jwtModule = await import("jsonwebtoken");
const jwt = jwtModule.default;

const { generateToken } = await import("../../utils/requiredMethods.js");

// ===================== Tests =====================
describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loginService - success", async () => {
    const admin = {
      id: 1,
      email: "a@b.com",
      password: "hashedpassword",
      status: true,
      roles: [
        {
          code: "ADMIN",
          permissions: [{ name: "perm1" }, { name: "perm2" }],
        },
      ],
    };

    findAdminByEmail.mockResolvedValue(admin);
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue("token123");

    const result = await loginService({ email: "a@b.com", password: "pwd" });

    expect(findAdminByEmail).toHaveBeenCalledWith("a@b.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("pwd", "hashedpassword");
    expect(result.accessToken).toBe("token123");
    expect(result.admin).toBe(admin);
  });

  test("loginService - invalid password", async () => {
    findAdminByEmail.mockResolvedValue({
      id: 1,
      email: "a@b.com",
      password: "hashed",
      status: true,
      roles: [],
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginService({ email: "a@b.com", password: "wrong" })
    ).rejects.toThrow("Invalid email or password");
  });

  test("logoutService - no token", async () => {
    const msg = await logoutService(null);
    expect(msg).toBe("Logout successful (no token)");
  });

  test("logoutService - invalid token", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });
    const msg = await logoutService("bad.token");
    expect(msg).toBe("Logout successful (invalid token)");
  });

  test("logoutService - expired token: decode used", async () => {
    const err = new Error("expired");
    err.name = "TokenExpiredError";
    jwt.verify.mockImplementation(() => {
      throw err;
    });
    jwt.decode.mockReturnValue({ id: 5 });

    const msg = await logoutService("expired.token");
    expect(msg).toBe("Logout successful");
  });

  test("changePasswordService - success", async () => {
    const adminObj = { id: 2, password: "oldhash" };
    findAdminById.mockResolvedValue(adminObj);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("newHash");
    saveAdmin.mockResolvedValue(adminObj);

    const result = await changePasswordService({
      adminId: 2,
      currentPassword: "oldpass",
      newPassword: "newpass123",
    });

    expect(findAdminById).toHaveBeenCalledWith(2);
    expect(bcrypt.compare).toHaveBeenCalledWith("oldpass", "oldhash");
    expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
    expect(saveAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ password: "newHash" })
    );
    expect(result).toBe("Password changed successfully");
  });

  test("getProfileService - success", async () => {
    const admin = {
      id: 10,
      name: "A",
      email: "a@b",
      emp_id: "E1",
      phone_number: "999",
      status: true,
      roles: [
        { id: 1, permissions: [{ name: "p1" }] },
        { id: 2, permissions: [{ name: "p2" }] },
      ],
    };

    findAdminById1.mockResolvedValue(admin);

    const profile = await getProfileService(10);

    expect(profile).toMatchObject({
      id: 10,
      name: "A",
      email: "a@b",
      emp_id: "E1",
      phone_number: "999",
      status: true,
    });

    expect(profile.permissions).toEqual([{ name: "p1" }, { name: "p2" }]);
  });
});
