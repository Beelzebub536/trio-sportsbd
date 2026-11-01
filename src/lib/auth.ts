import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import prisma from "@/lib/prisma";

// Social providers are only enabled when their credentials exist, so the app
// still boots on a dev machine without Google/Facebook keys configured.
const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
const facebookEnabled = Boolean(
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET,
);
const canonicalAuthUrl = process.env.BETTER_AUTH_URL;
const canonicalAuth = (() => {
  try {
    return canonicalAuthUrl ? new URL(canonicalAuthUrl) : undefined;
  } catch {
    return undefined;
  }
})();
const canonicalAuthOrigin = canonicalAuth?.origin;
const deploymentHost = process.env.VERCEL_URL;
const allowedAuthHosts = [
  "localhost:*",
  "127.0.0.1:*",
  ...(canonicalAuth ? [canonicalAuth.host] : []),
  ...(deploymentHost ? [deploymentHost] : []),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: allowedAuthHosts,
    ...(canonicalAuthUrl ? { fallback: canonicalAuthUrl } : {}),
    protocol: "auto",
  },
  trustedOrigins: [
    ...(canonicalAuthOrigin ? [canonicalAuthOrigin] : []),
    ...(deploymentHost ? [`https://${deploymentHost}`] : []),
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:*", "http://127.0.0.1:*"]),
  ],
  emailAndPassword: {
    // Email + password sign-in with NO email sending: no verification mail and
    // no password-reset mail. Admins reset passwords from the dashboard.
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(facebookEnabled
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
  account: {
    accountLinking: {
      enabled: true,
      // Only Google may auto-link (verified emails). Facebook must not, to
      // avoid account-takeover via unverified email addresses.
      trustedProviders: ["google"],
    },
  },
  plugins: [
    admin({
      // Users with role "admin" get the admin API. The plugin marks the
      // `role` field as `input: false`, so a signup payload containing
      // `role: "admin"` is ignored and the default "customer" is used. Only
      // the seed and admin server actions can change a role.
      adminRoles: ["admin"],
      defaultRole: "customer",
    }),
    // nextCookies() MUST be the last plugin so Server Actions get Set-Cookie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
