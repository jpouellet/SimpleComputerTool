/*
 * When you actually enjoy doing something but you're not satisfied with the
 * tools you have to do it, it's time to write better ones. So I did.
 */

"use strict";

var code_in;
var code_out;
var sim_out;
var out_radios;
var warning_box;

var myProgram;

function warn(string) {
	if (console && console.warn)
		console.warn(string);
	else if (console && console.log)
		console.log("warning: " + string);

	warning_box.textContent += string + "\n";
}

function selectLine(lineNumber) {
	// the first line is line number 0

	var lines = code_in.value.split("\n");

	if (lineNumber > lines) {
		warn("line number out of bounds");
		return false;
	}

	var i, start = 0, end;
	for (i = 0; i < lineNumber; i++)
		start += lines[i].length + 1;
	end = start + lines[i].length;

	if (code_in.setSelectionRange) { // W3 standard way
		code_in.focus();
		code_in.setSelectionRange(start, end);
	} else if (code_in.createTextRange) { // microsoft crap
		code_in.focus();
		var range = code_in.createTextRange();
		range.collapse(true);
		range.moveStart("character", start);
		range.moveEnd("character", end);
		range.select();
	} else {
		warn("no selection method detected");
		return false;
	}

	return true;
}

function getDesiredOffsetRadix() {
	for (var i = 0; i < out_radios.length; i++)
		if (out_radios[i].name === "radix" && out_radios[i].checked)
			return parseInt(out_radios[i].value);
	return 10;
}

function getDesiredCommentSource() {
	for (var i = 0; i < out_radios.length; i++)
		if (out_radios[i].name === "source" && out_radios[i].checked)
			return out_radios[i].value;
	return "literal";
}

var isFirstTime = true;
function loadCode() {
	if (!isFirstTime)
		warning_box.textContent = "";
	isFirstTime = false;

	try {
		myProgram = new Program(code_in.value);
	} catch (e) {
		var message = e.message;

		if (e.hasOwnProperty("line")) {
			message += " on line " + e.line;
			selectLine(e.line);
		}
		warn(message);

		myProgram = undefined;
	}

	makeTables();
}

function makeTables() {
	/*
	 * I want to show the offset to the left of the instruction, but not
	 * have it selected.
	 *
	 * It would be nice if <col> elements effected how things were selected,
	 * but alas, they don't, so do a stupid ugly hack instead where we have
	 * two side by side tables.
	 */

	if (myProgram === undefined) {
		code_out.innerHTML = "";
		return;
	}

	var output = document.createElement("div");
	var offsets = document.createElement("table");
	var instructions = document.createElement("table");

	var tr = document.createElement("tr");
	var th = document.createElement("th");
	th.textContent = "Offset";
	tr.appendChild(th);
	offsets.appendChild(tr);
	for (var i = 0; i < myProgram.instructions.length; i++) {
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.textContent = i.toString(getDesiredOffsetRadix());
		tr.appendChild(td);
		offsets.appendChild(tr);
	}
	output.appendChild(offsets);

	tr = document.createElement("tr");
	var bytecode = document.createElement("th");
	var comment = document.createElement("th");
	bytecode.textContent = "Bytecode";
	comment.textContent = "Comment";
	tr.appendChild(bytecode);
	tr.appendChild(comment);
	instructions.appendChild(tr);
	for (var i = 0; i < myProgram.instructions.length; i++) {
		var instruction = myProgram.instructions[i];

		tr = document.createElement("tr");
		bytecode = document.createElement("td");
		comment = document.createElement("td");

		bytecode.textContent = instruction.toBytecodeString();
		switch (getDesiredCommentSource()) {
		case "literal":
			comment.textContent = instruction.source;
			break;
		case "assembly":
			comment.textContent = instruction.toAssemblyString();
			break;
		default:
			comment.textContent = "Invalid Source Type!";
		}
		comment.innerHTML = "<span>//</span>" + comment.innerHTML;

		tr.appendChild(bytecode);
		tr.appendChild(comment);
		instructions.appendChild(tr);
	}
	output.appendChild(instructions);

	code_out.parentNode.replaceChild(output, code_out);
	code_out.id = "";
	output.id = "code_out";
	code_out = output;

	return true;
}

function runSim() {
	if (myProgram === undefined) {
		warn("You must load valid code before you can simulate it!");
		return false;
	}

	warn("Simulator not finished yet...");

	return true;
}

window.addEventListener("load", function() {
	code_in = document.getElementById("code_in");
	code_out = document.getElementById("code_out");
	sim_out = document.getElementById("sim_out");
	warning_box = document.getElementById("warnings");

	document.getElementById("btn_load").addEventListener('click', loadCode);
	document.getElementById("btn_run").addEventListener('click', runSim);

	out_radios = document.getElementsByClassName("out_radio");
	for (var i = 0; i < out_radios.length; i++)
		out_radios[i].addEventListener("change", makeTables);

	document.addEventListener('keydown', function() {
		/*
		 * Make {control, command}+R just re-evaluate the code instead
		 * of reloading the page (and making the user lose what they
		 * were working on!)
		 */
		if (event.keyCode === 82 && (event.ctrlDown || event.metaKey)) {
			try {
				loadCode();
			} catch (err) {
				warn(err.message);
			}
			event.preventDefault();
		}
	});

	loadCode();
});
