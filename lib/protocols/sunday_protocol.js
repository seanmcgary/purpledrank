var _ 		= require('underscore'),
	net 	= require('net');

var sunday_protocol = function(server, config){
	var self = this;

	self.server = server;
	self.config = config;

	return _.extend(self, {
		listen: function(){
			var self = this;

			self.socket_server = net.createServer(function(socket){
				console.log('[sunday server]     -- Client connected');

				// default to null until we fetch the connected machines
				socket.active_machine = null;
				socket.auth_username = null;
				socket.auth_password = null;
				socket.ibutton = null;
				socket.username = null;
				socket.password = null;
				socket.credits = null;

				self.server.command_exec.machines(function(err, machines){
					if(machines.length){
						// check for big drink
						_.each(machines, function(machine){
							if(_.indexOf(machine.aliases, 'd') >= 0){
								socket.active_machine = 'd';
							}
						});

						if(socket.active_machine === null){
							socket.active_machine = machines[0].aliases[0];
						}
					}

					console.log('[sunday server]     -- Machine set to ' + socket.active_machine);

					socket.on('end', function(){
						console.log('[sunday server]     -- Client disconnected');

						// TODO - any type of connection cleanup
					});

					socket.on('data', function(data){
						data = data.toString();

						self.parse_command(socket, data);

					});
				});
			});

			self.socket_server.listen(config.sunday_protocol_port, function(){
				console.log('[sunday server]     -- Sunday server listening on port ' + config.sunday_protocol_port);
			});
		},
		parse_command: function(socket, data){
			var self = this;

			// remove newlines and special characters
			data = data.replace(/\r?\n?/g, "").replace(/[^a-zA-Z0-9 _-]+/, '');
			data = data.split(' ');
			data[0] = data[0].toLowerCase();

			if(!(data[0] in self.config.sunday_protocol_commands)){
				// bad command, error out
				self.send_response(socket, self.config.errors['400']);
				return;
			}

			var command = self.config.sunday_protocol_commands[data[0]];

			if(data.length < command.num_args){
				self.send_response(socket, self.config.errors["401"] + command.usage);
				return;
			}

			switch(data[0]){
				case 'quit':
					console.log('[sunday server]     -- Client ' + socket.remoteAddress + ' quit');
					return socket.destroy();
				case 'auth':
					socket.username = data[1];
					socket.password = data[2];

					self.server.command_exec.auth(socket.username, socket.password, function(err, user_data){
						self.format_auth_user(socket, err, user_data);
					});

					break;
				case 'user':
					socket.username = data[1];
					self.send_response(socket, self.config.errors['OK']);
					break;
				case 'pass':
					if(socket.username === null){
						return self.send_response(socket, self.config.errors['402']);
					}

					socket.password = data[1];

					self.server.command_exec.auth(socket.username, socket.password, function(err, user_data){
						self.format_auth_user(socket, err, user_data);
					});

					// TODO - auth user
					break;
				case 'ibutton':
					socket.ibutton = data[1];

					self.server.command_exec.auth(data[1], function(err, user_data){
						console.log(arguments);
						self.format_auth_user(socket, err, user_data);
					});
					break;
				case 'drop':
					var delay = 0;

					if(data.length === 3){
						delay = data[2];
					}
					// TODO - check 
					self.server.command_exec.drop(socket.active_machine, data[2], delay, function(err, res){

					});
					break;
				case 'machine':
					break;	
				case 'machines': 	// return a list of connected machines
					self.server.command_exec.machines(function(err, machines){
						if(machines.length){
							var machine_string = self.config.errors["OK"] + " connected machines\n";

							_.each(machines, function(machine){
								machine_string += machine.aliases[0] + " - " + machine.long_name + "\n";
							});

							return self.send_response(socket, machine_string);

						} else {
							return self.send_response(socket, self.config.errors["501"]);
						}
					});
					break;
				case 'stat':
					break;
				case 'getbalance':
					break;
			}

		},
		format_auth_user: function(socket, err, user_data){
			var self = this;

			if(err == null && user_data !== false){
				// good
				if(user_data.auth_type == 'user'){
					socket.auth_username = socket.username;
				} else {
					socket.auth_username = user_data.username;
				}

				socket.ibutton = user_data.ibutton;

				try {
					socket.credits = parseInt(user_data.credits);
				} catch (e) {
					socket.credits = 0;
				}

				self.send_response(socket, self.config.errors['OK'] + ' ' + socket.credits);
			} else {
				// bad username and password
				socket.ibutton = null;
				socket.username = null;
				socket.password = null;

				return self.send_response(socket, self.config.errors['403']);
			}
		},
		send_response: function(socket, data){
			var self = this;

			socket.write(data + "\r\n");
		}
	});
};

module.exports = sunday_protocol;