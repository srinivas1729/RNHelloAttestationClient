import * as AppAttest from 'react-native-ios-appattest';

export async function attestationSupported(): Promise<boolean> {
  return await AppAttest.attestationSupported();
}

export async function prepareAndAttestKeys(): Promise<string | null> {
  return null;
}

export async function makeAttestedRequest(keyId: string): Promise<void> {
  console.log(`keyId: ${keyId}`);
}
