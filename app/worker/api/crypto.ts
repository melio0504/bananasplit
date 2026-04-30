export function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export async function createSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
