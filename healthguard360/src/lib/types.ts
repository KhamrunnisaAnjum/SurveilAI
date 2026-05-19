export type Role = 'patient' | 'asha' | 'nurse' | 'officer' | 'admin'

export interface User {
  id: string
  name: string
  role: Role
  mobile: string
  districtId: string
  wardId?: string
  villageId?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'M' | 'F' | 'O'
  riskScore: number
  ward: string
  admissionDate: string
  vitals: VitalRecord[]
  alerts: Alert[]
  shapExplanation: SHAPFeature[]
}

export interface VitalRecord {
  timestamp: string
  heartRate: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  oxygenSaturation: number
  temperature: number
}

export interface SHAPFeature {
  feature: string
  value?: number
  impact: number
}

export interface Facility {
  id: string
  name: string
  type: 'hospital' | 'blood_bank' | 'ambulance' | 'clinic'
  lat: number
  lng: number
  contact: string
  address: string
  availableBeds: number
  totalBeds: number
  icuBedsAvailable: number
  oxygenSupply: boolean
  bloodUnits: { type: string; units: number }[]
  distance?: number
}

export interface OutbreakAlert {
  id: string
  districtId: string
  disease: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  timestamp: string
  description: string
  cases: number
  status: 'active' | 'acknowledged' | 'resolved'
}

export interface SymptomReport {
  id: string
  bodyPart: string
  symptoms: string[]
  severity: number
  lat: number
  lng: number
  districtId: string
  timestamp: string
  reportedBy: string
}

export interface Alert {
  id: string
  type: 'outbreak' | 'high_risk' | 'resource_shortage'
  severity: 'low' | 'moderate' | 'high' | 'critical'
  title: string
  message: string
  districtId: string
  timestamp: string
  acknowledged: boolean
}

export interface HealthTip {
  id: string
  title: string
  body: string
  icon: string
}
