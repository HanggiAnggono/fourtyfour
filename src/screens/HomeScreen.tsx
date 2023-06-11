import React from 'react';
import {ScrollView, View} from 'react-native';
import TicketList from '../components/home/TicketList';
import {t} from 'react-native-tailwindcss';

export const HomeScreen = () => {
  return (
    <View style={[t.flex1]}>
      <TicketList />
    </View>
  );
};
