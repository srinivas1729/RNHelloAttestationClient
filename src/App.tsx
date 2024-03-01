import React from 'react';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';

import IOSAttestationContent from './IOSAttestationContent';

function App(): React.JSX.Element {
  return (
    <View style={styles.app}>
      <StatusBar hidden={true} />
      <Text style={styles.title}>Hello Attestation Client</Text>
      <Content />
    </View>
  );
}

function Content(): React.JSX.Element {
  if (Platform.OS === 'ios') {
    return <IOSAttestationContent />;
  } else {
    return <UnsupportedPlatfomAttestationContent />;
  }
}

function UnsupportedPlatfomAttestationContent(): React.JSX.Element {
  return (
    <View style={styles.unsupportedContainer}>
      <Text style={styles.text}>Not implemented for {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    alignItems: 'stretch',
    flex: 1,
    backgroundColor: 'grey',
  },
  title: {
    backgroundColor: '#4287f5',
    color: 'white',
    fontSize: 24,
  },
  unsupportedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
  },
  text: {
    fontSize: 32,
    fontWeight: '500',
  },
});

export default App;
