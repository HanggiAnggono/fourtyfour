import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Button,
  Alert,
} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {onlineManager, useMutation, useQuery} from '@tanstack/react-query';
import {t} from 'react-native-tailwindcss';
import {Ticket} from '../dto/ticket';
import {CONFIG} from '../constants';
import {queryClient} from '../query-client/queryClient';
import {Controller, FormProvider, useForm} from 'react-hook-form';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

const TicketDetailScreen = (props: Props) => {
  const {ticketId} = props.route.params || {};
  const ticketKey = ['tickets', ticketId];

  const {data, ...ticketQ} = useQuery<Ticket>({
    queryKey: ticketKey,
    queryFn: () => {
      return fetch(`${CONFIG.API_BASE_URL}/api/tickets/${ticketId}`)
        .then(res => res.json())
        .then((ticket: Ticket) => {
          reset({
            inspectorName: ticket.inspection?.inspector,
            brand: ticket.car?.brand,
            licensePlate: ticket.car?.licensePlate,
            model: ticket.car?.model,
            transmission: ticket.car?.transmission,
            type: ticket.car?.type,
            year: ticket.car?.year,
          });
          return ticket;
        });
    },
  });

  const ticket: Partial<Ticket> = data || {};

  const initialValues = {
    inspectorName: ticket?.inspection?.inspector,
    ...ticket?.car,
  };
  const form = useForm<typeof initialValues>();
  const {getValues, reset} = form;
  const values = getValues();

  // mutation
  const {mutate, ...submitM} = useMutation({
    mutationKey: ticketKey,
    onMutate: async (_: any) => {
      await queryClient.cancelQueries({queryKey: ticketKey});
      await queryClient.cancelQueries({queryKey: ['tickets']});
      const previousTicket: any = queryClient.getQueryData(ticketKey);
      const previousTickets: any = queryClient.getQueryData(['tickets']);

      // remove local state so that server state is taken instead
      // setComment(undefined);

      const updatedTicket = {
        ...previousTicket,
        car: values,
        inspection: {
          ...previousTicket?.ticket?.inspection,
          inspector: values.inspectorName,
        },
      };

      const updatedTickets = previousTickets.map((item: any) => {
        if (item.id === ticketId) {
          console.log({
            prev: item?.inspection?.inspector,
            new: updatedTicket?.inspection?.inspector,
          });
          return updatedTicket;
        }
        return item;
      });

      queryClient.setQueryData(ticketKey, updatedTicket);
      queryClient.setQueryData(['tickets'], updatedTickets);

      return {previousTicket, previousTickets};
    },
    onError: (_, __, context: any) => {
      queryClient.setQueryData(ticketKey, context.previousTicket);
      queryClient.setQueryData(['tickets'], context.previousTickets);
    },
    onSuccess: () => {
      console.log('success');
      Alert.alert('Success', 'Ticket updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ticketKey});
      queryClient.invalidateQueries({queryKey: ['tickets']});
      !onlineManager.isOnline() &&
        Alert.alert('Pending', 'Ticket update is waiting connection');
    },
  });

  if (ticketQ.isLoading) {
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
        <Controller
          name={key}
          render={({field: {onChange, value}}) => {
            return (
              <TextInput
                onChangeText={onChange}
                value={value}
                style={[t.bgGray700, t.mB2, t.rounded]}
              />
            );
          }}
        />
      </>
    );
  };

  const onSubmit = () => {
    const {inspectorName, ...car} = values;

    mutate({
      id: ticketId,
      car,
      inspection: {inspector: inspectorName},
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

        <FormProvider {...form}>
          <View style={[t.bgGray900, t.p1]}>
            <Text style={[t.mB2]}>Inspection Form:</Text>
            {textInput({key: 'inspectorName', label: 'Inspector Name'})}
            {textInput({key: 'licensePlate', label: 'License Plate'})}
            {textInput({key: 'brand', label: 'Brand'})}
            {textInput({key: 'model', label: 'Model'})}
            <Text>
              {submitM.isLoading
                ? 'Loading...'
                : submitM.isPaused
                ? 'paused'
                : '...'}
            </Text>
            <Button title="Submit" onPress={form.handleSubmit(onSubmit)} />
          </View>
        </FormProvider>
      </View>
    </ScrollView>
  );
};

export default TicketDetailScreen;
