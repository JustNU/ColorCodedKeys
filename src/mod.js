"use strict";

class Mod {
	postDBLoad(container) {
		// constants
		const logger = container.resolve("WinstonLogger");
		const database = container.resolve("DatabaseServer").getTables();
		const dbBots = database.bots.types;
		const config = require("../config/config.json");
		
		
}

	
module.exports = { mod: new Mod() }