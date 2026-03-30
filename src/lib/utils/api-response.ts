import { type NextRequest } from 'next/server'

export function errorResponse(
  message: string,
  status: number,
  serverError?: unknown,
): Response {
  if (serverError !== undefined) {
    console.error(`[API ${status}]`, message, serverError)
  }
  return Response.json({ error: message }, { status })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: NextRequest, context: any) => Promise<Response>

export function safeHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (err) {
      console.error('[API] Unhandled error:', err)
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 },
      )
    }
  }
}
