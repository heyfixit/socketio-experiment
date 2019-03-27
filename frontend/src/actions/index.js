export const MESSAGE_RECEIVED = 'MESSAGE_RECEIVED';

export const messageReceived = msg => ({
  type: MESSAGE_RECEIVED,
  payload: msg
});
