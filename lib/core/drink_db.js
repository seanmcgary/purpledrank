var _ 		= require('underscore'),
	mysql 	= require('mysql');


var drink_db = function(){
	var self = this;

	return _.extend(self, {
		create_connection: function(){
			var self = this;

			return mysql.createConnection({
				host: '',
				user: '',
				password: '',
				database: ''
			});
		},
		get_machine_items: function(alias, callback){
			var self = this;

			var query = 	"SELECT * \
								FROM slots \
								LEFT JOIN drink_items USING(item_id) \
								WHERE machine_id=( \
									SELECT machine_id \
										FROM machine_aliases \
										WHERE alias='" + alias + "' \
								)\
								ORDER BY slot_num ASC";

			var db = self.create_connection();
			db.query(query, function(err, results, fields){
				if(err === null){
					db.end();
					return callback(null, results);
				} else {
					db.end();
					return callback(true, err);
				}
			});
		},
		update_slot_count: function(alias, slot, count, callback){
			var self = this;

			var query = "\
				UPDATE slots \
					SET available=" + count + "\
					WHERE\
						slot_num=" + slot + "\
						AND\
						machine_id=(\
							SELECT machine_id\
								FROM machine_aliases\
								WHERE alias='" + alias + "'\
						)";
			var db = self.create_connection();

			db.query(query, function(err, results, fields){
				if(err === null){
					db.end();
					return callback(null, results);
				} else {
					db.end();
					return callback(true, err);
				}
			});
		},
		log_drop: function(alias, slot, username, item_id, callback){
			var self = this;

			var query = "\
				INSERT INTO drop_log(status, machine_id, slot, username, item_id, current_item_price)\
					VALUES(\
						'ok',\
						(\
							SELECT machine_id\
								FROM machine_aliases\
								WHERE alias='" + alias + "'\
						),\
						" + slot + ",\
						'" + username + "',\
						" + item_id + ",\
						(\
							SELECT item_price\
								FROM drink_items\
								WHERE item_id=" + item_id + "\
						)\
					)";
			
			var db = self.create_connection();
			db.query(query, function(err, results, fields){
				if(err === null){
					db.end();

					self.insert_money_log(username, item_id, function(err, res){
						if(err === null){
							self.decrement_slot(slot, alias, function(err, res){
								if(err === null){
									return callback(null, res);
								} else {
									return callback(true, err);
								}
							});
						} else {
							return callback(true, err);
						}
					});
				} else {
					db.end();
					return callback(true, err);
				}
			});
		},
		decrement_slot: function(slot, alias, callback){
			var self = this;

			var query = "\
				UPDATE slots\
					SET available=available - 1\
					WHERE available > 0\
					AND slot_num=" + slot + "\
					AND machine_id=(\
						SELECT machine_id\
							FROM machine_aliases\
							WHERE alias='" + alias + "'\
					)";
			var db = self.create_connection();

			db.query(query, function(err, results, fields){
				if(err === null){
					db.end();
					return callback(null, results);
				} else {
					db.end();
					return callback(true, err);
				}
			});
		},
		insert_money_log: function(username, item_id, callback){
			var self = this;

			var query = "\
				INSERT INTO money_log(username, admin, amount, direction, reason)\
					VALUES(\
						'" + username + "',\
						'drink',\
						(SELECT item_price\
							FROM drink_items\
							WHERE item_id=" + item_id + "\
						) * -1,\
						'out',\
						'drop'\
					)";
			
			var db = self.create_connection();

			db.query(query, function(err, res){
				if(err === null){
					db.end();
					return callback(null, res);
				} else {
					db.end();
					return callback(true, err);
				}
			});
		}
	});
};

module.exports = drink_db;

var db = new drink_db();

/*db.get_machine_items('ld', function(err, items){
	console.log(items);
});

db.update_slot_count('ld', 4, 1, function(err, res){
	console.log(arguments);
});*/

//db.log_drop('ld', 4, 'mcg1sean', 8, function(){
//	console.log(arguments);
//})