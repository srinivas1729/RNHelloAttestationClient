import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

interface UIState {
  prepareKeysDisabled: boolean;
  attestKeysDisabled: boolean;
  deleteKeysDisabled: boolean;
  logLines: string[];
}

function getInitialUIState(): UIState {
  return {
    prepareKeysDisabled: true,
    attestKeysDisabled: true,
    deleteKeysDisabled: true,
    logLines: ['line 1', 'line 2'],
  };
}

function IOSAttestationContent(): React.JSX.Element {
  const [uiState, updateUIState] = useState(getInitialUIState);

  const lines = `line 1
line 2`;
  return (
    <View style={styles.contentContainer}>
      <IOSAttestationControls
        prepareKeysDisabled={uiState.prepareKeysDisabled}
        attestKeysDisabled={uiState.attestKeysDisabled}
        deleteKeysDisabled={uiState.deleteKeysDisabled}
      />
      <TextInput
        style={styles.logsBox}
        editable={false}
        multiline={true}
        value={lines}
      />
    </View>
  );
}

interface ControlProps {
  prepareKeysDisabled: boolean;
  attestKeysDisabled: boolean;
  deleteKeysDisabled: boolean;
}

function IOSAttestationControls(props: ControlProps): React.JSX.Element {
  const handlePress = () => console.log('pressed!');
  const getStyle = (disabled: boolean) =>
    disabled ? [styles.pressable, styles.pressableDisabled] : styles.pressable;
  return (
    <View style={styles.iosControlsContainer}>
      <Pressable
        style={getStyle(props.prepareKeysDisabled)}
        onPress={handlePress}
        disabled={props.prepareKeysDisabled}>
        <Text style={styles.pressableText}>Prepare keys</Text>
      </Pressable>
      <Pressable
        style={getStyle(props.attestKeysDisabled)}
        onPress={handlePress}
        disabled={props.attestKeysDisabled}>
        <Text style={styles.pressableText}>Make Attested request</Text>
      </Pressable>
      <Pressable
        style={getStyle(props.deleteKeysDisabled)}
        onPress={handlePress}
        disabled={props.deleteKeysDisabled}>
        <Text style={styles.pressableText}>Delete keys</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: '#4287f5',
    marginLeft: 50,
    marginRight: 50,
    alignItems: 'center',
  },
  pressableDisabled: {
    backgroundColor: 'grey',
  },
  pressableText: {
    color: 'white',
    padding: 10,
    fontSize: 24,
  },
  logsBox: {
    borderWidth: 3,
    padding: 5,
    flex: 2,
    margin: 8,
    fontSize: 20,
  },
  iosControlsContainer: {
    justifyContent: 'space-evenly',
    flex: 1,
  },
  contentContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
});

export default IOSAttestationContent;
