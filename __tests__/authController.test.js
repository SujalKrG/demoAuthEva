// tests/controllers/authController.test.js

jest.mock("../services/authService.js", () => ({
  loginService: jest.fn(),
  logoutService: jest.fn(),
  changePasswordService: jest.fn(),
  getProfileService: jest.fn(),
}));

import {
  login,
  logout,
  changePassword,
  getProfile,
} from "../controllers/authController.js";
import {
  loginService,
  logoutService,
  changePasswordService,
  getProfileService,
} from "../services/authService.js";

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  beforeEach(() => jest.clearAllMocks());

  test("login controller - success", async () => {
    const req = { body: { email: "a@b", password: "pwd" } };
    const res = makeRes();

    loginService.mockResolvedValue({
      admin: { id: 1,  },
   
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        // message: "Login successful",
        // accessToken: "tok"
        admin: {
          id: 1,
        
        },
      })
    );
  });

  test("login controller - failure", async () => {
    const req = { body: { email: "a@b", password: "pwd" } };
    const res = makeRes();

    loginService.mockRejectedValue(new Error("Invalid"));

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("changePassword - unauthorized", async () => {
    const req = { admin: undefined };
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Unauthorized" })
    );
  });

  test("getProfile - success", async () => {
    const req = { admin: { id: 5 } };
    const res = makeRes();
    getProfileService.mockResolvedValue({ id: 5});

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, admin: { id: 5 } })
    );
  });

  test("logout - reads token header and returns message", async () => {
    const req = { headers: { authorization: "Bearer sometoken" } };
    const res = makeRes();
    logoutService.mockResolvedValue("Logout successful");

    await logout(req, res);

    expect(logoutService).toHaveBeenCalledWith("sometoken");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
