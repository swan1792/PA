import { useEffect } from 'react'
import { useNewsStore, NEWS_CATEGORIES } from '../store/newsStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { clsx } from 'clsx'

export default function NewsPage() {
  const { articles, isLoading, error, category, fetchNews, setCategory } = useNewsStore()

  useEffect(() => {
    fetchNews()
  }, [])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    fetchNews(cat)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📰 News</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">BBC News — Stay updated with international headlines</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                category === cat.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} padding="none">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => fetchNews()} className="mt-4 text-brand-600 font-medium hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && articles.length > 0 && (
          <>
            {/* Featured Article */}
            {articles[0] && (
              <a href={articles[0].link} target="_blank" rel="noopener noreferrer" className="block">
                <Card hover padding="none" className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-auto bg-gray-200 dark:bg-gray-700">
                      {articles[0].image ? (
                        <img src={articles[0].image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">📰</div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-2">
                        {NEWS_CATEGORIES.find((c) => c.key === category)?.icon} Featured
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-3">
                        {articles[0].title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {articles[0].description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{articles[0].source}</span>
                        <span>·</span>
                        <span>{formatDate(articles[0].pubDate)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
            )}

            {/* Rest of Articles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(1).map((article, i) => (
                <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" className="block">
                  <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700">
                      {article.image ? (
                        <img src={article.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="truncate">{article.source}</span>
                        <span>·</span>
                        <span>{formatDate(article.pubDate)}</span>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Empty */}
        {!isLoading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📰</p>
            <p className="text-gray-600 dark:text-gray-400">No news articles found</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
