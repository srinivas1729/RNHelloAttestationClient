import {Buffer} from 'react-native-buffer';
import * as AppAttest from 'react-native-ios-appattest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Sha256} from '@aws-crypto/sha256-js';
// Must be imported before uuid.
import 'react-native-get-random-values';
import stringify from 'json-stable-stringify';
import {v4 as uuidv4} from 'uuid';
import {
  fetchAttestationNonce,
  makePostRequest,
  registerAppAttestKey,
} from './Api';

const KEY_ID_KEY = 'publicKeyId';
// Enable to see more detailed logging.
const DEBUG = true;

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
      console.log(`newKeyId: ${newKeyId}`);
      const attestRequestId = uuidv4();
      const serverNonce = await fetchAttestationNonce(attestRequestId);
      if (!serverNonce) {
        return false;
      }
      const challengeHash = await this.getSHA256(this.parseUUIDV4(serverNonce));
      const challengeHashBase64 = Buffer.from(challengeHash).toString('base64');

      console.log('About to attest key');
      const attestationBase64 = await AppAttest.attestKeys(
        newKeyId,
        challengeHashBase64,
      );

      if (DEBUG) {
        console.log(`serverNonce: ${serverNonce}`);
        console.log(`attestionBase64: ${attestationBase64}`);
      }
      const success = await registerAppAttestKey(
        attestRequestId,
        newKeyId,
        attestationBase64,
      );
      if (!success) {
        return false;
      }

      await AsyncStorage.setItem(KEY_ID_KEY, newKeyId);
      console.log('Stored keyId!');
      this.keyId = newKeyId;
      return true;
    } catch (error) {
      console.error('Unexpected error during key prep/register', error);
      return false;
    }
  }

  async makeAttestedRequest(path: string, body: any): Promise<boolean> {
    this.ensureInitialized();
    if (this.keyId === null) {
      throw new Error(
        'No key available! Must prepare and register a key first!',
      );
    }

    const attestRequestId = uuidv4();
    const serverNonce = await fetchAttestationNonce(attestRequestId);
    if (!serverNonce) {
      return false;
    }
    // Include server nonce in request body to make it unique.
    body.attestationNonce = serverNonce;
    const clientDataHash = await this.getSHA256(stringify(body));
    const clientDataHashBase64 = Buffer.from(clientDataHash).toString('base64');
    const clientAttestationBase64 = await AppAttest.attestRequestData(
      clientDataHashBase64,
      this.keyId,
    );
    if (DEBUG) {
      console.log(`body to attest: ${stringify(body)}`);
      console.log(`clientDataHashBase64: ${clientDataHashBase64}`);
      console.log(`clientAttestationBase64: ${clientAttestationBase64}`);
    }
    const resBody = await makePostRequest(
      path,
      body,
      attestRequestId,
      clientAttestationBase64,
    );
    if (!resBody) {
      return false;
    }
    return true;
  }

  async getSHA256(data: string | Buffer): Promise<Uint8Array> {
    const hash = new Sha256();
    hash.update(data);
    return await hash.digest();
  }

  parseUUIDV4(uuid: string): Buffer {
    return Buffer.from(uuid.split('-').join(''), 'hex');
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
