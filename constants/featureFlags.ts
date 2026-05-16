// Development-only toggles. Keep disabled for production builds.
export const DEV_FLAGS = {
  // Temporary QA mode: treat first 21 players as unlocked.
  UNLOCK_21_PLAYERS_FOR_TESTS: true,
  // Minimum unlocked pool for manager/lineup QA.
  QA_UNLOCKED_PLAYERS_COUNT: 40,
} as const;
