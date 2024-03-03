import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as AppAttest from 'react-native-ios-appattest';

function IOSAttestationContent(): React.JSX.Element {
  const [attestSupported, setAttestSupported] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const supportedPromise = AppAttest.attestationSupported();
    supportedPromise.then((supported: boolean) => {
      setAttestSupported(supported);
    });
  }, []);

  console.log(`Render eval: ${attestSupported}`);
  return (
    <View style={styles.contentContainer}>
      {attestSupported === undefined && (
        <ActivityIndicator animating={true} size="large" />
      )}
      {attestSupported === false && (
        <Text style={styles.terminalText}>
          Device does not support Attestation
        </Text>
      )}
      {attestSupported === true && <IOSAttestationControls />}
    </View>
  );
}

interface UIState {
  prepareKeysDisabled: boolean;
  prepareKeysRunning: boolean;
  makeAttestedRequestDisabled: boolean;
  makeAttestedRequestRunning: boolean;
  deleteKeysDisabled: boolean;
  deleteKeysRunning: boolean;
}

function getInitialUIState(): UIState {
  return {
    prepareKeysDisabled: true,
    prepareKeysRunning: false,
    makeAttestedRequestDisabled: true,
    makeAttestedRequestRunning: false,
    deleteKeysDisabled: true,
    deleteKeysRunning: false,
  };
}

function IOSAttestationControls(): React.JSX.Element {
  const [uiState, updateUIState] = useState(getInitialUIState);

  return (
    <React.Fragment>
      <AttestationOperation
        name="Prepare keys"
        disabled={uiState.prepareKeysDisabled}
        running={uiState.prepareKeysRunning}
      />
      <AttestationOperation
        name="Make Attested Request"
        disabled={uiState.prepareKeysDisabled}
        running={uiState.makeAttestedRequestRunning}
      />
      <AttestationOperation
        name="Delete keys"
        disabled={uiState.prepareKeysDisabled}
        running={uiState.deleteKeysRunning}
      />
    </React.Fragment>
  );
}

interface OperationProps {
  name: string;
  disabled: boolean;
  running: boolean;
}

function AttestationOperation(props: OperationProps) {
  const getStyle = (disabled: boolean) =>
    disabled
      ? [styles.operationPressable, styles.operationPressableDisabled]
      : styles.operationPressable;
  return (
    <View>
      <Pressable
        style={getStyle(props.disabled)}
        // onPress={handlePress}
        disabled={props.disabled}>
        <Text style={styles.operationPressableText}>{props.name}</Text>
      </Pressable>
      <ActivityIndicator
        style={styles.operationIndicator}
        size="large"
        animating={props.running}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  operationPressable: {
    backgroundColor: '#4287f5',
    marginLeft: 50,
    marginRight: 50,
    alignItems: 'center',
  },
  operationPressableDisabled: {
    backgroundColor: 'grey',
  },
  operationPressableText: {
    color: 'white',
    padding: 10,
    fontSize: 24,
  },
  operationIndicator: {
    marginTop: 20,
  },
  iosControlsContainer: {
    justifyContent: 'space-evenly',
    flex: 1,
  },
  terminalText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
    flex: 1,
  },
});

export default IOSAttestationContent;
