import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-industrial-darker">
      <Sidebar />
      <div className="lg:ml-64">
        <TopNav />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

