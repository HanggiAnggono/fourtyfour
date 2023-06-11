import {View, Text} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {useQuery} from '@tanstack/react-query';
import {t} from 'react-native-tailwindcss';
import {Ticket} from '../dto/ticket';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

const TicketDetailScreen = (props: Props) => {
  const {ticketId} = props.route.params || {};

  const {data, isLoading, error} = useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: () => {
      return fetch(`http://localhost:3000/api/tickets/${ticketId}`)
        .then(res => res.json())
        .then(data => data)
        .catch(err => err);
    },
  });

  const ticket: Partial<Ticket> = data || {};

  return (
    <View style={[t.bgBlack, t.flex1, t.p1]}>
      <Text>{ticket?.id}</Text>
      <Text>{ticket?.ticketStatus}</Text>
      <Text>{ticket?.car?.brand}</Text>
      <Text>{ticket?.car?.licensePlate}</Text>
      <Text>{ticket?.car?.model}</Text>
      <Text>{ticket?.car?.transmission}</Text>
      <Text>{ticket?.car?.type}</Text>
      <Text>{ticket?.car?.year}</Text>
      <Text>{ticket?.seller?.name}</Text>
      <Text>{ticket?.seller?.address}</Text>
      <Text>{ticket?.seller?.phoneNumber}</Text>
      <Text>{ticket?.inspection?.schedule?.toLocaleString()}</Text>
      <Text style={[t.textBlue500]}>Link to Map</Text>
    </View>
  );
};

export default TicketDetailScreen;
