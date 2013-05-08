# Simple Computer Tool

## Info

This is an assembler, disassembler, and simulator for the Simple Computer
described in chapter 9 of Logic and Computer Design Fundamentals (4th edition).

You can download the figues and tables from the chapter here:
<http://writphotec.com/mano4/Figures_Tables/Fig_&_Tbl_Chapter_9.pdf>

I wrote this for Virginia Tech's ECE-2504 class. We had a homework assignment
in which we had to write a bit of assembly, but the provided assembler for the
processor we had to use was very rudimentary. So, instead of just deal with it
and do the homework like everybody else, I first wrote a better assembler.

## Assembly Format

Comments start with `//` or `#`.
Comments may appear on the same line as instructions.

Assembly instructions are specified like so:

    MNEMONIC OP[, OP[, OP]]

Bytecode instructions are specified as 4 hex digits.

Assembly and bytecode may be mixed at will
(useful when implementing new instructions).

Values are given in C-style syntax:

* `0xBEEF` for base 16
* `1984` for base 10
* `\007` for base 8

with an optional `-` after the radix specifier prefix to denote a negative
value.

Additional whitespace is allowed anywhere.

To keep backwards compatibility, values may be prefixed with 'r',
and opcodes may be lower case.

## Notes

The simulator isn't fully implemented yet, but most of the needed underlaying
functionality is there.
