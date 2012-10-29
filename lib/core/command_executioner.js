var _ 		= require('underscore'),
	async 	= require('async');

var command_executioner = function(machine_server, config){
	var self = this;

	self.machine_server = machine_server;
	self.config = config;

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

			// check to see if the machine is available
			self.machine_server.machine_connected(machine_alias, function(err, res){
				if(err === null){
					if(res === true){
						
					} else {
						// machine not connected
						callback(true, 'stuff');
					}
				} else {
					// error getting machine status
				}
			})

		}
	});
};

module.exports = command_runner;