import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.careerai.app',
  appName: 'CareerAI',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
