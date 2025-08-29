const OCCASIONS_CATEGORY = {
  1: "Wedding Related Occasions",
  2: "Birth & Baby Related Occasions",
  3: "Religious Ceremonies",
  4: "Professional & Academic Events",
  5: "Home & Social Events",
};

class OccasionResource {
  constructor(occasion) {
    this.occasionId = occasion.id;
    this.name = OccasionResource.cleanString(occasion.name);
    this.slug = occasion.slug;
    this.image = occasion.image;
    this.category = {
      id: occasion.category,
      name: OCCASIONS_CATEGORY[occasion.category] || "Unknown Category",
    };
  }

  // Static method to clean strings
  static cleanString(str) {
    if (!str) return str;
    return str.replace(/^["\\]+|["\\]+$/g, ""); // removes leading/trailing quotes or slashes
  }

  static collection(occasions) {
    return occasions.map((o) => new OccasionResource(o));
  }
}

module.exports = OccasionResource;
