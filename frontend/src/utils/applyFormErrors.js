import { parseApiError } from './errorHandler.js';

export function applyFormErrors(error, setError) {
  const parsed = parseApiError(error);

  Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
    setError(field, { type: 'server', message });
  });

  return parsed;
}
