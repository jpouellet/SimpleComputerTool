/*
 * General utility stuff.
 */

/*
 * Like Array.slice() but only includes up to (exclusive) the first undefined
 * value.
 */
Array.prototype.sliceDefined = function(start) {
	var undef = this.indexOf(undefined, start);

	if (undef == start)
		return [];
	else if (undef >= start)
		return this.slice(start, undef);
	else
		return this.slice(start);
};

/*
 * Insert String.prototype vs window namespace debate here.
 * I'm putting it here because parseInt and parseFloat are in the window
 * namespace and the only .toWhatever() on String.prototype are .toUpperCase()
 * and the like, which don't convert to non-string things, but just spit out
 * more strings.
 */
function cStyleParseInt(str) {
	var hex = cStyleParseInt.hex.exec(str);
	if (hex)
		return parseInt(hex[1], 16);

	var dec = cStyleParseInt.dec.exec(str);
	if (dec)
		return parseInt(dec[1], 10);

	var oct = cStyleParseInt.oct.exec(str);
	if (oct)
		return parseInt(oct[1], 8);

	warn("unable to parse C-style int \"" + str + "\"");

	return NaN;
}
/*
 * I'm not sure if tagging these on to cStyleParseInt is appropriate, but I
 * can't think of a better place to put them. I don't want them inside the
 * function because the compiled versions should really be cached and not keep
 * falling out of scope and getting garbage collected and then recomputed again.
 */
cStyleParseInt.hex = new RegExp("^0x(-?[0-9a-fA-F]+)$");
cStyleParseInt.dec = new RegExp("^(-?[0-9]+)$");
cStyleParseInt.oct = new RegExp("^\\\\(-?[0-7]+)$");
