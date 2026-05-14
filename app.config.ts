import type { ExpoConfig } from 'expo/config';

const EAS_PROJECT_ID = '49b020ca-43cd-436c-a30c-24aedfc68553';

export default (): ExpoConfig => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  const apiAuthPath = process.env.EXPO_PUBLIC_API_AUTH_PATH ?? '/api/mobile/login';
  const internalMobilePasswordAuthEnabled =
    (process.env.EXPO_PUBLIC_INTERNAL_MOBILE_PASSWORD_AUTH_ENABLED ?? '').toLowerCase() === 'true';

  return {
    name: 'Insuring Income (Internal)',
    slug: 'insuringincome-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'insuringincomemobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.insuringincome.internal.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#1a2b45',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.insuringincome.internal.app',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
      'expo-apple-authentication',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#1a2b45',
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#f4f6f8',
          dark: {
            backgroundColor: '#0f1419',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      apiBaseUrl,
      apiAuthPath,
      appChannel: process.env.EXPO_PUBLIC_APP_CHANNEL ?? 'local',
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      internalMobilePasswordAuthEnabled,
    },
    updates: {
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
