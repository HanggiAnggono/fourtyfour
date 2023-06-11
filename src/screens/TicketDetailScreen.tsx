import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Button,
} from 'react-native';
import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {useMutation, useQuery} from '@tanstack/react-query';
import {t} from 'react-native-tailwindcss';
import {Ticket} from '../dto/ticket';
import {CONFIG} from '../constants';
import {queryClient} from '../query-client/queryClient';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

function useForm<T>({initialValues} = {}) {
  const [values, setValues] = useState<T>(initialValues);

  const register = (key: string) => {
    return {
      value: values[key],
      onChangeText: (value: string) => {
        setValues({...values, [key]: value});
      },
    };
  };

  return {values, setValues, register};
}

const TicketDetailScreen = (props: Props) => {
  const {ticketId} = props.route.params || {};

  const {data, isLoading} = useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: () => {
      return fetch(`${CONFIG.API_BASE_URL}/api/tickets/${ticketId}`).then(res =>
        res.json(),
      );
    },
  });

  const ticket: Partial<Ticket> = data || {};

  const initialValues = {
    inspectorName: ticket?.inspection?.inspector,
    ...ticket?.car,
  };
  const {register, values} = useForm<typeof initialValues>({
    initialValues,
  });

  // mutation
  const {mutate, ...submitM} = useMutation({
    mutationKey: ['ticket', ticketId],
    mutationFn: (payload: any) => {
      console.log({payload});
      return fetch(`${CONFIG.API_BASE_URL}/api/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
    },
  });

  if (isLoading) {
    return (
      <View style={[t.bgGray700]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const textInput = ({key, label}: any) => {
    return (
      <>
        <Text style={[t.textXs]}>{label}</Text>
        <TextInput {...register(key)} style={[t.bgGray700, t.mB2, t.rounded]} />
      </>
    );
  };

  const handleSubmit = () => {
    const {inspectorName, ...car} = values;

    mutate({
      car,
      inspection: {inspectorName},
    });
  };

  return (
    <ScrollView style={[t.bgGray700, t.flex1, t.p3]}>
      <View>
        <View style={[t.flexRow, t.justifyBetween, t.mB2]}>
          <Text>{ticket?.id}</Text>
          <Text>{ticket?.ticketStatus}</Text>
        </View>
        <View style={[t.bgGray900, t.p1, t.mB2]}>
          <Text>Seller Info:</Text>
          <Text>{ticket?.seller?.name}</Text>
          <Text>{ticket?.seller?.address}</Text>
          <Text>{ticket?.seller?.phoneNumber}</Text>
        </View>
        <View style={[t.bgGray900, t.p1, t.mB2]}>
          <Text>Inspection Info:</Text>
          <Text>{ticket?.inspection?.schedule?.toLocaleString()}</Text>
          <Text style={[t.textBlue500]}>Link to Map</Text>
        </View>

        <View style={[t.bgGray900, t.p1]}>
          <Text style={[t.mB2]}>Inspection Form:</Text>
          {textInput({key: 'inspectorName', label: 'Inspector Name'})}
          {textInput({key: 'licensePlate', label: 'License Plate'})}
          {textInput({key: 'brand', label: 'Brand'})}
          {textInput({key: 'model', label: 'Model'})}
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
};

export default TicketDetailScreen;
