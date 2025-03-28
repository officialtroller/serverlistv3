class PreferencesManager {
	constructor() {
		const self = this;

		self.onchange = function() {};
		self.changeEventListeners = new Set();

		self.themeManager = new ThemeManager(self);
		self.preferences = self.loadPreferences();
		self.themeManager.validateOptions(false, true, false);
		self.renderPreferences(self.preferences);

		/* Mode Select Bindings */
		for (let mode of ["team", "survival", "deathmatch", "modding", "custom", "invasion"]) {
			document.getElementById(`${mode}Mode`).addEventListener("change", () => {
				if (document.getElementById(`${mode}Mode`).checked) {
					if (!self.preferences.modes.includes(mode)) self.preferences.modes.push(mode);
				} else {
					if (self.preferences.modes.includes(mode)) self.preferences.modes.splice(self.preferences.modes.indexOf(mode), 1);
				}
				self.savePreferences(self.preferences);
			});
		}

		/* Region Select Bindings */
		for (let region of ["America", "Europe", "Asia"]) {
			document.getElementById(region).addEventListener("change", () => {
				self.preferences.region = document.querySelector(`input[name="region"]:checked`).id;
				self.savePreferences(self.preferences);
			});
		}

		/* Copy Full Link Binding */
		document.getElementById("preferenceCopyFullLink").addEventListener("change", () => {
			self.preferences.copyFullLinks = document.getElementById("preferenceCopyFullLink").checked;
			self.savePreferences(self.preferences);
		});

		/* Center Asteroid Map Binding */
		document.getElementById("preferenceCenterMapAsteroids").addEventListener("change", () => {
			self.preferences.centerMapOnAsteroids = document.getElementById("preferenceCenterMapAsteroids").checked;
			self.savePreferences(self.preferences);
		});

		self.themeManager.initialize();
	}

	on(eventName, handler) {
		const self = this;

		if (eventName === "change") {
			self.changeEventListeners.add(handler);
		}
	}

	loadPreferences() {
		const self = this;
		let storedPreferences;
		try {
			storedPreferences = JSON.parse(window.localStorage.getItem("preferences"));
		} catch (e) {}
		// Re-write cached root-relative theme to be relative path instead
		if (!storedPreferences) {
			let preferences = {
				region: "America",
				modes: ["team", "survival", "deathmatch", "modding", "custom"],
				copyFullLinks: false,
				centerMapOnAsteroids: false,
				theme: {}
			}
			window.localStorage.setItem("preferences", JSON.stringify(preferences));
			return preferences;
		}
		return storedPreferences;
	}

	savePreferences(preferences) {
		const self = this;

		self.onchange(preferences);

		for (let handler of self.changeEventListeners) {
			handler(preferences);
		}

		window.localStorage.setItem("preferences", JSON.stringify(preferences));

		if (preferences.modes.includes("custom")) {
			document.getElementById("shareCustomGameCard").style.display = "";
		} else {
			document.getElementById("shareCustomGameCard").style.display = "none";
		}
	}

	renderPreferences(preferences) {
		/* Mode */
		let modeInputs = {
			"team": document.getElementById("teamMode"),
			"survival": document.getElementById("survivalMode"),
			"modding": document.getElementById("moddingMode"),
			"deathmatch": document.getElementById("deathmatchMode"),
			"invasion": document.getElementById("invasionMode"),
			"custom": document.getElementById("customMode")
		}

		for (let mode of ["team", "survival", "modding", "deathmatch", "invasion", "custom"]) {
			modeInputs[mode].checked = preferences.modes.includes(mode);
		}

		if (preferences.modes.includes("custom")) {
			document.getElementById("shareCustomGameCard").style.display = "";
		} else {
			document.getElementById("shareCustomGameCard").style.display = "none";
		}

		/* Region */
		document.getElementById(preferences.region).checked = true;

		/* Copy Full Links */
		document.getElementById("preferenceCopyFullLink").checked = preferences.copyFullLinks;

		/* Center Map On Asteroids */
		document.getElementById("preferenceCenterMapAsteroids").checked = preferences.centerMapOnAsteroids;

		this.themeManager.apply();
	}
}