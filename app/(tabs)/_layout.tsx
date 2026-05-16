import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameState } from '../../hooks/useGameState';

interface TabIconProps {
  emoji: string;
  focused: boolean;
}

function TabIcon({ emoji, focused }: TabIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.emoji, { opacity: focused ? 1 : 0.6 }]}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { getUnlockedPlayers } = useGameState();
  const unlockedCount = getUnlockedPlayers().length;
  const isManagementUnlocked = unlockedCount >= 21;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: Math.max(6, insets.bottom),
          },
        ],
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'בית',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'ניהול קבוצה',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
          href: isManagementUnlocked ? ('/(tabs)/management' as never) : null,
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: 'הסגל שלי',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'שחקנים',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚽" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D1220',
    borderTopWidth: 1,
    borderTopColor: '#252D3D',
    paddingTop: 4,
    paddingBottom: 6,
    height: 66,
  },
  tabLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 28,
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
  },
  emoji: {
    fontSize: 20,
  },
});
