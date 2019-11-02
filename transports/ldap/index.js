const ldapClient = require('./ldap');
module.exports = function (RED) {
    'use strict';

    function ldapNode (n) {
        RED.nodes.createNode(this, n);
        let node = this;
        let that = this;

        this.options = {
            host: n.host || 'ldap://localhost',
            port: n.port || 389
        };

        node.status({ });

        this.connect = function(config, node) {
            node.status({ fill:"blue",shape:"dot",text: 'connecting...' });

            that.ldapClient = new ldapClient();
            that.ldapClient.random = Math.random();

            let url = `${config.options.host}:${config.options.port}`;
            that.ldapClient.connect(url, config.credentials.username, config.credentials.password).then( (res, err) => {
                if (err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error'});
                    node.error(err ? err.toString() : 'Unknown error' );
                }
                node.status({ fill: 'green', shape: 'dot', text: 'connected' });
            });
        };

        this.on('close', function (done) {
            that.ldapClient.disconnect();
            node.status({ });
            // if (this.tick) { clearTimeout(this.tick); }
            // if (this.check) { clearInterval(this.check); }
            // node.connected = false;
            // node.emit("state"," ");
            done();
        });
    }

    function ldapUpdateNode (n) {
        RED.nodes.createNode(this, n);
        this.operation = n.operation;
        this.dn = n.dn;
        this.attribute = n.attribute;
        this.value = n.value;
        this.ldapConfig = RED.nodes.getNode(n.ldap);
        let node = this;

        this.ldapConfig.connect(this.ldapConfig, node);

        node.on('input', async function (msg) {
            node.operation = msg.operation || node.operation;
            node.dn = msg.dn || node.dn;
            node.attribute = msg.attribute || node.attribute;
            node.value = msg.payload || node.value;

            try {
                node.status({ fill: 'blue', shape: 'dot', text: 'running update' });

                let update = await this.ldapConfig.ldapClient.update(node.dn, node.operation, node.attribute, node.value);
                msg.ldapStatus = update;

                node.send(msg);

                node.status({ fill: 'green', shape: 'dot', text: 'completed' });
            } catch (err) {
                msg.error = err;
                node.send(msg);
                node.status({ fill: 'red', shape: 'ring', text: 'failed' });
                node.error(err ? err.toString() : 'Unknown error' );
            }
        });
    }

    function ldapSearchNode (n) {
        RED.nodes.createNode(this, n);
        this.baseDn = n.baseDn;
        this.searchScope = n.searchScope;
        this.filter = n.filter;
        this.attributes = n.attributes;
        this.ldapConfig = RED.nodes.getNode(n.ldap);
        let node = this;

        node.on('input', async function (msg) {
            node.baseDn = msg.baseDn || node.baseDn;
            node.searchScope = msg.searchScope || node.searchScope;
            node.filter = msg.filter || node.filter;
            node.attributes = msg.attributes || node.attributes;

            try {
                node.status({ fill: 'blue', shape: 'dot', text: 'running query' });

                let search = await this.ldapConfig.ldapClient.search(node.baseDn, { filter: node.filter, attributes: node.attributes, scope: node.searchScope });
                msg.payload = search;

                node.send(msg);

                node.status({ fill: 'green', shape: 'dot', text: 'completed' });
            } catch (err) {
                msg.error = err;
                node.send(msg);
                node.status({ fill: 'red', shape: 'ring', text: 'failed' });
                node.error(err ? err.toString() : 'Unknown error' );
            }
        });
    }

    RED.nodes.registerType('ldap', ldapNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
    RED.nodes.registerType('ldap-update in', ldapUpdateNode);
    RED.nodes.registerType('ldap-search in', ldapSearchNode);
};
