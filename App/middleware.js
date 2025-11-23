import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/',
    '/logs',
    '/settings',
    '/api/control',
    '/api/logs',
    '/api/status/latest',
  ],
};

