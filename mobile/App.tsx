import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from './src/shared/store';
import AppNavigator from './src/navigation/AppNavigator';
import SOSButton from './src/shared/components/SOSButton';
import OfflineIndicator from './src/shared/components/OfflineIndicator';
import { initLocationServices } from './src/shared/services/location.service';
import { initNotificationServices } from './src/shared/services/notification.service';
import { initEncryption } from './src/shared/services/encryption.service';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

const AppContent: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await initLocationServices();
        await initNotificationServices();
        await initEncryption();
      } catch (err) {
        console.warn('Init warning:', err);
      }
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FAFAFA"
          translucent={false}
        />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        <SOSButton />
        <OfflineIndicator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppContent />
    </PersistGate>
  </Provider>
);

export default App;
