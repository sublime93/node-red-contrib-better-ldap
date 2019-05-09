module.exports = function (RED) {
    'use strict';

    function ldapNode(n) {
        RED.nodes.createNode(this, n);
    }

    RED.nodes.registerType('ldap', ldapNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
};