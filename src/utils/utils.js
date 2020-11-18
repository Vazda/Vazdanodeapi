const saltHashPassword = function(password) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(password, salt);
    return passwordData;
}

const checkPassword = function(salt, password) {
    let hash = sha512(password, salt);
    return hash;
}

const hashPasswordWithSalt = function(password, salt) { 
    /** Gives us salt of length 16 */
    var passwordData = sha512(password, salt);
    return passwordData;
}

export default {
    saltHashPassword,
    checkPassword,
    hashPasswordWithSalt
}