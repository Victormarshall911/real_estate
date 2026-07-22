import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { blogAPI } from '../api/client'
import { Calendar, User, Clock, ArrowLeft, Loader2, BookOpen, Share2, Eye } from 'lucide-react'
import { getMediaUrl } from '../utils/media'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    fetchDetail()
  }, [slug])

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const { data } = await blogAPI.detail(slug)
      setPost(data)
      
      // Load general blog list for sidebar, exclude current post
      const relatedRes = await blogAPI.list()
      const list = relatedRes.data.results || relatedRes.data
      setRelatedPosts(list.filter(p => p.id !== data.id).slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      // fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setSharing(true)
      setTimeout(() => setSharing(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center bg-surface-dim">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen py-16 flex flex-col items-center justify-center bg-surface-dim px-4">
        <BookOpen className="w-16 h-16 text-text-muted mb-4 opacity-55" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Article Not Found</h2>
        <p className="text-sm text-text-muted mb-6 text-center max-w-sm">
          The article you are looking for does not exist, or has been removed.
        </p>
        <Link to="/blog" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim pb-20">
      
      {/* Article Header */}
      <div className="bg-navy py-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          
          <button 
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1.5 text-navy-100 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </button>

          {post.category_name && (
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold mb-3 block">
              {post.category_name}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-navy-100 text-xs sm:text-sm pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs uppercase">
                {post.author_name?.charAt(0)}
              </div>
              <span className="font-bold text-white">{post.author_name}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.read_time_minutes} min read</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.view_count} views</span>
            </div>
          </div>

        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left/Main Column: Article Body */}
        <article className="lg:col-span-8 space-y-8 bg-surface p-6 sm:p-10 rounded-3xl border border-border shadow-card">
          
          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden h-[300px] sm:h-[400px] relative bg-surface-muted border border-border-light">
              <img 
                src={getMediaUrl(post.cover_image_url)} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Render markdown content */}
          <div className="prose max-w-none prose-slate prose-headings:font-black prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary hover:prose-a:underline leading-relaxed text-sm sm:text-base">
            {post.content.split('\n').map((para, idx) => {
              if (para.startsWith('###')) {
                return <h3 key={idx} className="text-lg font-bold text-text-primary mt-6 mb-3">{para.replace('###', '').trim()}</h3>
              }
              if (para.startsWith('##')) {
                return <h2 key={idx} className="text-xl font-bold text-text-primary mt-8 mb-4 border-b border-border-light pb-2">{para.replace('##', '').trim()}</h2>
              }
              if (para.startsWith('#')) {
                return <h1 key={idx} className="text-2xl font-black text-text-primary mt-10 mb-6">{para.replace('#', '').trim()}</h1>
              }
              if (para.trim() === '') return null
              return <p key={idx} className="mb-4 text-text-secondary text-justify leading-relaxed">{para}</p>
            })}
          </div>

          <div className="pt-6 border-t border-border-light flex items-center justify-between mt-10">
            <div className="flex flex-wrap gap-2">
              {post.tag_list?.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-muted text-xs text-text-secondary border border-border-light">
                  #{tag}
                </span>
              ))}
            </div>

            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
            >
              <Share2 className="w-3.5 h-3.5" /> 
              {sharing ? 'Link Copied!' : 'Share Article'}
            </button>
          </div>

        </article>

        {/* Right Column: Sidebar (Related Posts) */}
        <aside className="lg:col-span-4 space-y-8">
          
          <div className="bg-surface rounded-3xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-bold text-text-primary border-b border-border-light pb-3">
              Related Articles
            </h3>

            {relatedPosts.length === 0 ? (
              <p className="text-xs text-text-muted">No other articles yet.</p>
            ) : (
              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <Link 
                    key={related.id} 
                    to={`/blog/${related.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-muted shrink-0 overflow-hidden border border-border-light">
                      {related.cover_image_url ? (
                        <img 
                          src={getMediaUrl(related.cover_image_url)} 
                          alt={related.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted font-bold">LM</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-all">
                        {related.title}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-1">
                        {new Date(related.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Ad/Newsletter Promo */}
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-6 shadow-lg border border-primary/20 space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <h3 className="text-lg font-black tracking-tight leading-snug relative z-10">
              Find Verified Land in Nigeria
            </h3>
            <p className="text-xs text-white/80 leading-relaxed relative z-10">
              Browse land listings verified by legal experts. Pay securely via escrow.
            </p>
            <Link 
              to="/properties"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-surface-muted transition-all text-center relative z-10"
            >
              Browse Land
            </Link>
          </div>

        </aside>

      </div>

    </div>
  )
}
