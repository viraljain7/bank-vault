import { SignIn } from '@clerk/clerk-react';
import { AuthLayout } from './AuthLayout';

export function SignInPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to access your secure vault">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            card: { boxShadow: 'none', border: 'none' },
            rootBox: { width: '100%' },
          },
        }}
      />
    </AuthLayout>
  );
}