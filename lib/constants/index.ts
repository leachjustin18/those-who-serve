/**
 * Available scheduling roles with metadata for day ordering and display labeling.
 */
export const ROLE_OPTIONS = [
  {
    label: "Morning Singing",
    value: "morning_singing",
    day: "Sunday",
    number: 1,
  },
  { label: "Lord's Table", value: "lords_table", day: "Sunday", number: 1 },
  {
    label: "Morning Prayer",
    value: "morning_prayer",
    day: "Sunday",
    number: 2,
  },
  {
    label: "Evening Singing",
    value: "evening_singing",
    day: "Sunday",
    number: 1,
  },
  {
    label: "Evening Prayers",
    value: "evening_prayers",
    day: "Sunday",
    number: 2,
  },
  { label: "Lead Singing", value: "lead_singing", day: "Wednesday", number: 1 },
  { label: "Devotional", value: "devotional", day: "Wednesday", number: 1 },
  {
    label: "Closing Prayer",
    value: "closing_prayer",
    day: "Wednesday",
    number: 1,
  },
];

/**
 * Acceptable MIME types for uploaded profile or service photos.
 */
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Maximum allowed file size, in bytes, for uploaded photos (5 MB).
 */
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Cache key for men data.
 */
export const MEN_CACHE_KEY = "men";
