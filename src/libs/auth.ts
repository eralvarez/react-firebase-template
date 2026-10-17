import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { userRepository } from './db';
import { auth, googleProvider } from './firebase';

type UserProvider = 'password' | 'google';

interface SignUpPayload {
  displayName: string;
  email: string;
  password: string;
}

const toSafeDisplayName = (displayName: string): string => displayName.trim();

const ensureLocalAuthPersistence = async () => {
  await setPersistence(auth, browserLocalPersistence);
};

const upsertUserDocument = async (user: User, provider: UserProvider): Promise<void> => {
  const { data: existingUsers, error: queryError } = await userRepository.getAll({
    where: {
      field: 'uid',
      operator: '==',
      value: user.uid,
    },
    limit: 1,
  });

  if (queryError) {
    throw queryError;
  }

  const payload = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    provider,
  };

  const existingUser = existingUsers?.[0];
  if (existingUser) {
    const { error: updateError } = await userRepository.update(existingUser.id, payload);
    if (updateError) {
      throw updateError;
    }
    return;
  }

  const { error: createError } = await userRepository.create(payload);
  if (createError) {
    throw createError;
  }
};

export const signUpWithEmailPassword = async ({ displayName, email, password }: SignUpPayload) => {
  await ensureLocalAuthPersistence();
  const credentials = await createUserWithEmailAndPassword(auth, email, password);

  const safeDisplayName = toSafeDisplayName(displayName);
  if (safeDisplayName) {
    await updateProfile(credentials.user, { displayName: safeDisplayName });
  }

  await upsertUserDocument(credentials.user, 'password');
  await sendEmailVerification(credentials.user);

  return credentials.user;
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  await ensureLocalAuthPersistence();
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserDocument(credentials.user, 'password');
  return credentials.user;
};

export const signInWithGoogle = async () => {
  await ensureLocalAuthPersistence();
  const credentials = await signInWithPopup(auth, googleProvider);
  await upsertUserDocument(credentials.user, 'google');
  return credentials.user;
};

export const resendVerificationEmail = async (user: User) => {
  await sendEmailVerification(user);
};

export const signOutUser = async () => {
  await signOut(auth);
};
