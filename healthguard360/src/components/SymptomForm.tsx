import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, CardTitle, CardContent, Slider } from '@/components/ui'
import { useLocationStore } from '@/stores/locationStore'

const schema = z.object({
  bodyPart: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  severity: z.number().min(0).max(100),
})

type FormData = z.infer<typeof schema>

const bodyParts = ['Head', 'Chest', 'Abdomen', 'Back', 'Limbs', 'Skin', 'Eyes', 'Ears', 'Throat']
const symptomOptions: Record<string, string[]> = {
  Head: ['Headache', 'Dizziness', 'Fever', 'Vision Blurred', 'Neck Stiffness'],
  Chest: ['Cough', 'Chest Pain', 'Shortness of Breath', 'Wheezing', 'Palpitations'],
  Abdomen: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Bloating'],
  Back: ['Back Pain', 'Lower Back Pain', 'Muscle Spasm'],
  Limbs: ['Joint Pain', 'Swelling', 'Weakness', 'Numbness'],
  Skin: ['Rash', 'Itching', 'Swelling', 'Bruising'],
  Eyes: ['Redness', 'Watering', 'Pain', 'Vision Change'],
  Ears: ['Ear Pain', 'Discharge', 'Hearing Loss'],
  Throat: ['Sore Throat', 'Difficulty Swallowing', 'Hoarseness'],
}

interface SymptomFormProps {
  onSubmit: (data: FormData & { lat: number; lng: number }) => void
}

export function SymptomForm({ onSubmit }: SymptomFormProps) {
  const { t } = useTranslation()
  const coords = useLocationStore((s) => s.coords)
  const [step, setStep] = useState(0)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bodyPart: '', symptoms: [], severity: 50 },
  })

  const bodyPart = watch('bodyPart')
  const symptoms = watch('symptoms')
  const severity = watch('severity')

  const toggleSymptom = (sym: string) => {
    const current = symptoms || []
    if (current.includes(sym)) {
      setValue('symptoms', current.filter((s) => s !== sym))
    } else {
      setValue('symptoms', [...current, sym])
    }
  }

  const onFormSubmit = (data: FormData) => {
    onSubmit({ ...data, lat: coords?.lat || 20.5937, lng: coords?.lng || 78.9629 })
  }

  return (
    <Card>
      <CardTitle>{t('report.symptom')}</CardTitle>
      <CardContent className="mt-4">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {step === 0 && (
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-3">{t('report.selectBodyPart')}</label>
              <div className="grid grid-cols-3 gap-2">
                {bodyParts.map((bp) => (
                  <button
                    key={bp}
                    type="button"
                    onClick={() => { setValue('bodyPart', bp); setStep(1) }}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      bodyPart === bp
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-50 text-surface-600 border border-surface-200 hover:border-primary/40 hover:bg-primary-50'
                    }`}
                  >
                    {bp}
                  </button>
                ))}
              </div>
              {errors.bodyPart && <p className="text-danger text-xs mt-1">{errors.bodyPart.message}</p>}
            </div>
          )}

          {step === 1 && bodyPart && (
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-3">{t('report.selectSymptoms')}</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {(symptomOptions[bodyPart] || []).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      (symptoms || []).includes(sym)
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-50 text-surface-600 border border-surface-200 hover:border-primary/40 hover:bg-primary-50'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              {errors.symptoms && <p className="text-danger text-xs mt-1">{errors.symptoms.message}</p>}
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-3">
                {t('report.severity')}: <span className="text-primary font-bold">{severity}</span>
              </label>
              <Slider
                min={0}
                max={100}
                {...register('severity', { valueAsNumber: true })}
                onChange={(e) => setValue('severity', Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-surface-400 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                {t('common.cancel')}
              </Button>
            )}
            {step === 1 ? (
              <Button type="submit" disabled={!bodyPart || !symptoms?.length}>
                {t('report.submit')}
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
