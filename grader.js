#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = 'index.html';
var CHECKSFILE_DEFAULT = 'checks.json';

var assertFileExists = function(file) {
	var instr = file.toString();
	if (!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting", instr);
		process.exit(1);
	}

	return instr;
};

var assertUrl = function(url) {
	var isUrl = url.indexOf("http") === 0;
	if (!isUrl) process.exit(1);

	return url;
};

var cheerioHtmlFile = function(htmlFile) {
	return cheerio.load(fs.readFileSync(htmlFile));
};

var loadChecks = function(checksFile) {
	return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtml = function($, checksFile) {
	var checks = loadChecks(checksFile).sort();
	var out = {};
	for (var check in checks) {
		var present = $(checks[check]).length > 0;
		out[checks[check]] = present;
	}
	console.log(JSON.stringify(out, null, 4));
};

var checkHtmlFile = function(htmlFile, checksFile) {
	$ = cheerioHtmlFile(htmlFile);
	checkHtml($, checksFile);
};

var checkUrl = function(url, checksFile) {
	rest.get(url).on('complete', function(result) {
		$ = cheerio.load(result);
		checkHtml($, checksFile);
	});
};

var clone = function(fn) {
	// Workaround for commander.js issue
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

if (require.main == module) {
	program.option('-c --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u --url <url>', "URL to check", clone(assertUrl))
		.parse(process.argv);
	if (typeof program.url !== 'undefined')
		checkUrl(program.url, program.checks);
	else
		checkHtmlFile(program.file, program.checks);
} else {
	exports.checkHtmlFile = checkHtmlFile;
}