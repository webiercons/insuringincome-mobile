import type { InternalMobileDevicePayload } from '@/lib/device-metadata';

export type PendingSsoLink = {
  assertion: string;
  provider: string;
  maskedEmail: string;
  device: InternalMobileDevicePayload;
};

export type PendingMfa = {
  challengeId: string;
  hint: string;
  device: InternalMobileDevicePayload;
};

let pendingSso: PendingSsoLink | null = null;
let pendingMfa: PendingMfa | null = null;

export function setPendingSsoLink(state: PendingSsoLink): void {
  pendingSso = state;
}

export function getPendingSsoLink(): PendingSsoLink | null {
  return pendingSso;
}

export function clearPendingSsoLink(): void {
  pendingSso = null;
}

export function setPendingMfa(state: PendingMfa): void {
  pendingMfa = state;
}

export function getPendingMfa(): PendingMfa | null {
  return pendingMfa;
}

export function clearPendingMfa(): void {
  pendingMfa = null;
}

export function clearPendingInternalAuth(): void {
  pendingSso = null;
  pendingMfa = null;
}
