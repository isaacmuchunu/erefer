/**
 * Custom hook to extract route parameters in an Inertia.js application
 * This mimics the behavior of react-router-dom's useParams hook
 */
export function useParams<T extends Record<string, string>>(): T {
  // Get the current URL path
  const path = window.location.pathname;
  
  // Extract the last segment as the ID
  const segments = path.split('/');
  const id = segments[segments.length - 1];
  
  // Return an object with the ID parameter
  return { id } as T;
}

export default useParams;