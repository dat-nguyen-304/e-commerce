const JWT = require('jsonwebtoken');

const createTokenPair = (payload, publicKey, privateKey) => {
    try {
        const accessToken = JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        });

        const refreshToken = JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`error verify hahaha: `, err);
            } else {
                console.log(`decode verify `, decode);
            }
        })

        return { accessToken, refreshToken };

    } catch (error) {

    }
}

module.exports = {
    createTokenPair
}