var _		= require('underscore'),
	async 	= require('async');

var drink_machine = function(socket, tini_data, machine_server, config){
	var self = this;

	console.log(arguments);

	self.socket = socket;
	self.tini_data;
	self.machine_server = machine_server;
	self.config = config;

	// define a queue to process drop requests
	self.queue = async.queue(function(drop, callback){
		drop(callback);
	}, 10);

	return _.extend(self, {
		drop: function(slot, delay, callback){
			var self = this;	

			var drop = function(queue_cb){
				setTimeout(function(){
					// send drop command
					console.log("SENDING DROP");

					console.log("DROP RECEIVED");

					// callback to finish the queue
					queue_cb('something');
				}, delay * 1000);
			}

			self.queue.push(drop, function(){
				console.log(arguments);

				callback();
			});
		}
	});
};

module.exports = drink_machine;