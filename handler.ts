import { decode, hmac } from './deps.ts'

function removeWebSafe(safeEncodedString: string): string {
  return safeEncodedString.replace(/-/g, '+').replace(/_/g, '/')
}

function makeWebSafe(encodedString: string): string {
  return encodedString.replace(/\+/g, '-').replace(/\//g, '_')
}

function encodeBase64Hash(key: Uint8Array, data: string): string {
  return hmac('sha1', key, data, 'utf8', 'base64') as string
}

export function sign(path: string, secret: string): string {
  const url = new URL(path)
  const urlPath = `${url.pathname}${url.search}`
  const safeSecret = decode(removeWebSafe(secret))
  const hashedSignature = makeWebSafe(encodeBase64Hash(safeSecret, urlPath))
  return `${url.origin}${urlPath}&signature=${hashedSignature}`
}