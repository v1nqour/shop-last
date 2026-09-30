import bcrypt from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        console.log("========== LOGIN ATTEMPT ==========");

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD;

        console.log("Received credentials:", credentials);
        console.log("ENV ADMIN_USERNAME:", adminUsername);
        console.log("ENV ADMIN_PASSWORD:", adminPasswordHash);

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Missing username or password");
          return null;
        }

        const isUsernameValid =
          credentials.username === adminUsername;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          adminPasswordHash || ""
        );

        console.log("Username entered:", credentials.username);
        console.log("Password entered:", credentials.password);
        console.log("Username valid:", isUsernameValid);
        console.log("Password valid:", isPasswordValid);

        if (isUsernameValid && isPasswordValid) {
          console.log("✅ Login SUCCESS");

          return {
            id: "1",
            name: adminUsername,
            email: "admin@example.com",
          };
        }

        console.log("❌ Login FAILED");
        return null;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);