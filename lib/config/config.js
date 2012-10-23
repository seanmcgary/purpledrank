var _ = require('underscore');


var base = {
	json_protocol_port			: 4141,
	sunday_protocol_port		: 4242,
	tini_server_port			: 4343,
	sunday_protocol_commands 	: {
		'user' : {
			num_args: 2,
			usage: 'USER username'
		},
		'pass': {
			num_args: 2,
			usage: 'PASS password'
		},
		'ibutton': {
			num_args: 2,
			usage: 'IBUTTON ibutton'
		},
		'stat': {
			num_args: 2,
			usage: 'STAT machine_alias'
		},
		'machine': {
			num_args: 2,
			usage: 'MACHINE machine_alias'
		}
	}	
};

var production = {

};

var dev = {

};

exports.production = _.extend(_.clone(base), production);
exports.dev = _.extend(_.clone(base), dev);