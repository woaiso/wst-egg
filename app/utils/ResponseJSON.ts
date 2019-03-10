export default class ResponseJSON {
  constructor(code = 0, message = 'success', data?: any) {
    return { code, message, ...data };
  }
}
