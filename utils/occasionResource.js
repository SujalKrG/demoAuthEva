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
    this.event_profile_theme = occasion.event_profile_theme;
    this.user_preview_theme = occasion.user_preview_theme;
    this.title_suffix = occasion.title_suffix;
    this.status = occasion.status;
    this.invitation_status = occasion.invitation_status;
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
