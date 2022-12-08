"use strict";

class Mod {
	postDBLoad(container) {
		// constants
		const logger = container.resolve("WinstonLogger");
		const database = container.resolve("DatabaseServer").getTables();
		const JsonUtil = container.resolve("JsonUtil");
		const VFS = container.resolve("VFS");
		const config = require("../config/config.json");
		const modDb = JsonUtil.deserialize(VFS.readFile("user/mods/ColorCodedKeys/db/keys.json"))
		const modLocalePath = `user/mods/ColorCodedKeys/locale/`
		
		
		// da code
		for (const mapId in modDb.Maps) {
			for (const keyId of modDb.Maps[mapId]) {
				if (database.templates.items[keyId]) {
					// change background color
					// marked key check
					if (!config.ChangeMarkedKeysBackground && modDb.MarkedKeys.includes(keyId)) {
						database.templates.items[keyId]._props.BackgroundColor = "yellow";
					} else {
						database.templates.items[keyId]._props.BackgroundColor = config.BackgroundColor[database.locales.global["en"].interface[mapId]];
					};
					
					// change locale
					for (const localeId in database.locales.global) {
						let ogDesc = database.locales.global[localeId].templates[keyId].Description
						let newLocale = `Map: ${database.locales.global[localeId].interface[mapId]}.\n${Mod.isConfigQuestsEnabled(config, keyId, modDb)}.\n`
						database.locales.global[localeId].templates[keyId].Description = newLocale + ogDesc
					};
				};
			};
		};
		
		// handle junk keys
		for (const junkKeyId of modDb.JunkKeys) {
			if (database.templates.items[junkKeyId]) {
				database.templates.items[junkKeyId]._props.BackgroundColor = config.BackgroundColor.JunkKeys;
			};
		};
		
	}
	
	static isUsedInQuests(keyId, modDb) {
		if (modDb.KeysUsedInQuest.includes(keyId)) {
			return "Yes";
		};
		
		return "No";
	}
	
	static isConfigQuestsEnabled(config, keyId, modDb) {
		if (config.AddIfUsedInQuestsToDesc) {
			return `Used in Quests: ${Mod.isUsedInQuests(keyId, modDb)}\n`;
		};
		
		return "";
	}
	
}
	
module.exports = { mod: new Mod() }