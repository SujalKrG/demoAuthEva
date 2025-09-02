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
    this.name = cleanString(occasion.name); // use function directly
    this.slug = occasion.slug;
    this.image = occasion.image;
    this.category = {
      id: occasion.category,
      name: OCCASIONS_CATEGORY[occasion.category] || "Unknown Category",
    };
  }

  static collection(occasions) {
    return occasions.map((o) => new OccasionResource(o));
  }
}

// 👇 move cleanString outside and export it
export function cleanString(str) {
  if (!str) return str;
  return str.replace(/^["\\]+|["\\]+$/g, "");
}

export default OccasionResource;
