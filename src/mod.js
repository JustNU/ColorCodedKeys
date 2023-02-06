"use strict";

class Mod {
	postDBLoad(container) {
		// constants
		const logger = container.resolve("WinstonLogger");
		const database = container.resolve("DatabaseServer").getTables();
		const jsonUtil = container.resolve("JsonUtil");
		const VFS = container.resolve("VFS");
		const modLoader = container.resolve("PreAkiModLoader");
		const modPath = modLoader.getModPath("Color-coded Keys");
		const config = require("../config/config.json");
		const data = require(`../db/items/itemData.json`);
		const localeEn = require(`../db/locale/en.json`);
		
		// da code
		// to do: rewrite this piece of shit code, and a note: sleep deprivation does not help you code
		for (const mapId in data.Maps) {
			for (const keyId of data.Maps[mapId]) {
				if (database.templates.items[keyId]) {
					// change background color
					// marked key check
					if (!config.ChangeMarkedKeysBackground && data.MarkedKeys.includes(keyId)) {
						database.templates.items[keyId]._props.BackgroundColor = "yellow";
					} else {
						database.templates.items[keyId]._props.BackgroundColor = config.BackgroundColor[database.locales.global["en"][mapId]];
					}
					
					// change locale
					for (const localeId in database.locales.global) {
						const ogDesc = database.locales.global[localeId][`${keyId} Description`];
						
						// apply placeholder en locale first
						const tempString = `${localeEn.mapString}: ${database.locales.global[localeId][mapId]}.\n${Mod.isConfigQuestsEnabled(config, keyId, data, localeEn)}\n`;
						database.locales.global[localeId][`${keyId} Description`] = tempString + ogDesc;
						
						// auto detecet locale and apply it
						if (VFS.exists(`${modPath}locale/${localeId}.json`)) {
							const loadedLocale = jsonUtil.deserialize(VFS.readFile(`${modPath}locale/${localeId}.json`));
							const newString = `${loadedLocale.mapString}: ${database.locales.global[localeId][mapId]}.\n${Mod.isConfigQuestsEnabled(config, keyId, data, loadedLocale)}\n`;
							
							database.locales.global[localeId][`${keyId} Description`] = newString + ogDesc;
						}
					}
				}
			}
		}
		
		// handle junk keys
		for (const junkKeyId of data.JunkKeys) {
			if (database.templates.items[junkKeyId]) {
				database.templates.items[junkKeyId]._props.BackgroundColor = config.BackgroundColor.JunkKeys;
			}
		}
		
	}
	
	static isUsedInQuests(keyId, data, locale) {
		if (data.KeysUsedInQuest.includes(keyId)) {
			return locale.yes;
		}
		
		return locale.no;
	}
	
	static isConfigQuestsEnabled(config, keyId, data, locale) {
		if (config.AddIfUsedInQuestsToDesc) {
			return `${locale.questString}: ${Mod.isUsedInQuests(keyId, data, locale)}.\n`;
		}
		
		return "";
	}
	
}
	
module.exports = { mod: new Mod() }