import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import React from 'react';
import {t} from 'react-native-tailwindcss';
import {useQuery} from 'react-query';

type Props = {};

type TicketStatus = 'pending' | 'done' | 'cancel';

interface Seller {
  name: string;
  phoneNumber: string;
  address: string;
}

interface Car {
  brand: string;
  model: string;
  type: string;
  year: number;
  transmission: string;
  licensePlate: string;
}

interface Inspection {
  schedule: Date;
}

interface Ticket {
  id: string;
  seller: Seller;
  gmapLink?: string;
  car: Car;
  inspection: Inspection;
  ticketStatus: TicketStatus;
}

const TicketList = (props: Props) => {
  const {isLoading, data, error, isIdle} = useQuery<Ticket[]>({
    queryFn: () => {
      return fetch('http://localhost:3000/api/tickets')
        .then(res => res.json())
        .then(data => data)
        .catch(err => err);
    },
    queryKey: ['tickets'],
  });

  const tickets = data || [];

  const renderTickets: ListRenderItem<Ticket> = ({item}) => {
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
      <TouchableOpacity key={item.id} style={[t.bgBlack, t.mB4, t.roundedLg]}>
        <View style={[t.bgGray900, t.p2, t.roundedLg]}>
          <View style={[t.flexRow, t.justifyBetween]}>
            <Text style={[]}>{item.id}</Text>
            <View style={[t.bgWhite, t.p1, t.roundedSm]}>
              <Text style={[t.textBlack]}>{item.ticketStatus}</Text>
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

  return (
    <FlatList
      data={tickets}
      renderItem={renderTickets}
      contentContainerStyle={[t.pY4, t.pX2]}
    />
  );
};

export default TicketList;
