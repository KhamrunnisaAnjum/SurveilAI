import { create } from 'zustand'

interface LocationState {
  coords: { lat: number; lng: number } | null
  districtId: string | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  districtId: null,
  loading: true,
  error: null,
  refresh: () => {
    set({ loading: true, error: null })
    if (!navigator.geolocation) {
      set({ loading: false, error: 'Geolocation not supported', coords: { lat: 20.5937, lng: 78.9629 } })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => set({ coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }, loading: false }),
      () => set({ loading: false, coords: { lat: 20.5937, lng: 78.9629 } }),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  },
}))
