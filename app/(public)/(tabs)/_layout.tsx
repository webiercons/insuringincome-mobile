import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PublicColors } from '@/constants/public-theme';

export default function PublicTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PublicColors.accent,
        tabBarInactiveTintColor: PublicColors.textMuted,
        tabBarStyle: {
          backgroundColor: PublicColors.surface,
          borderTopColor: PublicColors.border,
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quote-request"
        options={{
          title: 'Quote',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
