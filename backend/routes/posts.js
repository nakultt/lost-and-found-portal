const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// Fields a client is allowed to set. Prevents overwriting _id, createdAt, etc.
const EDITABLE_FIELDS = [
  'type',
  'title',
  'description',
  'category',
  'location',
  'date',
  'imageUrl',
  'contact',
  'status',
];

const pick = (obj, keys) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/posts
 * List posts with optional filters.
 * Query params: category, type, status, q (keyword), page, limit
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, type, status, q } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (q && q.trim()) {
      // Case-insensitive partial match so "calc" finds "Calculator".
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/posts/categories
 * Returns the category list plus a count of open posts in each.
 * Declared before "/:id" so "categories" is not treated as an id.
 */
router.get('/categories', async (req, res, next) => {
  try {
    const counts = await Post.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    res.json({
      success: true,
      data: Post.CATEGORIES.map((name) => ({ name, count: countMap[name] || 0 })),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/posts/:id — fetch a single post */
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

/** POST /api/posts — create a new lost/found post */
router.post('/', async (req, res, next) => {
  try {
    const data = pick(req.body, EDITABLE_FIELDS);
    delete data.status; // new posts always start as "open"
    const post = await Post.create(data);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/posts/:id — update a post (e.g. edit details or mark as resolved) */
router.put('/:id', async (req, res, next) => {
  try {
    const updates = pick(req.body, EDITABLE_FIELDS);
    const post = await Post.findByIdAndUpdate(req.params.id, updates, {
      new: true, // return the updated document
      runValidators: true, // apply schema validation to updates too
    });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/posts/:id — remove a post */
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted', data: { _id: post._id } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
