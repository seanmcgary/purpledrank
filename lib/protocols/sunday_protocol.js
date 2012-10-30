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

				// default to little drink for now
				socket.active_machine = 'ld';

				socket.on('end', function(){
					console.log('[sunday server]     -- Client disconnected');

					// TODO - any type of connection cleanup
				});

				socket.on('data', function(data){
					data = data.toString();

					self.parse_command(socket, data);

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

				case 'auth':
					break;
				case 'user':
					break;
				case 'pass':
					break;
				case 'ibutton':
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
		send_response: function(socket, data){
			var self = this;

			socket.write(data + "\r\n");
		}
	});
};

module.exports = sunday_protocol;