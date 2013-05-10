/*
 * A better simulator, because trying to use qsim to track code execution
 * is like trying to use a screwdriver to eat a pancake.
 */

"use strict";

function State(simulation) {
	this.PC = simulation.PC;
	this.R = new Int16Array(simulation.R);
	this.M = new Int16Array(simulation.M);
	this.tick = simulation.tick;
	this.simulation = simulation;
}
State.prototype = {
	equals: function(other) {
		// there should really be a memcmp() type function for typed arrays

		if (this.R.length !== other.R.length ||
		    this.M.length !== other.M.length ||
		    this.PC !== other.PC)
			return false;

		for (var i = 0; i < this.R.length; i++)
			if (this.R[i] !== other.R[i])
				return false;

		for (var i = 0; i < this.M.length; i++)
			if (this.M[i] !== other.M[i])
				return false;

		return true;
	},

	getTR: function() {
		var tr = document.createElement("tr");

		var PC = document.createElement("td");
		PC.textContent = this.PC.toString(settings.get("radix"));
		tr.appendChild(PC);

		var asm = document.createElement("td");
		asm.textContent = this.simulation.program.instructions[this.PC].toAssemblyString(settings.get("align_ops"), settings.get("r_prefix"));
		tr.appendChild(asm);

		for (var i = 0; i < this.R.length; i++) {
			var r = document.createElement("td");
			r.textContent = this.R[i].toString();
			tr.appendChild(r);
		}

		return tr;
	}
}

function Simulation(program) {
	this.R = new Int16Array(8);
	this.M = new Int16Array(0xFFFF);
	this.PC = 0;

	this.tick = 0;

	this.program = program;

	this.stateStack = [];
}
Simulation.prototype = {
	isAtEnd: function() {
		return this.program.instructions[this.PC] === undefined;
	},

	step: function() {
		if (this.isAtEnd())
			throw {name: "InternalError", message: "no more instructions to execute"};

		var instruction = this.program.instructions[this.PC];
		var args = instruction.getArgValueArray();
		args.unshift(this);
		CPU[instruction.getOpcodeValue()].implementation.apply(CPU, args);

		this.tick++;
	},

	run: function() {
		while (!this.isAtEnd()) {
			var pcBackup = this.PC;
			this.step();
			this.makeSnapshot();
			if (this.PC !== pcBackup + 1) {
				if (this.isStuck())
					break;
			}
		}
	},

	isStuck: function() {
		var lastState = this.stateStack[this.stateStack.length - 1];
		for (var i = this.stateStack.length - 2; i >= 0; i--) {
			if (lastState.equals(this.stateStack[i]))
				return true;
		}

		return false;
	},

	makeSnapshot: function() {
		this.stateStack.push(new State(this));
	},

	getTable: function() {
		var table = document.createElement("table");

		var tr = document.createElement("tr");

		var PC = document.createElement("th");
		PC.textContent = "PC";
		tr.appendChild(PC);

		var asm = document.createElement("th");
		asm.textContent = "Instruction";
		tr.appendChild(asm);

		for (var i = 0; i < this.R.length; i++) {
			var r = document.createElement("th");
			r.textContent = "R" + i;
			tr.appendChild(r);
		}

		table.appendChild(tr);

		for (var i = 0; i < this.stateStack.length; i++)
			table.appendChild(this.stateStack[i].getTR());

		return table;
	}
};
