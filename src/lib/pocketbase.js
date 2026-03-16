import PocketBase from 'pocketbase';

// Use your NAS IP and the port we set for PocketBase
const pb = new PocketBase('http://192.168.1.227:8090');

export default pb;