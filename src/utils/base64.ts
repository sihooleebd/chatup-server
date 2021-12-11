export default class Base64 {
  static makeBase64StrUrlSafe(base64Str: string): string {
    return base64Str.replace('/', '_').replace('+', '-');
  }

  static encodeUrlSafeBase64(str: string): string {
    const base64Str = Buffer.from(str, 'utf8').toString('base64');
    return Base64.makeBase64StrUrlSafe(base64Str);
  }

  static decodeUrlSafeBase64(base64Str: string): string {
    const tmp = base64Str.replace('_', '/').replace('-', '+');
    const utf8Str = Buffer.from(tmp, 'base64').toString('utf8');
    return utf8Str;
  }
}
