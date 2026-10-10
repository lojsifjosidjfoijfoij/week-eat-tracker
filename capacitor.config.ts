import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.louis.weekmealplanner',
  appName: 'dinrr',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#F2EFE9',
    scheme: 'dinrr',
  }
};

export default config;
