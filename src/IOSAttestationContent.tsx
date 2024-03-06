import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import IOSAttestManager from './IOSAttestManager';

function IOSAttestationContent(): React.JSX.Element {
  const [attestSupported, setAttestSupported] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    IOSAttestManager.initialize().then(() => {
      setAttestSupported(IOSAttestManager.attestationSupported());
    });
  }, []);

  console.log(`attestSupported: ${attestSupported}`);
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

function getInactiveControlsState(): ControlsState {
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
  const [controlsState, updateControlsState] = useState(() => {
    return IOSAttestManager.isKeyRegistered()
      ? {
          ...getInactiveControlsState(),
          makeAttestedRequestDisabled: false,
          deleteKeysDisabled: false,
        }
      : {
          ...getInactiveControlsState(),
          prepareKeysDisabled: false,
        };
  });

  const prepareKeysHandler = () => {
    updateControlsState({
      ...getInactiveControlsState(),
      prepareKeysRunning: true,
    });
    // TODO: handle fail case
    IOSAttestManager.prepareAndRegisterKey().then(() => {
      updateControlsState({
        ...getInactiveControlsState(),
        makeAttestedRequestDisabled: false,
        deleteKeysDisabled: false,
      });
    });
  };
  const makeAttestedRequestHandler = () => {
    updateControlsState({
      ...getInactiveControlsState(),
      makeAttestedRequestRunning: true,
    });
    // TODO: handle fail case
    IOSAttestManager.makeAttestedRequest().then(() => {
      updateControlsState({
        ...getInactiveControlsState(),
        makeAttestedRequestDisabled: false,
        deleteKeysDisabled: false,
      });
    });
  };
  const deleteHandler = () => {
    updateControlsState({
      ...getInactiveControlsState(),
      deleteKeysRunning: true,
    });
    // TODO: handle fail case
    IOSAttestManager.deleteKey().then(() => {
      updateControlsState({
        ...getInactiveControlsState(),
        prepareKeysDisabled: false,
      });
    });
  };

  console.log(`controlsState: ${JSON.stringify(controlsState)}`);
  return (
    <React.Fragment>
      <AttestationOperation
        name="Prepare keys"
        pressHandler={prepareKeysHandler}
        disabled={controlsState.prepareKeysDisabled}
        running={controlsState.prepareKeysRunning}
      />
      <AttestationOperation
        name="Make Attested Request"
        pressHandler={makeAttestedRequestHandler}
        disabled={controlsState.makeAttestedRequestDisabled}
        running={controlsState.makeAttestedRequestRunning}
      />
      <AttestationOperation
        name="Delete keys"
        pressHandler={deleteHandler}
        disabled={controlsState.deleteKeysDisabled}
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
