export function canRemoveOwner(ownerCount: number): boolean {
  return ownerCount > 1;
}

export function canDeleteSignup(isOwner: boolean): boolean {
  return !isOwner;
}