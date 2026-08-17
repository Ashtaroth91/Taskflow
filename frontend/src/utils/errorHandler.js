/**
 * Extracts normalized error details from the backend error envelope response
 * Contract: { statusCode, success: false, message, errors: [] }
 */
export function parseApiError(error) {
  if (!error) {
    return {
      message: 'An unknown error occurred.',
      statusCode: 500,
      fieldErrors: {},
    };
  }

  // Network error / server unreachable
  if (error.code === 'ERR_NETWORK') {
    return {
      message: 'Network error. Please check your connection or backend server.',
      statusCode: 0,
      fieldErrors: {},
    };
  }

  const response = error.response;
  if (!response) {
    return {
      message: error.message || 'Unable to communicate with server.',
      statusCode: 500,
      fieldErrors: {},
    };
  }

  const data = response.data || {};
  const statusCode = data.statusCode || response.status || 500;
  const message = data.message || 'An error occurred while processing your request.';
  
  // Transform errors array into fieldErrors map if array contains objects with field property
  const fieldErrors = {};
  if (Array.isArray(data.errors)) {
    data.errors.forEach((err) => {
      if (typeof err === 'object' && err !== null) {
        const field = err.field || err.param || err.path;
        if (field) {
          fieldErrors[field] = err.message || err.msg || 'Invalid field';
        }
      }
    });
  }

  return {
    message,
    statusCode,
    fieldErrors,
    rawErrors: data.errors || [],
  };
}
