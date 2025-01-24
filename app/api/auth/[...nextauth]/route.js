import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const lowercaseEmail = credentials.email.toLowerCase();

          // Find user
          const user = await User.findOne({ email: lowercaseEmail }).select('+password');
          
          if (!user) {
            return null;
          }

          // Compare passwords
          const isValid = await bcrypt.compare(
            String(credentials.password),
            String(user.password)
          );

          if (!isValid) {
            return null;
          }

          // Return user without password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          };

        } catch (error) {
          console.error('Auth error:', error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
