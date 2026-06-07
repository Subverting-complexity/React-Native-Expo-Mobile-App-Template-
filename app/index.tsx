import { StyleSheet, Text, View } from 'react-native';
import { lightTheme } from '@/theme';

export default function HomeScreen() {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: lightTheme.colors.background },
      ]}
    >
      <Text style={{ color: lightTheme.colors.textPrimary }}>
        Expo Template
      </Text>
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
