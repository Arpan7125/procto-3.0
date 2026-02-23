import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Google OAuth Strategy ──────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'NOT_SET',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'NOT_SET',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/v1/auth/google/callback`,
        passReqToCallback: true,
      },
      async (req: any, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const role = req.query?.state || 'STUDENT';
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Find existing user by provider+providerId OR by email
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { provider: 'google', providerId: profile.id },
                { email },
              ],
            },
          });

          if (user) {
            // If user exists by email but hasn't linked Google, link it
            if (!user.provider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  provider: 'google',
                  providerId: profile.id,
                  profilePhotoUrl: profile.photos?.[0]?.value || user.profilePhotoUrl,
                },
              });
            }
            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                role: role === 'FACULTY' ? 'FACULTY' : 'STUDENT',
                provider: 'google',
                providerId: profile.id,
                profilePhotoUrl: profile.photos?.[0]?.value,
                isVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

// ── GitHub OAuth Strategy ──────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'NOT_SET',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'NOT_SET',
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/v1/auth/github/callback`,
        passReqToCallback: true,
        scope: ['user:email'],
      },
      async (req: any, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          const role = req.query?.state || 'STUDENT';
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

          // Find existing user by provider+providerId OR by email
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { provider: 'github', providerId: profile.id },
                { email },
              ],
            },
          });

          if (user) {
            if (!user.provider) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  provider: 'github',
                  providerId: profile.id,
                  profilePhotoUrl: profile.photos?.[0]?.value || user.profilePhotoUrl,
                },
              });
            }
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
          } else {
            const displayName = profile.displayName || profile.username || 'User';
            user = await prisma.user.create({
              data: {
                email,
                firstName: displayName.split(' ')[0],
                lastName: displayName.split(' ').slice(1).join(' ') || '',
                role: role === 'FACULTY' ? 'FACULTY' : 'STUDENT',
                provider: 'github',
                providerId: profile.id,
                profilePhotoUrl: profile.photos?.[0]?.value,
                isVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

// Serialize/deserialize (not using sessions, but passport requires it)
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
