import Base64 from './base64';

export default class Auth {
  static authenticate(accessToken?: string): [number, number] {
    if(!accessToken) {
      accessToken = '';
    }
    console.log('accessToken:', accessToken);
    if (accessToken.length === 0) {
      return [0, 401];
    }
    if (
      !/^([A-Za-z0-9-_=]+)(.)([A-Za-z0-9-_=]+)(.)([A-Za-z0-9-_=]+)$/.test(
        accessToken,
      )
    ) {
      console.log("reges doesn't match");
      return [0, 400];
    }
    if(accessToken==='Unknown User') {
      console.log('weird access token')
      return [0, 400];
    }
    const [email64, id64, validator64] = accessToken.split('.');
    const email = Base64.decodeUrlSafeBase64(email64);
    const id = Number(Base64.decodeUrlSafeBase64(id64)) || 0;
    const validator = Base64.decodeUrlSafeBase64(validator64);
    if (Auth.getAccessToken(email, id) !== accessToken) {
      console.log('invalid');
      return [0, 400];
    }

    return [id, 200];
  }

  static getAccessToken(email: string, id: number) {
    const tempStr = `${email}.${id}`;
    const value = tempStr
      .split('')
      .reduce((a, c, i) => a + c.charCodeAt(0) * i, 528);

    return (
      Base64.encodeUrlSafeBase64(email) +
      '.' +
      Base64.encodeUrlSafeBase64(String(id)) +
      '.' +
      Base64.encodeUrlSafeBase64(String(value))
    );
  }
}
