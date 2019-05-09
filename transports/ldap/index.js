module.exports = function (RED) {
    'use strict';

    function ldapNode (n) {
        RED.nodes.createNode(this, n);

        this.options = {
            host: n.host || 'ldap://localhost',
            port: n.port || 389
        };
    }

    function ldapUpdateNode (n) {
        RED.nodes.createNode(this, n);
        this.operation = n.operation;
        this.dn = n.dn;
        this.attribute = n.attribute;
        this.value = n.value;
        this.ldapConfig = RED.nodes.getNode(n.ldap);

        let node = this;
        node.on('input', async function (msg) {
            node.operation = msg.operation || node.operation;
            node.dn = msg.dn || node.dn;
            node.attribute = msg.attribute || node.attribute;
            node.value = msg.payload || node.value;

            let ldap = require('./ldap');
            node.status({ fill:"blue",shape:"dot",text: 'connecting' });
            try {
                let url = `${node.ldapConfig.options.host}:${node.ldapConfig.options.port}`;
                await ldap.connect(url, node.ldapConfig.credentials.username, node.ldapConfig.credentials.password);
                node.status({ fill: 'green', shape: 'dot', text: 'connected' });

                await ldap.update(node.dn, node.operation, node.attribute, node.value);

                node.status({});
            } catch (err) {
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
};