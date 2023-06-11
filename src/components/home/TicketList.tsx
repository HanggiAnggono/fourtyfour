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
  const tickets: Ticket[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => ({
    id: `TICKET-${n}`,
    seller: {
      address:
        'rddesbanana Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae, earum laboriosam architecto nostrum officiis eos placeat mollitia porro aliquam corporis exercitationem hic dolorem sit voluptas. Assumenda at quis ipsa offic',
      name: 'banana 4BB06316-00AC-4182-887A-0474FAE5CF5C',
      phoneNumber: '087882681944',
    },
    car: {
      brand: 'Toyoda',
      model: 'Axios',
      type: 'gasoline',
      year: 2023,
      transmission: 'AT',
      licensePlate: 'F 3212 HY',
    },
    inspection: {
      schedule: new Date(),
    },
    ticketStatus: 'pending',
    gmapLink: 'https://www.google.com/maps?q=40.7128,-74.0060',
  }));

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
