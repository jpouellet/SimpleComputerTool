/*
 * "Simple Computer" instruction set emulator. See table 9-8 on page 469 of
 * Logic and Computer Design Fundamentals (4th edition). Also available from:
 * http://writphotec.com/mano4/Figures_Tables/Fig_&_Tbl_Chapter_9.pdf
 * Note that CPU.<opcode>.format differs from the "format" field in table 9-8.
 * The table in the book uses RD, RA, and RB in the format field and DR, SA, and
 * SB everywhere else, so DR, SA, and SB are used everywhere here for
 * consistency.
 */

"use strict";

var CPU = {

0x00: {
	instruction: "Move A",
	mnemonic: "MOVA",
	format: ["DR", "SA"],
	implementation: function(/* Simulation */ s, DR, SA) {
		s.R[DR] = s.R[SA];
		s.PC++;
	}
},

0x01: {
	instruction: "Increment",
	mnemonic: "INC",
	format: ["DR", "SA"],
	implementation: function(s, DR, SA) {
		s.R[DR] = s.R[SA] + 1;
		s.PC++;
	}
},

0x02: {
	instruction: "Add",
	mnemonic: "ADD",
	format: ["DR", "SA", "SB"],
	implementation: function(s, DR, SA, SB) {
		s.R[DR] = s.R[SA] + s.R[SB];
		s.PC++;
	}
},

0x05: {
	instruction: "Subtract",
	mnemonic: "SUB",
	format: ["DR", "SA", "SB"],
	implementation: function(s, DR, SA, SB) {
		s.R[s.DR] = s.R[s.SA] - s.R[s.SB];
		s.PC++;
	}
},

0x06: {
	instruction: "Decrement",
	mnemonic: "DEC",
	format: ["DR", "SA"],
	implementation: function(s, DR, SA) {
		s.R[DR] = s.R[SA] - 1;
		s.PC++;
	}
},

0x08: {
	instruction: "AND",
	mnemonic: "AND",
	format: ["DR", "SA", "SB"],
	implementation: function(s, DR, SA, SB) {
		s.R[DR] = s.R[SA] & s.R[SB];
		s.PC++;
	}
},

0x09: {
	instruction: "OR",
	mnemonic: "OR",
	format: ["DR", "SA", "SB"],
	implementation: function(s, DR, SA, SB) {
		s.R[DR] = s.R[SA] | s.R[SB];
		s.PC++;
	}
},

0x0A: {
	instruction: "Exclusive OR",
	mnemonic: "XOR",
	format: ["DR", "SA", "SB"],
	implementation: function(s, DR, SA, SB) {
		s.R[DR] = s.R[SA] ^ s.R[SB];
		s.PC++;
	}
},

0x0B: {
	instruction: "NOT",
	mnemonic: "NOT",
	format: ["DR", "SA"],
	implementation: function(s, DR, SA) {
		s.R[DR] = ~s.R[SA];
		s.PC++;
	}
},

0x0C: { // why does this instruction exist? we have MOVA...
	instruction: "Move B",
	mnemonic: "MOVB",
	format: ["DR", "SB"],
	implementation: function(s, DR, SB) {
		s.R[DR] = s.R[SB];
		s.PC++;
	}
},

0x0D: {
	instruction: "Shift Right",
	mnemonic: "SHR",
	format: ["DR", "SB"],
	implementation: function(s, DR, SB) {
		s.R[DR] = s.R[SB] >> 1;
		s.PC++;
	}
},

0x0E: {
	instruction: "Shift Left",
	mnemonic: "SHL",
	format: ["DR", "SB"],
	implementation: function(s, DR, SB) {
		s.R[DR] = s.R[SB] << 1;
		s.PC++;
	}
},

0x4C: {
	instruction: "Load Immediate",
	mnemonic: "LDI",
	format: ["DR", "OP"],
	implementation: function(s, DR, OP) {
		s.R[DR] = OP;
		s.PC++;
	}
},

0x42: {
	instruction: "Add Immediate",
	mnemonic: "ADI",
	format: ["DR", "SA", "OP"],
	implementation: function(s, DR, SA, OP) {
		s.R[DR] = s.R[SA] + OP;
		s.PC++;
	}
},

0x10: {
	instruction: "Load",
	mnemonic: "LD",
	format: ["DR", "SA"],
	implementation: function(s, DR, SA) {
		s.R[DR] = s.M[SA];
		s.PC++;
	}
},

0x20: {
	instruction: "Store",
	mnemonic: "ST",
	format: ["SA", "SB"],
	implementation: function(s, SA, SB) {
		s.R[SA] = s.R[SB];
		s.PC++;
	}
},

0x60: {
	instruction: "Branch on Zero",
	mnemonic: "BRZ",
	format: ["SA", "AD"],
	implementation: function(s, SA, AD) {
		if (s.R[SA] == 0)
			s.PC += AD;
		else
			s.PC++;
	}
},

0x61: {
	instruction: "Branch on Negative",
	mnemonic: "BRN",
	format: ["SA", "AD"],
	implementation: function(s, SA, AD) {
		if (s.R[SA] < 0)
			s.PC += AD;
		else
			s.PC++;
	}
},

0x70: {
	instruction: "Jump",
	mnemonic: "JMP",
	format: ["SA"],
	implementation: function(s, SA) {
		s.PC = s.R[SA];
	}
},

} // CPU
