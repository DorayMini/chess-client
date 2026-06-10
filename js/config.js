const host = window.location.hostname;
const protocol = window.location.protocol; 

const serverHost = (host === "localhost" || host === "127.0.0.1") 
    ? "127.0.0.1" 
    : "paroxysmally-compensable-timmy.ngrok-free.dev";

const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
const apiProtocol = protocol;

window.APP_CONFIG = {
    API_URL: `${apiProtocol}//${serverHost}`,
    WS_URL: `${wsProtocol}//${serverHost}`
};
