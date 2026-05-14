import Constants from 'expo-constants';

export type AppExtra = {
  apiBaseUrl: string;
  /** Legacy client-portal path; internal mobile uses `/api/v1/internal-mobile/*`. */
  apiAuthPath: string;
  appChannel: string;
  googleIosClientId: string;
  googleAndroidClientId: string;
  googleWebClientId: string;
  internalMobilePasswordAuthEnabled: boolean;
};

export function getExtra(): AppExtra {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  return {
    apiBaseUrl: typeof extra?.apiBaseUrl === 'string' ? extra.apiBaseUrl : '',
    apiAuthPath: typeof extra?.apiAuthPath === 'string' ? extra.apiAuthPath : '/api/mobile/login',
    appChannel: typeof extra?.appChannel === 'string' ? extra.appChannel : 'local',
    googleIosClientId: typeof extra?.googleIosClientId === 'string' ? extra.googleIosClientId : '',
    googleAndroidClientId:
      typeof extra?.googleAndroidClientId === 'string' ? extra.googleAndroidClientId : '',
    googleWebClientId: typeof extra?.googleWebClientId === 'string' ? extra.googleWebClientId : '',
    internalMobilePasswordAuthEnabled:
      typeof extra?.internalMobilePasswordAuthEnabled === 'boolean'
        ? extra.internalMobilePasswordAuthEnabled
        : false,
  };
}
