import type { MapSlug, GrenadeType, Side, ThrowType } from '@/lib/types/lineup'

export const VALID_MAPS: readonly MapSlug[] = [
  'mirage', 'inferno', 'dust2', 'nuke', 'anubis', 'ancient', 'overpass',
] as const

export const VALID_SIDES: readonly Side[] = ['T', 'CT'] as const

export const VALID_TYPES: readonly GrenadeType[] = [
  'smoke', 'flash', 'molotov', 'he',
] as const

export const VALID_THROW_TYPES: readonly ThrowType[] = [
  'normal', 'jumpthrow', 'runthrow', 'walkthrow',
] as const

export function parsePositiveInt(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN
  return Number.isInteger(n) && n > 0 ? n : null
}

export function validateString(v: unknown, maxLength: number): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (trimmed.length === 0 || trimmed.length > maxLength) return null
  return trimmed
}

export function validateCommentText(text: unknown): string | null {
  return validateString(text, 2000)
}

export function escapePostgrestPattern(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/%/g, '\\%')
}

export function isValidMap(v: unknown): v is MapSlug {
  return typeof v === 'string' && (VALID_MAPS as readonly string[]).includes(v)
}

export function isValidSide(v: unknown): v is Side {
  return typeof v === 'string' && (VALID_SIDES as readonly string[]).includes(v)
}

export function isValidType(v: unknown): v is GrenadeType {
  return typeof v === 'string' && (VALID_TYPES as readonly string[]).includes(v)
}

export function isValidThrowType(v: unknown): v is ThrowType {
  return typeof v === 'string' && (VALID_THROW_TYPES as readonly string[]).includes(v)
}

interface LineupCreateData {
  name: string
  map: MapSlug
  side: Side
  type: GrenadeType
  from: string
  to: string
  throw_type: ThrowType
  description: string
  video: string
  video_url: string
  screenshots: string[]
}

type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string }

export function validateLineupCreate(body: Record<string, unknown>): ValidationResult<LineupCreateData> {
  const name = validateString(body.name, 200)
  if (!name) return { valid: false, error: 'name is required (max 200 chars)' }

  if (!isValidMap(body.map)) return { valid: false, error: `Invalid map. Allowed: ${VALID_MAPS.join(', ')}` }
  if (!isValidSide(body.side)) return { valid: false, error: `Invalid side. Allowed: ${VALID_SIDES.join(', ')}` }
  if (!isValidType(body.type)) return { valid: false, error: `Invalid type. Allowed: ${VALID_TYPES.join(', ')}` }
  if (!isValidThrowType(body.throw_type)) return { valid: false, error: `Invalid throw_type. Allowed: ${VALID_THROW_TYPES.join(', ')}` }

  const from = validateString(body.from, 100)
  if (!from) return { valid: false, error: 'from is required (max 100 chars)' }

  const to = validateString(body.to, 100)
  if (!to) return { valid: false, error: 'to is required (max 100 chars)' }

  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 5000) : ''
  const video = typeof body.video === 'string' ? body.video.trim().slice(0, 500) : ''
  const video_url = typeof body.video_url === 'string' ? body.video_url.trim().slice(0, 500) : ''

  let screenshots: string[] = []
  if (Array.isArray(body.screenshots)) {
    screenshots = body.screenshots
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .slice(0, 10)
      .map(s => s.trim().slice(0, 500))
  }

  return {
    valid: true,
    data: {
      name,
      map: body.map as MapSlug,
      side: body.side as Side,
      type: body.type as GrenadeType,
      from,
      to,
      throw_type: body.throw_type as ThrowType,
      description,
      video,
      video_url,
      screenshots,
    },
  }
}

export function validateLineupUpdate(body: Record<string, unknown>): ValidationResult<Partial<LineupCreateData>> {
  const data: Partial<LineupCreateData> = {}
  let hasFields = false

  if (body.name !== undefined) {
    const name = validateString(body.name, 200)
    if (!name) return { valid: false, error: 'name must be 1-200 chars' }
    data.name = name
    hasFields = true
  }

  if (body.map !== undefined) {
    if (!isValidMap(body.map)) return { valid: false, error: `Invalid map. Allowed: ${VALID_MAPS.join(', ')}` }
    data.map = body.map
    hasFields = true
  }

  if (body.side !== undefined) {
    if (!isValidSide(body.side)) return { valid: false, error: `Invalid side. Allowed: ${VALID_SIDES.join(', ')}` }
    data.side = body.side
    hasFields = true
  }

  if (body.type !== undefined) {
    if (!isValidType(body.type)) return { valid: false, error: `Invalid type. Allowed: ${VALID_TYPES.join(', ')}` }
    data.type = body.type
    hasFields = true
  }

  if (body.throw_type !== undefined) {
    if (!isValidThrowType(body.throw_type)) return { valid: false, error: `Invalid throw_type. Allowed: ${VALID_THROW_TYPES.join(', ')}` }
    data.throw_type = body.throw_type
    hasFields = true
  }

  if (body.from !== undefined) {
    const from = validateString(body.from, 100)
    if (!from) return { valid: false, error: 'from must be 1-100 chars' }
    data.from = from
    hasFields = true
  }

  if (body.to !== undefined) {
    const to = validateString(body.to, 100)
    if (!to) return { valid: false, error: 'to must be 1-100 chars' }
    data.to = to
    hasFields = true
  }

  if (body.description !== undefined) {
    data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 5000) : ''
    hasFields = true
  }

  if (body.video !== undefined) {
    data.video = typeof body.video === 'string' ? body.video.trim().slice(0, 500) : ''
    hasFields = true
  }

  if (body.video_url !== undefined) {
    data.video_url = typeof body.video_url === 'string' ? body.video_url.trim().slice(0, 500) : ''
    hasFields = true
  }

  if (body.screenshots !== undefined) {
    if (!Array.isArray(body.screenshots)) return { valid: false, error: 'screenshots must be an array' }
    data.screenshots = body.screenshots
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .slice(0, 10)
      .map(s => s.trim().slice(0, 500))
    hasFields = true
  }

  if (!hasFields) return { valid: false, error: 'No valid fields to update' }

  return { valid: true, data }
}
