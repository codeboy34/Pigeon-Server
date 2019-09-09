var admin = require('./firebase-admin.js')


//verify the  idToken 
function tokenVerifier(idToken) {
  return new Promise((resolve, reject) => {
    admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
        resolve(decodedToken)
      })
      .catch((err) => {
        reject(err)
      });
  })

}



async function verifyToken(req, res, next) {
  try {

    var headersString = JSON.stringify(req.headers);
    var headers = JSON.parse(headersString);

    // console.log(headersString)
    var decodedToken = await tokenVerifier(headers.idtoken)
    var user_id = decodedToken.phone_number.replace("+91", "")
    req.user_id = user_id

    next()
  } catch (err) {
    res.status(403).end("Invalid token")
  }
}


//for socket token verify
async function verifyWithToken(token, user_phone_number) {
  try {
    var decodedToken = await tokenVerifier(token)
    var decoded_phone = decodedToken.phone_number.replace("+91", "");
    //if(decoded_phone!=user_phone_number)
    // throw "Token is not match with user."

  } catch (e) {
    throw e
  }
}

function tempVerifier(req, res, next) {
  console.log(req)
  console.log(req.body)
  req.body.decodedToken = { phone_number: +req.body.phoneNumber }
  next()
}


module.exports = {
  verifyToken: verifyToken,
  verifyWithToken: verifyWithToken
};