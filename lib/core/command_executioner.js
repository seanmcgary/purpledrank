var _ 		= require('underscore'),
	async 	= require('async'),
	LDAP 	= require('./ldap');

var command_executioner = function(machine_server, config){
	var self = this;

	self.machine_server = machine_server;
	self.config = config;

	self.ldap = new LDAP();

	return _.extend(self, {
		drop: function(machine_alias, slot, delay, callback){
			var self = this;

			if(typeof delay === 'function'){
				callback = delay;
				delay = 0;
			} else {
				try {
					delay = parsetInt(delay);
				} catch(e){
					delay = 0;
				}
			}

			// TODO - 	get state for slot from mysql

			// TODO - 	get state of slot from machine

			// TODO - 	Check to see if the the machine has items available.
			// 			If slot is physically empty, return slot empty error (500)
			// 			If the slot is not empty, drop the item, make callback

			// check to see if the machine is available
			self.machine_server.machine_connected(machine_alias, function(err, machine){
				if(err === null){
					if(res === true){
						console.log(machine)
					} else {
						// machine not connected
						callback(true, 'stuff');
					}
				} else {
					// error getting machine status
				}
			})

		},
		stat: function(machine_alias, callback){
			var self = this;

			// TODO - pull the machine stat from mysql

			// TODO - pull slot status from the actual machine

			// should return an array of objects
			/*
				[
					{
						state: (0 == empty, 1 == available),
						disabled: (0 == false, 1 == true),
						item: (string)
						price: (int)
					}, 
					{},...
				]
			*/
			return callback(null, []);
		},
		// USAGE
		// 		username, password, callback
		// 		ibutton, callback
		auth: function(username, password, callback){
			var auth_type = 'user';
			if(typeof password === 'function'){
				callback = password;
				auth_type = 'ibutton';
			}

			console.log(auth_type);

			if(auth_type == 'user'){
				// basic auth
				self.ldap.auth_user(username, password, function(err, user){
					if(err === null){
						user.auth_type = 'basic';

						return callback(null, user);
					} else {
						return callback(true, user);
					}
				});
			} else {
				// ibutton auth
				console.log(username);
				self.ldap.auth_user(username, function(err, user){
					if(err === null){
						user.auth_type = 'ibutton';

						return callback(null, user);
					} else {
						return callback(true, user);
					}
				});
			}
			// TODO - implement auth here. for now, return positive auth by returning credits
			/*callback(null, {
				ibutton: 1111111111,
				username: 'seanmcgary',
				credits: 10,
				auth_type: auth_type
			});*/
		},
		machines: function(callback){
			var self = this;

			self.machine_server.get_connected_machines(callback);
		}

	});
};

module.exports = command_executioner;