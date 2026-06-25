import { create } from 'zustand'

export interface NewsArticle {
  title: string
  description: string
  link: string
  image: string
  pubDate: string
  source: string
  category: string
}

interface NewsCategory {
  key: string
  label: string
  icon: string
  feedUrl: string
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { key: 'world', label: 'World', icon: '🌍', feedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { key: 'business', label: 'Business', icon: '💼', feedUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { key: 'technology', label: 'Technology', icon: '💻', feedUrl: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { key: 'science', label: 'Science', icon: '🔬', feedUrl: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  { key: 'sports', label: 'Sports', icon: '⚽', feedUrl: 'https://feeds.bbci.co.uk/sport/rss.xml' },
  { key: 'health', label: 'Health', icon: '🏥', feedUrl: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬', feedUrl: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
]

const FEED_API = 'https://feedrapp.info'

interface NewsState {
  articles: NewsArticle[]
  isLoading: boolean
  error: string | null
  category: string
  fetchNews: (category?: string) => Promise<void>
  setCategory: (category: string) => void
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,
  category: 'world',

  fetchNews: async (category?: string) => {
    const targetCategory = category || get().category
    const cat = NEWS_CATEGORIES.find((c) => c.key === targetCategory) || NEWS_CATEGORIES[0]

    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${FEED_API}?q=${encodeURIComponent(cat.feedUrl)}&num=15`, {
        signal: AbortSignal.timeout(15000),
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      const entries = data?.responseData?.feed?.entries || []

      const articles: NewsArticle[] = entries.map((item: any) => ({
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        link: item.link || '',
        image: item.thumbnail || extractImage(item.content) || '',
        pubDate: item.publishedDate || '',
        source: item.author || data.responseData?.feed?.title || 'BBC News',
        category: targetCategory,
      }))

      set({ articles, isLoading: false, category: targetCategory })
    } catch (error: any) {
      console.error('News fetch error:', error.message)
      set({ error: 'Failed to load news', isLoading: false, articles: [] })
    }
  },

  setCategory: (category: string) => {
    set({ category })
  },
}))

function extractImage(content: string): string {
  if (!content) return ''
  const match = content.match(/<img[^>]+src="([^">]+)"/)
  return match ? match[1] : ''
}
