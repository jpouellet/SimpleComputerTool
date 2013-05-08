/*
 * A better assembler, because numeric instruction offsets everywhere leads to
 * frustration, and frustration leads to the dark side.
 */

// Sorry for breaking 80 chars some places in here. The alternative was worse.

"use strict";

function Instruction(representation) {
	representation = representation.trim();

	this.source = representation;
	this.program = undefined;
	this.sourceLine = undefined;
	this.bytecode = undefined;

	/*
	 * This code looks ugly because of all the error checking it does,
	 * but error checking is good.
	 */

	var hex = Program.prototype.bytecodePattern.exec(representation);
	var asm = Program.prototype.instructionPattern.exec(representation);
	if (hex) {
		this.bytecode = parseInt(hex[1], 16);
	} else if (asm) {
		var found = false;
		for (var i = 0; i < 0x7F; i++) {
			// sorry about > 80 chars, but it's uglier if i try to wrap it.
			if (CPU[i] === undefined)
				continue;
			if (!CPU[i].mnemonic || !CPU[i].format)
				throw {name: "InternalError", message: "operation " + i + " is not fully implemented. check cpu.js"};

			if (CPU[i].mnemonic !== asm[1])
				continue;

			found = true;

			this.DR = undefined;
			this.SA = undefined;
			this.SB = undefined;
			this.OP = undefined;
			this.AD = undefined;

			var args = asm.sliceDefined(2);
			if (CPU[i].format.length != args.length)
				throw {name: "InternalError", message: CPU[i].mnemonic + " expects " + CPU[i].format.join(", ") + " but " + args.length + " arguments given"};

			for (var j = 0; j < CPU[i].format.length; j++) {
				// eww, repetition, but its somewhat unique per type, so idk how to do it better
				switch (CPU[i].format[j]) {
				case "DR":
					if (this.DR === undefined)
						this.DR = cStyleParseInt(args[j]);
					else
						throw {name: "InternalError", message: "argument " + (j+1) + " has duplicate type " + CPU[i].format[j] + " in opcode " + i};
					if (this.DR > 7 || this.DR < 0)
						throw {name: "RangeError", message: "DR (argument " + (j+1) + ") is out of bounds (" + this.DR + ")"};
					break;
				case "SA":
					if (this.SA === undefined)
						this.SA = cStyleParseInt(args[j]);
					else
						throw {name: "InternalError", message: "argument " + (j+1) + " has duplicate type " + CPU[i].format[j] + " in opcode " + i};
					if (this.SA > 7 || this.SA < 0)
						throw {name: "RangeError", message: "SA (argument " + (j+1) + ") is out of bounds (" + this.SA + ")"};
					break;
				case "SB":
					if (this.SB === undefined)
						this.SB = cStyleParseInt(args[j]);
					else
						throw {name: "InternalError", message: "argument " + (j+1) + " has duplicate type " + CPU[i].format[j] + " in opcode " + i};
					if (this.SB > 7 || this.SB < 0)
						throw {name: "RangeError", message: "SB (argument " + (j+1) + ") is out of bounds (" + this.SB + ")"};
					break;
				case "OP":
					if (this.OP === undefined)
						this.OP = cStyleParseInt(args[j]);
					else
						throw {name: "InternalError", message: "argument " + (j+1) + " has duplicate type " + CPU[i].format[j] + " in opcode " + i};
					if (this.OP > 7 || this.OP < 0)
						throw {name: "RangeError", message: "OP (argument " + (j+1) + ") is out of bounds (" + this.OP + ")"};
					break;
				case "AD":
					if (this.AD === undefined)
						this.AD = cStyleParseInt(args[j]);
					else
						throw {name: "InternalError", message: "argument " + (j+1) + " has duplicate type " + CPU[i].format[j] + " in opcode " + i};
					if (this.AD > 31 || this.AD < -32) // i think this is right, but not 100% sure.
						throw {name: "RangeError", message: "AD (argument " + (j+1) + ") is out of bounds (" + this.AD + ")"};
					break;
				default:
					throw {name: "InternalError", message: "argument " + j + " has unknown type " + CPU[i].format[j] + " in opcode " + i};
				}
			}

			this.bytecode = i << 9;

			// type detection could be more robust and provide validation for CPU.format arrays
			if (this.DR !== undefined)
				this.bytecode |= this.DR << 6;
			if (this.SA !== undefined)
				this.bytecode |= this.SA << 3;
			if (this.SB !== undefined)
				this.bytecode |= this.SB;
			if (this.OP !== undefined)
				this.bytecode |= this.OP;
			if (this.AD !== undefined) {
				if (this.AD < 0) {
					// eww. there MUST be a better way to do this
					var mag = Math.abs(this.AD + 1);
					this.bytecode |= !(mag &  1)      |
							 !(mag &  2) << 1 |
							 !(mag &  4) << 2 |
							 !(mag &  8) << 6 |
							 !(mag & 16) << 7 |
							 !(mag & 32) << 8 |
							 1           << 9;
				} else {
					this.bytecode |= (this.AD & 7) | ((this.AD & 0xC0) << 3);
				}
			}
		}

		if (!found)
			throw {name: "InputError", message: "unknown instruction: " + asm[1]};
	} else {
		throw {name: "InputError", message: "unrecognized instruction format: " + representation};
	}
}
Instruction.prototype = {
	getOpcodeValue: function() {
		return (this.bytecode & 0xFE00) >> 9;
	},

	getOperandValue: function(name) {
		switch (name) {
		case "DR": // [8:6]
			return (this.bytecode & 0x01C0) >> 6;
		case "SA": // [5:3]
			return (this.bytecode & 0x0038) >> 3;
		case "SB": // [2:0]
		case "OP": // same thing
			return this.bytecode & 0x0007;
		case "AD": // se {[8:6], [2:0]}
			var l = (this.bytecode & 0x00C0) >> 3; // left 2 bits
			var r = this.bytecode & 0x0007; // right 3 bits
			var v = l | r; // magnitude
			if (this.bytecode & 0x0100) {
				// 2's compliment sign extend
				v = (v * -1) - 1;
			}
			return v;
		default:
			return undefined;
		}
	},

	toBytecodeString: function() {
		var str = this.bytecode.toString(16);
		while (str.length < 4)
			str = "0" + str;
		return str;
	},

	toAssemblyString: function(align, rPrefix) {
		var instruction = CPU[this.getOpcodeValue()];
		if (instruction === undefined)
			return undefined;

		var mnemonic = instruction.mnemonic;
		if (mnemonic === undefined)
			return undefined;

		var format = instruction.format;
		if (format === undefined || !format.length) // falsy because we want to catch 0 and undefined
			return undefined;

		var values = format.map(function(op) {
			var val = this.getOperandValue(op);
			if (rPrefix && (op === "DR" || op === "SA" || op === "SB"))
				val = "r" + val;
			return val;
		}, this); // passing this shouldn't be necessary, but i hear it's broken in some browsers.

		if (align)
			while (mnemonic.length < 4)
				mnemonic += " ";

		return mnemonic + " " + values.join(", ");
	},
};

