/*
 *	jsValidate.js
 *	Server-side Mootools class to mimic jQuery's validate plugin
 *	It allows you to use the same validation rules in your server side code and your front end environment
 *	This was designed to be used in a server-side environemt with mootools
 *	
 *	@description: Server-side Mootools class to validate data against jQuery validate plugin rules
 *	@author: Adam Fisher (adamnfish)
 *	@version: 0.1 (alpha)
 *	@licence: MIT-Style
 *	@website: http://www.adamnfish.com/projects/jsValidate/
 *	@github: http://github.com/adamnfish/jsValidate/tree
 *	@requires: Server-side Mootools 1.2.3+
 *
 *	@acknowledgements:
 *	jQuery validation plug-in 1.5.5
 *
 *	http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 *	http://docs.jquery.com/Plugins/Validation
 *
 *	Copyright (c) 2006 - 2008 Jörn Zaefferer
 */

var $;
var jsValidate = new Class({
	defaultMessages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		dateDE: "Bitte geben Sie ein gültiges Datum ein.",
		number: "Please enter a valid number.",
		numberDE: "Bitte geben Sie eine Nummer ein.",
		digits: "Please enter only digits",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: "Please enter no more than {0} characters.",
		minlength: "Please enter at least {0} characters.",
		rangelength: "Please enter a value between {0} and {1} characters long.",
		range: "Please enter a value between {0} and {1}.",
		max: "Please enter a value less than or equal to {0}.",
		min: "Please enter a value greater than or equal to {0}."
	},
	// validation rules
	rules: {},
	// validation error messages
	messages: {},
	// data should be an object containing the name value pairs to check against
	data: {},
	errors: {},
	valid: 0,
	
	initialize: function(data, rules, messages){
		if($defined(rules.rules) && $defined(rules.messages) && typeof(messages) === "undefined"){
			this.rules = $H(rules.rules);
			this.messages = $H(rules.messages);
		} else{
			this.rules = $H(rules);
			this.messages = $H(messages);
		}
		this.data = data;
	},
	
	/*
	 *	Perform validation on the data
	 */
	validate: function(cache){
		if(0 !== this.valid && cache){
			return this.valid;
		}
		var valid = true;
		this.rules.each(function(rules, fieldname){
			if("object" === $type(rules)){
				// we have mutiple rules for this fieldname
				$H(rules).each(function(param, rule){
					if(this.checkField(fieldname, rule, param) === false){
						valid = false;
					}
				}, this);
			} else{
				// we must have a single rule with no param (eg required)
				// pass true as the param
				if(this.checkField(fieldname, rules, true) === false){
					valid = false;
				}
			}
		}, this);
		
		this.valid = valid;
		return this.valid;
	},
	
	setError: function(fieldname, rule, param){
		var message = typeof(this.messages[fieldname]) !== "undefined" ? this.messages[fieldname][rule] || this.messages[fieldname] : this.defaultMessages[rule];
		
		if(message.test(/\{[0-9]+\}/)){
			// do some replacement foo
			if($type(param) !== "array"){
				param = [param];
			}
			if(message.test(/\{[0-9]+\}/)){
				for(var i = 0; i < param.length; i++){
					if($type(param[i] === "string")){
						message.replace("{" + i + "}", param[i], "g");	
					}
				}
			}
		}
		this.errors[fieldname] = message;
	},
	
	getError: function(fieldname){
		return this.errors[fieldname];
	},
	
	resetErrors: function(){
		this.errors = {};
	},
	
	/*
	 *	Checks the field's valididty (mimics jQuery validator plugin)
	 */
	checkField: function(fieldname, rule, param){
		// valid until proven otherwise
		var valid = true;
		var value = this.data[fieldname]; // by the assumption that the data object holds the fieldname value pairs
		
		$ = function(fieldname){
			if("#" === fieldname.substr(0, 1)){
				fieldname = fieldname.substr(1);
			}
			return {val: $lambda(this.data[fieldname])};
		}.bind(this);
		
		switch(rule){
			case "required":
				if("function" === $type(param)){
					// calculate required state from callback
					if(param() && value === ""){
						valid = false;
						this.setError(fieldname, rule, param);
					}
				} else if(param !== false && false === $chk(value)){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "remote":
				// this one can't be checked in server side js at the moment because it isn't possible to make requests
			break;
			case "minlength":
				if(value && param !== false && value.trim().length < param){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "maxlength":
				if(value && param !== false && value.trim().length > param){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "rangelength":
				var length = value.trim().length;
				if(value && param !== false && (length < param[0] || length > param[1])){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "min":
				if(value && param !== false && value < param){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "max":
				if(value && param !== false && value > param){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "range":
				if(value && param !== false && (value < param[0] || value > param[1])){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "email":
				if(value && param !== false && (!value.test(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i))){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "url":
				if(value && param !== false && !value.test(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "date":
				if(value && param !== false && /Invalid|NaN/.test(new Date(value))){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "dateISO":
				if(value && param !== false && !/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value)){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "number":
				if(value && param !== false && !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "digits":
				if(value && param !== false && !/^\d+$/.test(value)){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "creditcard":
				// not processing this one here
				// we're only using credit card details in the payment gateway which validates it properly
			break;
			case "accept":
				param = typeof(param) == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
				if(value && param !== false && value.match(new RegExp(".(" + param + ")$", "i"))){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
			case "equalTo":
				var target = param;
				if("#" === target.substr(0, 1)){
					target = target.substr(1);
				}
				if(value && param !== false && value != this.data[target]){
					valid = false;
					this.setError(fieldname, rule, param);
				}
			break;
		}
		return valid;
	}
});
