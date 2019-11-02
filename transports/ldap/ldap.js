const ldap = require('ldapjs');
const uuidParse = require('../tools/uuid-parse');

function ldapClient () {
    this.client = undefined;
    this.defaultAttributes = [
        'dn', 'userPrincipalName', 'sAMAccountName', 'objectSID', 'mail',
        'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl',
        'employeeID', 'sn', 'givenName', 'initials', 'cn', 'displayName',
        'comment', 'description', 'title', 'department', 'company'
    ];
    this.baseDn = '';
    /**
     * @public
     * Connect to LDAP server
     * @param {string} url      URL of LDAP server
     * @param {string} username UPN or dn of user to bind to instance with
     * @param {string} password Password of user
     * @param {object} options  additional options for ldapjs connection
     * @returns {Promise<*>}
     */
    this.connect = async function (url, username, password, options = {}) {
        let that = this;
        this.client = ldap.createClient({
            url,
            reconnect: true,
            ...options
        });
        this.client.on('error', function(err) {
            console.warn('LDAP connection failed, but fear not, it will reconnect OK', err);
        });
        return new Promise(function (resolve, reject) {
            if (that.client.connected) return resolve();
            that.client.bind(username, password, function(err, conn) {
                if (err) {
                    return reject(err);
                }
                return resolve(conn);
            });
        });
    }
    this.disconnect = function () {
        if (this.client) {
            this.client.unbind();
        }
    };
    /**
     * @public
     * Perform an update action on a specific LDAP object
     * @param {string} dn         DN of the object
     * @param {string} operation  Operation type to perform
     * @param {string} attribute  Attribute to change
     * @param {null|string} value Value of the change
     * @returns {Promise<*>}
     */
    this.update = async function (dn, operation, attribute, value = null) {
        let that = this;
        let changeObj = {
            operation,
            modification: {}
        };
        changeObj.modification[attribute] = value;
        let change = new ldap.Change(changeObj);

        return new Promise(function (resolve, reject) {
            that.client.modify(dn, change, function(err, res) {
                if (err) {

                    return reject({ success: false, error: err });
                }
                return resolve({ success: true });
            });
        });
    };
    /**
     * @public
     * @param {string} dn       base dn for the search
     * @param {object} userOpts additional user options for search query
     * @returns {Promise<array(object)>}
     */
    this.search = async function (dn, userOpts) {
        let that = this;
        if (userOpts.attributes !== '') {
            userOpts.attributes = userOpts.attributes.split(',');
        } else {
            userOpts.attributes = this.defaultAttributes;
        }
        return new Promise(function (resolve, reject) {
            that.results = [];
            that.client.search(dn, userOpts, function (err, res) {
                if (err) {
                    console.log('better-ldap error', err);
                    reject(err);
                }
                res.on('searchEntry', function (entry) {
                    let res = entry.object;
                    delete res.controls;

                    that.onSearchEntry(res, entry.raw, function (item) {
                        that.results.push(item);
                    })
                });
                res.on('searchReference', function () { reject('Referral chasing not implemented.') });
                res.on('error', function(err) { return reject(err); });
                res.on('end', function(result) { return resolve(that.results); });
            })
        });
    };
    /**
     * @private
     * Default search entry parser.
     * @param {object} item       Item returned from AD
     * @param {object} raw        Raw return object
     * @param {function} callback Callback when parsing is complete
     */
    this.onSearchEntry = function (item, raw, callback) {
        if (raw.hasOwnProperty('objectSid')) item.objectSid = uuidParse.unparse(raw.objectSid);
        if (raw.hasOwnProperty("objectGUID")) entry.objectGUID = uuidParse.unparse(raw.objectGUID);
        if (raw.hasOwnProperty("mS-DS-ConsistencyGuid")) entry['mS-DS-ConsistencyGuid'] = uuidParse.unparse(raw['mS-DS-ConsistencyGuid']);
        callback(item);
    };

    return this;
}

module.exports = ldapClient;
