# HealthOS Auth + Onboarding Phase 3

Date: 2026-06-16

## Files Inspected

- `src/app/auth/login.tsx`
- `src/app/auth/sign-in.tsx`
- `src/app/auth/sign-up.tsx`
- `src/app/auth/signup.tsx`
- `src/app/auth/forgot-password.tsx`
- `src/components/auth/AuthShell.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/context/AuthContext.tsx`
- `src/lib/profileSync.ts`
- `src/lib/supabase.ts`
- `src/app/onboarding/index.tsx`
- `src/lib/onboardingStorage.ts`
- `src/types/onboarding.ts`

## Components Created

- `src/components/healthos/auth/HealthOSAuthScreen.tsx`
- `src/components/healthos/auth/HealthOSAuthCard.tsx`
- `src/components/healthos/auth/HealthOSAuthButton.tsx`
- `src/components/healthos/auth/HealthOSAuthInput.tsx`
- `src/components/healthos/auth/HealthOSSocialButton.tsx`
- `src/components/healthos/auth/HealthOSAuthError.tsx`
- `src/components/healthos/auth/index.ts`
- `src/components/healthos/onboarding/HealthOSOnboardingScreen.tsx`
- `src/components/healthos/onboarding/HealthOSOnboardingProgress.tsx`
- `src/components/healthos/onboarding/HealthOSOnboardingOptionCard.tsx`
- `src/components/healthos/onboarding/HealthOSOnboardingGoalPillGrid.tsx`
- `src/components/healthos/onboarding/index.ts`

## Screens Updated

- `src/app/auth/sign-in.tsx`
- `src/app/auth/sign-up.tsx`
- `src/app/auth/forgot-password.tsx`
- `src/app/onboarding/index.tsx`
- `src/components/auth/AuthShell.tsx`
- `src/components/auth/AuthForm.tsx`
- `src/components/healthos/index.ts`

## Auth Structure Found

Email auth is routed through `useAuth`, which calls:

- `signInWithEmail` in `src/lib/profileSync.ts`
- `signUpWithEmail` in `src/lib/profileSync.ts`

Forgot password already used `supabase.auth.resetPasswordForEmail` directly and was preserved.

No existing Google OAuth helper was found.

No existing Apple OAuth helper was found.

## Auth Methods Wired

- Email/password sign in: preserved and restyled.
- Email/password sign up: preserved and restyled.
- Forgot password: preserved and restyled.
- Google: visible button with pending inline error behavior. No fake login.
- Apple: platform-aware social button. It is disabled because no existing Apple auth provider flow was found. On unsupported platforms it communicates iOS-only behavior.

## Onboarding Order Implemented

The active onboarding route now follows:

1. Setup purpose
2. Gender / profile basics
3. Goals / what they need help with
4. Privacy and sharing
5. Permissions
6. Finish

The route still stores through the existing onboarding state keys:

- `welcome`
- `profile_setup`
- `module_selection`
- `privacy_promise`
- `notifications`
- `finish`

This keeps compatibility with the existing `OnboardingStep` type and storage logic.

## Persistence Preserved

Preserved existing logic for:

- Initial profile preferences via `createInitialHealthProfile`
- Selected modules via `updateOnboardingState`
- Suggested widgets via `saveInitialHealthWidgets`
- Notification choice via `saveInitialNotificationChoice`
- AI disabled-by-default consent via `saveInitialAssistantConsent(false)`
- Onboarding completion via `completeOnboarding`

Optional height, weight, and activity level were not added because the existing profile/onboarding model does not support those fields yet.

## Placeholders Remaining

- Google OAuth provider flow needs a real existing helper before enabling successful sign-in.
- Apple sign-in needs a real platform/provider implementation before enabling.
- Camera, Calendar, Device Sync, and Location permission cards are UI-only except Notifications, which preserves the existing notification choice handler.
- Home widget personalization beyond selected modules/widgets remains for later phases.

## Risks

- The existing onboarding storage type still includes old step names for compatibility. The UI maps those into the six-step HealthOS order.
- Users already mid-onboarding in old steps may be normalized into the nearest new phase.
- Social auth buttons are intentionally not functional until provider flows are implemented.

## Next Recommended Phase

Phase 04 should style the Home entry/dashboard using the HealthOS shell and widget primitives without changing bottom nav routes or Supabase logic.
