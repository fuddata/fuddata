export let sessionId = sessionStorage.getItem('sessionId');
export let email = sessionStorage.getItem('email');
export let serverToken = "";
export let turnstileId = "";

export const setServerToken = (token) => {
  serverToken = token;
};

export const getTurnstileId = () => turnstileId;
export const renderTurnstile = () => {
  turnstileId = turnstile.render('#ttWidget', {
    sitekey: '0x4AAAAAAARY-yrETZZ7W3HV',
  });
};
