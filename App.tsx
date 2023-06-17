/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {useNetInfo} from '@react-native-community/netinfo';
import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {t} from 'react-native-tailwindcss';
import RootNavigation from './src/navigation/RootNavigation';
import {PersistAsyncStorageProvider} from './src/query-client/queryClient';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useQueryClient} from '@tanstack/react-query';

function App(): JSX.Element {
  return (
    <PersistAsyncStorageProvider>
      <RootNavigation />
      <NetworkInfo />
      <Logger />
    </PersistAsyncStorageProvider>
  );
}

const NetworkInfo = () => {
  const {isConnected, isInternetReachable} = useNetInfo();
  const isOnline = isConnected || isInternetReachable;

  if (!isOnline) {
    return (
      <View style={[t.p1]}>
        <Text>You are offline</Text>
      </View>
    );
  }

  return null;
};

const Logger = () => {
  const queryClient = useQueryClient();
  const mCache = queryClient.getMutationCache();
  // const cache = mCache.find({mutationKey: keys.updateTicket(ticketId)});
  const {getItem} = useAsyncStorage('tanstack-query-cache');
  useEffect(() => {
    const i = setInterval(() => {
      getItem().then((result: any) => {
        const data = JSON.parse(result);
        console.warn(
          new Date().toTimeString().replace('GMT+0700', ''),
          JSON.stringify(
            {
              offlineMutations: data?.clientState?.mutations?.length,
              offlineQueries: data?.clientState?.queries?.length,
              pausedM: mCache.findAll({predicate: m => m.state.isPaused})
                ?.length,
            },
            null,
            2,
          ),
        );
      });
    }, 3000);

    return () => {
      clearInterval(i);
    };
  }, []);

  return null;
};

export default App;
