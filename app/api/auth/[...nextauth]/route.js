import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        // En production, comparer avec un hash stocké
        const isValid = await bcrypt.compare(
          credentials.password, 
          process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
        );
        
        if (isValid) {
          return { id: '1', name: 'Admin', email: 'admin@favoris.pro' };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin',
  },
});

export { handler as GET, handler as POST };