// Socket connection

import { io } from 'socket.io-client';

const manager = new Manager('http://localhost/', {
  reconnectionDelayMax: 10000,
});

const socket = manager.socket('/', {
  // Principal namespace
  auth: {
    token: '123',
  },
});

manager.open(err => {
  if (err) {
    console.log('error occurred in manager socket');
  } else {
    console.log('Connection successed to manager socket');
  }
});

const adminSocket = manager.socket('/admin', {
  //"admin" namespace
  auth: {
    token: '123',
  },
});

// Socket event

socket.io.on('error', error => {
  // Error of connection
});

/*
il y a aussi : connect, reconnect, reconnect_failed...
*/
