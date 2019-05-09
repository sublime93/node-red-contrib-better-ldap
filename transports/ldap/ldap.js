const ldap = require('ldapjs');
module.exports = {
    client: undefined,
    /**
     * Connect to LDAP server
     * @param {string} url      URL of LDAP server
     * @param {string} username UPN or dn of user to bind to instance with
     * @param {string} password Password of user
     * @param {object} options  additional options for ldapjs connection
     * @returns {Promise<*>}
     */
    connect: async function(url, username, password, options = {}) {
        let that = this;
        this.client = ldap.createClient({
            url,
            ...options
        });
        return new Promise(function (resolve, reject) {
            that.client.bind(username, password, function(err, conn) {
                if (err) return reject(err);
                return resolve(conn);
            });
        });
    },
    /**
     * Perform an update action on a specific LDAP object
     * @param {string} dn         DN of the object
     * @param {string} operation  Operation type to perform
     * @param {string} attribute  Attribute to change
     * @param {null|string} value Value of the change
     * @returns {Promise<*>}
     */
    update: async function (dn, operation, attribute, value = null) {
        let that = this;
        let changeObj = {
            operation,
            modification: {}
        };
        changeObj.modification[attribute] = value;
        let change = new ldap.Change(changeObj);

        return new Promise(function (resolve, reject) {
            that.client.modify(dn, change, function(err, res) {
                console.log('');
                if (err) {
                    return reject({ success: false, error: err });
                }
                return resolve({ success: true });
            });
        });
    }
}