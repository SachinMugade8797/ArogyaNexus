export function canAccessProfile(access: { user_id: string } | null | undefined, userId: string): boolean {
  return Boolean(access && access.user_id === userId);
}
