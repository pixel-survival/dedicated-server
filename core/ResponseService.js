const config = require('./../config/app');
const Payload = require('./Payload');

class ResponseService {
  checkHeaders(type, methods) {
    return (request, response, next) => {
      const payload = new Payload();
      const headerValues = config.server.login.requiredHeaders[type];
      const notContainsHeaderType = !request.headers[type];
      const notContainsHeaderValue = !headerValues.some(headerValue => request.headers[type].includes(headerValue));

      if ((notContainsHeaderType || notContainsHeaderValue) && methods.includes(request.method)) {
        payload.add('status', 'error');
        payload.add('message', `Invalid header ${type}. Only: [${headers.join(', ')}]`);

        response.send(payload.get());

        return;
      }
      
      next();
    }
  }

  checkInvalidJSON(error, request, response, next) {
    const payload = new Payload();
    const hasInvalidRequest = !request.body && request.method !== 'GET';
    const hasError = error instanceof SyntaxError && 'body' in error && error.type === 'entity.parse.failed';

    if (hasInvalidRequest || hasError) {
      payload.add('status', 'error');
      payload.add('message', 'Invalid JSON');

      response.send(payload.get());

      return;
    }
  
    next();
  }
}

module.exports = new ResponseService();