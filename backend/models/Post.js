const mongoose = require('mongoose');

// Allowed values are exported so routes and the seed script share one source of truth.
const CATEGORIES = [
  'electronics',
  'books',
  'id-cards',
  'keys',
  'bags',
  'clothing',
  'accessories',
  'stationery',
  'others',
];
const POST_TYPES = ['lost', 'found'];
const STATUSES = ['open', 'resolved'];

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Contact name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, 'Please enter a valid phone number'],
    },
  },
  { _id: false } // embedded sub-document, no separate id needed
);

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: { values: POST_TYPES, message: 'Type must be "lost" or "found"' },
      required: [true, 'Post type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Invalid category' },
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 120,
    },
    date: {
      // date the item was lost / found (not the date of posting)
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        // one day of grace so a "today" date from any timezone is accepted
        validator: (v) => v.getTime() <= Date.now() + 24 * 60 * 60 * 1000,
        message: 'Date cannot be in the future',
      },
    },
    imageUrl: { type: String, trim: true },
    contact: { type: contactSchema, required: true },
    status: {
      type: String,
      enum: STATUSES,
      default: 'open',
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Compound index for the most common query: filter by category/type, newest first.
postSchema.index({ category: 1, type: 1, createdAt: -1 });
// Full-text index for the keyword search box.
postSchema.index(
  { title: 'text', description: 'text', location: 'text' },
  { weights: { title: 5, location: 2, description: 1 }, name: 'PostTextIndex' }
);

module.exports = mongoose.model('Post', postSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.POST_TYPES = POST_TYPES;
module.exports.STATUSES = STATUSES;
