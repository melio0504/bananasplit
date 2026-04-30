export type D1Result<T = unknown> = {
  results?: T[]
  success: boolean
}

export type D1PreparedStatement = {
  all<T = unknown>(): Promise<D1Result<T>>
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(columnName?: string): Promise<T | null>
  run(): Promise<D1Result>
}

export type D1Database = {
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  prepare(query: string): D1PreparedStatement
}

export type AssetFetcher = {
  fetch(request: Request): Promise<Response>
}

export type Env = {
  ASSETS: AssetFetcher
  DB: D1Database
  GOOGLE_CLIENT_ID: string
}

export type ApiContext = {
  env: Env
  request: Request
  url: URL
}

export type SessionUser = {
  email: string
  id: string
  name: string | null
  pictureUrl: string | null
}

export type SyncOperationInput = {
  entityId: string
  entityType: string
  id: string
  operation: 'create' | 'update' | 'delete'
  payload: string | Record<string, unknown>
}

export type AppliedSyncRecord = {
  entityId: string
  entityType: string
  groupId: string | null
  operation: string
  payload: unknown
}

export type SyncChange = {
  cursor: string
  deviceId: string
  entityId: string
  entityType: string
  operation: string
  payload: unknown
}
