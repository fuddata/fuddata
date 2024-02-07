export let sessionId = sessionStorage.getItem('sessionId');
export let serverToken = "";
export let turnstileId = "";
export let email = "";

export const setSessionId = (id) => {
    sessionId = id;
};

export const setServerToken = (token) => {
    serverToken = token;
};

export const getTurnstileId = () => turnstileId;
export const renderTurnstile = () => {
  turnstileId = turnstile.render('#ttWidget', {
    sitekey: '0x4AAAAAAARY-yrETZZ7W3HV',
  });
};

export const setEmail = (email) => {
  email = email;
};

