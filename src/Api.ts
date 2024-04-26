import {v4 as uuidv4} from 'uuid';

import {getClientId} from './ClientId';

// TODO: Better solution.
// Replace with host:port where hello-attestation-server-node is running.
const HELLO_ATTESTATION_SERVER = '<host>:<port>';

export async function fetchAttestationNonce(
  forRequestId: string,
): Promise<string | null> {
  const result = await makePostRequest('newAttestationNonce', {
    forRequestId,
  });
  if (!result) {
    return null;
  }
  return 'nonce' in result ? result.nonce : null;
}

export async function registerAppAttestKey(
  attestRequestId: string,
  keyId: string,
  attestationBase64: string,
): Promise<boolean> {
  const result = await makePostRequest(
    'registerAppAttestKey',
    {keyId, attestationBase64},
    attestRequestId,
  );
  return result != null;
}

export async function makePostRequest(
  path: string,
  body: any,
  requestId?: string,
  clientAttestationBase64?: string,
): Promise<any | null> {
  try {
    console.log(`Invoking API: ${path}`);
    const response = await fetch(`http://${HELLO_ATTESTATION_SERVER}/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-client-id': await getClientId(),
        'x-request-id': requestId ?? uuidv4(),
        ...(clientAttestationBase64
          ? {'x-client-attestation': clientAttestationBase64}
          : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error(`Response was not successful: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Unexpected error during request!', error);
    return null;
  }
}
