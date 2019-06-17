const ldap = require('./ldap');
module.exports = function (RED) {
    'use strict';

    function ldapNode (n) {
        RED.nodes.createNode(this, n);
        let node = this;

        this.options = {
            host: n.host || 'ldap://localhost',
            port: n.port || 389
        };

        node.status({ });

        this.connect = function(config, node) {
            node.status({ fill:"blue",shape:"dot",text: 'connecting...' });
            let url = `${config.options.host}:${config.options.port}`;
            ldap.connect(url, config.credentials.username, config.credentials.password).then( (res, err) => {
                node.status({ fill: 'green', shape: 'dot', text: 'connected' });
            });
        };

        this.on('close', function (done) {
            ldap.disconnect();
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

                let update = await ldap.update(node.dn, node.operation, node.attribute, node.value);
                msg.ldapStatus = update;

                node.send(msg);

                node.status({});
            } catch (err) {
                node.status({ fill: 'red', shape: 'ring', text: 'failed' });
                node.error(err ? err : 'Unknown error' );
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
};