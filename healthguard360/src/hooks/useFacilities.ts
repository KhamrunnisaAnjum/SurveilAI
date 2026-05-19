import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Facility } from '@/lib/types'

export function useFacilities(coords: { lat: number; lng: number } | null, radius = 5000) {
  return useQuery<Facility[]>({
    queryKey: ['facilities', coords, radius],
    queryFn: async () => {
      if (!coords) return mockFacilities
      const { data } = await api.get('/facilities', {
        params: { lat: coords.lat, lng: coords.lng, radius },
      })
      return data?.facilities ?? mockFacilities
    },
    enabled: true,
  })
}

const mockFacilities: Facility[] = [
  {
    id: 'F001', name: 'District General Hospital', type: 'hospital',
    lat: 20.61, lng: 78.98, contact: '+91-9876543210',
    address: 'Main Road, District Center',
    availableBeds: 45, totalBeds: 150, icuBedsAvailable: 5, oxygenSupply: true,
    bloodUnits: [
      { type: 'A+', units: 10 }, { type: 'B+', units: 8 },
      { type: 'O+', units: 15 }, { type: 'AB+', units: 3 },
    ],
  },
  {
    id: 'F002', name: 'Community Health Center', type: 'clinic',
    lat: 20.57, lng: 78.95, contact: '+91-9876543211',
    address: 'Block Road, Ward A',
    availableBeds: 12, totalBeds: 30, icuBedsAvailable: 0, oxygenSupply: false,
    bloodUnits: [{ type: 'O+', units: 5 }],
  },
  {
    id: 'F003', name: 'Red Cross Blood Bank', type: 'blood_bank',
    lat: 20.59, lng: 78.96, contact: '+91-9876543212',
    address: 'Civil Lines, District Center',
    availableBeds: 0, totalBeds: 0, icuBedsAvailable: 0, oxygenSupply: false,
    bloodUnits: [
      { type: 'A+', units: 25 }, { type: 'B+', units: 30 },
      { type: 'O+', units: 40 }, { type: 'O-', units: 10 },
      { type: 'AB+', units: 8 },
    ],
  },
  {
    id: 'F004', name: 'City Ambulance Services', type: 'ambulance',
    lat: 20.6, lng: 78.97, contact: '+91-9876543213',
    address: 'Emergency Lane, District Center',
    availableBeds: 0, totalBeds: 0, icuBedsAvailable: 0, oxygenSupply: true,
    bloodUnits: [],
  },
]
