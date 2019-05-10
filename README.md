# node-red-contrib-better-ldap

[![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

Better LDAP includes nodes which implement the [ldapjs][ldapjs] api. Some nodes
have been simplified to help ease of use.

Install
-------

Run the following command in the root directory of your Node-RED install

    npm install node-red-contrib-better-ldap

Nodes
-------
***Update Node***

Update node is used to update an attribute on an LDAP object by DN

![update_node](./images/update_node.png)
![update node settings](./images/update_node_settings.png)

Operation, DN, Attribute, and Value can be accessed via
`msg.operation`, `msg.dn`, `msg.attribute`, `msg.payload`
respectively.

Node does not return any data.

Configuration
-------

Host, port, username, and password are required to configure a new LDAP client.    
    
License
-------

See [license](https://github.com/rocky3598/node-red-contrib-better-ldap/blob/master/LICENSE)
    
[ldapjs]: https://github.com/joyent/node-ldapjs    