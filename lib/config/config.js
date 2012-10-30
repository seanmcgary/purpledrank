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
		},
		'drop': {
			num_args: 2,
			max_args: 3,
			usage: 'DROP slot [delay]'
		}
	},
	errors: {
		// command errors
		"400": "ERR 400: Bad command",
		"401": "ERR 401: Usage - ",

		// machine errors
		"500": "ERR 500: Slot empty"
	},
	tini_whitelist: {}	
};

var production = {

};

var dev = {
	tini_whitelist: {
		'127.0.0.1': {
			aliases: ['ld', 'littledrink'],
			long_name: 'Little Drink',
			has_sensor: false
		}
	}
};

exports.production = _.extend(_.clone(base), production);
exports.dev = _.extend(_.clone(base), dev);