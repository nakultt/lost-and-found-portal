import { useState } from 'react';
import { CATEGORIES } from '../constants';

// Local date as YYYY-MM-DD (toISOString alone would give the UTC date).
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const EMPTY_FORM = {
  type: 'lost',
  title: '',
  description: '',
  category: '',
  location: '',
  date: today(),
  imageUrl: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

// Client-side checks give instant feedback; the server validates again.
function validate(form) {
  const errors = {};
  if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.category) errors.category = 'Please choose a category';
  if (!form.location.trim()) errors.location = 'Location is required';
  if (!form.date) errors.date = 'Date is required';
  else if (form.date > today()) errors.date = 'Date cannot be in the future';
  if (!form.contactName.trim()) errors.contactName = 'Your name is required';
  if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) errors.contactEmail = 'Enter a valid email';
  if (form.contactPhone && !/^[0-9+\-\s]{7,15}$/.test(form.contactPhone))
    errors.contactPhone = 'Enter a valid phone number';
  return errors;
}

// Convert flat form state into the nested shape the API expects.
function toPayload(form) {
  return {
    type: form.type,
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    location: form.location.trim(),
    date: form.date,
    imageUrl: form.imageUrl.trim() || undefined,
    contact: {
      name: form.contactName.trim(),
      email: form.contactEmail.trim(),
      phone: form.contactPhone.trim() || undefined,
    },
  };
}

// Map server error keys like "contact.email" back to form field names.
const SERVER_FIELD_MAP = {
  'contact.name': 'contactName',
  'contact.email': 'contactEmail',
  'contact.phone': 'contactPhone',
};

export default function PostForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit(toPayload(form));
      setForm(EMPTY_FORM);
    } catch (err) {
      const mapped = Object.fromEntries(
        Object.entries(err.fieldErrors || {}).map(([k, v]) => [SERVER_FIELD_MAP[k] || k, v])
      );
      setErrors(mapped);
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    className: errors[name] ? 'invalid' : '',
  });
  const errorFor = (name) => errors[name] && <span className="field-error">{errors[name]}</span>;

  return (
    <form className="card post-form" onSubmit={handleSubmit} noValidate>
      <h2>Report a Lost or Found Item</h2>

      <div className="type-toggle">
        {['lost', 'found'].map((t) => (
          <label key={t} className={`toggle-option ${form.type === t ? `selected ${t}` : ''}`}>
            <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
            I {t} something
          </label>
        ))}
      </div>

      <label>
        Title*
        <input {...field('title')} placeholder="e.g. Black HP laptop charger" maxLength={100} />
        {errorFor('title')}
      </label>

      <div className="row">
        <label>
          Category*
          <select {...field('category')}>
            <option value="">-- Select --</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errorFor('category')}
        </label>
        <label>
          Date {form.type === 'lost' ? 'lost' : 'found'}*
          <input type="date" max={today()} {...field('date')} />
          {errorFor('date')}
        </label>
      </div>

      <label>
        Location*
        <input {...field('location')} placeholder="e.g. Library 2nd floor" />
        {errorFor('location')}
      </label>

      <label>
        Description*
        <textarea {...field('description')} rows={4} maxLength={1000}
          placeholder="Colour, brand, identifying marks..." />
        {errorFor('description')}
      </label>

      <label>
        Image URL (optional)
        <input {...field('imageUrl')} placeholder="https://..." />
      </label>

      <fieldset>
        <legend>Contact details</legend>
        <div className="row">
          <label>
            Name*
            <input {...field('contactName')} />
            {errorFor('contactName')}
          </label>
          <label>
            Email*
            <input type="email" {...field('contactEmail')} placeholder="you@college.edu" />
            {errorFor('contactEmail')}
          </label>
        </div>
        <label>
          Phone (optional)
          <input {...field('contactPhone')} />
          {errorFor('contactPhone')}
        </label>
      </fieldset>

      {serverError && <p className="alert">{serverError}</p>}

      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Submit Post'}
        </button>
      </div>
    </form>
  );
}
