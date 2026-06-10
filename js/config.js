const protocol = window.location.protocol; 
const hostname = window.location.hostname; 
const port = "8081"; 

window.APP_CONFIG = {
    API_URL: `${protocol}//${hostname}:${port}` 
};
