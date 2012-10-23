var _ 		= require('underscore'),
	net 	= require('net');

var json_protocol = function(server, config){
	var self = this;

	self.server = server;
	self.config = config;

	return _.extend(self, {
		
	});
};

module.exports = json_protocol;