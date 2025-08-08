export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/api/bookmarks/(create|update|delete)']
};