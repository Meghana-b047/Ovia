

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}





///TESTING 
/*
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const testConnection = async () => {
    try {
      const res = await fetch('http://localhost:8000/health'); // ← replace with your IP
      const data = await res.json();
      Alert.alert('✅ Connected!', JSON.stringify(data));
    } catch (err) {
      Alert.alert('❌ Not Connected', err.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
      <TouchableOpacity
        onPress={testConnection}
        style={{
          position: 'absolute', bottom: 40, alignSelf: 'center',
          backgroundColor: '#FB6F92', padding: 12, borderRadius: 20,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Test Connection</Text>
      </TouchableOpacity>
    </View>
  );
}

*/