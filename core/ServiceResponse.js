const config = require('./../config/app');
const Payload = require('./Payload');

class ServiceResponse {
  checkHeaders(type, methods) {
    return (request, response, next) => {
      const payload = new Payload();
      const headerValues = config.server.requiredHeaders[type];
      const notContainsHeaderType = !request.headers[type];
      const notContainsHeaderValue = !headerValues.some(headerValue => request.headers[type].includes(headerValue));

      if ((notContainsHeaderType || notContainsHeaderValue) && methods.includes(request.method)) {
        payload.add('status', 'error');
        payload.add('message', `Invalid header ${type}. Only: [${headers.join(', ')}]`);

        return response.send(payload.get());
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

      return response.send(payload.get());
    }
  
    next();
  }
}

module.exports = ServiceResponse;