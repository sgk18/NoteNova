import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notenova.app',
  appName: 'NoteNova',
  webDir: 'out',
  server: {
    url: 'https://note-nova-khaki.vercel.app', // 👈 PUT YOUR REAL VERCEL LINK
    cleartext: true
  }
};

export default config;
