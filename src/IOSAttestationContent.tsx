import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface ControlsState {
  prepareKeysDisabled: boolean;
  prepareKeysRunning: boolean;
  makeAttestedRequestDisabled: boolean;
  makeAttestedRequestRunning: boolean;
  deleteKeysDisabled: boolean;
  deleteKeysRunning: boolean;
}

function getInitialControlsState(): ControlsState {
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
  const [keyId, setKeyId] = useState<string | null>(null);
  const [controlsState, updateControlsState] = useState(
    getInitialControlsState,
  );

  useEffect(() => {
    readKeyId().then((keyIdValue: string | null) => {
      const nextControlsState =
        keyIdValue === null
          ? {
              ...getInitialControlsState(),
              prepareKeysDisabled: false,
            }
          : {
              ...getInitialControlsState(),
              makeAttestedRequestDisabled: false,
              deleteKeysDisabled: false,
            };
      setKeyId(keyIdValue);
      updateControlsState(nextControlsState);
    });
  }, []);

  // handlePrepareKeys: kick off operation, set UI State. onComplete, set UI State
  // handleMakeAttestedRequest:

  const logHandler = (): void => console.log('clicked!');
  const deleteHandler = () => {
    updateControlsState({
      ...getInitialControlsState(),
      deleteKeysRunning: true,
    });
    removeKeyId().then(() => {
      setKeyId(null);
      updateControlsState({
        ...getInitialControlsState(),
        prepareKeysDisabled: false,
      });
    });
  };

  return (
    <React.Fragment>
      <AttestationOperation
        name="Prepare keys"
        pressHandler={logHandler}
        disabled={controlsState.prepareKeysDisabled}
        running={controlsState.prepareKeysRunning}
      />
      <AttestationOperation
        name="Make Attested Request"
        pressHandler={logHandler}
        disabled={controlsState.prepareKeysDisabled}
        running={controlsState.makeAttestedRequestRunning}
      />
      <AttestationOperation
        name="Delete keys"
        pressHandler={deleteHandler}
        disabled={controlsState.prepareKeysDisabled}
        running={controlsState.deleteKeysRunning}
      />
    </React.Fragment>
  );
}

interface OperationProps {
  name: string;
  disabled: boolean;
  running: boolean;
  pressHandler: () => void;
}

function AttestationOperation(props: OperationProps): React.JSX.Element {
  const getStyle = (disabled: boolean) =>
    disabled
      ? [styles.operationPressable, styles.operationPressableDisabled]
      : styles.operationPressable;
  return (
    <View>
      <Pressable
        style={getStyle(props.disabled)}
        onPress={props.pressHandler}
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

const STORAGE_KEY = 'publicKeyId';

async function readKeyId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch (error) {
    // TODO: toast?
    console.error('Error reading key from storage', error);
    return null;
  }
}

async function writeKeyId(keyIdValue: string): Promise<void> {
  try {
    return await AsyncStorage.setItem(STORAGE_KEY, keyIdValue);
  } catch (error) {
    console.error('Error storing key to storage', error);
    // TODO: toast?
    return;
  }
}

async function removeKeyId(): Promise<void> {
  try {
    return await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error deleting key from storage', error);
    // TODO: toast?
    return;
  }
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
