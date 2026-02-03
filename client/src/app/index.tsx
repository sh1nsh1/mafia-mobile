import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <AppText center>Работаем!</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
