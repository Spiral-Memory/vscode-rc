export class AuthData {
  private static authToken: string | null = null;
  private static userId: string | null = null;

  static setAuthToken(token: string) {
    AuthData.authToken = token;
  }

  static getAuthToken() {
    return AuthData.authToken;
  }

  static setUserId(id: string) {
    AuthData.userId = id;
  }

  static getUserId() {
    return AuthData.userId;
  }
}
