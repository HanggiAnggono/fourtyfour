import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {QueryClient, onlineManager} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import NetInfo from '@react-native-community/netinfo';

const hourInMs = 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {retry: 0, cacheTime: 24 * hourInMs * 3},
    queries: {
      retry: 0,
      networkMode: 'offlineFirst',
      cacheTime: 24 * hourInMs * 3,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export const PersistAsyncStorageProvider = ({
  children,
}: React.PropsWithChildren) => {
  useEffect(() => {
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(state => {
        console.log({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        });
        setOnline(!!state.isConnected || !!state.isInternetReachable);
      });
    });
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: asyncStoragePersister}}
      // onSuccess={() => {
      //   console.log('RESUMING PAUSED MUTATIONS');
      //   queryClient.resumePausedMutations().then(() => {
      //     console.log('MUTATIONS COMPLETED, INVALIDATING QUERIES');
      //     queryClient.invalidateQueries();
      //   });
      // }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
