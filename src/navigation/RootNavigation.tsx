import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  TicketDetail: {ticketId: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
