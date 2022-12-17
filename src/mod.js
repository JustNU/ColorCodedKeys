"use strict";

class Mod {
	postDBLoad(container) {
		// constants
		const logger = container.resolve("WinstonLogger");
		const database = container.resolve("DatabaseServer").getTables();
		const jsonUtil = container.resolve("JsonUtil");
		const VFS = container.resolve("VFS");
		const config = require("../config/config.json");
		const modDb = jsonUtil.deserialize(VFS.readFile("user/mods/ColorCodedKeys/db/keys.json"));
		const modLocalePath = `user/mods/ColorCodedKeys/locale`;
		const localeEn = jsonUtil.deserialize(VFS.readFile(`${modLocalePath}/en.json`));
		
		// da code
		// to do: rewrite this piece of shit code, and a note: sleep deprivation does not help you code
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
						let ogDesc = database.locales.global[localeId].templates[keyId].Description;
						
						// apply placeholder en locale first
						let tempString = `${localeEn.mapString}: ${database.locales.global[localeId].interface[mapId]}.\n${Mod.isConfigQuestsEnabled(config, keyId, modDb, localeEn)}\n`;
						database.locales.global[localeId].templates[keyId].Description = tempString + ogDesc;
						
						// auto detecet locale and apply it
						if (VFS.exists(`${modLocalePath}/${localeId}.json`)) {
							let loadedLocale = jsonUtil.deserialize(VFS.readFile(`${modLocalePath}/${localeId}.json`));
							let newString = `${loadedLocale.mapString}: ${database.locales.global[localeId].interface[mapId]}.\n${Mod.isConfigQuestsEnabled(config, keyId, modDb, loadedLocale)}\n`;
							
							database.locales.global[localeId].templates[keyId].Description = newString + ogDesc;
						};
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
	
	static isUsedInQuests(keyId, modDb, locale) {
		if (modDb.KeysUsedInQuest.includes(keyId)) {
			return locale.yes;
		};
		
		return locale.no;
	}
	
	static isConfigQuestsEnabled(config, keyId, modDb, locale) {
		if (config.AddIfUsedInQuestsToDesc) {
			return `${locale.questString}: ${Mod.isUsedInQuests(keyId, modDb, locale)}.\n`;
		};
		
		return "";
	}
	
}
	
module.exports = { mod: new Mod() }