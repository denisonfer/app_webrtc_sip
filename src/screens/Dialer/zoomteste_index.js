import React, {useEffect, useState} from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
} from 'react-native-webrtc-web-shim';
import io from 'socket.io-client';
import Peer from 'react-native-peerjs';

import {Container, ButtonToDoCall, TextButton} from './styles';

const API_URI = 'http://192.168.1.5:5000';

export const socket_io = io(`${API_URI}`);

const Dialer = () => {
  socket_io.on('connection', () => {
    console.log('====================================');
    console.log('connected');
    console.log('====================================');
  });

  const [stream, setStream] = useState(false);

  const peerServer = new Peer();
  peerServer.on('error', console.log);

  function connectToNewUser(userId, streamData) {
    const call = peerServer.call(userId, streamData);
  }

  function addStream(s) {}

  function joinRoom(streamReceived) {
    const roomId = 'asdfasdfasdfasdf';

    setStream(streamReceived);

    peerServer.on('open', userId => {
      socket_io.emit('join_room', {userId, roomId});
    });

    socket_io.on('user_connected', userId => {
      connectToNewUser(userId, streamReceived);
    });

    peerServer.on('call', call => {
      call.answer(streamReceived);

      call.on('stream', stream => {
        addStream(stream);
      });
    });
  }

  useEffect(() => {
    let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.lengths; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            width: 640,
            height: 480,
            frameRate: 30,
            facingMode: isFront ? 'user' : 'environment',
            deviceId: videoSourceId,
          },
        })
        .then(stream => {
          // Got stream!
          joinRoom(stream);
        })
        .catch(error => {
          // Log error
          console.tron.log('[getUserMedia].error ', error);
        });
    });
  }, []);

  return (
    <Container>
      {stream && <RTCView stream={stream} style={{width: 150, height: 150}} />}

      <ButtonToDoCall>
        <TextButton>Chamar</TextButton>
      </ButtonToDoCall>
    </Container>
  );
};

export default Dialer;
