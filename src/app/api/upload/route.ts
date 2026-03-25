import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  STORAGE_URL,
} from '@/lib/utils/auth-helpers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const BUCKET = 'lineup-media'

/**
 * POST /api/upload
 * Upload a file to Supabase Storage bucket "lineup-media".
 * Accepts multipart/form-data with a "file" field.
 * Uploads to path: {user_id}/{timestamp}-{filename}
 * Returns the public URL.
 */
export async function POST(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File too large (max 10MB)' }, { status: 413 })
    }

    // Validate file type (only images and mp4)
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: 'File type not allowed. Use: jpg, png, webp, gif, mp4' }, { status: 400 })
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${user.id}/${timestamp}-${safeName}`

    // Read file into ArrayBuffer for upload
    const fileBuffer = await file.arrayBuffer()

    // Upload via Supabase Storage REST API
    const uploadRes = await fetch(
      `${STORAGE_URL}/object/${BUCKET}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': file.type || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: fileBuffer,
      }
    )

    if (!uploadRes.ok) {
      console.error('[upload] Storage error:', await uploadRes.text())
      return Response.json({ error: 'Failed to upload file' }, { status: uploadRes.status })
    }

    // Construct the public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`

    return Response.json(
      { url: publicUrl, path: filePath },
      { status: 201 }
    )
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
