import { useState, useEffect } from 'react'
import { useLocationStore } from '@/stores/locationStore'
import { useFacilities } from '@/hooks/useFacilities'

export function SOSButton() {
  const coords = useLocationStore((s) => s.coords)
  const { data: facilities } = useFacilities(coords, 5000)
  const [countdown, setCountdown] = useState(0)
  const [active, setActive] = useState(false)

  const hospitals = facilities?.filter((f) => f.type === 'hospital') || []
  const nearestHospital = hospitals[0]

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (countdown === 0 && active) {
      setActive(false)
      if (nearestHospital) {
        window.open(`tel:${nearestHospital.contact}`, '_self')
      }
    }
  }, [countdown, active, nearestHospital])

  const handleSOS = () => {
    setCountdown(5)
    setActive(true)
  }

  const handleCancel = () => {
    setCountdown(0)
    setActive(false)
  }

  if (!active) {
    return (
      <button
        onClick={handleSOS}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-danger text-white shadow-lg shadow-danger/30 hover:shadow-xl hover:shadow-danger/40 hover:scale-110 transition-all flex items-center justify-center font-bold text-lg animate-pulse-soft"
        title="Emergency SOS"
      >
        SOS
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🚨</span>
        </div>
        <h2 className="text-2xl font-bold text-surface-800 mb-2">Emergency SOS</h2>
        <p className="text-surface-500 mb-6">
          {countdown > 0
            ? `Calling nearest hospital in ${countdown} seconds...`
            : 'Connecting to emergency services...'}
        </p>

        {nearestHospital && (
          <div className="bg-surface-50 rounded-xl p-3 mb-6 text-left border border-surface-100">
            <p className="text-sm font-semibold text-surface-800">{nearestHospital.name}</p>
            <p className="text-xs text-surface-400">{nearestHospital.address}</p>
            <p className="text-xs text-primary-600 font-medium mt-1">{nearestHospital.contact}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 h-12 rounded-xl border border-surface-200 text-surface-600 font-medium hover:bg-surface-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setActive(false)
              if (nearestHospital) {
                window.open(`tel:${nearestHospital.contact}`, '_self')
              }
            }}
            className="flex-1 h-12 rounded-xl bg-danger text-white font-medium hover:bg-red-600 transition-colors shadow-sm"
          >
            Call Now
          </button>
        </div>

        {countdown > 0 && (
          <div className="mt-4 h-1 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-danger rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
