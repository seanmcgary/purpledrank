/**
	file - server.js


	- Create server instances
	- Create instantiate tini-connect middleware

*/

var _ 				= require('underscore'),
	json_protocol 	= require('./protocols/json_protocol');
	sunday_protocol = require('./protocols/sunday_protocol'),
	config 			= require('./config/config');

(function(){
	var self = this;

	// TODO - handle environment to select config
	config = config.dev;

	// create protocol servers
	var json_server = new json_protocol(self, config);
	var sunday_server = new sunday_protocol(self, config);

	sunday_server.listen();


})();