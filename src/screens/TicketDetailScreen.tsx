import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Button,
  Alert,
  ToastAndroid,
} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/RootNavigation';
import {
  onlineManager,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {t} from 'react-native-tailwindcss';
import {Ticket} from '../dto/ticket';
import {CONFIG} from '../constants';
import {queryClient} from '../query-client/queryClient';
import {keys} from '../query-client/queryKey';
import {Controller, FormProvider, useForm} from 'react-hook-form';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

type TicketForm = {
  inspectorName: string;
  brand: string;
  licensePlate: string;
  model: string;
  transmission: string;
  type: string;
  year: number;
};

const TicketDetailScreen = (props: Props) => {
  const {ticketId} = props.route.params || {};

  const {data, ...ticketQ} = useQuery<Ticket>({
    queryKey: keys.ticketDetail(ticketId),
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

  const form = useForm<TicketForm>();
  const {reset} = form;

  // mutation
  const {mutate, ...submitM} = useMutation({
    mutationKey: keys.updateTicket(ticketId),
    onMutate: async ({
      inspectorName,
      ...ticketForm
    }: TicketForm & {id: string}) => {
      await queryClient.cancelQueries({queryKey: keys.ticketDetail(ticketId)});
      const previousTicket = queryClient.getQueryData(
        keys.ticketDetail(ticketId),
      ) as Ticket;

      // remove local state so that server state is taken instead
      // setComment(undefined);

      const optimistTicket: Ticket = {
        ...previousTicket,
        car: ticketForm,
        inspection: {
          ...previousTicket?.inspection,
          inspector: inspectorName,
        },
      };

      queryClient.setQueryData(keys.ticketDetail(ticketId), optimistTicket);
      return {previousTicket};
    },
    onError: (_, __, context: any) => {
      // will run if network request failed even if offline mode
      // and resetting the query cache to previous values
      queryClient.setQueryData(
        keys.ticketDetail(ticketId),
        context.previousTicket,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: keys.ticketDetail(ticketId)});
      // !onlineManager.isOnline() &&
      //   ToastAndroid.show(
      //     'Ticket update is waiting connection',
      //     ToastAndroid.SHORT,
      //   );
    },
  });

  if (ticketQ.isLoading) {
    return (
      <View style={[t.bgGray700, t.flex1, t.contentCenter, t.justifyCenter]}>
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
                autoFocus={key === 'inspectorName'}
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
  const onSubmit = ({inspectorName, ...formValues}: TicketForm) => {
    const body: Partial<Ticket> = {
      id: ticketId,
      ...ticket,
      car: formValues,
      inspection: {
        ...ticket.inspection,
        inspector: inspectorName,
      },
    };
    mutate(body);
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
