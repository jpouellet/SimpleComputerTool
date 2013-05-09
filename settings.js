/*
 * Makes management of settings much easier and almost completely automatic.
 */

window.settings = {
	values: {},

	hooks: {},

	init: function() {
		document.getElementById("settings").recurse(function() {
			if (this.tagName === "INPUT") {
				this.addEventListener("change", function(event) {
					var elem = event.target;

					if (elem.type === "radio")
						settings.reload();
					else
						settings.loadFromElem(event.target);

					if (settings.hooks.hasOwnProperty(elem.name)) {
						for (var i = 0; i < settings.hooks[elem.name].length; i++)
							settings.hooks[elem.name][i].call(elem, elem.value);
					}
				}, false);
			}
		});
		this.reload();
	},

	registerHook: function(name, callback) {
		if (!this.hooks.hasOwnProperty(name))
			this.hooks[name] = [];
		this.hooks[name].push(callback);
	},

	reload: function() {
		this.values = {};
		document.getElementById("settings").recurse(function(elem) {
			if (elem.tagName === "INPUT") {
				this.loadFromElem(elem);
			}
		}, this);
	},

	loadFromElem: function(elem) {
		if (!elem.name || !elem.value)
			return;

		if (this.values.hasOwnProperty(elem.name)) {
			if (elem.type !== "radio")
				warn("multiple input elements with name \"" + elem.name + "\"");
		} else {
			this.values[elem.name] = null;
		}

		switch (elem.type) {
		case "radio":
			if (elem.checked)
				this.values[elem.name] = elem.value;
			break;
		case "checkbox":
			this.values[elem.name] = elem.checked;
			break;
		case "text":
			this.values[elem.name] = elem.value;
			break;
		case "number":
			this.values[elem.name] = parseFloat(elem.value);
			break;
		default:
			warn("unknown input element of type " + elem.type);
		}
	},

	get: function(key) {
		return this.values[key];
	}
};
