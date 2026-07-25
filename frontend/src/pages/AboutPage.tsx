import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-brand-600 dark:text-brand-400 hover:underline mb-8 inline-block">
            ← Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-brand-900 dark:text-white mb-6">
            About PA App
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-brand-800 dark:text-brand-200 mb-3">
                What is PA?
              </h2>
              <p className="text-brand-700 dark:text-brand-300 leading-relaxed">
                PA (Personal Assistant) is an all-in-one productivity app designed to help you
                manage your tasks, habits, goals, notes, and more — all in one place, with a
                clean and intuitive interface.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-800 dark:text-brand-200 mb-3">
                Features
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-brand-700 dark:text-brand-300">
                <li className="flex items-center gap-2">✓ Task management</li>
                <li className="flex items-center gap-2">✓ Habit tracking</li>
                <li className="flex items-center gap-2">✓ Goal setting</li>
                <li className="flex items-center gap-2">✓ Journal & notes</li>
                <li className="flex items-center gap-2">✓ Kanban board</li>
                <li className="flex items-center gap-2">✓ Calendar view</li>
                <li className="flex items-center gap-2">✓ Expense tracking</li>
                <li className="flex items-center gap-2">✓ Workout logging</li>
                <li className="flex items-center gap-2">✓ Reading list</li>
                <li className="flex items-center gap-2">✓ Idea capture</li>
                <li className="flex items-center gap-2">✓ Reminders</li>
                <li className="flex items-center gap-2">✓ Achievements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-brand-800 dark:text-brand-200 mb-3">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'TailwindCSS', 'Vite', 'Express', 'SQLite'].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-brand-100 dark:bg-gray-700 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
