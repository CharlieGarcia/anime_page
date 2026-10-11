import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// Only API routes need the signed-in user on the server. Pages are left alone so the
// statically generated ones (home, details) keep being served straight from the cache;
// they read the auth state in the browser.
export const config = {
  matcher: ['/api/(.*)']
};
