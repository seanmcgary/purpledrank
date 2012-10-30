var _ = require('underscore');


var base = {
	json_protocol_port			: 4141,
	sunday_protocol_port		: 4242,
	tini_server_port			: 4343,
	sunday_protocol_commands 	: {
		'quit': {
			num_args: 1,
			usage: 'QUIT'
		},
		'auth': {
			num_args: 3,
			usage: 'AUTH username password'
		},
		'user': {
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
		},
		'machines': {
			num_args: 1,
			usage: 'MACHINES'
		},
		"getbalance": {
			num_args: 1,
			usage: "GETBALANCE"
		}
	},
	errors: {
		OK: "OK:",

		// command errors
		"400": "ERR 400: Bad command",
		"401": "ERR 401: Usage - ",
		"402": "ERR 402: Username required",
		"403": "ERR 403: Invalid username/password or ibutton",
		"404": "ERR 404: You need to log in",
		"405": "ERR 405: User doesnt exist",

		// machine errors and states
		"500": "ERR 500: Slot empty",
		"501": "ERR 501: No machines connected"
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