import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {
  QueryClient,
  dehydrate,
  hydrate,
  onlineManager,
} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import NetInfo from '@react-native-community/netinfo';
import {CONFIG} from '../constants';

const hourInMs = 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
      networkMode: 'offlineFirst',
      cacheTime: 24 * hourInMs * 3,
    },
    queries: {
      retry: 0,
      networkMode: 'offlineFirst',
      cacheTime: 24 * hourInMs * 3,
    },
  },
});

queryClient.setMutationDefaults(['tickets'], {
  mutationFn: async ({id, ...payload}) => {
    // to avoid clashes with our optimistic update when an offline mutation continues
    await queryClient.cancelQueries({queryKey: ['tickets', id]});
    return fetch(`${CONFIG.API_BASE_URL}/api/tickets/${id}`, {
      body: JSON.stringify({id, ...payload}),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

let state: any;

export const PersistAsyncStorageProvider = ({
  children,
}: React.PropsWithChildren) => {
  useEffect(() => {
    onlineManager.setEventListener(setOnline => {
      return NetInfo.addEventListener(netState => {
        const isOnline =
          !!netState.isConnected || !!netState.isInternetReachable;
        if (!isOnline) {
          state = dehydrate(queryClient);
        }
        setOnline(isOnline);
      });
    });
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: asyncStoragePersister}}
      onSuccess={() => {
        console.log('RESUMING PAUSED MUTATIONS');
        hydrate(queryClient, state);
        queryClient.resumePausedMutations().then(() => {
          console.log('MUTATIONS COMPLETED, INVALIDATING QUERIES');
          queryClient.invalidateQueries();
        });
      }}>
      {children}
    </PersistQueryClientProvider>
  );
};
