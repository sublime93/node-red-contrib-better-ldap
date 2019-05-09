const ldap = require('ldapjs');
module.exports = {
    client: undefined,
    connect: async function(url, username, password, options) {
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
    update: async function (dn, operation, attribute, value) {
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