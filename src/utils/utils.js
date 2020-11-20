import crypto from 'crypto';


const getQueryParameters = (query) => {
    const objKeys = Object.keys(query);
    if(objKeys.length > 0) return query;
    return {}
}
// ---- This functions are used to salt and hash developers password ----
const genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
}

const sha512 = function(password, salt){
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
}

const saltHashPassword = function(userpassword) {
    let salt = genRandomString(16); /** Gives us salt of length 16 */
    let passwordData = sha512(userpassword, salt);
    return passwordData;
}
const hashPasswordWithSalt = function(userpassword, salt) { 
    /** Gives us salt of length 16 */
    let passwordData = sha512(userpassword, salt);
    return passwordData;
}

// ==== Check developer's entered password, with his salt from DB ====
const checkPassword = function(salt, userpassword) {
    let hash = sha512(userpassword, salt);
    return hash;
}

// ==== Get random password when developer forgets password ====
const genRandomStringPassword = function(){
    return Math.random().toString(36).substring(5, 13) + Math.random().toString(36).substring(5, 13);
}

const saltHashPasswordForgot = function() {
    let salt = genRandomString(16); /** Gives us salt of length 16 */
    let userpassword = genRandomStringPassword();
    let passwordData = sha512(userpassword, salt);
    return {
        passwordData: passwordData,
        userpassword: userpassword
    }
        
}

// const uuidv4 = function () {
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  export default {
    getQueryParameters,
    saltHashPassword,
    checkPassword,
    saltHashPasswordForgot,
    uuidv4,
    hashPasswordWithSalt
}