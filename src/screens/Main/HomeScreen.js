import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Inicio</Text>
      <Button title="Tweet" onPress={() => navigation.navigate('Post')} />
      <View style={{ marginTop: 20 }}>
        <Text>Seguidores: 12</Text>
        <Text>Seguidos: 8</Text>
      </View>
    </View>
  );
}
