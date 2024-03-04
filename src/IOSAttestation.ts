import * as AppAttest from 'react-native-ios-appattest';
import {Sha256} from '@aws-crypto/sha256-js';
import {v4 as uuidv4} from 'uuid';

// import {getClientId} from './ClientId';

export async function attestationSupported(): Promise<boolean> {
  return await AppAttest.attestationSupported();
}

export async function prepareAndAttestKeys(): Promise<string | null> {
  try {
    const keyId = await AppAttest.generateKeys();
    // const clientId = await getClientId();
    // TODO: fetch challenge from server using clientId.
    const challenge = uuidv4();
    const hash = new Sha256();
    hash.update(challenge);
    const challengeHash = await hash.digest();
    const challengeHashBase64 = Buffer.from(challengeHash).toString('base64');
    const attestationBase64 = await AppAttest.attestKeys(
      keyId,
      challengeHashBase64,
    );

    // TODO: send to server to verify / store the key.
    console.log(`Attestation length: ${attestationBase64.length}`);

    return keyId;
  } catch (error) {
    return null;
  }
}

// TODO: return boolean if request accepted by server.
export async function makeAttestedRequest(keyId: string): Promise<void> {
  console.log(`keyId: ${keyId}`);
  // TODO: actually make request!
}
