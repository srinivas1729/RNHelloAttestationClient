import * as AppAttest from 'react-native-ios-appattest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Sha256} from '@aws-crypto/sha256-js';
// Must be imported before uuid.
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const KEY_ID_KEY = 'publicKeyId';

class IOSAttestManager {
  private initialized: boolean = false;
  private supported: boolean = false;
  private keyId: string | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.supported = await AppAttest.attestationSupported();
    try {
      this.keyId = await AsyncStorage.getItem(KEY_ID_KEY);
    } catch (error) {
      console.error('Unexpected error during init', error);
      // Treat it like keyId is not available.
      this.keyId = null;
    }
    this.initialized = true;
  }

  attestationSupported(): boolean {
    this.ensureInitialized();
    return this.supported;
  }

  isKeyRegistered(): boolean {
    this.ensureInitialized();
    return this.keyId !== null;
  }

  async prepareAndRegisterKey(): Promise<boolean> {
    this.ensureInitialized();
    try {
      console.log('Generating keys');
      const newKeyId = await AppAttest.generateKeys();
      // const clientId = await getClientId();
      // TODO: fetch challenge from server using clientId.
      const challenge = uuidv4();
      const hash = new Sha256();
      hash.update(challenge);
      const challengeHash = await hash.digest();
      // FIXME: fails because Buffer is not available!
      const challengeHashBase64 = Buffer.from(challengeHash).toString('base64');

      console.log('About to attest key');
      const attestationBase64 = await AppAttest.attestKeys(
        newKeyId,
        challengeHashBase64,
      );

      // TODO: send to server to verify / store the key.
      console.log(`Attestation length: ${attestationBase64.length}`);
      await AsyncStorage.setItem(KEY_ID_KEY, newKeyId);

      console.log('Stored keyId!');
      this.keyId = newKeyId;
      return true;
    } catch (error) {
      console.error('Unexpected error during key prep/register', error);
      return false;
    }
  }

  async makeAttestedRequest(): Promise<boolean> {
    this.ensureInitialized();
    if (this.keyId === null) {
      throw new Error(
        'No key available! Must prepare and register a key first!',
      );
    }
    console.log(`keyId: ${this.keyId}`);
    // TODO: actually make request!
    return true;
  }

  async deleteKey(): Promise<boolean> {
    this.ensureInitialized();
    try {
      await AsyncStorage.removeItem(KEY_ID_KEY);
      this.keyId = null;
      return true;
    } catch (error) {
      console.error('Unexpected error during deleteKey', error);
      return false;
    }
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Must call initialize() before this API');
    }
  }
}

export default new IOSAttestManager();
