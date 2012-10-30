var node_ldap 	= require('LDAP'),
	_ 			= require('underscore'),
	util 		= require('util'),
	config 		= require('../config/ldap_config');

var ldap = function(){
	var self = this;
	self.ldap = new node_ldap({ uri: config.host, version: config.version });

	return _.extend(self, {
		user_dn: function(username){
			return 'uid=' + username + ',' + config.user_base;
		},
		ibutton_dn: function(ibutton){
			return 'ibutton=' + ibutton + ',' + config.user_base;
		},
		drink_dn: function(){
			return 'cn=' + config.username + ',' + config.drink_base;
		},
		auth_user: function(username, password, callback){
			var self = this;

			var auth_type = 'user';
			if(typeof password === 'function'){
				callback = password;
				auth_type = 'ibutton';
			}

			self.ldap.open(function(err){
				if(err){
					return callback(true);
				}

				if(auth_type == 'user'){

					var bind_options = {
						binddn: self.user_dn(username),
						password: password
					};

					self.ldap.simplebind(bind_options, function(err){
						if(err){
							return callback(true);
						} else {
							self.ldap.close();
							self.get_user_data(username, function(err, user){
								return callback(err, user);
							});
						}
					});
				} else {
					// ibutton auth
					var drink_bind = {
						binddn: self.drink_dn(),
						password: config.password
					};

					self.ldap.simplebind(drink_bind, function(err){
						if(err){
							return callback(true);
						}
						var ibutton = username;
						var user_search = {
							base: self.user_base,
							scope: '*',
							filter: '(ibutton=' + ibutton + ')',
							subtree: self.ldap.SUBTREE,
							attrs: 'uid'
						};

						self.ldap.search(user_search, function(err, data){
							if(err || data.length == 0){
								return callback(true);
							}

							username = data[0].uid[0]

							self.ldap.close();
							self.get_user_data(username, function(err, user){
								return callback(err, user);
							});
						});
					});
				}	
			});
		},
		get_user_data: function(username, callback){
			var self = this;

			self.ldap.open(function(err){
				if(err){
					return callback(true);
				}

				var drink_bind = {
					binddn: self.drink_dn(),
					password: config.password
				};

				self.ldap.simplebind(drink_bind, function(err){
					if(err){
						return callback(true);
					}

					var user_search = {
						base: config.user_base,
						scope: '*',
						filter: '(uid=' + username + ')',
						subtree: self.ldap.SUBTREE,
						attrs: 'uid,ibutton,drinkBalance'
					};
					
					self.ldap.search(user_search, function(err, data){
						if(data.length){
							var user_result = data[0];

							var user = {
								ibutton: user_result.ibutton[0],
								credits: user_result.drinkBalance[0],
								username: username
							};
							self.ldap.close();
							return callback(null, user);
						} else {
							self.ldap.close();
							return callback(true);
						}						
					});
				});
			});
		},
		update_balance: function(username, new_balance, callback){
			var self = this;

			self.ldap.open(function(err){
				if(err){
					return callback(true);
				}

				var drink_bind = {
					binddn: self.drink_dn(),
					password: config.password
				};

				self.ldap.simplebind(drink_bind, function(err){
					if(err){
						return callback(true);
					}

					var dn = self.user_dn(username);
					var changes = [{
						attr: 'drinkBalance',
						vals: [new_balance]
					}];

					self.ldap.modify(dn, changes, function(err){
						if(err){
							self.ldap.close();
							return callback(true);
						}

						self.get_user_data(username, function(err, data){
							self.ldap.close();
							return callback(err, data);
						});
					});
				});
			})
		}
	});
};

module.exports = ldap;

// EXAMPLES

//var l = new ldap();

//l.auth_user('username', 'password', function(){
//	console.log(arguments);
//});

//l.auth_user('ibutton', function(){
//	console.log(arguments);
//});

//l.update_balance('username', 40, function(){
//	console.log(arguments);
//});

