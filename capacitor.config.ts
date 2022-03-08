import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexup.ordereadyadmin',
  appName: 'ordeready',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      DisableDeploy: "true"
    }
  }
};

export default config;
