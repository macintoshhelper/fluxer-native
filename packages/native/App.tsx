// import { NewAppScreen } from '@react-native/new-app-screen';
import { Button, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

import './global.css';
import { Turnstile } from './src/components/Turnstile';
import { useEffect, useState } from 'react';
import { useActions, useToken } from './store/store';


const getPlatformHeaderValue = (): 'web' | 'desktop' | 'mobile' => 'mobile';
const withPlatformHeader = (headers?: Record<string, string>): Record<string, string> => ({
	'X-Fluxer-Platform': getPlatformHeaderValue(),
  'Origin': 'https://web.fluxer.app',
	...(headers ?? {}),
});

interface StandardLoginResponse {
	mfa: false;
	user_id: string;
	token: string;
	theme?: string;
}

interface MfaLoginResponse {
	mfa: true;
	ticket: string;
	sms: boolean;
	totp: boolean;
	webauthn: boolean;
	allowed_methods?: Array<string>;
	sms_phone_hint?: string | null;
}

type LoginResponse = StandardLoginResponse | MfaLoginResponse;

export interface IpAuthorizationPollResult {
	completed: boolean;
	token?: string;
	user_id?: string;
}

export async function pollIpAuthorization(ticket: string): Promise<IpAuthorizationPollResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`https://web.fluxer.app/api/v1/auth/ip-authorization/poll?ticket=${ticket}`, {
    method: 'GET',
    headers: withPlatformHeader(headers),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
    if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data: IpAuthorizationPollResult = await response.json();
  return data;
}

async function login({
  email,
  password,
  captchaToken,
  captchaType,
}: {
  email: string;
  password: string;
  captchaToken?: string;
  captchaType?: 'turnstile' | 'hcaptcha';
}): Promise<LoginResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (captchaToken) {
    headers['X-Captcha-Token'] = captchaToken;
    headers['X-Captcha-Type'] = captchaType || 'hcaptcha';
  }

  const response = await fetch('https://web.fluxer.app/api/v1/auth/login', {
    method: 'POST',
    headers: withPlatformHeader(headers),
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data: LoginResponse = await response.json();

  console.log('Login successful', { mfa: data?.mfa });

  return data;
}

function App() {
  const [captchaToken, setCaptchaToken] = useState('');
  const token = useToken();
  const { setToken } = useActions();
  const [guilds, setGuilds] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState('');
  const [ticket, setTicket] = useState('');

  useEffect(() => {
    if (token) {

    }

  }, [token]); 

  const handleLogin = async () => {
    if (ticket) {
      const data = await pollIpAuthorization(ticket);
      if (data?.token) {
        setToken(data.token);
      }
    }
    try {
      const response = await login({
        email,
        password,
        captchaToken,
        captchaType: 'turnstile'
      });
      if ((response as StandardLoginResponse).token) {
        setToken((response as StandardLoginResponse).token);
      }
      else if ((response as MfaLoginResponse).ticket) {
        setTicket((response as MfaLoginResponse).ticket);
      }
      // setData(JSON.stringify(response, null, 2));
    } catch(err) {
      setData('error: ' + err);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-black p-10">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Fluxer!
      </Text>
      {/* <Text selectable>{token}</Text> */}
      {/* <Text selectable>{ticket}</Text> */}
      {Boolean(token) ? (
        <Text selectable>
          Signed In.{/* Token: {token}*/}
        </Text>
      ) : (
        <View className="flex-1 justify-center p-4 bg-black min-w-64 w-full">
          <TextInput
            className="mb-4 p-3 border border-[#00B44E] text-lg text-white"
            placeholder="Enter your email"
            placeholderTextColor="white"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail} // Update email state
          />
          <TextInput
            className="mb-4 p-3 border border-[#00B44E] text-lg text-white"
            placeholder="Enter your password"
            placeholderTextColor="white"
            secureTextEntry
            value={password}
            onChangeText={setPassword} // Update password state
          />
          <Turnstile className="bg-black" onTokenReceived={(tkn) => { setCaptchaToken(tkn) }} />
          <View className="items-center">
            <TouchableOpacity
              className="bg-blue-500 text-white py-4 px-6 mt-4 items-center justify-center"
              onPress={handleLogin}
            >
              <Text className="text-white">LOGIN</Text>
            </TouchableOpacity>
          </View>
          {/* {Boolean(data) && <Text className="mt-4 text-sm text-gray-600">{data}</Text>} */}
        </View>
      )}
    </View>
  );
}

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
