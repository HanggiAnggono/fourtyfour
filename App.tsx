/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import RootNavigation from './src/navigation/RootNavigation';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {retry: 0},
    queries: {retry: 0},
  },
});

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigation />
    </QueryClientProvider>
  );
}

export default App;
