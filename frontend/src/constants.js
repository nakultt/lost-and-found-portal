// Must match CATEGORIES in backend/models/Post.js
export const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'books', label: 'Books' },
  { value: 'id-cards', label: 'ID Cards' },
  { value: 'keys', label: 'Keys' },
  { value: 'bags', label: 'Bags' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'others', label: 'Others' },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || value;
