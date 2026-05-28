import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.louis.weekmealplanner',
  appName: 'week meal planner',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#F2EFE9'
  }
};

export default config;
