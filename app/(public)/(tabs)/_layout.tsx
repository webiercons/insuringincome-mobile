import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function PublicTabsLayout() {
  const p = usePublicPalette();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: p.accent,
      tabBarInactiveTintColor: p.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      tabBarStyle: {
        backgroundColor: p.surface,
        borderTopColor: p.border,
        paddingTop: 4,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
          },
          default: {},
        }),
      },
      tabBarButton: HapticTab,
    }),
    [p],
  );

  return (
    <Tabs screenOptions={screenOptions}>
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
          title: 'Resources',
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
