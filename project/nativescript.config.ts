import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.bitstackclone',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    codeCache: true,
    enableScreenCapture: true
  },
  ios: {
    discardUncaughtJsExceptions: true,
    enableScreenCapture: true
  }
} as NativeScriptConfig;