import { DateTime } from 'luxon'
import { getContextualUpdateLabel } from './time'

describe('getContextualUpdateLabel', () => {
  const now = DateTime.fromISO('2026-11-11T15:00:00', { zone: 'local' })

  const label = (iso: string) =>
    getContextualUpdateLabel(DateTime.fromISO(iso, { zone: 'local' }), now)

  it('names today, yesterday, and the current week', () => {
    expect(label('2026-11-11T09:00:00')).toBe('Actualizado hoy')
    expect(label('2026-11-10T23:00:00')).toBe('Actualizado ayer')
    expect(label('2026-11-09T08:00:00')).toBe('Actualizado esta semana')
  })

  it('uses coarser buckets as the update gets older', () => {
    expect(label('2026-11-04T08:00:00')).toBe('Actualizado la semana pasada')
    expect(label('2026-11-01T08:00:00')).toBe('Actualizado este mes')
    expect(label('2026-10-15T08:00:00')).toBe('Actualizado el mes pasado')
    expect(label('2026-06-01T08:00:00')).toBe('Actualizado hace 5 meses')
    expect(label('2025-11-11T08:00:00')).toBe('Actualizado el año pasado')
    expect(label('2024-01-01T08:00:00')).toBe('Actualizado hace 2 años')
  })
})
