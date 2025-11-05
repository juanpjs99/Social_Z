import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';

// Importa las pantallas de tu clon de Twitter
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import FollowersScreen from './src/screens/FollowersScreen';
import FollowingScreen from './src/screens/FollowingScreen';
import TweetFormScreen from './src/screens/TweetFormScreen';
import FeedScreen from './src/screens/FeedScreen';
import TweetListScreen from './src/screens/TweetListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#1c1c1c' },
            headerTintColor: '#a855f7',
            contentStyle: { backgroundColor: '#0d0d0d' },
          }}
        >
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
          <Stack.Screen name="TweetForm" component={TweetFormScreen} options={{ title: 'Publicar Tweet' }} />
          <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
          <Stack.Screen name="TweetList" component={TweetListScreen} options={{ title: 'Tweets' }} />
          <Stack.Screen name="Followers" component={FollowersScreen} options={{ title: 'Seguidores' }} />
          <Stack.Screen name="Following" component={FollowingScreen} options={{ title: 'Siguiendo' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
