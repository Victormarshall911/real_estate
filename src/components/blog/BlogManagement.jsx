import { useState, useEffect, useCallback } from 'react'
import { blogAPI } from '../../api/client'
import { Plus, Edit, Trash2, Calendar, FileText, CheckCircle2, Clock, X, Upload, Loader2 } from 'lucide-react'
import { getMediaUrl } from '../../utils/media'

export default function BlogManagement() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await blogAPI.myPosts()
      setPosts(data.results || data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch blog posts.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await blogAPI.categories()
      setCategories(data.results || data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [fetchPosts, fetchCategories])

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      await blogAPI.delete(slug)
      fetchPosts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.')
    }
  }

  const handleEditClick = (post) => {
    setEditingPost(post)
    setShowEditor(true)
  }

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-border-light pb-4">
        <div>
          <h2 className="text-xl font-black text-text-primary">Blog Articles</h2>
          <p className="text-xs text-text-muted mt-1">Write guides and insights for prospective buyers</p>
        </div>
        <button
          onClick={() => { setEditingPost(null); setShowEditor(true) }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" /> Write Article
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border-light rounded-3xl bg-surface-dim">
          <FileText className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-55" />
          <h3 className="text-sm font-bold text-text-secondary">No articles written yet</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            Share layout tips, investment guides or local infrastructure news to build credibility.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date Created</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface-dim/40 transition-colors">
                  <td className="py-4 font-bold text-text-primary max-w-xs truncate" title={post.title}>
                    {post.title}
                  </td>
                  <td className="py-4 text-text-secondary">{post.category_name || 'Uncategorized'}</td>
                  <td className="py-4 font-semibold text-text-primary">{post.view_count || 0}</td>
                  <td className="py-4">
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-200">
                        <Clock className="w-3.5 h-3.5" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-text-muted">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="p-1.5 rounded-lg hover:bg-surface-muted text-text-secondary hover:text-primary transition-all"
                      title="Edit Article"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-all"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <BlogEditorModal
          post={editingPost}
          categories={categories}
          onClose={() => { setShowEditor(false); setEditingPost(null) }}
          onSaved={() => { setShowEditor(false); setEditingPost(null); fetchPosts() }}
        />
      )}
    </div>
  )
}

function BlogEditorModal({ post, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category: post?.category || '',
    tags: post?.tags || '',
    status: post?.status || 'draft',
    is_featured: post?.is_featured || false,
  })
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState(post?.cover_image_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCover(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = { ...form }
      if (cover) payload.cover_image = cover

      if (post) {
        await blogAPI.update(post.slug, payload)
      } else {
        await blogAPI.create(payload)
      }
      onSaved()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to save blog post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-surface w-full max-w-2xl rounded-3xl border border-border shadow-card overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-lg font-black text-text-primary">
            {post ? 'Edit Article' : 'Write Article'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-dim transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. 5 Land Buying Mistakes to Avoid in Lagos"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-text-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all text-text-primary"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="e.g. lagos, investment, documents"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Excerpt / Summary
            </label>
            <textarea
              rows={2}
              required
              maxLength={400}
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="A short summary shown in search listings..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all resize-none text-text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Content (Markdown supported)
            </label>
            <textarea
              rows={8}
              required
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Write your article body here. Supports headings, bullet points, bold tags..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all resize-none text-text-primary font-mono"
            />
          </div>

          {/* Cover image upload */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              {preview && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0 bg-surface-muted">
                  <img src={getMediaUrl(preview)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text-primary text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:hover:bg-primary/20 file:transition-all cursor-pointer outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-light">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Publish Status
              </label>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-sm focus:outline-none focus:border-primary transition-all text-text-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center gap-2 h-full pt-6">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={(e) => update('is_featured', e.target.checked)}
                className="rounded text-primary border-border focus:ring-primary w-4 h-4"
              />
              <label htmlFor="is_featured" className="text-xs font-bold text-text-secondary uppercase tracking-wider cursor-pointer">
                Feature on Homepage
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-surface py-4 border-t border-border-light mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary border border-border hover:bg-surface-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-[0.98] shadow-md shadow-primary/10"
            >
              {submitting ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
