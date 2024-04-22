const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, UnauthorizedRequestError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");


const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR'
}

class AccessService {
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail(email);
        if (!foundShop) throw new BadRequestError('Shop is not registered');
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new UnauthorizedRequestError('Authentication error');

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);

        const keyStore = await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey
        });

        if (!keyStore) {
            throw new BadRequestError('Can not create keys');
        }

        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }


    static signUp = async ({ name, email, password }) => {
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        });

        if (newShop) {
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            console.log({ privateKey, publicKey });

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            });

            if (!keyStore) {
                throw new BadRequestError('Can not create keys');
            }

            const tokens = createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
            console.log(`Created Token Success `, tokens);

            return {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                tokens
            }
        }
        return null;
    }
}

module.exports = AccessService;