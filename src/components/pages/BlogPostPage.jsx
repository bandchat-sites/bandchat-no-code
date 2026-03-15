import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import '../../../styles/pages/blog.css';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { data: post, loading, error } = usePublicApi(() => publicApi.getBlogPost(slug), [slug]);

  if (loading) return <div className="loading" style={{ paddingTop: 'var(--space-4xl)' }}><div className="loading-spinner" /></div>;
  if (error) return (
    <div style={{ textAlign: 'center', paddingTop: 'calc(var(--header-height) + var(--space-4xl))' }}>
      <div className="error-message">Post not found</div>
      <Link to="/blog" className="btn btn--secondary" style={{ marginTop: 'var(--space-lg)' }}>Back to Blog</Link>
    </div>
  );
  if (!post) return null;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          {post.publishedAt && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
              {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            </div>
          )}
          <h1 className="page-hero__title" style={{ fontSize: 'var(--text-4xl)' }}>{post.title}</h1>
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
              {post.tags.map(tag => (
                <span key={tag} className="badge badge--muted">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-post">
            {post.coverImage && (
              <img src={post.coverImage} alt="" className="blog-post__cover" />
            )}
            <div className="blog-post__content" style={{ whiteSpace: 'pre-wrap' }}>
              {post.content}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-3xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-color)' }}>
              <Link to="/blog" className="btn btn--secondary">&larr; Back to Blog</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
