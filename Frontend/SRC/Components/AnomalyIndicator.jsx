import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function AnomalyIndicator({ detected }) {
  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
      ${detected
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse'
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      }
    `}>
      {detected ? (
        <>
          <AlertTriangle size={18} className="animate-pulse" />
          <span className="font-semibold">Anomaly Detected</span>
        </>
      ) : (
        <>
          <CheckCircle size={18} />
          <span className="font-semibold">All Systems Normal</span>
        </>
      )}
    </div>
  )
}

