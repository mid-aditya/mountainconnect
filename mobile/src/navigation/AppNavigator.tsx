import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAppSelector, useAppDispatch } from '../shared/store';
import { selectIsAuthenticated } from '../shared/store/slices/authSlice';
import { startNetworkMonitoring } from '../shared/store/slices/offlineSlice';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../config/theme';
import { featureFlags } from '../config/env';

// Shared Components
import SOSButton from '../shared/components/SOSButton';
import OfflineIndicator from '../shared/components/OfflineIndicator';

// Auth Screens
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import VerifyIdentityScreen from '../features/auth/VerifyIdentityScreen';

// Dashboard
import DashboardScreen from '../features/dashboard/DashboardScreen';

// Maps
import MapsScreen from '../features/maps/MapsScreen';
import MountainDetailScreen from '../features/maps/MountainDetailScreen';
import OfflineMapManagerScreen from '../features/maps/OfflineMapManager';
import GPSTrackerScreen from '../features/maps/GPSTrackerScreen';

// Community
import ForumScreen from '../features/community/ForumScreen';
import ThreadDetailScreen from '../features/community/ThreadDetailScreen';
import FindTeamScreen from '../features/community/FindTeamScreen';

// Marketplace
import MarketplaceScreen from '../features/marketplace/MarketplaceScreen';
import GearDetailScreen from '../features/marketplace/GearDetailScreen';
import CreateListingScreen from '../features/marketplace/CreateListingScreen';

// Profile
import ProfileScreen from '../features/auth/ProfileScreen';

// Emergency
import EmergencyScreen from '../features/emergency/EmergencyScreen';
import CheckInOutScreen from '../features/emergency/CheckInOutScreen';

// Types
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Auth Stack Navigator ──────────────────────────────────────────────────────
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Colors.background },
        animationEnabled: true,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="VerifyEmail"
        component={() => <View><Text>Verify Email</Text></View>}
        options={{ title: 'Verifikasi Email' }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={() => <View><Text>Forgot Password</Text></View>}
        options={{ title: 'Lupa Password' }}
      />
    </AuthStack.Navigator>
  );
};

// ── Tab Icons ─────────────────────────────────────────────────────────────────
const getTabIcon = (routeName: string, focused: boolean): string => {
  const icons: Record<string, [string, string]> = {
    Home: ['home', 'home-outline'],
    Maps: ['map', 'map-outline'],
    Community: ['people', 'people-outline'],
    Marketplace: ['cart', 'cart-outline'],
    Profile: ['person', 'person-outline'],
  };
  return icons[routeName]?.[focused ? 0 : 1] ?? 'help-circle';
};

// ── Main Tab Navigator ────────────────────────────────────────────────────────
const TabNavigator: React.FC = () => {
  const isSOSActive = useAppSelector((s) => s.emergency.currentSOS !== null);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <Icon
            name={getTabIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Spacing.sm,
          height: Spacing.tabBarHeight,
          ...Shadows.sm,
        },
        tabBarLabelStyle: {
          ...Typography.caption,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          ...Typography.subtitle1,
          color: Colors.text,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ title: 'Beranda' }}
      />
      <Tab.Screen
        name="Maps"
        component={MapsScreen}
        options={{ title: 'Peta' }}
      />
      {featureFlags.enableForum && (
        <Tab.Screen
          name="Community"
          component={CommunityNavigator}
          options={{ title: 'Komunitas', headerShown: false }}
        />
      )}
      {featureFlags.enableMarketplace && (
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceNavigator}
          options={{ title: 'Jual Beli', headerShown: false }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

// ── Community Nested Stack ────────────────────────────────────────────────────
const CommunityStack = createStackNavigator();
const CommunityNavigator: React.FC = () => (
  <CommunityStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.surface,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: { color: Colors.text, fontWeight: '700' },
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <CommunityStack.Screen name="Forum" component={ForumScreen} options={{ title: 'Forum' }} />
    <CommunityStack.Screen name="ThreadDetail" component={ThreadDetailScreen} options={{ title: 'Thread' }} />
    <CommunityStack.Screen name="FindTeam" component={FindTeamScreen} options={{ title: 'Cari Tim' }} />
  </CommunityStack.Navigator>
);

// ── Marketplace Nested Stack ──────────────────────────────────────────────────
const MarketplaceStack = createStackNavigator();
const MarketplaceNavigator: React.FC = () => (
  <MarketplaceStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.surface,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: { color: Colors.text, fontWeight: '700' },
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <MarketplaceStack.Screen name="MarketplaceMain" component={MarketplaceScreen} options={{ title: 'Jual Beli' }} />
    <MarketplaceStack.Screen name="GearDetail" component={GearDetailScreen} options={{ title: 'Detail Gear' }} />
    <MarketplaceStack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: 'Jual Gear' }} />
  </MarketplaceStack.Navigator>
);

// ── Root Navigator ────────────────────────────────────────────────────────────
const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isRehydrating = useAppSelector((s) => s.auth.isRehydrating);

  useEffect(() => {
    dispatch(startNetworkMonitoring());
  }, [dispatch]);

  if (isRehydrating) {
    return null; // Let App.tsx handle loading screen
  }

  return (
    <NavigationContainer>
      <OfflineIndicator />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="SOS"
              component={EmergencyScreen}
              options={{
                presentation: 'modal',
                cardStyle: { backgroundColor: Colors.dangerFaded },
              }}
            />
            <Stack.Screen
              name="Emergency"
              component={EmergencyScreen}
              options={{ title: 'Darurat' }}
            />
            <Stack.Screen
              name="MountainDetail"
              component={MountainDetailScreen}
              options={{ title: 'Detail Gunung' }}
            />
            <Stack.Screen
              name="OfflineMapManager"
              component={OfflineMapManagerScreen}
              options={{ title: 'Peta Offline' }}
            />
            <Stack.Screen
              name="GPSTracker"
              component={GPSTrackerScreen}
              options={{ title: 'GPS Tracker' }}
            />
            <Stack.Screen
              name="TripDetail"
              component={() => <View />}
              options={{ title: 'Detail Trip' }}
            />
            <Stack.Screen
              name="Chat"
              component={() => <View />}
              options={{ title: 'Chat' }}
            />
            <Stack.Screen
              name="ThreadDetail"
              component={ThreadDetailScreen}
              options={{ title: 'Thread' }}
            />
            <Stack.Screen
              name="GearDetail"
              component={GearDetailScreen}
              options={{ title: 'Detail Gear' }}
            />
            <Stack.Screen
              name="CreateListing"
              component={CreateListingScreen}
              options={{ title: 'Jual Gear' }}
            />
            <Stack.Screen
              name="CheckInOut"
              component={CheckInOutScreen}
              options={{ title: 'Check-in/Out' }}
            />
            <Stack.Screen
              name="VerifyIdentity"
              component={VerifyIdentityScreen}
              options={{ title: 'Verifikasi Identitas' }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* SOS Button - Accessible from ANY screen */}
      {isAuthenticated && <SOSButton />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default AppNavigator;
