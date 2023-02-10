import { io } from 'socket.io-client'
export default (context, inject) => {
  inject('socket', io('172.16.10.100:31008'))
}