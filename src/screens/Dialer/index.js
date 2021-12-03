import React, {useEffect, useState} from 'react';
import axios from 'axios';
import JsSIP from 'jssip';
import {mediaDevices, RTCPeerConnection} from 'react-native-webrtc';

import {ButtonToDoCall, Container, TextButton} from './styles';

const Dialer = () => {
  const [streamAudio, setStreamAudio] = useState(null);
  const [token, setToken] = useState('');
  const [uaConn, setUaConn] = useState(false);

  if (uaConn) {
    console.tron.log('TEM UA CONN');
    const socket = new JsSIP.WebSocketInterface(
      'wss://mozaik-wss.mozaik.cloud:443/ws',
    );
    const configuration = {
      sockets: [socket],
      uri: 'sip:615dec50459f5b00014eb311@mozaik-wss.mozaik.cloud',
      password: 'A1e5cS93OX',
    };

    const ua = new JsSIP.UA(configuration);
    ua.start();
    ua.on('newRTCSession', data => {
      console.tron.log('data newRTCSession', data);
    });
  }

  async function handleUpdateStatusWebphone() {
    try {
      const {data} = await axios.put(
        'https://api-webphone.mozaik.cloud/v1/webphone/servicestatus',
        {
          service_member_status: 'available',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.tron.log('data status updated', data);
    } catch (error) {
      console.tron.log('error', error);
    }
  }

  async function connectToSoftphone(voiceServer) {
    const {
      rtcURIAddr,
      rtcWssServer,
      rtcUAUsername,
      rtcUAPassword,
      caller_ident_external,
    } = voiceServer;

    // this.caller_ident_external = caller_ident_external

    // Criando objeto UA do SIP
    const config = {
      iceServers: [{url: 'stun:stun.1.mozaik.cloud:3478'}],
    };
    const pc = new RTCPeerConnection(config);

    // SIP TESTES
    const socket = new JsSIP.WebSocketInterface(
      'wss://mozaik-wss.mozaik.cloud:443/ws',
    );
    const configuration = {
      sockets: [socket],
      uri: 'sip:615dec50459f5b00014eb311@mozaik-wss.mozaik.cloud',
      password: rtcUAPassword,
    };

    const ua = new JsSIP.UA(configuration);
    ua.start();
    ua.on(
      'registered',
      async ({response}) => {
        console.tron.log('REGISTERED SIP', response);
        setUaConn(true);
        await handleUpdateStatusWebphone();
      },
      err => {
        console.tron.log('err registered', err);
      },
    );
  }

  useEffect(() => {
    async function authWebPhone() {
      const {data} = await axios.post(
        'https://api-webphone.mozaik.cloud/v1/webphone/auth',
        {
          user_name: 'denison.menezes@code7.com',
          user_passwd: 'Jesus3fiel@',
        },
      );

      setToken(data.ret_token);

      if (data) {
        const response = await axios.get(
          'https://api-webphone.mozaik.cloud/v1/webphone/voiceserver',
          {
            headers: {
              Authorization: `Bearer ${data.ret_token}`,
            },
          },
        );

        if (response) {
          await connectToSoftphone(response.data);
        }

        if (response) {
          await axios.post(
            'https://api-webphone.mozaik.cloud/v1/webphone/servicestatus',
            {},
            {
              headers: {
                Authorization: `Bearer ${data.ret_token}`,
              },
            },
          );
        }
      }

      if (streamAudio) {
        return;
      }

      const stream = await mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      setStreamAudio(stream);
    }

    authWebPhone();
  }, [streamAudio]);

  return (
    <Container>
      <ButtonToDoCall>
        <TextButton>Chamar</TextButton>
      </ButtonToDoCall>
    </Container>
  );
};

export default Dialer;
