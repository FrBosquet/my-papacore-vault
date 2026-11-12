import { DateTime } from 'luxon'
import { getContextualUpdateLabel, getDoneRecency } from './time'

describe('getDoneRecency', () => {
  const now = DateTime.fromISO('2026-11-12T12:00:00', { zone: 'local' })

  const label = (iso: string) =>
    getDoneRecency(DateTime.fromISO(iso, { zone: 'local' }), now).label

  it('names the current week, last week, and the weeks just before', () => {
    expect(label('2026-11-12')).toBe('Esta semana')
    expect(label('2026-11-09')).toBe('Esta semana')
    expect(label('2026-11-08')).toBe('La semana pasada')
    expect(label('2026-11-02')).toBe('La semana pasada')
    expect(label('2026-11-01')).toBe('Hace 2 semanas')
    expect(label('2026-10-19')).toBe('Hace 3 semanas')
  })

  it('collapses older dates into months and years', () => {
    expect(label('2026-10-18')).toBe('Hace un mes')
    expect(label('2026-10-01')).toBe('Hace un mes')
    expect(label('2026-09-15')).toBe('Hace 2 meses')
    expect(label('2026-06-01')).toBe('Hace 5 meses')
    expect(label('2025-11-12')).toBe('Hace un año')
    expect(label('2024-11-12')).toBe('Hace 2 años')
  })

  it('keeps an old week inside the current month on its own', () => {
    const endOfMarch = DateTime.fromISO('2026-03-31T12:00:00', {
      zone: 'local',
    })

    expect(
      getDoneRecency(
        DateTime.fromISO('2026-03-03', { zone: 'local' }),
        endOfMarch
      ).label
    ).toBe('Hace 4 semanas')
  })
})

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
