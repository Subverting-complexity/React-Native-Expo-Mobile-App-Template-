import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={{ color: theme.colors.textPrimary }}>Expo Template</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
