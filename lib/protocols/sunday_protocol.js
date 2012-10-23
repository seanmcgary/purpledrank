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
				console.log('[Sunday server]	-- Client connected');

				socket.on('end', function(){
					console.log('[Sunday server]	-- Client disconnected');

					// TODO - any type of connection cleanup
				});

				socket.on('data', function(data){
					data = data.toString();

					self.parse_command(socket, data);

				});
			});

			self.socket_server.listen(config.sunday_protocol_port, function(){
				console.log('Sunday server listening on port ' + config.sunday_protocol_port);
			});
		},
		parse_command: function(socket, data){
			var self = this;

			// remove newlines and special characters
			data = data.replace(/\r?\n?/g, "").replace(/[^a-zA-Z0-9 _-]+/, '');

			data = data.split(' ');

			data[0] = data.toLowercase();

			if(!(data[0] in self.config.sunday_protocol_commands)){
				// bad command, error out
				self.send_response(socket, "Bad command");
			}

		},
		send_response: function(socket, data){

		}
	});
};

module.exports = sunday_protocol;