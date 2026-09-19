import { SignUp } from '@clerk/clerk-react';
import { AuthLayout } from './AuthLayout';

export function SignUpPage() {
  return (
    <AuthLayout title="Create your vault" subtitle="Set up secure access to your credentials">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
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