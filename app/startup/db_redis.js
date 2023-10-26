// 'use strict';

// const  { createClient } = require('redis');
// const { REDIS, SOCKET_LOADBALANCING_ENABLE } = require('../../config');

// const redisCred = {
//     host: REDIS.HOST,
//     port: REDIS.PORT
// };

// if ( REDIS.PASSWORD ){
//     redisCred.password = REDIS.PASSWORD;
// }

// const pubClient = createClient(redisCred);

// const socketLoadBalancer = async () => {
    
//     await pubClient.connect();

//     if( SOCKET_LOADBALANCING_ENABLE ) {
        
//         let { createAdapter } = require("@socket.io/redis-adapter");

//         const subClient = pubClient.duplicate();
//         await subClient.connect();
//         await global.io.adapter(createAdapter(pubClient, subClient));
//     }
// }

// module.exports = async () => {
//     await socketLoadBalancer();
// };