import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';

const CLIENT_ID_KEY = 'clientId';

let singletonPromise: Promise<string> | null = null;

export async function getClientId(): Promise<string> {
  if (singletonPromise === null) {
    singletonPromise = loadOrCreateClientId();
  }
  return singletonPromise;
}

async function loadOrCreateClientId(): Promise<string> {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(CLIENT_ID_KEY, (getError, clientId) => {
      if (getError) {
        reject(getError);
      }
      if (clientId !== null && clientId !== undefined) {
        resolve(clientId);
      }
      if (clientId === null) {
        const newClientId = uuidv4();
        AsyncStorage.setItem(CLIENT_ID_KEY, newClientId, setError => {
          if (setError) {
            reject(setError);
          }
          resolve(newClientId);
        });
      } else {
        reject('Read clientId that is undefined!!');
      }
    });
  });
}
