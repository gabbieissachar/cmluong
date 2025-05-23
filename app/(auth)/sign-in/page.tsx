import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex justify-center pt-20">
      <SignIn path="/app/(auth)/sign-in" signUpUrl="/app/(auth)/sign-up" />
    </div>
  )
}
