'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();
export const signInWithGoogle = (callbackURL = '/me') => authClient.signIn.social({ provider: 'google', callbackURL });
