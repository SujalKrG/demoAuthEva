// __tests__/controllers/occasionFieldController.test.js
import { jest } from "@jest/globals";

// ========== MOCK SERVICE ==========
jest.unstable_mockModule("../../services/occasionFieldService.js", () => ({
  createOccasionFieldsService: jest.fn(),
  updateOccasionFieldService: jest.fn(),
  deleteOccasionFieldService: jest.fn(),
  getAllOccasionFieldsService: jest.fn(),
  getOccasionFieldsByIdService: jest.fn(),
}));

const {
  createOccasionFieldsService,
  updateOccasionFieldService,
  deleteOccasionFieldService,
  getAllOccasionFieldsService,
  getOccasionFieldsByIdService,
} = await import("../../services/occasionFieldService.js");

const {
  createOccasionField,
  updateOccasionField,
  deleteOccasionField,
  getAllOccasionFields,
  getOccasionFieldsById,
} = await import("../../controllers/occasionFieldController.js");

describe("OccasionFieldController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, admin: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // ========== CREATE OCCASION FIELD ==========
  test("createOccasionField - success", async () => {
    const mockData = [{ id: 1, name: "Birthday" }];
    createOccasionFieldsService.mockResolvedValue(mockData);
    req.body = { name: "Birthday" };
    req.admin.id = 1;

    await createOccasionField(req, res);

    expect(createOccasionFieldsService).toHaveBeenCalledWith(req.body, 1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: `${mockData.length} Occasion field(s) created successfully`,
      data: mockData,
    });
  });

  test("createOccasionField - duplicate error", async () => {
    const error = new Error("Duplicate");
    error.name = "SequelizeUniqueConstraintError";
    createOccasionFieldsService.mockRejectedValue(error);

    await createOccasionField(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Duplicate entry",
      details: error.errors,
    });
  });

  // ========== UPDATE OCCASION FIELD ==========
  test("updateOccasionField - success", async () => {
    updateOccasionFieldService.mockResolvedValue([true]);
    req.params.id = "10";
    req.body = { name: "Anniversary" };
    req.admin.id = 1;

    await updateOccasionField(req, res);

    expect(updateOccasionFieldService).toHaveBeenCalledWith("10", req.body, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Occasion field with ID (10) updated successfully",
    });
  });

  test("updateOccasionField - not found", async () => {
    updateOccasionFieldService.mockResolvedValue([0]);
    req.params.id = "10";
    req.body = { name: "Anniversary" };
    req.admin.id = 1;

    await updateOccasionField(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Occasion field not found or no changes made",
    });
  });

  // ========== DELETE OCCASION FIELD ==========
  test("deleteOccasionField - success", async () => {
    deleteOccasionFieldService.mockResolvedValue(true);
    req.params.id = "5";
    req.admin.id = 1;

    await deleteOccasionField(req, res);

    expect(deleteOccasionFieldService).toHaveBeenCalledWith("5", 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Occasion field with ID (5) deleted successfully",
    });
  });

  test("deleteOccasionField - not found", async () => {
    deleteOccasionFieldService.mockResolvedValue(false);
    req.params.id = "5";
    req.admin.id = 1;

    await deleteOccasionField(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Occasion field not found",
    });
  });

  // ========== GET ALL OCCASION FIELDS ==========
  test("getAllOccasionFields - success", async () => {
    const mockData = [{ id: 1, name: "Birthday" }];
    getAllOccasionFieldsService.mockResolvedValue(mockData);

    await getAllOccasionFields(req, res);

    expect(getAllOccasionFieldsService).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  // ========== GET OCCASION FIELD BY ID ==========
  test("getOccasionFieldsById - success", async () => {
    const mockData = { id: 3, name: "Wedding" };
    getOccasionFieldsByIdService.mockResolvedValue(mockData);
    req.params.id = "3";

    await getOccasionFieldsById(req, res);

    expect(getOccasionFieldsByIdService).toHaveBeenCalledWith("3");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("getOccasionFieldsById - not found", async () => {
    getOccasionFieldsByIdService.mockResolvedValue(null);
    req.params.id = "3";

    await getOccasionFieldsById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No occasion fields found",
    });
  });
});
