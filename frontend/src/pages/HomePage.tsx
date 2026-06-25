export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-brand-900 dark:text-white mb-6">
            PA App
          </h1>
          <p className="text-xl text-brand-700 dark:text-brand-300 mb-8">
            Your Personal Assistant Application
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Get Started
            </a>
            <a
              href="/about"
              className="px-6 py-3 border border-brand-600 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
