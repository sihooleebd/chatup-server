export default class HTMLHelper {
  static escape(str: string): string {
    return str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  }
}



