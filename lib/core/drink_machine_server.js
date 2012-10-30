/**
	Listens for connections from tini boards and authenticates them
*/
var _ 				= require('underscore'),
	net 			= require('net'),
	drink_machine 	= require('./drink_machine');

var drink_machine_server = function(server, config){
	var self = this;
	self.server = server;
	self.config = config;

	return _.extend(self, {
		listen: function(){
			var self = this;

			self.connected_tinis = {};

			self.server = net.createServer(function(socket){
				socket.on('end', function(){

				});

				socket.on('connect', function(){
					var remoteAddr = socket.remoteAddress;
					if(!(remoteAddr in self.config.tini_whitelist)){
						// tini trying to connect, denied
						console.log('[machine server]    -- denied connection attempt from ' + remoteAddr);
						socket.destroy();
						return;
					}

					if(!(remoteAddr in self.connected_tinis)){
						var tini = new drink_machine(socket, self.config.tini_whitelist[remoteAddr], self, self.config);

						self.connected_tinis[remoteAddr] = tini;						
					} else {
						console.log('[machine server]    -- denied connection. tini already connected from ' + remoteAddr);
						socket.destroy();
						return;
					}
				});
			});

			self.server.listen(self.config.tini_server_port, function(){
				console.log('[machine server]    -- listening on port ' + self.config.tini_server_port);
			});
		},
		machine_connected: function(alias, callback){
			var self = this;

			_.each(self.connected_tinis, function(machine){
				if(_.indexOf(machine.tini_data.aliases, alias) >= 0){
					callback(null, machine);
					return;
				}
			});

			return callback(null, false);
		},
		get_machine: function(alias, callback){
			_.each(self.connected_tinis, function(machine){
				if(_.indexOf(machine.tini_data.aliases, alias) >= 0){
					callback(null, machine);
					return;
				}
			});
		},
		machine_disconnected: function(alias){
			var self = this;

			_.each(self.connected_tinis, function(machine, index){
				if(_.indexOf(machine.tini_data.aliases, alias) >= 0){
					var name = machine.tini_data.long_name;
					self.connected_tinis[index] = null;
					delete self.connected_tinis[index];

					console.log('[machine server]    -- '+ name + 'connection cleaned up');
					return;
				}
			});
		}	
	});
};

module.exports = drink_machine_server;