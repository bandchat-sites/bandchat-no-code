import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}>
          {isEditing ? 'Edit Post' : 'New Blog Post'}
        </h1>
        <button className="btn btn--secondary btn--sm" onClick={() => navigate('/backstage')}>Back</button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="card__body">
          <div className="contact-field" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="contact-field__label">Title</label>
            <input
              type="text"
              className="contact-field__input"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Post title"
            />
          </div>

          <div className="contact-field" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="contact-field__label">Slug</label>
            <input
              type="text"
              className="contact-field__input"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="url-slug"
            />
          </div>

          <div className="contact-field" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="contact-field__label">Excerpt</label>
            <textarea
              className="contact-field__input"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief summary..."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="contact-field" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="contact-field__label">Content (Markdown)</label>
            <textarea
              className="contact-field__input"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your post..."
              rows={15}
              style={{ resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          <div className="contact-field" style={{ marginBottom: 'var(--space-lg)' }}>
            <label className="contact-field__label">Tags (comma-separated)</label>
            <input
              type="text"
              className="contact-field__input"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="gig-recap, tokyo, news"
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn--primary" disabled>
              Publish (requires backend)
            </button>
            <button className="btn btn--secondary" disabled>
              Save Draft
            </button>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
            Blog publishing will be functional once a backend is added. For now, blog posts can be added directly to <code>public/data/blog.json</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
