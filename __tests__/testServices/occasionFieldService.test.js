// __tests__/services/occasionFieldService.test.js
import { jest } from "@jest/globals";

// ===================== MOCKS =====================
jest.unstable_mockModule("../../models/index.js", () => ({
  db: {},
  sequelize: { transaction: jest.fn((fn) => fn({})) }, // mock transaction
  default: { sequelize: { transaction: jest.fn((fn) => fn({})) } },
}));

jest.unstable_mockModule("../../repositories/occasionFieldRepository.js", () => ({
  bulkCreateOccasionFields: jest.fn(),
  updateOccasionFieldById: jest.fn(),
  deleteOccasionFieldById: jest.fn(),
  findAllActiveOccasions: jest.fn(),
  findAllOccasionFields: jest.fn(),
  findOccasionById: jest.fn(),
}));

jest.unstable_mockModule("../../utils/occasionResource.js", () => ({
  __esModule: true,
  default: class OccasionResource {
    constructor(data) {
      this.occasionId = data.id;
      this.name = data.name;
    }
    static collection(items) {
      return items.map((i) => new OccasionResource(i));
    }
  },
}));

// ===================== IMPORTS =====================
const dbModule = await import("../../models/index.js");
const occasionRepo = await import("../../repositories/occasionFieldRepository.js");
const OccasionResource = (await import("../../utils/occasionResource.js")).default;
const occasionService = await import("../../services/occasionFieldService.js");

// ===================== TESTS =====================
describe("occasionFieldService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createOccasionFieldsService - normalizes data & calls bulkCreate", async () => {
    const rawData = [
      { occasion_id: "1", order_no: "5", required: "true", options: '["a","b"]' },
    ];
    occasionRepo.bulkCreateOccasionFields.mockResolvedValue(true);

    const result = await occasionService.createOccasionFieldsService(rawData, 10);

    expect(occasionRepo.bulkCreateOccasionFields).toHaveBeenCalledWith(
      expect.any(Array),
      {},
      10
    );

    expect(result[0]).toMatchObject({
      occasion_id: 1,
      order_no: 5,
      required: true,
      options: ["a", "b"],
    });
  });

  test("updateOccasionFieldService - calls repo update", async () => {
    occasionRepo.updateOccasionFieldById.mockResolvedValue("updated");
    const res = await occasionService.updateOccasionFieldService(1, { label: "New" }, 10);

    expect(occasionRepo.updateOccasionFieldById).toHaveBeenCalledWith(1, { label: "New" }, 10);
    expect(res).toBe("updated");
  });

  test("deleteOccasionFieldService - calls repo delete", async () => {
    occasionRepo.deleteOccasionFieldById.mockResolvedValue("deleted");
    const res = await occasionService.deleteOccasionFieldService(1, 10);

    expect(occasionRepo.deleteOccasionFieldById).toHaveBeenCalledWith(1, 10);
    expect(res).toBe("deleted");
  });

  test("getAllOccasionFieldsService - returns normalized occasions with formFields", async () => {
    const occasions = [{ id: 1, name: "Occ1" }];
    const fields = [
      { id: 100, occasion_id: 1, field_key: "f1", label: "Label1", type: "text", required: true, options: [], order_no: 1 },
    ];

    occasionRepo.findAllActiveOccasions.mockResolvedValue(occasions);
    occasionRepo.findAllOccasionFields.mockResolvedValue(fields);

    const result = await occasionService.getAllOccasionFieldsService();

    expect(occasionRepo.findAllActiveOccasions).toHaveBeenCalled();
    expect(occasionRepo.findAllOccasionFields).toHaveBeenCalled();

    expect(result[0]).toMatchObject({
      occasionId: 1,
      formFields: [
        {
          formFieldId: 100,
          fieldKey: "f1",
          label: "Label1",
          type: "text",
          required: true,
          options: [],
          orderNo: 1,
        },
      ],
    });
  });

  test("getOccasionFieldsByIdService - returns null if occasion not found", async () => {
    occasionRepo.findOccasionById.mockResolvedValue(null);

    const res = await occasionService.getOccasionFieldsByIdService(1);
    expect(res).toBeNull();
  });

  test("getOccasionFieldsByIdService - returns occasion with formFields", async () => {
    const occasion = { id: 1, name: "Occ1" };
    const fields = [
      { id: 100, occasion_id: 1, field_key: "f1", label: "Label1", type: "text", required: true, options: [], order_no: 1 },
    ];
    occasionRepo.findOccasionById.mockResolvedValue(occasion);
    occasionRepo.findAllOccasionFields.mockResolvedValue(fields);

    const res = await occasionService.getOccasionFieldsByIdService(1);

    expect(res).toMatchObject({
      occasionId: 1,
      formFields: [
        {
          formFieldId: 100,
          fieldKey: "f1",
          label: "Label1",
          type: "text",
          required: true,
          options: [],
          orderNo: 1,
        },
      ],
    });
  });
});