function Program(source) {
	this.labels = {};
	this.instructions = [];

	var lines = source.split("\n");

	// resolve all the labels so we can be more intelligent about them
	var pcIndex = 0;
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();

		if (this.instructionPattern.test(line))
			pcIndex++;

		var label = this.labelPattern.exec(line);
		if (label != null)
			this.labels[label[1]] = {index: pcIndex, line: i, used: false};
	}

	if (!this.propertyIsEnumerable("labels"))
		warn("your browser seems to not support property enumeration, things might not work correctly");

	// compile all the things
	for (var i = 0; i < lines.length; i++) {
		var realLine = lines[i].trim();

		// It would be nice to handle comments better
		line = lines[i].replace(this.commentRemovalPattern, "").trim();

		if (line === "")
			continue;

		if (this.commentPattern.test(line) ||
		    this.labelPattern.test(line))
			continue;

		if (this.bytecodePattern.test(line)) {
			var op;
			try {
				op = new Instruction(line);
			} catch (e) {
				throw {name: "SyntaxError", message: "[" + e.name + "] " + e.message, line: i};
			}
			op.program = this;
			op.sourceLine = i;
			op.source = realLine;
			this.instructions.push(op);
			continue;
		}

		var asm = this.instructionPattern.exec(line);
		if (asm) {
			var opcode = asm[1].toUpperCase();
			var args = asm.sliceDefined(2);

			// resolve labels
			for (var label in this.labels) {
				for (var j = 0; j < args.length; j++) {
					if (args[j] === label) {
						args[j] = this.labels[label].index;
						this.labels[label].used = true;
					}
				}
			}

			// make sure we dont have any undefined symbols
			for (var j = 0; j < args.length; j++) {
				args[j] = cStyleParseInt(args[j]);
				if (args[j] === NaN)
					throw {name: "SyntaxError", message: "argument " + (j+1) + " is invalid", line: i};
			}

			var op;
			try {
				op = new Instruction(opcode + " " + args.join(", "));
			} catch (e) {
				throw {name: "SyntaxError", message: "[" + e.name + "] " + e.message, line: i};
			}
			op.program = this;
			op.sourceLine = i;
			op.source = realLine;
			this.instructions.push(op);
			continue;
		}

		throw {name: "SyntaxError", message: "unknown instruction format", line: i};
	}

	// make sure we used all the labels
	var firstBadLine = undefined;
	for (var label in this.labels) {
		if (!this.labels[label].used) {
			warn("unused label \"" + label + "\" on line " + this.labels[label].line);
			selectLine(this.labels[label].line);
			if (firstBadLine !== undefined)
				firstBadLine = this.labels[label].index;
		}
	}
	if (firstBadLine !== undefined)
		selectLine(firstBadLine);
}
Program.prototype = {
	toBytecodeString: function() {
	},

	toAssemblyString: function() {
		return this.instructions.map(function(line) { return line.toAssemblyString(); }).join("\n");
	},

	// regexes in prototype to avoid duplicated compilation on instantiation
	commentRemovalPattern: new RegExp("(?:#|//).*"),
	commentPattern: new RegExp("^(?:\\/\\/|#)\s*(.*)$"),
	instructionPattern: (function() {
		var hex = "-?0x[0-9a-fA-F]+";
		var dec = "-?[0-9]+";
		var oct = "-?\\\\[0-7]+";
		var label = "[a-zA-Z\\._][0-9a-zA-Z\\._]*";
		var arg = "r?("+hex+"|"+dec+"|"+oct+"|"+label+")";
		var optarg = "(?:,\\s+"+arg+")?";
		var opcode = "([a-zA-Z]+)";
		var pattern = "^"+opcode+"\\s+"+arg+optarg+optarg+"$";
		return new RegExp(pattern);
	}()),
	bytecodePattern: new RegExp("^(?:0x)?([0-9a-fA-F]{4})$"),
	labelPattern: new RegExp("^([a-zA-Z\\._][0-9a-zA-Z\\._]*):$")
};

if (Program.prototype.commentPattern === undefined ||
    Program.prototype.instructionPattern === undefined ||
    Program.prototype.bytecodePattern === undefined ||
    Program.prototype.labelPattern === undefined)
	warn("Your browser does not support regular expressions.");
