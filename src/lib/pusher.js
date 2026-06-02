"use client";
import Pusher from 'pusher-js';

let pusherClient = null;

export function getPusherClient() {
  if (!pusherClient && typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (key && cluster) {
      pusherClient = new Pusher(key, {
        cluster: cluster,
      });
    }
  }
  return pusherClient;
}
