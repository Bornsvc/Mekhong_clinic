import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import pool from '@/backend/config/database';

// let pool: Pool;

// if (process.env.NODE_ENV === 'production') {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//   });
// } else {
//   pool = new Pool({
//     user: process.env.POSTGRES_USER,
//     host: process.env.POSTGRES_HOST,
//     database: process.env.POSTGRES_DB,
//     password: process.env.POSTGRES_PASSWORD,
//     port: parseInt(process.env.POSTGRES_PORT || '5432'),
//     ssl: {
//       rejectUnauthorized: false // เปิดใช้งาน SSL และยอมรับการเชื่อมต่อที่ไม่ถูกต้อง
//     }
//   });
// }

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [credentials.username]
          );

          const user = result.rows[0];
          
          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id,
              name: user.username,
              email: user.email,
              role: user.role
            };
          }
          return null;
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = Number(token.id);
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };