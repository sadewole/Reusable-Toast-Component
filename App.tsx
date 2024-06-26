import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ToastView from './components/ToastComponent';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider, toast } from 'react-native-toastee';

export default function App() {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  const handleToastee = () => {
    toast('Message from toastee');
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style='auto' />
        <ToastView
          position={'top'}
          message='Toast sample code developed by samador'
          onDismiss={toggleVisible}
          autoDismiss={3000}
          preset='success'
          zIndex={1500}
          visible={visible}
        />

        <View style={styles.container}>
          <Text>Open up App.tsx to start working on your app!</Text>
          <Button title='click me' onPress={toggleVisible} />
          <Button title='click me toastee' onPress={handleToastee} />
        </View>

        <ToastProvider />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
