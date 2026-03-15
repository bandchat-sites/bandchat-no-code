import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicApi } from '../../hooks/usePublicApi';
import { publicApi } from '../../services/api';
import '../../../styles/pages/blog.css';

export default function BlogPage() {
  const { data: posts, loading, error } = usePublicApi(() => publicApi.getBlogPosts(), []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Blog</h1>
          <p className="page-hero__subtitle">
            Stories, updates, and musings from the band
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <div className="loading"><div className="loading-spinner" /></div>}
          {error && <div className="error-message">Failed to load posts</div>}

          {posts && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-muted)' }}>
              No blog posts yet. Stay tuned!
            </div>
          )}

          <div className="blog-list stagger-children">
            {posts?.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card">
                {post.coverImage && (
                  <img src={post.coverImage} alt="" className="blog-card__image" loading="lazy" />
                )}
                <div className="blog-card__body">
                  {post.publishedAt && (
                    <div className="blog-card__date">
                      {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.excerpt && <p className="blog-card__excerpt">{post.excerpt}</p>}
                  {post.tags?.length > 0 && (
                    <div className="blog-card__tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="badge badge--muted">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
