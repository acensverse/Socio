export const authConfig = {
  trustHost: true,
  providers: [], // Keep empty or add providers that are edge-compatible
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
      }
      return session
    },
  },
}
