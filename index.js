const Memcached = require('memcached');
const crypto = require('crypto');

const memcached = new Memcached(process.env.ELASTICACHE_ENDPOINT); // Replace with your endpoint

async function sessionStart(event) {
  let sessionId = getSessionIdFromCookie(event.headers.Cookie);
  let sessionData = {};

  if (sessionId) {
    sessionData = await getSessionData(sessionId);
  }

  if (!sessionData) {
    sessionId = generateSessionId();
    sessionData = {};
    await setSessionData(sessionId, sessionData);
  }

  return { sessionId, sessionData };
}

async function getSessionData(sessionId) {
  return new Promise((resolve, reject) => {
    memcached.get(sessionId, (err, data) => {
      if (err) return reject(err);
      if (data) {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  });
}


function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

function getSessionIdFromCookie(cookieHeader) {
  if (!cookieHeader){
    return null;
  }
  const cookies = cookieHeader.split(';');
  for(let cookie of cookies){
    const parts = cookie.trim().split('=');
    if(parts[0] === 'sessionId'){
      return parts[1];
    }
  }
  return null;
}

async function setSessionData(sessionId, sessionData){
    return new Promise((resolve, reject) => {
        memcached.set(sessionId, JSON.stringify(sessionData), 3600, (err, result) => {
            if (err){
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


module.exports = {
  
}