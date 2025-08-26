"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saltAndHashPassword = saltAndHashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
function saltAndHashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const hash = (0, crypto_1.pbkdf2Sync)(password, salt, 1000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(":");
    const hash = (0, crypto_1.pbkdf2Sync)(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
}
