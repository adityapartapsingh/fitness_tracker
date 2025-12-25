/**
 * Unified error handling for API responses
 */

class APIError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const statusCode = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    if (statusCode === 401) {
      // Clear auth on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }

    return new APIError(message, statusCode, error.response.data);
  }

  if (error.request) {
    // Request made but no response
    return new APIError('No response from server', 0, null);
  }

  // Other errors
  return new APIError(error.message, null, null);
};

export default APIError;
