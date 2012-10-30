var node_ldap 	= require('LDAP'),
	_ 			= require('underscore'),
	util 		= require('util'),
	config 		= require('../config/ldap_config');

var ldap = function(){
	var self = this;
	//self.ldap = new node_ldap({ uri: config.host, version: config.version });

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
		get_ldap: function(){
			return new node_ldap({ uri: config.host, version: config.version });
		},
		auth_user: function(username, password, callback){
			var self = this;

			var auth_type = 'user';
			if(typeof password === 'function'){
				callback = password;
				auth_type = 'ibutton';
			}

			var l = self.get_ldap();

			l.open(function(err){
				if(err){
					return callback(true, 'open failed (auth user)');
				}

				if(auth_type == 'user'){

					var bind_options = {
						binddn: self.user_dn(username),
						password: password
					};

					l.simplebind(bind_options, function(err){
						if(err){
							l.close();
							return callback(true, 'bind failed (auth user)');
						} else {
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

					l.simplebind(drink_bind, function(err){
						if(err){
							l.close();
							return callback(true, 'bind failed (auth ibutton)');
						}
						var ibutton = username;
						var user_search = {
							base: config.user_base,
							scope: '*',
							filter: '(ibutton=' + ibutton + ')',
							subtree: l.SUBTREE,
							attrs: 'uid'
						};

						l.search(user_search, function(err, data){
							if(err || data.length == 0){
								l.close();
								return callback(true, 'search failed (auth ibutton)');
							}

							username = data[0].uid[0]

							l.close();
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
			var l = self.get_ldap();

			l.open(function(err){
				if(err){
					return callback(true, 'open failed (get user data)');
				}

				var drink_bind = {
					binddn: self.drink_dn(),
					password: config.password
				};

				l.simplebind(drink_bind, function(err){
					if(err){
						return callback(true, 'bind failed (get user data)');
					}

					var user_search = {
						base: config.user_base,
						scope: '*',
						filter: '(uid=' + username + ')',
						subtree: l.SUBTREE,
						attrs: 'uid,ibutton,drinkBalance'
					};
					
					l.search(user_search, function(err, data){
						if(data.length){
							var user_result = data[0];

							var user = {
								ibutton: user_result.ibutton[0],
								credits: user_result.drinkBalance[0],
								username: username
							};
							l.close();
							return callback(null, user);
						} else {
							l.close();
							return callback(true, 'search failed (get user data)');
						}						
					});
				});
			});
		},
		update_balance: function(username, new_balance, callback){
			var self = this;

			var l = self.get_ldap();

			l.open(function(err){
				if(err){
					return callback(true);
				}

				var drink_bind = {
					binddn: self.drink_dn(),
					password: config.password
				};

				l.simplebind(drink_bind, function(err){
					if(err){
						l.close();
						return callback(true);
					}

					var dn = self.user_dn(username);
					var changes = [{
						attr: 'drinkBalance',
						vals: [new_balance]
					}];

					l.modify(dn, changes, function(err){
						if(err){
							l.close();
							return callback(true);
						}

						self.get_user_data(username, function(err, data){
							l.close();
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

