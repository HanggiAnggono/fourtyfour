import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect} from 'react';
import {t} from 'react-native-tailwindcss';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {Ticket} from '../../dto/ticket';
import {CONFIG} from '../../constants';
import {keys} from '../../query-client/queryKey';

type Props = {};

const TicketList = (props: Props) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {isLoading, data, refetch, isRefetching} = useQuery<Ticket[]>({
    queryFn: () => {
      return fetch(`${CONFIG.API_BASE_URL}/api/tickets`)
        .then(res => res.json())
        .then(data => data);
    },
    queryKey: keys.tickets(),
  });

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: keys.ticketDetail('TICKET-1'),
      queryFn: () => {
        return fetch(`${CONFIG.API_BASE_URL}/api/tickets/TICKET-1`).then(res =>
          res.json(),
        );
      },
    });
  }, []);

  const tickets = data || [];

  const renderTickets: ListRenderItem<Ticket> = ({item}) => {
    const handlePressTicket = () => {
      navigation.navigate('TicketDetail', {ticketId: item.id});
    };

    const handlePressGoogleMapLink = () => {
      if (item.gmapLink) {
        const [lat, lng] = item.gmapLink.split('=')[1].split(',');
        const scheme = Platform.select({
          ios: 'maps://0,0?q=',
          android: 'geo:0,0?q=',
        });
        const latLng = `${lat},${lng}`;
        const label = 'Custom Label';
        const url = Platform.select({
          ios: `${scheme}${label}@${latLng}`,
          android: `${scheme}${latLng}(${label})`,
        });
        Linking.openURL(`${url}`);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        onPress={handlePressTicket}
        style={[t.bgBlack, t.mB4, t.roundedLg]}>
        <View style={[t.bgGray900, t.p2, t.roundedLg]}>
          <View style={[t.flexRow, t.justifyBetween]}>
            <Text style={[]}>{item.id}</Text>
            <View style={[t.flex, t.flexRow]}>
              <View style={[t.bgWhite, t.p1, t.roundedSm, t.mR2]}>
                <Text style={[t.textBlack]}>
                  Inspector: {item.inspection?.inspector}
                </Text>
              </View>
              <View style={[t.bgWhite, t.p1, t.roundedSm]}>
                <Text style={[t.textBlack]}>{item.ticketStatus}</Text>
              </View>
            </View>
          </View>
          <View style={[]}>
            <Text>User: {item.seller.name?.substring(0, 10)}...</Text>
            <View style={[t.flexRow, t.justifyBetween]}>
              <Text style={[t.textGray500]}>
                Car: {item.car.brand} {item.car.model} {item.car.transmission} (
                {item.car.year})
              </Text>
              <Text>{item.car.licensePlate}</Text>
            </View>
          </View>
          <View style={[t.mT3]}>
            <Text style={[t.textXs]}>
              Inspection: {item.inspection.schedule?.toString()}
            </Text>
          </View>
          <View style={[t.flexRow, t.justifyBetween]}>
            <Text>{item.seller.address?.substring(0, 20)}...</Text>
            <Text onPress={handlePressGoogleMapLink} style={[t.textBlue500]}>
              Map Link
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[t.flex, t.flex1]}>
        <ActivityIndicator size="large" style={[t.mTAuto, t.mBAuto]} />
      </View>
    );
  }

  return (
    <FlatList
      onRefresh={() => refetch()}
      refreshing={isRefetching}
      data={tickets}
      renderItem={renderTickets}
      contentContainerStyle={[t.pY4, t.pX2]}
    />
  );
};

export default TicketList;
