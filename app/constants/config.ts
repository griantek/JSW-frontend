export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
};

export const API_ENDPOINTS = {
  search: '/api/journals/search',
};
