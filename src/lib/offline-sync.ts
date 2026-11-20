/**
 * EdvoNest Mobile PWA & Offline Synchronization Helper
 * Secure offline caching and background synchronization.
 * Tagline: Learn • Grow • Succeed
 */

export interface QueuedAttendance {
  id: string;
  sectionId: string;
  dateStr: string;
  records: Array<{ studentId: string; status: string; remarks?: string }>;
  timestamp: number;
}

const ATTENDANCE_QUEUE_KEY = 'edvonest_offline_attendance_queue';

/**
 * Returns true if the client browser has an active internet connection.
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Queues an attendance submission safely in local client storage when offline.
 */
export function queueOfflineAttendance(
  sectionId: string,
  dateStr: string,
  records: Array<{ studentId: string; status: string; remarks?: string }>
): QueuedAttendance {
  if (typeof window === 'undefined') {
    return { id: 'dummy', sectionId, dateStr, records, timestamp: Date.now() };
  }

  const existingStr = localStorage.getItem(ATTENDANCE_QUEUE_KEY);
  const queue: QueuedAttendance[] = existingStr ? JSON.parse(existingStr) : [];

  const newItem: QueuedAttendance = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sectionId,
    dateStr,
    records,
    timestamp: Date.now(),
  };

  queue.push(newItem);
  localStorage.setItem(ATTENDANCE_QUEUE_KEY, JSON.stringify(queue));

  // Request background sync if Service Worker and SyncManager are available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg: any) => {
      if (reg.sync) {
        reg.sync.register('sync-attendance').catch((e: any) => console.log('Sync register failed', e));
      }
    });
  }

  return newItem;
}

/**
 * Retrieves the count of pending offline attendance records.
 */
export function getOfflineAttendanceCount(): number {
  if (typeof window === 'undefined') return 0;
  const existingStr = localStorage.getItem(ATTENDANCE_QUEUE_KEY);
  if (!existingStr) return 0;
  try {
    const queue: QueuedAttendance[] = JSON.parse(existingStr);
    return queue.length;
  } catch {
    return 0;
  }
}

/**
 * Flushes all pending offline attendance records to the server.
 */
export async function flushOfflineAttendance(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !isOnline()) {
    return { synced: 0, failed: 0 };
  }

  const existingStr = localStorage.getItem(ATTENDANCE_QUEUE_KEY);
  if (!existingStr) return { synced: 0, failed: 0 };

  let queue: QueuedAttendance[] = [];
  try {
    queue = JSON.parse(existingStr);
  } catch {
    return { synced: 0, failed: 0 };
  }

  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: QueuedAttendance[] = [];

  for (const item of queue) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: item.sectionId,
          dateStr: item.dateStr,
          records: item.records,
        }),
      });

      if (res.ok) {
        synced++;
      } else if (res.status === 401) {
        // Session expired during offline sync
        handleSessionExpiry();
        return { synced, failed: queue.length - synced };
      } else {
        remaining.push(item);
        failed++;
      }
    } catch {
      remaining.push(item);
      failed++;
    }
  }

  localStorage.setItem(ATTENDANCE_QUEUE_KEY, JSON.stringify(remaining));
  return { synced, failed };
}

/**
 * Safely handles session expiration:
 * Clears temporary non-sensitive data and redirects cleanly to login.
 */
export function handleSessionExpiry() {
  if (typeof window === 'undefined') return;
  // Clear any temporary draft keys
  try {
    sessionStorage.clear();
  } catch {}
  window.location.href = '/login?session_expired=true';
}

/**
 * Registers device for PWA Push Notifications.
 */
export async function subscribeToPushNotifications(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: 'Push notifications are not supported on this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission denied.' };
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      // In production you would supply your VAPID public key
      // For development/simulation we register standard push endpoint
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      });
    }

    // Post to backend
    const res = await fetch('/api/pwa/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SUBSCRIBE',
        subscription: sub,
      }),
    });

    if (res.ok) {
      return { success: true, message: 'Push notifications enabled successfully!' };
    }
    return { success: true, message: 'Subscribed locally on this device.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Push subscription failed.' };
  }
}
