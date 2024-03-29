var _		= require('underscore'),
	async 	= require('async');

var drink_machine = function(socket, tini_data, machine_server, config){
	var self = this;

	self.socket = socket;
	self.tini_data = tini_data;
	self.machine_server = machine_server;
	self.config = config;

	self.awaiting_callback = null;

	// command queue
	self.queue = async.queue(function(job, callback){
		// set up the callback for when the tini response
		self.awaiting_callback = function(status){
			console.log('queue callback' + status);
			callback(status);
		};

		// fire the command
		job.command()
	}, 1);

	var recv_data = '';
	socket.on('error', function(){
		console.log("ERROR");
	});

	socket.on('end', function(){
		self.socket = null;
		console.log('[' + self.tini_data.long_name + ']    - connection lost');
		self.machine_server.machine_disconnected(self.tini_data.aliases[0]);
	});

	socket.on('data', function(data){
		data = data.toString();

		recv_data += data;

		// if its a new line, we're done receiving data
		if(recv_data[recv_data.length - 1] == '\n'){

			// replace newlines and whitespace/pipe with nothing
			var message = recv_data.replace(/\n+/g, '').replace(/^\s+|\s+$/g, '');

			// zero out recv_data to prep for next message
			recv_data = '';
			//console.log(message);
			//console.log('--------------');
			// first character of the message is the message code
			switch(message[0]){
				case '0': // auth - 0 <password>\n
					console.log('[' + self.tini_data.long_name + ']    - acking login');
					self.send("1\n", function(){

					});
					break;

				case '4': // drop ack - 4\n
					self.awaiting_callback('ack');
					break;
				case '5': // drop nack - 5\n
				self.awaiting_callback('nack');
					break;
				case '7': // stat - 7\n <slot num> <empty>...\n
					break;
				case '8': // 8 <temp (double)\n
					// TODO - log temp
					var temp = message.split(' ')[1];
					console.log('[' + self.tini_data.long_name + ']    - temp: ' + temp);
					break;
				case '9': // 9\n - noop
					break;
			}

		} else {
			// otherwise, add a space
			recv_data += " ";
		}
	});

	return _.extend(self, {
		drop: function(slot, delay, callback){
			var self = this;	

			console.log('delaying ' + delay + ' seconds');
			setTimeout(function(){	
				// after the delay, queue the request

				var job = {
					command: function(){
						self.send("3" + slot + "\n");
					}
				};

				self.queue.push(job, function(){
					// this will be called back to when a response is received
					console.log(arguments);
				});
			}, delay * 1000);
		},
		stat: function(callback){
			// TODO - make call to tini to get the status
		},
		send: function(msg, callback){
			var self = this;

			try {
				self.socket.write(msg);
				callback(null);
			} catch(e){
				// TODO - log error
				// TODO - mark machine as disconnected
				callback(true);
			}
		}
	});
};

module.exports = drink_machine;