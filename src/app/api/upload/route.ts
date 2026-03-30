import { type NextRequest } from 'next/server'
import { getUser, getToken, STORAGE_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { uploadLimiter, checkRateLimit } from '@/lib/utils/rate-limit'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const BUCKET = 'lineup-media'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4']
const MAX_SIZE = 10 * 1024 * 1024

const MAGIC_SIGNATURES: Record<string, { bytes: number[]; offset?: number }[]> = {
  'image/jpeg': [{ bytes: [0xFF, 0xD8, 0xFF] }],
  'image/png': [{ bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] }],
  'image/webp': [{ bytes: [0x52, 0x49, 0x46, 0x46] }],
  'image/gif': [{ bytes: [0x47, 0x49, 0x46, 0x38] }],
  'video/mp4': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
}

function verifyMagicBytes(header: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_SIGNATURES[mimeType]
  if (!signatures) return false
  return signatures.some(sig => {
    const offset = sig.offset ?? 0
    if (header.length < offset + sig.bytes.length) return false
    return sig.bytes.every((byte, i) => header[offset + i] === byte)
  })
}

export const POST = safeHandler(async (request: NextRequest) => {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rl = await checkRateLimit(uploadLimiter, user.id)
  if (rl) return rl

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return errorResponse('No file provided', 400)

  if (file.size > MAX_SIZE) {
    return errorResponse('File too large (max 10MB)', 413)
  }

  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    return errorResponse('File type not allowed. Use: jpg, png, webp, gif, mp4', 400)
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ext = safeName.includes('.') ? '.' + safeName.split('.').pop()!.toLowerCase() : ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return errorResponse('File extension not allowed', 400)
  }

  const fileBuffer = await file.arrayBuffer()
  const header = new Uint8Array(fileBuffer.slice(0, 12))
  if (!verifyMagicBytes(header, file.type)) {
    return errorResponse('File content does not match declared type', 400)
  }

  const filePath = `${user.id}/${Date.now()}-${safeName}`

  const uploadRes = await fetch(
    `${STORAGE_URL}/object/${BUCKET}/${filePath}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: fileBuffer,
    },
  )

  if (!uploadRes.ok) {
    return errorResponse('Failed to upload file', uploadRes.status, await uploadRes.text())
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`
  return Response.json({ url: publicUrl, path: filePath }, { status: 201 })
})
