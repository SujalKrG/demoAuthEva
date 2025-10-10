// tests/services/authService.test.js
// mocks must come before the module under test is imported

jest.mock("../repositories/authRepository.js", () => ({
  findAdminByEmail: jest.fn(),
  findAdminById: jest.fn(),
  saveAdmin: jest.fn(),
  findAdminById1: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../utils/requiredMethods.js", () => ({
  generateToken: jest.fn(() => "MOCK_TOKEN"),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  decode: jest.fn(),
}));

// now import what we want to test and the mocks

import {
  findAdminByEmail,
  findAdminById,
  saveAdmin,
  findAdminById1,
} from "../repositories/authRepository.js";
import {
  loginService,
  logoutService,
  changePasswordService,
  getProfileService,
} from "../services/authService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/requiredMethods.js";

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

    // permissions should be flattened to an array of permission objects
    expect(profile.permissions).toEqual([{ name: "p1" }, { name: "p2" }]);
  });
});
