import slugify from "slugify";
import multer from "multer";

//this method capitalize the sentence(first letter of each word is capital)
export const capitalizeSentence = (sentence = "") => {
  return sentence
    .toLowerCase()
    .split(" ")
    .filter((word) => word.trim() !== "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

//this method slugify the sentence (convert the sentence to a unique code including by replacing the space into '-' and add a unique code at the end. e.g admin dashboard -> admin-dashboard-823762)
export const slug = (name) => {
  return (
    slugify(name, { lower: true, strict: true }) +
    "-" +
    Date.now().toString().slice(-6)
  );
};

export const sanitizeName = (name) => {
  const ext = path.extname(name) || "";
  const base = path.basename(name, ext);
  return slugify(base, { lower: true, strict: true }) + ext.toLowerCase();
};

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const normalizeDecimal = (val) => {
  if (val === undefined || val === null || val === "" || val === "null") {
    return null;
  }
  return Number(val);
};

export const validationError = async (res, t, message) => {
  if (t) await t.rollback();
  return res.status(400).json({ success: false, message });
};
