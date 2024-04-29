# RNHelloAttestationClient

This is an example app that uses Client Attestation (iOS for now). It uses iOS
App Attest API's to certify its integrity with the backend it uses ([reference](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity)).
The example backend to use with this project is in [`hello-attestat-server-node`](https://github.com/srinivas1729/hello-attestation-server-node).
The backend will validate that requests are coming from valid versions of this
app running on real iOS devices and that the requests have not been tampered
with.

This app is developed using [React Native](https://reactnative.dev) and
bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).
This app uses the [`react-native-ios-appattest`](https://github.com/srinivas1729/react-native-ios-appattest)
library that wraps the App Attest API's and offers a Javascript/Typescript API.

**_NOTE_** that it must be run on a real iOS device. App Attest API's are not
available on the iOS simulator.

## Build & run the app on a device

Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

1. Clone the repo.
1. Setup dependencies: `npm install`. Also install pods e.g. `cd ios && pod install && cd..`.
1. Start Metro server (e.g. `npm start`).
1. Follow these [instructions](https://reactnative.dev/docs/running-on-device) to build the app and run on a device. Since the project does use CoacoaPods, ensure you
open the `.xcworkspace` file in XCode.
1. Once you have done a build/run in XCode, successive runs can be done on the command
   line: `npm run ios`.

## Running the app against Example backend

Follow the instructions at [`hello-attestat-server-node`](https://github.com/srinivas1729/hello-attestation-server-node) (under `RNHelloAttestationClient`)
to get the server running for your app.

Obtain the host-ip and port that the server is running on. Update
`HELLO_ATTESTATION_SERVER` in `Api.ts` with the host-ip and port. This is
required so the app can access the server.

Run the app. In the UI, go through the steps:

1. Prepare keys: The app will generate attestation keys on the device, get them
   attested by Apple and call the backend server to register them. I the
   backend is able to verify the attestation, it will persist the client's
   public key. The client will save the keyId.
1. Make Attested request: The client will invoke the high-value API on the
   server. It will get the request attested on the device i.e. sign it with the
   private key. The signature (attestation) will be included as HTTP header on
   the request. The server will check the attestation using the public key for
   the client.