// lib/whatsapp.js
export async function sendWhatsAppNotification(to, message) {
  // Placeholder for Twilio integration
  console.log(`Sending WhatsApp to ${to}: ${message}`);
  // Example: await twilioClient.messages.create({ to: `whatsapp:${to}`, from: 'whatsapp:+1234567890', body: message });
}

// lib/auth.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        passwordHash: { label: "Password Hash", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findFirst({
          where: { email: credentials.email, passwordHash: credentials.passwordHash },
        });
        if (!user) throw new Error("Invalid credentials");
        return { id: user.id, role: user.role, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};

export default NextAuth(authOptions);