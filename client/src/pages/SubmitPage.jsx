import { useState } from 'react';
import { submitTestimonial } from '../api';
import { StarRating } from '../components/Shared';

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    text: '',
    rating: 5,
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photo) fd.append('photo', photo);
      await submitTestimonial(fd);
      setSuccess(true);
      setForm({ name: '', email: '', company: '', text: '', rating: 5 });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page submit-page">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Thank you!</h1>
          <p>Your testimonial has been submitted and is pending review.</p>
          <button type="button" className="btn btn-primary" onClick={() => setSuccess(false)}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page submit-page">
      <div className="page-header">
        <h1>Share your experience</h1>
        <p>Tell us what you loved — your words help others discover us.</p>
      </div>

      <form className="submit-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-row">
          <label>
            Your name *
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
          </label>
          <label>
            Email *
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" />
          </label>
        </div>

        <label>
          Company
          <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." />
        </label>

        <label>
          Your testimonial *
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            required
            rows={5}
            placeholder="What did you enjoy most about working with us?"
            minLength={10}
          />
        </label>

        <fieldset className="rating-field">
          <legend>Rating *</legend>
          <StarRating rating={form.rating} interactive onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
        </fieldset>

        <label className="photo-upload">
          Photo (optional)
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {preview && <img src={preview} alt="Preview" className="photo-preview" />}
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit testimonial'}
        </button>
      </form>
    </div>
  );
}
