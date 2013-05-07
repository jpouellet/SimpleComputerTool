/*
 * A better simulator, because trying to use qsim to track code execution
 * is like trying to use a screwdriver to eat a pancake.
 */

"use strict";

function Simulation(program) {
	this.R = new Int16Array(8);
	this.M = new Int16Array(0xFFFF);
	this.PC = 0;

	// Not really used by anything...
	this.V = false;
	this.C = false;
	this.N = false;
	this.Z = false;

	this.program = program;
}
Simulation.prototype = {
	step: function() {
	},

	run: function() {
	},

	getState: function() {
	}
};
