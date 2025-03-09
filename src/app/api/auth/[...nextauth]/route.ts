import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// Function to normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\s+/g, '').replace(/-/g, '').trim();
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phoneNumber: { label: 'شماره تلفن', type: 'tel' },
        password: { label: 'رمز عبور', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new Error('اطلاعات وارد شده نامعتبر است');
        }

        // Normalize the phone number
        const normalizedPhoneNumber = normalizePhoneNumber(credentials.phoneNumber);
        console.log('Login attempt:', { 
          rawPhoneNumber: credentials.phoneNumber, 
          normalizedPhoneNumber 
        });

        await connectToDatabase();

        const user = await User.findOne({ phoneNumber: normalizedPhoneNumber });
        if (!user) {
          console.log('User not found with phone number:', normalizedPhoneNumber);
          throw new Error('کاربری با این شماره تلفن یافت نشد');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('Invalid password for user:', normalizedPhoneNumber);
          throw new Error('رمز عبور اشتباه است');
        }

        console.log('Login successful for user:', normalizedPhoneNumber);
        return {
          id: user._id.toString(),
          phoneNumber: user.phoneNumber,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phoneNumber = token.phoneNumber;
        delete (session.user as any).email;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 