/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useNetInfo} from '@react-native-community/netinfo';
import React from 'react';
import {Text, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import RootNavigation from './src/navigation/RootNavigation';
import {PersistAsyncStorageProvider} from './src/query-client/queryClient';

function App(): JSX.Element {
  return (
    <PersistAsyncStorageProvider>
      <RootNavigation />
      <NetworkInfo />
    </PersistAsyncStorageProvider>
  );
}

const NetworkInfo = () => {
  const {isConnected, isInternetReachable} = useNetInfo();
  const isOnline = isConnected || isInternetReachable;
  console.log({isOnline});

  if (!isOnline) {
    return (
      <View style={[t.p1]}>
        <Text>You are offline</Text>
      </View>
    );
  }

  return null;
};

export default App;
