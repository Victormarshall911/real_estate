import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../api/client'
import { Search, Calendar, User, Clock, ArrowRight, Loader2, BookOpen } from 'lucide-react'
import { getMediaUrl } from '../utils/media'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [selectedCategory])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory) params.category = selectedCategory
      if (search) params.search = search
      
      const { data } = await blogAPI.list(params)
      setPosts(data.results || data)
    } catch (err) {
      console.error('Failed to load blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await blogAPI.categories()
      setCategories(data.results || data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchPosts()
  }

  const featuredPost = posts.find(p => p.is_featured) || posts[0]
  const remainingPosts = posts.filter(p => p.id !== featuredPost?.id)

  return (
    <div className="min-h-screen bg-surface-dim pb-20">
      
      {/* Hero Header */}
      <div className="bg-navy py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-widest mb-4">
            LandMarket Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Real Estate Insights &amp; Market Updates
          </h1>
          <p className="text-navy-100 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            Get expert guides, property investment advice, layout documentation tips, and professional analyses directly from Nigerian land industry experts.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, layout insights, legal guidelines..."
              className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-transparent bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-text-primary shadow-elevated"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all active:scale-[0.98]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              !selectedCategory
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-muted'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                  : 'bg-surface text-text-secondary border-border hover:bg-surface-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-3xl border border-border border-dashed">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-text-primary mb-2">No articles found</h3>
            <p className="text-text-muted text-sm">
              We couldn't find any articles matching your search query. Try adjusting filters!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Featured Post Card */}
            {!selectedCategory && featuredPost && (
              <div className="bg-surface rounded-3xl overflow-hidden border border-border grid grid-cols-1 lg:grid-cols-12 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="lg:col-span-7 h-64 sm:h-96 relative overflow-hidden bg-surface-muted">
                  {featuredPost.cover_image_url ? (
                    <img 
                      src={getMediaUrl(featuredPost.cover_image_url)} 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-muted font-bold text-xl">LandMarket</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    {featuredPost.category_name && (
                      <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
                        {featuredPost.category_name}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-black text-text-primary leading-tight hover:text-primary transition-colors">
                      <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-4">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border-light flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {featuredPost.author_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">{featuredPost.author_name}</p>
                        <p className="text-[10px] text-text-muted">{featuredPost.author_role}</p>
                      </div>
                    </div>

                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all"
                    >
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory ? posts : remainingPosts).map((post) => (
                <article key={post.id} className="bg-surface rounded-3xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all flex flex-col h-full group">
                  <div className="h-48 relative overflow-hidden bg-surface-muted">
                    {post.cover_image_url ? (
                      <img 
                        src={getMediaUrl(post.cover_image_url)} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-muted font-bold text-sm">LandMarket</div>
                    )}
                    {post.category_name && (
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-primary uppercase tracking-wider shadow">
                        {post.category_name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.read_time_minutes} min read</span>
                      </div>
                      <h3 className="font-bold text-lg text-text-primary leading-snug line-clamp-2 hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border-light flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] uppercase">
                          {post.author_name?.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-text-primary">{post.author_name}</span>
                      </div>
                      <Link 
                        to={`/blog/${post.slug}`} 
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  )
}
