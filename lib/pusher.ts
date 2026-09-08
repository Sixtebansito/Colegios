import Pusher from 'pusher';
import PusherClient from 'pusher-js';

const globalForPusher = global as unknown as {
  pusherServer: Pusher | undefined;
};

export const pusherServer =
  globalForPusher.pusherServer ||
  new Pusher({
    appId: process.env.PUSHER_APP_ID || 'dummy-app-id',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy-key',
    secret: process.env.PUSHER_SECRET || 'dummy-secret',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    useTLS: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPusher.pusherServer = pusherServer;
}

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy-key',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  }
);
