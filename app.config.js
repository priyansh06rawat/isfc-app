export default {
  expo: {
    name: 'isfc-app',
    slug: 'isfc-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'indiashelterapp',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/expo.icon',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './assets/images/icon.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.anonymous.isfcapp',
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFFFFF',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 200,
          },
        },
      ],
      'expo-secure-store',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      SF_LOGIN_URL: process.env.EXPO_PUBLIC_SF_LOGIN_URL || 'https://isfc--partial.sandbox.my.salesforce.com',
      SF_INSTANCE_URL: process.env.EXPO_PUBLIC_SF_INSTANCE_URL || 'https://isfc--partial.sandbox.my.salesforce.com',
      SF_CLIENT_ID: process.env.EXPO_PUBLIC_SF_CLIENT_ID || '3MVG973QtA4.tpvmvalhsxClba78wzwg9PQL9brMOTrnuhN3l1YQ.1j14G74Wzjp4UR9TKBc4BsXKAgmxTAw4',
      SF_CLIENT_SECRET: process.env.EXPO_PUBLIC_SF_CLIENT_SECRET || '87299BDB3C3A678C5B4E5277420DBC865E7F82383B2857D56C33BB4117F6AA3D',
      router: {},
      eas: {
        projectId: 'e603950b-7621-4c0c-af5d-89ec58a1362e',
      },
    },
    owner: 'priyanshrawat',
  },
};
