#!/usr/bin/env js
// lib.js v2.1.9 (c) | Copyright 2022-2023 Daniel E. Janusch

/**
 * Todo etc. Comment Syntax:
 * // TODO: Miscellaneous todo
 * // TODO/ADD: add something
 * // TODO/CHG: change something to do a different thing. Not really an update nor a fix.
 * // TODO/FIG: figure out what something does/means/is supposed to do if there are no comments
 * // TODO/FIN: finish or implement something
 * // TODO/FIX: fix something, figure ou why it is broken, etc
 * // TODO/UPD: update something
 * There can be multiple modifiers, and they will be in alphabetical order (as shown above)
 * // TODO/FIN/UPD: finish updating something
 * etc.
 * // DEV: temporary development thing, ie: dev break in a while loop.
 * // KEEP: keep up to date. documentation or something.
 * there can also be no message
 * // DEV:/ no message
 * // KEEP:/ no message
 * // TODO:/ no message (probably should though)
*/


void (() => { "use strict";
	/* Customization & Constants: */ {
		const _Global_String = (globalThis + "").slice(8, -1).toLowerCase();

		var LibSettings = {
		// the comments are the default values. if the comment is on a separate line, it is for the setting directly after it.
		//////////////////////////////////////// LIBRARY USER INPUT START ////////////////////////////////////////
			Alert_Library_Load_Finished         : "default" // false
			, Global_Ignore_List                : "default" // []
			, Add_All_GlobalNames               : "default" // true
			// only recommended if using something like jsdom
			, Do_DOM_Things_In_Node_Anyway      : "default" // false
			, Globlize_Library_Variables_Object : "default" // true
			// if nullish. no key will be set
			, Global_Library_Object_Name        : "default" // "LIBRARY_VARIABLES"
			, ON_CONFLICT                       : "default" // "debug"
			, Alert_Conflict_For_Math           : "default" // false
			, Alert_Conflict_OverWritten        : "default" // true
			, Define_Deprecated_Functions       : "default" // true
			, Warn_Deprecated_Use               : "default" // true
			, Library_Startup_Message           : "default" // `${LIBRARY_NAME} loaded`
			// function for logging that the library startup finished without any errors.
			, Library_Startup_Function          : "default" // console.log
			, Output_Math_Variable              : "default" // "Math"
			, Input_Math_Variable               : "default" // "rMath" (MathObjects object key)
			, MATH_LOG_DEFAULT_BASE             : "default" // 10. for rMath.log and rMath.logbase
			// default is celcius, for rMath.tempConv (temperature converter between systems)
			// the options are "fahrenheit", "celcius", "kelvin", or "rankine". only the first letter actually matters
			, MATH_TEMPCONV_DEFAULT_END_SYSTEM  : "default" // "c"
			, aMath_Help_Argument               : "default" // true
			, aMath_DegTrig_Argument            : "default" // true
			, aMath_Comparatives_Argument       : "default" // true
			, aMath_Internals_Argument          : "default" // true
			, bMath_Help_Argument               : "default" // true
			, bMath_DegTrig_Argument            : "default" // true
			, bMath_Comparatives_Argument       : "default" // true
			, cMath_DegTrig_Argument            : "default" // true
			, cMath_Help_Argument               : "default" // true
			, fMath_Help_Argument               : "default" // true
			, fMath_DegTrig_Argument            : "default" // true
			, sMath_Help_Argument               : "default" // true
			// only recommended to be false if you plan to never use sMath or anything that uses it.
			, sMath_DegTrig_Argument            : "default" // true
			, sMath_Comparatives_Argument       : "default" // true
			, rMath_DegTrig_Argument            : "default" // true
			, rMath_Help_Argument               : "default" // true
			, rMath_Comparatives_Argument       : "default" // true
			, rMath_Constants_Argument          : "default" // true
			, cfMath_Help_Argument              : "default" // true
			, Logic_Bitwise_Argument            : "default" // true
			, Logic_Comparatives_Argument       : "default" // true
			, Logic_Help_Argument               : "default" // true
			// Keylogger is automatically off if LibSettings.Use_Document is false which is defined
			// somewhere further down in the same section of the code
			, Run_KeyLogger                     : "default" // false
			, KeyLogger_Debug_Argument          : "default" // false
			, KeyLogger_Alert_Start_Stop        : "default" // true
			, KeyLogger_Alert_Unused            : "default" // false
			, KeyLogger_Variable_Argument       : "default" // Symbol.for('keys')
			, KeyLogger_Copy_Obj_Argument       : "default" // true
			, KeyLogger_Type_Argument           : "default" // "keydown"
			, Clear_LocalStorage                : "default" // false
			, Clear_SessionStorage              : "default" // false
			, Creepily_Watch_Every_Action       : "default" // false
			, Freeze_Math_Objects               : "default" // false
			, Freeze_Library_Object             : "default" // false
			, Use_Orig_Args_For_Deprecated_Fns  : "default" // true
			, Defined_Properties_Configurable   : "default" // false
			, Defined_Properties_Enumerable     : "default" // false
			, Defined_Properties_Writable       : "default" // true
			, Property_Is_Default_Defined_Vars  : "default" // false
			, Testing_Object_Global_Name        : "Test.js" // N/A. just set to undefined, if there is none.
			, Create_Testing_Object             : "default" // true
		///////////////////////////////////////// LIBRARY USER INPUT END /////////////////////////////////////////
		////////////////////////////// LIBRARY DEVELOPER SETTINGS & VARIABLES START //////////////////////////////
			, Environment_Global_String         : _Global_String
			, DOM_Ignore_list                   : []
			, On_Conflict_Options               : [
				"log", "throw", "return", "error", "warn",
				"debug", "info", "assert", "alert", "none",
				"crash", "cry", "dont-use", "default",
				"debugger", "crash"
				// "none" just ignores the error and overwrites it anyway, pretending it never happened.
			]
			, Settings_Help_String             : `Settings Help:
				 * OnConflict Options (ones in parentheses are aliases for the same thing):
				   - log: console.log (default value)
				   - throw (trw): throw an error at the end of the main functon if there were any variable naming conflicts
				   - return (ret): returns frrom the main function
				   - error (err): console.error
				   - warning (warn, wrn): console.warn
				   - debug (dbg, default): console.debug
				   - debugger: causes a debugger where the overwrite happens. then it acts the same as cry
				   - info (inf): console.info
				   - assert (ast): console.assert
				   - alert (alt): ${_Global_String}.alert(). if in node and the Do_DOM_Things_In_Node_Anyway is falsy, none gets used instead.
				   - crash: throw an error at the first variable naming conflict
				   - cry: console.logs every time something is overwritten instead of all at the end in one message.
				   - dont-use: doesn't overwrite anything but also doesn't throw an error. similar to none.
				   - none: ignores the error and overwrites the value anyway. not recommended
				 * Library Settings:
				   - LibSettings can be accessed at LIBRARY_VARIABLES["local LibSettings"]
				   - The defaults are the boolean value true, unless otherwise noted on the same line in a comment
				   - if there is a comment that is not on the same line as a variable, it is for the variable directly below it
				   - All alerts happen using console.log except for conflict stuff.
				 * global ignore list
				   - should be an array of strings that corresponds with keys in LIBRARY_VARIABLES
				   - LIBRARY_VARIABLES is defined in the next section of the code.
				   - for each item in the ignore list, the function will NOT be added to the global scope
				   - if it, the ignore list variable, is a string, then that singular key will not be brought to the global scope.
				   - if it is an array, the none of the corresponding elements will be globalized.
				   - otherwise, nothing changes.
				   - functions on the global ignore list can still be accessed through LIBRARY_VARIABLES if it is globalized
				 * LIBRARY_VARIABLES["local define"] string syntax for first argument:
				   - if the last character is ', ", or \` the name will start at the next of the same quote going backwards
					 > example: if the string ends with 'asdf asdf ', the name will be "asdf asdf "
					 > if the string ends with 'asdf asdf ", it will throw an error because the quote has no beginning.
					 > for the name to be "asdf 1234", the quotes are required or "asdf" will be one of the parameters, and only "1234" will be the name
				   - starting here, they are in the order that define() checks for them in.
				   - auto
					 > auto doesn't do anything and its only purpose is to distinguish variables that are dynamically created
					 > auto acts like local but if it has "call" or "instance" etc as one of the parameters, it won't do it.
					 > returns from the function immediately
				   - archived
					 > archived is similar to auto and it has the exact same functionality, that is, none.
					 > archived is for if you are overwriting something and you want a (shallow probably) copy of the original
					 > returns from the function immediately
				   - ifdom
					 > if LibSettings.Use_Document is falsy it adds the name and value to the dom ignore list and returns.
					 > LibSettings.Use_Document = LibSettings.isBrowser || LibSettings.Do_DOM_Things_In_Node_Anyway;
					   ~ LibSettings.isBrowser = String(globalThis).slice(8, -1).toLowerCase() === "${_Global_String}"
				   - previous
					 > previous sets the value to be whatever the previous value was.
				   - math
					 > if neither call nor instance are active, instance is activated.
					 > if defer is not active, it is activated.
					 > the value gets added to the MathObjects object.
				   - symbol
					 > the name of the function becomes Symbol.for(name)
					 > example: if symbol is active and the name is "12345", the name becomes Symbol.for("12345")
				   - pdelete
					 > deletes the variable from the scope which is the 3rd argument then updated the previous value to what was just deleted
				   - delete
					 > deletes the variable from the scope which is the 3rd argument. doesn not update the previous value.
				   - object
					 > if object is active, then for each key in the value, it will be defined in the new subscope.
					 > example: "object Array": { asdf: 3 }. this will set Array.asdf to 3
				   - prototype
					 > prototype is similar to object but adds the values to the prototype instead of the object itself
				   - local
					 > doesn't globalize the variable.
					 > if overwrite or native are active, it throws an error because there is nothing to overwrite because it's a local variable
					 > if instance or call are active, it will call it in case something important happens inside it, but otherwise just discards it.
				   - defer
					 > if the section argument is 0, then the string gets added to either DEFER_ARR or LOCAL_DEFER_ARR depending on if local is active or not.
					 > if section is anything else, the function proceeds as normal
				   - overwrite
					 > ignores what ON_CONFLICT is set to and acts as if it is set to "none".
					 > it just overwrites the value anyway.
					 > no errors happen if there is nothing to overwrite. it just changes it from undefined to the new value.
				   - native
					 > an extension of overwrite
					 > if the thing being overwritten is a native function, then it overwrites it, otherwise what happens depends on ON_CONFLICT.
				   - instance
					 > creates a new instance of the value with the "new" keyword
					 > similar to call
				   - call
					 > calls the value as if it is a function assuming it is a function.
					 > will throw an error if the value is not a function
					 > similar to instance
				   - deprecated
					 > if LibSettings.Define_Deprecated_Functions is falsy or the value is not a function, it returns immediately.
					 > it logs to the console via console.warn that a deprecated function is being defined when it is defined
					 > if LibSettings.Warn_Deprecated_Use is truthy, whenever called, it warns to the console that a deprecated function was used
				   - ignore
					 > The property gets completely skipped over and ignored.
				   - property
					 > uses Object.defineProperty() instead of direct assignment
					 > the arguments are defined in the LibSettings
					   ~ Defined_Properties_Configurable, default is false
					   ~ Defined_Properties_Enumerable, default is false
					   ~ Defined_Properties_Writable, default is true
					 > if local is active, nothing changes and having property is useless.
				   - iterable
					 > if the property flag is given, it changes the enumerable argument to true, otherwise nothing changes
					 > does the same thing as the enumerable flag
				   - enumerable
					 > if the property flag is given, it changes the enumerable argument to true, otherwise nothing changes
					 > does the same thing as the iterable flag
				   - configurable
					 > if the property flag is given, it changes the configurable argument to true, otherwise nothing changes
				   - nwritable
					 > if the property flag is given, it changes the writable argument to false, otherwise nothing changes
				   - nproperty
					 > if property is set as the default in the settings, anything with the nproperty flag is never a property
				   - try
					 > if the scope is nullish, then an error is not thrown and define() just returns undefined.
					 > the main use cases are if the 'object' or 'prototype' flags are set.
			`.replace(/\t+/g, " ").replace(/^\s+|\s+$/, "")
			, isNodeJS                          : _Global_String === "global"
			, isBrowser                         : _Global_String === "window"
			, LIBRARY_NAME                      : "lib.js"
		/////////////////////////////// LIBRARY DEVELOPER SETTINGS & VARIABLES END ///////////////////////////////
		};

		if (LibSettings.isBrowser) {
			var __dirname = document.currentScript.src.slice(
				0, document.currentScript.src.lastIndexOf("/") + 1
			)
			, __filename = document.currentScript.src;
		}

		// Other Values:
		LibSettings.On_Conflict_Options.includes(LibSettings.ON_CONFLICT) || (LibSettings.ON_CONFLICT = "debug");
		LibSettings.Use_Document = LibSettings.isBrowser || LibSettings.Do_DOM_Things_In_Node_Anyway;
		LibSettings.ON_CONFLICT = LibSettings.ON_CONFLICT.toLowerCase();
		LibSettings.FILE_PATH = LibSettings.isNodeJS ?
			`${__dirname.replace(/\\/g, "/")}/${__filename}` :
			document.currentScript.src;

		///////////////////////////////////////////// DEFAULTS START /////////////////////////////////////////////

		// with (LibSettings) { ... } would make this so much better
		LibSettings.Globlize_Library_Variables_Object === "default" && (LibSettings.Globlize_Library_Variables_Object = !0);
		LibSettings.MATH_TEMPCONV_DEFAULT_END_SYSTEM  === "default" && (LibSettings.MATH_TEMPCONV_DEFAULT_END_SYSTEM  = "c");
		LibSettings.Use_Orig_Args_For_Deprecated_Fns  === "default" && (LibSettings.Use_Orig_Args_For_Deprecated_Fns  = !0);
		LibSettings.Property_Is_Default_Defined_Vars  === "default" && (LibSettings.Property_Is_Default_Defined_Vars  = !1);
		LibSettings.Defined_Properties_Configurable   === "default" && (LibSettings.Defined_Properties_Configurable   = !1);
		LibSettings.Defined_Properties_Enumerable     === "default" && (LibSettings.Defined_Properties_Enumerable     = !1);
		LibSettings.Do_DOM_Things_In_Node_Anyway      === "default" && (LibSettings.Do_DOM_Things_In_Node_Anyway      = !1);
		LibSettings.KeyLogger_Variable_Argument       === "default" && (LibSettings.KeyLogger_Variable_Argument       = Symbol.for('keys'));
		LibSettings.Alert_Library_Load_Finished       === "default" && (LibSettings.Alert_Library_Load_Finished       = !1);
		LibSettings.Define_Deprecated_Functions       === "default" && (LibSettings.Define_Deprecated_Functions       = !0);
		LibSettings.aMath_Comparatives_Argument       === "default" && (LibSettings.aMath_Comparatives_Argument       = !0);
		LibSettings.bMath_Comparatives_Argument       === "default" && (LibSettings.bMath_Comparatives_Argument       = !0);
		LibSettings.sMath_Comparatives_Argument       === "default" && (LibSettings.sMath_Comparatives_Argument       = !0);
		LibSettings.rMath_Comparatives_Argument       === "default" && (LibSettings.rMath_Comparatives_Argument       = !0);
		LibSettings.Logic_Comparatives_Argument       === "default" && (LibSettings.Logic_Comparatives_Argument       = null);
		LibSettings.KeyLogger_Copy_Obj_Argument       === "default" && (LibSettings.KeyLogger_Copy_Obj_Argument       = !0);
		LibSettings.Creepily_Watch_Every_Action       === "default" && (LibSettings.Creepily_Watch_Every_Action       = !1);
		LibSettings.Defined_Properties_Writable       === "default" && (LibSettings.Defined_Properties_Writable       = !0);
		LibSettings.Global_Library_Object_Name        === "default" && (LibSettings.Global_Library_Object_Name        = "LIBRARY_VARIABLES");
		LibSettings.Testing_Object_Global_Name        === "default" && (LibSettings.Testing_Object_Global_Name        = undefined);
		LibSettings.Alert_Conflict_OverWritten        === "default" && (LibSettings.Alert_Conflict_OverWritten        = !0);
		LibSettings.KeyLogger_Alert_Start_Stop        === "default" && (LibSettings.KeyLogger_Alert_Start_Stop        = !0);
		LibSettings.Library_Startup_Function          === "default" && (LibSettings.Library_Startup_Function          = console.log);
		LibSettings.KeyLogger_Debug_Argument          === "default" && (LibSettings.KeyLogger_Debug_Argument          = !1);
		LibSettings.aMath_Internals_Argument          === "default" && (LibSettings.aMath_Internals_Argument          = !0);
		LibSettings.rMath_Constants_Argument          === "default" && (LibSettings.rMath_Constants_Argument          = !0);
		LibSettings.Library_Startup_Message           === "default" && (LibSettings.Library_Startup_Message           = `${LibSettings.LIBRARY_NAME} loaded`);
		LibSettings.KeyLogger_Type_Argument           === "default" && (LibSettings.KeyLogger_Type_Argument           = "keydown");
		LibSettings.Alert_Conflict_For_Math           === "default" && (LibSettings.Alert_Conflict_For_Math           = !1);
		LibSettings.KeyLogger_Alert_Unused            === "default" && (LibSettings.KeyLogger_Alert_Unused            = !1);
		LibSettings.aMath_DegTrig_Argument            === "default" && (LibSettings.aMath_DegTrig_Argument            = !0);
		LibSettings.bMath_DegTrig_Argument            === "default" && (LibSettings.bMath_DegTrig_Argument            = !0);
		LibSettings.cMath_DegTrig_Argument            === "default" && (LibSettings.cMath_DegTrig_Argument            = !0);
		LibSettings.fMath_DegTrig_Argument            === "default" && (LibSettings.fMath_DegTrig_Argument            = !0);
		LibSettings.sMath_DegTrig_Argument            === "default" && (LibSettings.sMath_DegTrig_Argument            = !0);
		LibSettings.rMath_DegTrig_Argument            === "default" && (LibSettings.rMath_DegTrig_Argument            = !0);
		LibSettings.Logic_Bitwise_Argument            === "default" && (LibSettings.Logic_Bitwise_Argument            = "bit");
		LibSettings.Freeze_Library_Object             === "default" && (LibSettings.Freeze_Library_Object             = !1);
		LibSettings.MATH_LOG_DEFAULT_BASE             === "default" && (LibSettings.MATH_LOG_DEFAULT_BASE             = 10);
		LibSettings.Create_Testing_Object             === "default" && (LibSettings.Create_Testing_Object             = !0);
		LibSettings.Output_Math_Variable              === "default" && (LibSettings.Output_Math_Variable              = "Math");
		LibSettings.Clear_SessionStorage              === "default" && (LibSettings.Clear_SessionStorage              = !1);
		LibSettings.cfMath_Help_Argument              === "default" && (LibSettings.cfMath_Help_Argument              = !0);
		LibSettings.Input_Math_Variable               === "default" && (LibSettings.Input_Math_Variable               = "rMath");
		LibSettings.Freeze_Math_Objects               === "default" && (LibSettings.Freeze_Math_Objects               = !1);
		LibSettings.Warn_Deprecated_Use               === "default" && (LibSettings.Warn_Deprecated_Use               = !0);
		LibSettings.Add_All_GlobalNames               === "default" && (LibSettings.Add_All_GlobalNames               = !0);
		LibSettings.aMath_Help_Argument               === "default" && (LibSettings.aMath_Help_Argument               = !0);
		LibSettings.cMath_Help_Argument               === "default" && (LibSettings.cMath_Help_Argument               = !0);
		LibSettings.fMath_Help_Argument               === "default" && (LibSettings.fMath_Help_Argument               = !0);
		LibSettings.bMath_Help_Argument               === "default" && (LibSettings.bMath_Help_Argument               = !0);
		LibSettings.sMath_Help_Argument               === "default" && (LibSettings.sMath_Help_Argument               = !0);
		LibSettings.rMath_Help_Argument               === "default" && (LibSettings.rMath_Help_Argument               = !0);
		LibSettings.Logic_Help_Argument               === "default" && (LibSettings.Logic_Help_Argument               = "help");
		LibSettings.Global_Ignore_List                === "default" && (LibSettings.Global_Ignore_List                = []);
		LibSettings.Clear_LocalStorage                === "default" && (LibSettings.Clear_LocalStorage                = !1);
		LibSettings.Run_KeyLogger                     === "default" && (LibSettings.Run_KeyLogger                     = !1);
		LibSettings.ON_CONFLICT                       === "default" && (LibSettings.ON_CONFLICT                       = "debug");

		////////////////////////////////////////////// DEFAULTS END //////////////////////////////////////////////

		LibSettings.Clear_SessionStorage && sessionStorage?.clear?.();
		LibSettings.Clear_LocalStorage && localStorage?.clear?.();
	}
	/* Variables & Functions definitions: */ {
		/* Local Variables (may also be global) */ {
			// NOTE: Maximum Array length allowed: 4,294,967,295 (2^32 - 1)
			// NOTE: Maximum BigInt value allowed: 2^1,073,741,823
			// Array(10).fill([]) does a different thing than [[],[],[],[],[],[],[],[],[],[]]
			var [getOldGlobals, getNewGlobals] = (function create_get_globals() {
				const old_globals = Reflect.ownKeys(globalThis);
				return [
					function getOldGlobals() {
						// in case things have been deleted
						return Reflect.ownKeys(globalThis).filter( s => old_globals.includes(s) );
					},
					function getNewGlobals() {
						return Reflect.ownKeys(globalThis).filter( s => !old_globals.includes(s) );
					}
				]
			})();
			if (LibSettings.Add_All_GlobalNames) {
				globalThis.self       ??= globalThis; // browser
				globalThis.global     ??= globalThis; // node.js
				globalThis.window     ??= globalThis; // browser
				globalThis.globalThis ??= globalThis; // both
				globalThis.frames     ??= globalThis; // browser
			}
			for (var i = 10, j, multable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					multable[i][j] = i * j;
			for (var i = 10, j, addtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					addtable[i][j] = i + j;
			for (var i = 10, j, subtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					subtable[i][j] = i - j;
			for (var i = 10, j, divtable = [[],[],[],[],[],[],[],[],[],[]]; i --> 0 ;)
				for (j = 10; j --> 0 ;)
					divtable[i][j] = i / j;

			var stringifyScope = function stringifyScope(val, scopename, list, orig_str) {
				const prototype = list.includes("prototype"), object = list.includes("object");
				return LibSettings.Environment_Global_String + ( object || prototype ? "." : "" ) + (
					object ? scopename : prototype ? scopename + ".prototype" :"") + ( "'`\"".includes(
						orig_str.at(-1)) ? `['${val}']` : "." + val
				);
			}
			, CONFLICT_ARR = Object.create(null, {
				length: { value: 0, writable: !0, configurable: !1, enumerable: !1 },
				push: {
					value: function push([val, scopename, list, orig_str]) {
						return Array.prototype.push.call(
							CONFLICT_ARR,
							stringifyScope(val, scopename, list, orig_str)
						);
					},
					writable: !1,
					enumerable: !1,
					configurable: !1,
				}
			})
			, DEFER_ARR = [], LOCAL_DEFER_ARR = [], MathObjects = Object.create(null)
			//////////////////////////////// START OF CONSTANTS ////////////////////////////////
			, numbers = "0123456789"
			, alphabetL = "abcdefghijklmnopqrstuvwxyz"
			, alphabet  = alphabetL
			, alphabetU = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			, base62Numbers = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
			, characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()`~[]{}|;:',.<>/?-_=+ \"\\"
			, π      = 3.1415926535897932  , π_2   = 1.5707963267948966
			, π_3    = 1.0471975511965979  , π2_3  = 2.0943951023931957
			, π_4    = 0.7853981633974483  , π3_4  = 2.3561944901923449
			, π5_4   = 3.9269908169872414  , π7_4  = 5.4977871437821382
			, π_5    = 0.6283185307179586  , π7_6  = 3.6651914291880923
			, π5_6   = 2.6179938779914944  , π11_6 = 5.7595865315812876
			, π_6    = .52359877559829887  , π_7   = .44879895051282761
			, π_8    = .39269908169872414  , π_9   = .34906585039886592
			, π_10   = .31415926535897932  , π_11  = .28559933214452665
			, π_12   = .26179938779914946
			, omega  = .56714329040978387 // Ωe^Ω = 1
			, emc    = .57721566490153286 // Euler-Mascheroni Constant
			, phi    = 1.6180339887498947 // -2 sin 666°
			, foia1  = 2.2931662874118610 // Foia's first constant
			, foia2  = 1.1874523511265010 // Foia's second constant. exact form
			, e      = 2.7182818284590452
			, tau    = 6.2831853071795864
			, pi     = π
			, symbToStr = function symbolToString(symbol, form = 1) {
				return typeof symbol === "symbol" ?
					form === 1 ?
						`Symbol${ Symbol.keyFor(symbol) === void 0 ? "" : ".for"
							}("${ symbol.description.replace(/"/g, "\\\"") }")` :

						`Symbol${Symbol.keyFor(symbol) === void 0 ? "" : ".for"}(${symbol.description})` :
						void 0;
			}
			, json = Object.create(Object.prototype, {
				parse: {
					// TODO/FIN: Finish
					value: function parse(object, reviver) {
						try { return JSON.parse(object, reviver) }
						catch { return void 0 }
					}
					, writable: !1
					, enumerable: !1
					, configurable: !1
				}
				, stringify: {
					value: function stringify(
						object, {
							space = " "
							, spacesAtEnds = false
							, onlyEnumProps = true
						} = {}
					) {
						switch (object == null ?
							"nullish" :
							object instanceof Array ?
								"array" :
								object instanceof RegExp ?
									"regexp" :
									typeof object
						) {
							case "boolean": return `${object}`;
							case "function": return  void 0; // can't be serialized. maybe can be treated as a regular object.
							case "regexp": return `${object}`;
							case "string": return `"${ object.replace([/\\/g, /"/g], ["\\\\", '\\"']) }"`;
							case "bigint": return `${object}n`;
							case "number": return Object.is(object, -0) ? "-0" : `${object}`;
							case "nullish": return object === null ? "null" : "undefined";
							case "symbol": return `Symbol${ Symbol.keyFor(object) === void 0 ? "" : ".for"
								}("${ object.description.replace(/"/g, "\\\"") }")`;
							// the "array" and "object" cases might be able to be combined due to their similarity
							case "array":
								if (!object.length) return `[${spacesAtEnds ? space : ""}${spacesAtEnds ? space : ""}]`;

								for (var output = `[${spacesAtEnds ? space : ""}`, i = 0 ;;) {
									// can probably be a do..while, but I don't care.
									output += stringify(
										object[i++]
										, {
											space: space
											, spacesAtEnds: spacesAtEnds
											, onlyEnumProps: onlyEnumProps
										}
									);
									if (i < object.length) output += `,${space}`;
									else break;
								}
								return output + `${spacesAtEnds ? space : ""}]`;
							case "object":
								var keys = (onlyEnumProps ? Object.keys : Reflect.ownKeys)(object);
								if (onlyEnumProps) keys = keys.concat(
									Object.getOwnPropertySymbols(object)
										.filter( key => Object.propertyIsEnumerable.call(object, key) )
								);
								if (!keys.length) return `{${spacesAtEnds ? space : ""}${spacesAtEnds ? space : ""}}`;
								for (var output = `{${spacesAtEnds ? space : ""}`, i = 0 ;;) {
									// can probably be a do..while, but I don't care.
									output += `${
										typeof keys[i] === "symbol" ? "[" : '"'
									}${
										typeof keys[i] === "symbol" ? symbToStr(keys[i], 1) : keys[i]
									}${
										typeof keys[i] === "symbol" ? "]" : '"'
									}:${
										space
									}${stringify(
										object[ keys[i] ]
										, {
											space: space
											, spacesAtEnds: spacesAtEnds
											, onlyEnumProps: onlyEnumProps
										}
									)}`;
									if (++i < keys.length) output += `,${space}`;
									else break;
								}
								return output + `${spacesAtEnds ? space : ""}}`;
							default: throw Error("that type is not supposed to exist.");
						}
						throw Error("it is supposed to be impossible to get here.");
					}
					, writable: !1
					, enumerable: !1
					, configurable: !1
				}
				, _JSON: {
					value: JSON
					, writable: !1
					, enumerable: !1
					, configurable: !1
				}
				, [Symbol.toStringTag]: {
					value: "JSON"
					, writable: !1
					, enumerable: !1
					, configurable: !1
				}
			})
			, list = Array.from
			, int = Number.parseInt
			, rand = Math.random // I don't yet know how to make my own version of this.
			//////////////////////////////// END OF CONSTANTS ////////////////////////////////
			, sgn = x => typeof x === "number" ?
				x < 0 ?
					-1 :
					+(x > 0) :
				typeof x === "bigint" ?
					x < 0n ?
						-1n :
						BigInt(x > 0n) :
					LIBRARY_VARIABLES?.type?.(x, 1) === "complex" ?
						LIBRARY_VARIABLES.MathObjects.cMath.sgn(x) :
						NaN
			, abs = x => LIBRARY_VARIABLES?.type?.(x, 1) === "complex" ?
				LIBRARY_VARIABLES.MathObjects.cMath.abs(x) :
				x * sgn(x)
			// document.all == null ????!!/? what!?!?
			, constr = function constructorName(input) {
				return input == null ?
					input :
					input?.constructor?.name;
			}
			// this.at(-1) doesn't work with all iterables. (ie: HTMLAllCollection)
			, lastElement = function lastElement() { return this[this.length - 1] }
			, isArr = function isArray(thing) { return thing instanceof Array }
			, chr = function chr(integer) { return String.fromCharCode( Number(integer) ) }
			, deepCopy = function deepCopy(object) { return eval( json.stringify(object) ) /* safe eval */  }
			, dim = function dim(e, n=1) { return e?.length - n }
			, len = function length(e) { return e?.length }
			, sizeof = function	sizeof(obj, keys=true) {
				// gets the size of an object
				return obj == null || obj != obj ? // (null, undefined), NaN
					0 :
					obj.length ?? // arraylike object
						( keys ? Object.keys : Reflect.ownKeys )(obj).length; // everything else
			}
			, range = (function create_range() {
				function* Range(start, stop, step=1) {
					for (var i = start; i < stop; i += step)
						yield i;
				}
				Range.prototype.toArray = range.prototype.toArr = function toArray() {
					throw Error`Not Implemented`;
				};
				Range.prototype.next = (function () {
					var _next = Range.prototype.next;
					return function next() {
						var out = _next.call(this);

						this.yield++;
						this.last = out.value;
						out.done && (this.done = true);

						return out;
					}
				})();
				Range.prototype.getYields = function getYields() {
					return 1 + (this.last - this.start) / this.step;
				}
				function range(start, stop /* while i < stop ... */, step=1) {
					if ( Number.isNaN(start = Number(start)) ) throw Error`start must be a number`;
					if ( !Number.isFinite(start) ) throw Error`start must be finite`;

					stop == null ? [start, stop] = [0, start] : stop++;

					var a = Range(start, stop, step);

					Reflect.defineProperty(a, "start", {
						value: start
						, writable: false
						, configurable: false
						, enumerable: false
					});
					Reflect.defineProperty(a, "stop", {
						value: stop
						, writable: false
						, configurable: false
						, enumerable: false
					});
					Reflect.defineProperty(a, "step", {
						value: step
						, writable: false
						, configurable: false
						, enumerable: false
					});
					Reflect.defineProperty(a, "yield", {
						value: 0
						, writable: true
						, configurable: false
						, enumerable: false
					});
					(function() {
						var last_variable = undefined;

						Reflect.defineProperty(a, "last", {
							get: function last() { return last_variable }
							, set: function last(value) {
								// last.caller === this.next &&
									(last_variable = value);
							}
							, configurable: false
							, enumerable: false
						});
					})()
					Reflect.defineProperty(a, "last", {
						value: undefined
						, writable: true
						, configurable: false
						, enumerable: false
					});
					a.done = false;

					return a;
				}
				return range;
			})()
			, isIterable = function isIterable(thing) {
				try { for (const e of thing) break }
				catch { return !1 }
				return !0
			}
			, isEnumerable = function isEnumerable(thing) {
				try { for (const e in thing) break }
				catch { return !1 }
				return !0
			}
			, arrzip = function arrzip(arr1, arr2) {
				// array zip
				// TODO: Make a faster way of filtering out infinite generators
				if (arr1?.constructor?.prototype?.[Symbol.toStringTag] === "Generator")
					try { arr1 = Array.from(arr1) }
					catch { throw Error("Infinite generators cannot be zipped. argument index 0") }
				if (arr2?.constructor?.prototype?.[Symbol.toStringTag] === "Generator")
					try { arr2 = Array.from(arr2) }
					catch { throw Error("Infinite generators cannot be zipped. argument index 1") }
				if (!isIterable(arr1) || !isIterable(arr2)) return [arr1, arr2];
				for (var output = [], length = Math.min(arr1.length, arr2.length), i = 0; i < length; i++)
					output.push([ arr1[i] , arr2[i] ]);
				return output;
			}
			, numStrNorm = function NormalizeNumberString(snum="0.0", defaultValue=NaN) {
				if (typeof snum === "bigint") return snum + ".0";
				if (isNaN(snum)) return defaultValue;

				// 0 or -0 both return 0
				// (-0) + "" ==> "0", but "-0.0" could be inputed for some reason

				if ((snum += "")[0] === "-") {
					if ( sMath.eq.iz(snum.slice(1)) ) return "0.0";
				}
				else if ( sMath.eq.iz(snum) ) return "0.0";

				const match = /e([+-]\d+)$/.exec(snum);
				if ( match !== null ) snum = sMath.mul10( snum.slice(0, match.index), +match[1] );	

				!snum.includes(".") && (snum += ".0");
				snum = (snum[0] === "-" ? "-" : "") +
					snum.substring( +(snum[0] === "-") +
						(snum.match(/^-?(0+\B)/)?.[1]?.length ?? 0),
						snum.match(/\B0+$/)?.index ?? Infinity
				);
				return (snum[0] === "." ? "0" : "") + snum + (snum.ew(".") ? "0" : "");
			}
			, type = function type(a/*object*/, specific=false) {
				return specific == !1 || typeof a === "bigint" || typeof a === "symbol" ?
					/^__type__\(\){return("|'|`)mutstr\1}$/.test(`${a?.__type__}`.replace(/\s|;/g, "")) ?
						"string" :
						typeof a :
					a === void 0 ?
						"und" :
						typeof a === "number" ?
							Number.isNaN(a) ?
								"nan" :
								Number.isNaN(a - a) ?
									"inf" :
									"num" :
							typeof a === "object" ?
								a?.constructor?.name === 'NodeList' ?
									"nodelist" :
									a === null ?
										"null" :
										a instanceof RegExp ?
											"regex" :
											/^__type__\(\){return("|'|`)linkedlist\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
												"linkedlist" :
												/^__type__\(\){return("|'|`)complex\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
													"complex" :
													/^__type__\(\){return("|'|`)fraction\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
														"fraction" :
														/^__type__\(\){return("|'|`)set\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
															"set" :
															/^__type__\(\){return("|'|`)dict\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
																"dict" :
																/^__type__\(\){return("|'|`)mutstr\1}$/.test(`${a.__type__}`.replace(/\s|;/g, "")) ?
																	"mutstr" :
																	isArr(a) ?
																		"arr" :
																		"obj" :
								typeof a === "string" ?
									"str" :
									typeof a === "boolean" ?
										"bool" :
										typeof a === "bigint" ?
											"int" :
											/^class/.test(a+"") ?
												"class" :
												"func"
			}
			, strToObj = (function create_sto() {
				function isInvalidString(str, nextCharacter="]") {
					// Stage 2: isInvalidString. returns [isInvalid, endBracketIndex]
					for (var i = 1; i < str.length; i++) {
						if (str[i] === str[0]) {
							if ( str[i-1] !== "\\" || str[i-2] === "\\")
								return str[i+1] !== nextCharacter ? [!0, i] : [!1, i+1];
						}
						else if (str[i] === nextCharacter) return [!0, i];
					}
				}
				function isInvalidSymbolDotFor(str="", nextCharacter="]") {
					let [isInvalid, endBracketIndex] = isInvalidString(str.slice(11), ")");
					endBracketIndex += 12;
					return [str[endBracketIndex] !== nextCharacter ? !1 : isInvalid, endBracketIndex];
				}
				function stringToObject(
					str = "globalThis" // string to convert into an object
					, scope = globalThis
					, removeSpaces = true
					, optionalStart = true
				)
				{
					// kind of like eval or JSON.parse except it converts something like "window.Math" ...
					// into the object instead of from the serialized form of the object.
					// converts strings to objects in 4 steps. 1 of which is optional sometimes.
					// uses eval, but safely.
					// stage 1: remove unneccessary extra whitespace
					// only skip stage 1 if you are positive it was already done.
					if (removeSpaces) {
						// all whitespace characters that are not contained by strings get removed as unnecessary.
						// problem?: "asdf.a sdf" maps to "asdf.asdf"
							// It is too complicated to make that an error, and I don't care enough, and it doesn't matter anyway. just don't input that if you don't want it to work.
						str = str.split("");
						let i = 0, inString = !1;
						for (; i < str.length; i++) {
							if (inString) inString === str[i] && (inString = !1);
							else if ( "'`\"".includes(str[i]) ) inString = str[i];
							else /\s/.test(str[i]) && str.splice(i--, 1);
						}
						str = str.join("");
					}

					// stage 2: fix the beginning part

					if ( /^[^?.]/.test(str[0]) ) str = (optionalStart ? "?." : ".") + str;

					// stage 3: split the string correctly into an array

					for (var i = 0, output = [], n = str.length; i < n ;) {
						if (str[i] === "?") {
							if (str[i+1] !== ".") throw Error(`invalid optional member access at index ${i}`);
							str[i+2] === "[" && i++;
							output.push("?.");
							i++;
						}
						if (str[i] === "[") {
							i++;
							let tmpstr = str.substr(i);
							switch (!0) {
								// Boolean:
								case tmpstr.substr(0, 6) === "false]":
								case tmpstr.substr(0, 5) === "true]":
								// nullish:
								case tmpstr.substr(0, 5) === "null]":
								case tmpstr.substr(0, 10) === "undefined]":
								// Number, NaN:
								case tmpstr.substr(0, 4) === "NaN]":
								case !isNaN(+tmpstr.slice(0, tmpstr.indexOf("]"))):
								// BigInt:
								case tmpstr[tmpstr.indexOf("]")-1] === "n" && !isNaN( +tmpstr.slice(0, tmpstr.indexOf("]")-1) ):
									tmpstr = `"${tmpstr.slice(0, tmpstr.indexOf("]"))}"${tmpstr.slice(tmpstr.indexOf("]"))}`;
									// there is intentionally no break here.
								// String:
								case "\"'`".includes(tmpstr[0]):
									var [isInvalid, endBracketIndex] = isInvalidString(tmpstr, "]");
									if (isInvalid) throw Error(`invalid string computed member access at index ${i}`);
									output.push( tmpstr.slice(0, endBracketIndex) );
									i += endBracketIndex + 1;
									break;
								// Symbol.for:
								case tmpstr.substr(0, 11) === "Symbol.for(":
									var [isInvalid, endBracketIndex] = isInvalidSymbolDotFor(tmpstr, "]");
									if (isInvalid)
										throw Error(`invalid Symbol.for(...) computed member access at index ${i}`)
									output.push( tmpstr.slice(0, endBracketIndex) );
									i += endBracketIndex + 1;
									break;
								// other Symbol attribute:
								case /^Symbol\.\w+]/.test(tmpstr):
									const match = /^Symbol\.\w+]/.exec(tmpstr);
									output.push( match[0] );
									i += match[0].length;
									break;
								// something else:
								default:
									throw Error(`invalid type for computed member access at index ${i}`);
							}
						}
						else if (str[i] === ".") {
							i++;
							if (/\d/.test(str[i]))
								throw Error(`invalid dot operator member acces at index ${i}. cannot start with a number.`);
							let match = /\w+/.exec( str.slice(i) );
							output.push(`"${match[0]}"`);
							i += match[0].length;
						}
						else throw Error("Probably Not supposed to happen.");
					}

					// stage 4: turn the array into an object

					// these evals are guaranteed to be safe.
					// either they are something like "'string'", "Symbol.attribute", or "Symbol.for('string')".
					output.forEach( (e, i) => e === "?." ?
						null :
						( scope = output[i-1] === "?." ? scope?.[eval(e)] : scope[eval(e)] )
					);
					return scope;
				}
				stringToObject._isInvalidString = isInvalidString;
				stringToObject._isInvalidSymbolDotFor = isInvalidSymbolDotFor;
				return stringToObject;
			})()
			, define = (function create_define() {

				function error(name, scopename, orig_str, ON_CONFLICT) {
					const args = [
						String(name)
						, (scopename || "").replace(/(object|prototype)\s*/, "")
						, scopename?.replace?.(/\s*\w+\s*$/, "")?.split?.(/\s+/g) || []
						, orig_str,
					];
					CONFLICT_ARR.push(args);
					if (ON_CONFLICT === "crash") throw Error(`${stringifyScope(...args)} is already defined and LibSettings.ON_CONFLICT is set to 'crash'`);
					if (ON_CONFLICT === "cry") console.log(`${stringifyScope(...args)} overwritten and LibSettings.ON_CONFLICT is set to cry.`);
					if (ON_CONFLICT === "debugger") debugger;
					else if (ON_CONFLICT === "dont-use") return !0;
					return !1;
				}

				function createList(str) {
					var list = str.replace(/^\s+|\s+$/g, "")
						, name;
					if ("'\"`".includes( list[list.length - 1] )) {
						let char = list.at(-1)
							, i = list.length - 1; // this `- 1` is intentional
						while (i --> 0) if (list[i] === char) break;
						if (i < 0) throw Error("name quotation only has no beginning");

						name = list.slice(i+1);
						list = list.slice(0, i);
					}
					else {
						const regex = list.match(/\S+$/);
						name = regex[0];
						list = list.slice(0, regex.index);
					}
					return [
						Array.from(new Set( list.split(/\s+/g).filter(e => e).map(s => s.toLowerCase()) )),
						name
					];
				}

				var previous = null;

				function define(
					str, // key in LIBRARY_VARIABLES or for variable name in scope.
					section, // for defer.
					scope = globalThis,
					customValue = undefined,
					scopename = undefined,
					ON_CONFLICT = LibSettings.ON_CONFLICT,
					addLocalAuto = false
				) {
					if (
						typeof str !== "string" ||
						!str ||
						scope == null ||
						scope != scope /*NaN*/ ||
						(Array.isArray( LibSettings.Global_Ignore_List ) ?
							LibSettings.Global_Ignore_List.includes(str) :
							LibSettings.Global_Ignore_List === s
						)
					) return;

					if (addLocalAuto && !Object.hasOwn(LIBRARY_VARIABLES, str) && scopename === void 0) {
						if (!str.includes("auto")) str = "auto " + str;
						if (!str.includes("local")) str = "local " + str;
						LIBRARY_VARIABLES[str] = customValue;
					}

					var [list, name] = createList(str)
					, value = customValue === void 0 ?
						LIBRARY_VARIABLES[str] :
						customValue;

					if (list.includes("auto") || list.includes("archived") || list.includes("ignore"))
						return;
					if (list.includes("deprecated")) {
						// doesn't work with functions that use `this`
						if (!LibSettings.Define_Deprecated_Functions || typeof value !== "function") return;
						let deprectedScopeStr = stringifyScope(
							name
							, (scopename || "").replace(/(object|prototype)\s*/, "")
							, scopename?.replace?.(/\s*\w+\s*$/, "")?.split?.(/\s+/g) || []
							, str
						);
						var _fn = value;
						if (LibSettings.Warn_Deprecated_Use)
						value = LibSettings.Use_Orig_Args_For_Deprecated_Fns ?
							Function(
								getArguments(_fn) /* already a string */
								, `\tconsole.warn("deprecated function '${deprectedScopeStr}' is being called");\n\treturn this._fn.apply(this._scope, arguments);`
							).bind({ _fn: _fn, _scope: scope }) :
							function fn(/*arguments*/) {
								console.warn(`deprecated function '${deprectedScopeStr}' is being called`);
								return _fn.apply(scope, arguments);
							};
						value._fn = _fn;
						value._scope = scope;
					}

					if (list.includes("ifdom") && !LibSettings.Use_Document)
						// return if not using the DOM
						return LibSettings.DOM_Ignore_list.push( [name, value] );
					if (list.includes("previous")) return define(
						str.replace(/previous\s+/g, ""),
						section,
						scope,
						previous, // this arg is different. can't just do ...arguments
						scopename,
						ON_CONFLICT,
						addLocalAuto
					);
					if (list.includes("math")) {
						!list.includes("call") && !list.includes("instance") && list.push("instance");
						!list.includes("defer") && list.push("defer");
					}
					if (list.includes("symbol"))
						// Symbol instead of String.
						name = Symbol.for(name);
					if (list.includes("pdelete")) {
						if ( scope == null && list.includes("try") )
							return;

						// update the previous object. overwrites everything else. must be used on its own.
						previous = scope[name];
						delete scope[name];
					}
					if (list.includes("delete")) {
						if ( scope == null && list.includes("try") )
							return;

						// overwrites everything else except pdelete. must be used on its own.
						delete scope[name]
					}
					if (list.includes("object")) {
						let newScope;

						if ( list.includes("try") ) {
							try { newScope = strToObj(name, scope) }
							catch { return }
						}
						else newScope = strToObj(name, scope);

						for (let [key, val] of Object.entries( value ))
							define(key, section, newScope, val, str, ON_CONFLICT, addLocalAuto);
						return;
					}
					if (list.includes("prototype")) {
						let newScope;

						if ( list.includes("try") ) {
							try { newScope = strToObj(name, scope)?.prototype }
							catch { return }
						}
						else newScope = strToObj(name, scope)?.prototype;

						for (let [key, val] of Object.entries( value ))
							define(key, section, newScope, val, str, ON_CONFLICT, addLocalAuto);
						return;
					}
					if (list.includes("local")) {
						if (list.includes("defer") && !section)
							return LibSettings.LOCAL_DEFER_ARR.push(str);
						if (list.includes("overwrite") || list.includes("native"))
							throw Error("overwrite and native are not supported for locals");
						if (list.includes("instance")) previous = new value;
						else if (list.includes("call")) previous = value();
						else previous = value;
						return;
					}
					if (list.includes("defer") && !section)
						return LibSettings.DEFER_ARR.push(str);

					if (list.includes("instance"))
						previous = new value;
					else if (list.includes("call"))
						previous = value();
					else
						previous = value;

					if (list.includes("math")) Reflect.defineProperty(MathObjects, name, {
						value: previous,
						writable: !1,
						enumerable: !1,
						configurable: !1,
					});
					if (list.includes("native")) return define( (typeof scope[name] === "function" &&
						(scope[name]+"").endsWith("() { [native code] }") ? "overwrite " : "") + name,
						section, scope, previous, scopename || "", ON_CONFLICT, addLocalAuto
					);

					if ( scope == null && list.includes("try") )
						return;

					return list.includes("overwrite") || !(scope[name] !== void 0 &&
						ON_CONFLICT !== "none" &&
						error(name, scopename, str, ON_CONFLICT)
					) ?
						(list.includes("nproperty") ||
							!(list.includes("property") || LibSettings.Property_Is_Default_Defined_Vars) ?
							(scope[name] = previous) :
							Reflect.defineProperty(scope, name, {
								value: previous
								, configurable: list.includes("configurable") || !!LibSettings.Defined_Properties_Configurable
								, enumerable: list.includes("iterable") ||
									list.includes("enumerable") ||
									!!LibSettings.Defined_Properties_Enumerable
								, writable: !(list.includes("nwritable") && !LibSettings.Defined_Properties_Writable),
							})
						) :
						void 0;
				}

				define.getPrevious = function getPrevious() { return previous };
				define.error = error;
				define.createList = createList;

				return define;
			})()
			, stringifyMath = function stringifyMath(
				fn/*function or string*/,
				variable = "x",
				defaultArgValue = '"1.0"',
				precision = 18
			) {
				// can take in a string or a function. returns a function.
				// "^" means exponent
				// "//" means floor division (fdiv)
				// TODO/FIX: Make exponents evaluate right-to-left instead of left-to-right
				// TODO/ADD: Add correct support for unary operators
					// TODO/FIX: fix "-2 + 3"
					// TODO/FIX: fix "+x + 3"
					// TODO/FIX: fix "- x^2 + 3"
				// TODO/CHG: change "^" to be ipow, and "**" to be pow
				// TODO/ADD: add "\\" (double backslash) for cdiv
				// TODO/ADD: add "!" as the factorial of whatever came before

				if (type(variable) !== "string" || !variable?.length) return !1;
				defaultArgValue = String(defaultArgValue);
				var code = (typeof fn === "function" ? fn.code() : fn).replace(
					[
						/^\s*return\s*/
						, /(\d*\.\d+|\d+\.\d*)/g
						, /\[/g
						, /\]/g
						, /\b\s*([-+/*^%]+)\s*\b/g
					], [
						""
						, '"$1"'
						, "("
						, ")"
						, " $1 "
					]
				);

				// stringify non-stringified number literals
				while (!0) {
					let m = code.match(/(?<!")(\b(?<!\.)\d+(?!\.)\b)(?!")/);
					if (m === null) break;
					code = code.slc(0, m.index) + `"${m[0]}"` + code.slc(m.index + len(m[0]));
				}

				// replace things like 5x with sMath.mul["5",x]
				code = `(${code.replace(RegExp(`(\\d+\\.?\\d*)${variable}`, "g"), `sMath.mul["$1",${variable}]`)})`;

				// sMath notation for floor, ceil, and round
				while (code.io("⌈") !== -1 || code.io("⌊") !== -1) {
					// find the cases for flooring, ceiling, and rounding, and parentheses errors
					let i = rMath.min(
						[code.io("⌈"), code.io("⌊")].filter(e => e !== -1)
					)
						, index = i + 1
						, count = 1;
					for (; count ; index++) {
						if (index === code.length) throw Error(`parentheses starting at index ${i} not closed.`);
						if ( "(⌈⌊".incl(code[index]) ) count++;
						else if ( ")⌉⌋".incl(code[index]) ) count--;
					}
					index--;
					if (code[index] === ")") throw Error(`invalid parentheses at indexes ${i} through ${index}`);
					code = `${code.slc(0, i)}sMath.${
						code[i] === "⌈" ?
							code[index] === "⌉" ?
								"ceil" :
								"round" :
							code[index] === "⌋" ?
								"floor" :
								"round"
					}[(${code.slc(i + 1, index).strip()})]${code.slc(index + 1)}`;
				}

				// fix errors here

				while (code.io("(") !== -1) {
					for (var index = 0, i = 0, n = len(code), p = 0, highest = 0; i < n; i++) {
						// find the deepest parentheses
						if (code[i] === "(") p++; else
						if (code[i] === ")") p--;
						if (p > highest) highest = p, index = i;
					}
					var arr = code.slc(index, ")", 0, 1).replace(/([^\s()]+)/g, "($1)")
						.slc(1, -1).strip().split(/(?=\()/g).map(e => e.strip().slc(1, -1));
					if (arr.length === 1) {
						code = code.replace(
							code.slc(index, ")", -1, 1).toRegex(),
							`[${arr}]`
						)
					}
					if (arr.length > 3) {
						var i = rMath.min([ arr.io("**"), arr.io("^") ].filter(e => e !== -1));
						if (i === Infinity) {
							i = rMath.min(
								[ arr.io("*"), arr.io("/"), arr.io("%"), arr.io("//") ]
									.filter(e => e !== -1)
							);
							if (i === Infinity) {
								i = rMath.min([ arr.io("+"), arr.io("-") ].filter(e => e !== -1));
								if (i === Infinity) throw Error("Invalid input. either operators are missing between values, or operator that is not supported was used, or something else, idk.");
							}
						}
						code = code.replace(
							code.slc(index + 1, ")").toRegex()
							, `${arr.slice(0, i-1).join(" ")} (${
								arr.slice(i - 1, i + 2).join(" ")
							}) ${arr.slice(i + 2).join(" ")}`.strip()
						);
						continue;
					}
					let tmp = `sMath.${sMath[arr[1]].name}[${arr[0]},${arr[2]}`;
					tmp.sw("sMath.div") && (tmp += `,"${precision}"`);
					code = code.replace(code.slc(index, ")", 0, 1).toRegex(), tmp + "]");
				}

				// return final output function
				return Function(
					variable + (defaultArgValue === "" ? "" : " = " + defaultArgValue)
					, `\treturn ${
						code.replace([/\[/g, /\]/g], ["(", ")"])
					};`.replace(/,/g, ", ")
				);
			}
			, keyof = function keyof(
				obj = null
				, value = null
				, parentDepth = Infinity
				, compare = (a, b) => a === b
			) {
				if (Number.isNaN(parentDepth = Number(parentDepth))) parentDepth = Infinity;

				for (; parentDepth --> 0 ;) {
					if (obj == null) return null;
					for (const key of Reflect.ownKeys( Object(obj) ))
						if (compare(obj[key], value)) return key;
					if (obj === obj.constructor) return null; // `Function` and probably others
					obj = obj.constructor;
				}
				return null;
			}
			, ord = function ord(string) {
				return type(string) === "string" && string.length ?
					string.length - 1 ?
						string.split("").map(c => c.charCodeAt()) :
						string.charCodeAt() :
					0
			}
			, fpart = function fPart(n, number=true) {
				if (typeof n === "bigint") return number ? 0 : "0.0";
				if ( rMath.isNaN(n) ) return NaN;
				if ( Number.isInteger(n) ) return number ? 0 : "0.0";
				if ((n+"").includes("e+")) n = n.toPrecision(100);
				else if ((n+"").incl("e-")) n = sMath.div10( (n+"").slc(0, "e"), Number((n+"").slc("-", void 0, 1)) );
				return number ?
					Number( (n+"").slc(".") ) :
					`0${`${n}`.slc(".")}`;
			}
			, round = function round(n) {
				return typeof n === "number" ?
					Number.isNaN(n) ?
						NaN :
						Number.isNaN(n - n) ? // infinity
							n :
							+sMath.int(n) + (fpart(n) >= .5) * sgn(n) :
					typeof n === "bigint" ?
						n :
						typeof n === "string" ?
							round(+n) :
							NaN;
			}
			, randint = function randomInt(min=1, max=null) {
				if (max == null)
					max = min, min = 0;
				if (typeof min !== "number" || typeof max !== "number") return round( rand() );
				min < 0 && min--;
				return round( rand() * abs(min - max) + min );
			}
			, floor = function floor(n) {
				return typeof n === "number" ?
					Number.parseInt(n) - (n<0 && n != Number.parseInt(n)) :
					typeof n === "bigint" ?
						n :
						NaN;
			}
			, ceil = function ceil(n) {
				return typeof n === "number" ?
					Number.parseInt(n) + (n>0 && n != Number.parseInt(n)) :
					typeof n === "bigint" ?
						n :
						NaN;
			}
			, getArguments = function getArguments(fn) {
				// broken for (a => { ... })
				// broken for ((a=")" ...) => { ... })
				// any comments inside the argument parens act as a docstring like in python.
				// works for almost all functions
				// works before library functions are defined
				if (typeof fn !== "function") return !1;
				fn += ""; // fn = fn.toString()
				if (/^function \w+\(\)\s*{\s*\[native code\]\s*$/.test(fn))
					return "native function. can't get arguments";
				if (fn.startsWith("class")) return a.slice(0, a.indexOf("{")).trim();
				if (/^function/.test(fn) && /^\s*\(/.test(fn)) return fn.match(/^\w+/)[0]; // ??? idk
				for (var i = 0, fn = fn.slice(fn.indexOf("(")), n = fn.length, count = 0; i < n; i++) {
					if (fn[i] === "(") count++;
					else if (fn[i] === ")") count--;
					if (!count) break;
				}
				return fn.substring(1, i);
			}
			, numToStrW_s = function numberToStringWithUnderscores(number) {
				for (var i = 0, str2 = "", str = `${number}`.reverse(); i < str.length; i++) {
					!(i % 3) && i && (str2 += "_");
					str2 += str[i];
				}
				return str2.reverse();
			}
			, strMul = function stringMultiplication(s1="", num=1) {
				// basically just the same thing as regular string multiplication in Python

				return typeof num === "bigint" && (num = Number(num)),
				isFinite(num) ?

					(num < 0 && (num = 0),					
					type(s1, 1) === "mutstr" ?
						MutableString( String.prototype.repeat.call(s1, num) ) :
							typeof s1 === "string" ?
								s1.repeat(num) :
								""
					) :
					type(s1, 1) === "mutstr" ?
						MutableString() :
						""
			}
			, formatjson = function formatJSON(code="{}", {
				objectNewline = true,
				tab = "\t",
				newline = "\n",
				space = " ",
				arrayOneLine = true,
				// arrayAlwaysOneLine = false, // doesn't do anything yet
				arrayOneLineSpace = " ", // if " ", [ ITEM ]. if "\t", [\tITEM\t]. etc
			}={}) {
				if (type(code) !== "string") throw TypeError("formatjson() requires a string");
				try { JSON.parse(code) } catch { throw TypeError("formatjson() requires a JSON string") }
				if (code.remove(/\s/g) === "{}") return "{}";
				if (code.remove(/\s/g) === "[]") return "[]";
				if (/^("|'|`)(.|\n)*\1$/.test( code.remove(/\s+/g) ))
					return code.remove(/(^\s*)|(\s*$)/g);
				for (var i = 0, n = code.length, tabs = 0, output = "", inString = !1; i < n; i++) {
					if (code[i] === '"' && code[i - 1] !== '\\') inString = !inString;
					if (inString) output += code[i];
					else if (/\s/.test(code[i])) continue;
					else if (code[i] === "{") output += `${code[i]}${newline}${strMul(tab, ++tabs)}`;
					else if (code[i] === "[") {
						if (!arrayOneLine) {
							output += `${code[i]}${newline}${strMul(tab, ++tabs)}`;
							continue;
						}
						for (let arrayInString = !1, index = i + 1 ;; index++) {
							if (code[index] === '"' && code[index - 1] !== '\\')
								arrayInString = !arrayInString;
							if (arrayInString) continue;
							if (["{", "[", ","].includes(code[index])) {
								output += `${code[i]}${newline}${strMul(tab, ++tabs)}`;
								break;
							} else if (code[index] === "]") {
								output += `[${arrayOneLineSpace}${
									code.substring(i + 1, index)
								}${arrayOneLineSpace}]`;
								i = index;
								break;
							}
						}
					} else if (["}", "]"].incl(code[i])) output += `${newline}${strMul(tab, --tabs)}${code[i]}`;
					else if (code[i] === ":") output += `${code[i]}${space}`;
					else if (code[i] === ",") {
						// objectNewline === true : }, {
						// objectNewline === false: },\n\t{
						let s = code.slice(i);
						output += code[i] + (!objectNewline && code[i + 1 + len(s) - len(s.remove(/^\s+/))] === "{" ? `${space}` : `${newline}${strMul(tab, tabs)}`);
					} else output += code[i];
				}
				return output;
			}
			, bisectLeft = function bisectLeft(arr, x, lo=0, hi=null) {
				hi ??= hi = arr?.length ?? 0;
				if (lo < 0 || hi < lo || hi > arr.length) return false;
				let mid;
				while (lo != hi) {
					mid = lo + floor( (hi-lo) / 2 );
					if (arr[mid] < x) lo = mid + 1; else hi = mid;
				}
				return lo;
			}
			, bisectRight = function bisectRight(arr, x, lo=0, hi=null) {
				hi ??= arr?.length ?? 0;
				if (lo < 0 || hi < lo || hi > arr.length) return false;
				let mid;
				while (lo != hi) {
					mid = lo + floor( (hi-lo) / 2 );
					if (arr[mid] <= x) lo = mid + 1; else hi = mid;
				}
				return lo;
			}
			, bisect = function bisect(arr, x, orientation="left", lo=0, hi=null) {
				return (orientation === "left" ?
					bisectLeft : bisectRight
				)(arr, x, lo, hi);
			}
			, qsort = (function create_quickSort() {
				function partition(arr, low, high) {
					let pivot = arr[high];
					for (var i = low - 1, j = low; j <= high - 1; j++)
						arr[j] < pivot && ( i++, [arr[i], arr[j]] = [arr[j], arr[i]] );
					return i++, [arr[i], arr[high]] = [arr[high], arr[i]], i;
				}
				function qsort(arr, low=0, high=arr.length - 1) {
					// does affect original variable, unlike msort
					if (low >= high) return arr;
					const pi = partition(arr, low, high); // partition index
					return qsort(arr, low, pi - 1), qsort(arr, pi + 1, high);
				}
				return qsort.partition = partition, qsort;
			})()
			, msort = (function create_mergeSort() {
				function merge(left, right) {
					let arr = [];
					while (left.length && right.length)
						arr.push( (
							left[0] < right[0] ? left : right
						).shift() );
					return [ ...arr, ...left, ...right ];
				}
				function msort(arr) {
					// doesn't affect original variable, unlike qsort
					return arr.length < 2 ?
						arr :
						merge(
							msort( arr.slice(0, arr.length / 2) ), // slice(a, b) ⩶ slice(⌊a⌋, ⌊b⌋)
							msort( arr.slice(arr.length / 2) )
						)
				}
				return msort.merge = merge, msort;
			})()
			, dict = (function create_dict() {
				// So I can add prototype methods and not have it on literally every object in existance
				var Dictionary = class dict extends globalThis.Object {
					// I think "extends Object" here might be redundant, but whatever.
					constructor(dict) {
						super();
						for (const e of Reflect.ownKeys(dict))
							this[e] = dict[e];
					}
					keys()                   { return Object.keys(this)              }
					keyof(thing, depth, cmp) { return keyof(this, thing, depth, cmp) }
					values()                 { return Object.values(this)            }
					entries()                { return Object.entries(this)           }
					freeze()                 { return Object.freeze(this)            }
					isFrozen()               { return Object.isFrozen(this)          }
					isExtensible()           { return Object.isExtensible(this)      }
					preventExtensions()      { return Object.preventExtensions(this) }
					seal()                   { return Object.seal(this)              }
					isSealed()               { return Object.isSealed(this)          }
					size()                   { return Object.keys(this).length       }
					__type__()               { return "dict";                        }
				}
				function dict(obj={}) { return new Dictionary(obj) }
				dict.fromEntries = function fromEntries(entries=[]) {
					return this( Object.fromEntries(entries) );
				}
				return dict;
			})()
			, intervals = dict()
			, setInterval = function setInterval() {
				var interval = _setInterval.apply(globalThis, arguments);
				intervals[interval] = arguments;
				return interval;
			}
			, clearInterval = function clearInterval(/*code*/) {
				_clearInterval.apply(globalThis, arguments);
				delete intervals[code];
			}
			, getDocstring = function getDocstring(fn) {
				if (!Function.isFunction(fn))
					return "";
					// not a function, no docstring
				fn = fn.code();
				for (var i = 0; i < fn.length; i++) {
					if (fn[i] === "/") {
						if (fn[i+1] === "/") {
							while (fn[++i] !== "\n");
							return fn.slice(0, i);
						} else if (fn[i+1] === "*") {
							for (var inString = null; i < fn.length; i++) {
								if ( "'\"`".includes(fn[i]) ) inString = inString === fn[i] ?
									null : // end of string
									fn[i]; // start of string
								else if (inString === null && fn[i] === "/" && fn[i-1] === "*")
									return fn.slice(0, i+1);
							}
							// impossible, multilined-comment not terminated.
							// there is a bug in code above if this debugger is reached
							debugger;
							return fn + "*/";
						} else return ""; // regular expression or syntax error
					} else if ( !/\s/.test(fn[i]) )
						return "";
						// not a whitespace character, not a comment. no docstring
				}
				return ""; // empty function, empty docstring
			};
			if (LibSettings.Use_Document)
			var createElement = function createElement(element, options={}) {
				if (typeof element !== "string") {
					if (element == null) throw Error("undefined element name");
					options = element;
					element = element.element;
					delete options.element;
				}

				if (typeof element !== "string") throw Error("element name is not a string");

				var element = document.createElement(element)
					, appendChild = true // if false .append() is used instead of .appendChild for objects
					, objects = null
					, clicks = 0;

				for (const e of Object.keys(options)) {
					if (e === "on") {
						isArr(options.on) || ( options.on = [options.on] );
						isArr(options.on) ? [options.on] : options.on
						for (let obj of options[e]) {
							obj.listener ??= obj.handler;
							element.ael( obj.type, obj.listener, {
								capture : obj.capture ,
								passive : obj.passive ,
								once    : obj.once    ,
							});
						}
					}
					else if (["class", "classList"].includes(e)) element.setAttribute("class",
						isArr(options[e]) ?
							options[e].join(" ") :
							options[e]
					);
					else if (e === "children")
						isArr(options[e]) ?
							options[e].forEach(child => element.appendChild(child)) :
							element.appendChild(options[e]);
					else if (e === "onclick")
						typeof options[e] === "function" ?
							element.ael("click", options[e]) :
							element.ael("click", ...options[e]);
					else if (e === "styles")
						for (const style of Object.keys(options[e]))
							element.style[style] = options[e][style];
					else if (e === "attributes" || e === "attr")
						for (const key of Object.keys(options[e]))
							element.setAttribute(key, options[e][key]);
					else if (e === "append") objects = options[e];
					else if (e === "appendChild") appendChild = !!options[e];
					else if (e === "click") clicks = options[e];
					else element[e] = options[e];
				}
				if (objects != null) {
					if ( !isArr(objects) ) objects = [objects];
					for (var i = objects.length; i --> 0 ;)
						appendChild ?
							objects[i].appendChild(element) :
							objects[i].append(element);
				}
				element.click(clicks);
				return element;
			};
			setInterval._setInterval = globalThis.setInterval,
				clearInterval._clearInterval = globalThis.clearInterval;
			LibSettings.DEFER_ARR = DEFER_ARR, LibSettings.LOCAL_DEFER_ARR = LOCAL_DEFER_ARR;
			LibSettings.CONFLICT_ARR = CONFLICT_ARR;
		}
		// Variables in LIBRARY_VARIABLES will be globalized unless explicitly localized.
		var LIBRARY_VARIABLES = {
		"call LinkedList"() {
			class Node {
				constructor(value, next=null) {
					this.value = value;
					this.next = next;
				}
			}
			class LinkedList {
				constructor(head) {
					this.size = 0;
					this.head = head == null ? null : new Node(head);
				}
				insertLast(value) {
					if (!this.size) return this.insertFirst(value);
					this.size++;
					for (var current = this.head; current.next ;)
						current = current.next;
					current.next = new Node(value);
					return this;
				}
				insertAt(value, index=0) {
					if (index < 0 || index > this.size) throw Error(`Index out of range: index: ${index}`);
					if (!index) return this.insertFirst(value);
					if (index === this.size) return this.insertLast(value);
					for (var current = this.head; index --> 0 ;)
						current = current.next;
					this.size++;
					current.next = new Node(value, current.next)
					return this;
				}
				getAt(index=0) {
					if (index < 0 || index > this.size) throw Error(`Index out of range. index: ${index}`);
					for (var current = this.head; index --> 0 ;)
						current = current.next;
					return current;
				}
				removeAt(index) {
					if (index < 0 || index > this.size) throw Error(`Index out of range. index: ${index}`);
					for (var current = this.head; index --> 1 ;)
						current = current.next;
					current.next = current.next.next; // Garbage Collector Will worry about this
					this.size--;
					return this;
				}
				insertFirst(value) {
					this.head = new Node(value, this.head);
					this.size++;
					return this;
				}
				reverse() {
					for (var cur = this.head, prev = null, next; cur ;)
						[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
					this.head = prev ?? this.head;
					return this;
				}
				toArray() {
					for (var current = this.head, a = []; current ;) {
						a.push(current.value);
						current = current.next;
					}
					return a;
				}
				clear() {
					this.head = null;
					this.size = 0;
					return this;
				}
				Node() { return new Node(...arguments) }
				__type__() { return "linkedlist" }
			}
			LinkedList._Node = Node;
			return LinkedList;
		}
		, "ifdom call native Image"() {
			// the function can still be used the same as before
			var _Image = globalThis.Image;
			function Image(width, height, options={}) {
				var image = new _Image(width, height);
				for (const e of Object.keys(options)) image[e] = options[e];
				return image;
			}
			Image._Image = _Image;
			return Image;
		}
		, "call md5"(n) {
			function r(n, r) {
				var t = (65535 & n) + (65535 & r);
				return (n >> 16) + (r >> 16) + (t >> 16) << 16 | 65535 & t
			}
			function t(n, t, e, u, o, c) { return r((f=r(r(t, n), r(u, c))) << (i=o) | f >>> 32 - i, e) }
			function e(n, r, e, u, o, c, f) { return t(r & e | ~r & u, n, r, o, c, f) }
			function u(n, r, e, u, o, c, f) { return t(r & u | e & ~u, n, r, o, c, f) }
			function o(n, r, e, u, o, c, f) { return t(r ^ e ^ u, n, r, o, c, f) }
			function c(n, r, e, u, o, c, f) { return t(e ^ (r | ~u), n, r, o, c, f) }
			function f(n, t) {
				n[t >> 5] |= 128 << t % 32, n[14 + (t + 64 >>> 9 << 4)] = t;
				for (var f=0,i,a,h,l,v=1732584193, d=-271733879, g=-1732584194, s=271733878; f < n.length; f += 16)
					i = v, a = d, h = g, l = s,
					v = e(v, d, g, s, n[f], 7, -680876936), s = e(s, v, d, g, n[f + 1], 12, -389564586),
					g = e(g, s, v, d, n[f + 2], 17, 606105819), d = e(d, g, s, v, n[f + 3], 22, -1044525330),
					v = e(v, d, g, s, n[f + 4], 7, -176418897), s = e(s, v, d, g, n[f + 5], 12, 1200080426),
					g = e(g, s, v, d, n[f + 6], 17, -1473231341), d = e(d, g, s, v, n[f + 7], 22, -45705983),
					v = e(v, d, g, s, n[f + 8], 7, 1770035416), s = e(s, v, d, g, n[f + 9], 12, -1958414417),
					g = e(g, s, v, d, n[f + 10], 17, -42063), d = e(d, g, s, v, n[f + 11], 22, -1990404162),
					v = e(v, d, g, s, n[f + 12], 7, 1804603682), s = e(s, v, d, g, n[f + 13], 12, -40341101),
					g = e(g, s, v, d, n[f + 14], 17, -1502002290),
					v = u(v, d = e(d, g, s, v, n[f + 15], 22, 1236535329), g, s, n[f + 1], 5, -165796510),
					s = u(s, v, d, g, n[f + 6], 9, -1069501632), g = u(g, s, v, d, n[f + 11], 14, 643717713),
					d = u(d, g, s, v, n[f], 20, -373897302), v = u(v, d, g, s, n[f + 5], 5, -701558691),
					s = u(s, v, d, g, n[f + 10], 9, 38016083), g = u(g, s, v, d, n[f + 15], 14, -660478335),
					d = u(d, g, s, v, n[f + 4], 20, -405537848), v = u(v, d, g, s, n[f + 9], 5, 568446438),
					s = u(s, v, d, g, n[f + 14], 9, -1019803690), g = u(g, s, v, d, n[f + 3], 14, -187363961),
					d = u(d, g, s, v, n[f + 8], 20, 1163531501), v = u(v, d, g, s, n[f + 13], 5, -1444681467),
					s = u(s, v, d, g, n[f + 2], 9, -51403784), g = u(g, s, v, d, n[f + 7], 14, 1735328473),
					v = o(v, d = u(d, g, s, v, n[f + 12], 20, -1926607734), g, s, n[f + 5], 4, -378558),
					s = o(s, v, d, g, n[f + 8], 11, -2022574463), g = o(g, s, v, d, n[f + 11], 16, 1839030562),
					d = o(d, g, s, v, n[f + 14], 23, -35309556), v = o(v, d, g, s, n[f + 1], 4, -1530992060),
					s = o(s, v, d, g, n[f + 4], 11, 1272893353), g = o(g, s, v, d, n[f + 7], 16, -155497632),
					d = o(d, g, s, v, n[f + 10], 23, -1094730640), v = o(v, d, g, s, n[f + 13], 4, 681279174),
					s = o(s, v, d, g, n[f], 11, -358537222), g = o(g, s, v, d, n[f + 3], 16, -722521979),
					d = o(d, g, s, v, n[f + 6], 23, 76029189), v = o(v, d, g, s, n[f + 9], 4, -640364487),
					s = o(s, v, d, g, n[f + 12], 11, -421815835), g = o(g, s, v, d, n[f + 15], 16, 530742520),
					v = c(v, d = o(d, g, s, v, n[f + 2], 23, -995338651), g, s, n[f], 6, -198630844),
					s = c(s, v, d, g, n[f + 7], 10, 1126891415), g = c(g, s, v, d, n[f + 14], 15, -1416354905),
					d = c(d, g, s, v, n[f + 5], 21, -57434055), v = c(v, d, g, s, n[f + 12], 6, 1700485571),
					s = c(s, v, d, g, n[f + 3], 10, -1894986606), g = c(g, s, v, d, n[f + 10], 15, -1051523),
					d = c(d, g, s, v, n[f + 1], 21, -2054922799), v = c(v, d, g, s, n[f + 8], 6, 1873313359),
					s = c(s, v, d, g, n[f + 15], 10, -30611744), g = c(g, s, v, d, n[f + 6], 15, -1560198380),
					d = c(d, g, s, v, n[f + 13], 21, 1309151649), v = c(v, d, g, s, n[f + 4], 6, -145523070),
					s = c(s, v, d, g, n[f + 11], 10, -1120210379), g = c(g, s, v, d, n[f + 2], 15, 718787259),
					d = c(d, g, s, v, n[f + 9], 21, -343485551), v = r(v, i), d = r(d, a), g = r(g, h), s = r(s, l);
				return [v, d, g, s]
			}
			function i(n) {
				for (var r = 0, t = "", e = 32 * n.length; r < e; r += 8)
					t += String.fromCharCode(n[r >> 5] >>> r % 32 & 255);
				return t
			}
			function a(n) {
				var r, t = [];
				for (t[(n.length >> 2) - 1] = void 0, r = 0; r < t.length; r++) t[r] = 0;
				var e = 8 * n.length;
				for (r = 0; r < e; r += 8) t[r >> 5] |= (255 & n.charCodeAt(r / 8)) << r % 32;
				return t
			}
			function h(n) {
				var r, t, e = "0123456789abcdef", u = "";
				for (t = 0; t < n.length; t++)
					r = n.charCodeAt(t),
					u += e.charAt(r >>> 4 & 15) + e.charAt(15 & r);
				return u
			}
			function l(n) { return unescape(encodeURIComponent(n)) }
			var ff = f, ii = i;
			function v(n) { return n = l(n), ii(ff(a(n), 8 * n.length)) }
			function d(n, r) {
				return function(n, r) {
					var t, e, u = a(n), o = [], c = [];
					for (o[15] = c[15] = void 0, u.length > 16 && (u = f(u, 8 * n.length)), t = 0; t < 16; t++)
						o[t] = 909522486 ^ u[t], c[t] = 1549556828 ^ u[t];
					return e = f(o.concat(a(r)), 512 + 8 * r.length),
					i(f(c.concat(e), 640))
				}(l(n), l(r))
			}
			return function md5(n, r, t) {
				return r !== void 0 ?
					t !== void 0 ?
						d(r, n) :
						h( d(r, n) ) :
					t !== void 0 ?
						v(n) :
						h(v(n));
			}
		}
		, enumerate(iterable) {
			if (!isIterable(iterable)) return [0, iterable];
			return arrzip( Object.keys(iterable).map(e => +e), iterable );
		}
		, help(str) {
			// eval doesn't matter here because this function is for developer use only.
			try { eval(str) }
			catch (err) {
				if (/SyntaxError: Unexpected token '.+'/.in(`${err}`)) {
					open(`https://developer.mozilla.org/en-US/search?q=${/'(.+)'/.exec(`${err}`)[1]}`, "_blank");
					return "Keyword";
				}
				if (`${err}` === "SyntaxError: Unexpected end of input") {
					open(`https://developer.mozilla.org/en-US/search?q=${str}`, "_blank");
					return "Keyword";
				}
			} try {
				var fn = eval(str);
				if (typeof fn === "function") {
					if (`${fn}`.endsWith("() { [native code] }")) {
						open(`https://developer.mozilla.org/en-US/search?q=${str}()`, "_blank");
						return "Native Function. arguments/docstring can't be retrieved. Use the official JS documentation";
					}
					return console.log(`${getDocstring(fn)}`), `Function: arguments = ${getArguments(fn)}`;
				}
			} catch {}
			try { return "Variable: value = " + Function(`return ${str}`)() }
			catch { return "Variable not Found" }	
		}
		, findDayOfWeek(day=0, month=0, year=0, order="dd/mm/yyyy", str=!0) {
			// dd-mm-yyyy makes more sense in the current context. 
			if (Number.isNaN( day = Number(day) ) || !isFinite(day))
				throw TypeError(`argument 1 either isn't finite or isn't a number`);
			if (Number.isNaN( month = Number(month) ) || !isFinite(month))
				throw TypeError(`argument 2 either isn't finite or isn't a number`);
			if (Number.isNaN( year = Number(year) ) || !isFinite(year))
				throw TypeError(`argument 3 either isn't finite or isn't a number`);
			if (type(order) !== "string" ) throw TypeError(`argument 5 isn't a string`);
			if (order !== "dd/mm/yyyy") {
				order = order.lower().split(/\/|-/);
				const tmp = [day, month, year]
					, used = [!1, !1, !1];
				for (var i = 0; i < 3; i++) switch (order[i]) {
					case "dd":
						if (used[0]) throw Error("Invalid input for argument 5");
						[used[0], day] = [!0, tmp[i]];
						break;
					case "mm":
						if (used[1]) throw Error("Invalid input for argument 5");
						[used[1], month] = [!0, tmp[i]];
						break;
					case "yyyy":
						if (used[2]) throw Error("Invalid input for argument 5");
						[used[2], year] = [!0, tmp[i]];
						break;
					default: throw Error("Invalid input for argument 5");
				}
			}
			day += !day - 1, month += !month - 1;
			const LEAP = !(year % 4)
			// 'days' is the number of days in the month
			// 'offset' is the offset from the beginning of the year to the beginning of the month in days
			, Months = [
				{   days: 31        , offset:   0        }
				, { days: 28 + LEAP , offset:  31        }
				, { days: 31        , offset:  59 + LEAP }
				, { days: 30        , offset:  90 + LEAP }
				, { days: 31        , offset: 120 + LEAP }
				, { days: 30        , offset: 151 + LEAP }
				, { days: 31        , offset: 181 + LEAP }
				, { days: 31        , offset: 212 + LEAP }
				, { days: 30        , offset: 243 + LEAP }
				, { days: 31        , offset: 273 + LEAP }
				, { days: 30        , offset: 304 + LEAP }
				, { days: 31        , offset: 334 + LEAP }
			];
			for (; day > Months[month % 12].days; month++) day -= Months[month % 12].days;
			let ans = (1 + (year += floor(month / 12) - 1) % 4 * 5 +
				year % 100 * 4 + year % 400 * 6 + day +
				Months[month % 12].offset
			) % 7;
			return str ?
				["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] [ans] :
				ans;
		}
		, "ifdom simulateKeypress": function simulateKeypress({
			key = "",
			code = "",
			ctrl = false,
			alt = false,
			shift = false,
			ctrlKey = undefined,
			altKey = undefined,
			shiftKey = undefined,
			type = "keypress",
			view = globalThis,
			isTrusted = true,
			path = [],
			bubbles = true,
			cancelable = true,
			cancelBubble = false,
			which = null,
			charCode = null,
			composed = null,
			currentTarget = null,
			defaultPrevented = null,
			detail = null,
			eventPhase = null,
			isComposing = null,
			keyCode = null,
			location = null,
			metaKey = null,
			repeat = null,
			returnValue = null,
			sourceCapabilities = null,
			srcElement = null,
			target = null,
			timeStamp = null,
		}={})
		{ return document.body.dispatchEvent(
			new KeyboardEvent({
				isTrusted            : isTrusted // sets to false anyway
				, key                : key
				, code               : code
				, ctrlKey            : ctrlKey ?? ctrl
				, altKey             : altKey ?? alt
				, shiftKey           : shiftKey ?? shift
				, view               : view
				, which              : which
				, bubbles            : bubbles
				, cancelBubble       : cancelBubble
				, cancelable         : cancelable
				, charCode           : charCode
				, composed           : composed
				, currentTarget      : currentTarget
				, defaultPrevented   : defaultPrevented
				, detail             : detail
				, eventPhase         : eventPhase
				, isComposing        : isComposing
				, keyCode            : keyCode
				, location           : location
				, metaKey            : metaKey
				, path               : path
				, repeat             : repeat
				, returnValue        : returnValue
				, sourceCapabilities : sourceCapabilities
				, srcElement         : srcElement
				, target             : target
				, timeStamp          : timeStamp
				, type               : type
			})
		)}
		, passwordGenerator(length=18, charsToRemove=void 0, chars=characters) {
			if (Number.isNaN( length = Number(length)) || length < 0) return !1;
			length = Number.parseInt(length);
			if (type(charsToRemove, 1) === "arr") {
				if (charsToRemove.every( e => type(e) === "string" ))
					charsToRemove = charsToRemove.join("");
				else return !1;
			}
			else if (
				type(charsToRemove) !== "string" &&
				charsToRemove !== void 0 &&
				charsToRemove !== null
			) return !1;
			if (chars === characters && charsToRemove !== void 0 && charsToRemove !== null)
				for (const char in charsToRemove)
					chars = chars.remove(char);
			for (var i = length, password = ""; i --> 0 ;)
				password += chars.rand();
			return password;
		}
		, "ifdom getAllDocumentObjects": function getAllDocumentObjects() {
			var objs = [document];
			document.doctype && objs.push(document.doctype);
			objs.union(document.all);
			return objs;
		}
		, "ifdom css": function css(text, options, append) {
			if (typeof text === "object") {
				// if `text` parameter is missing, move the other arguments over 1 place
				// ie: (options, append) --> ("", options, append)
				append = options/* ?? !0*/; // append ??= true happens later anyway
				options = text ?? {}; // in case of null
				text = "";
			}
			else {
				// (text, options?, append?) stays the same
				text ??= "";
				options ??= {};
				// append ??= true happens later
			}

			if (typeof options === "boolean") {
				// (text, append) --> css(text, {}, append)
				append = options;
				options = {};
			}

			append ??= true;
			options.type ??= "text/css";
			options.innerHTML ??= text;
			var element = createElement("style", options);
			if (append) document.head.appendChild(element);
			return element;
		}
		, *genzip(gen1, gen2) {
			// generator zip
			gen1 = toGenerator(gen1), gen2 = toGenerator(gen2);
			var a = gen1.next(), b = gen2.next();
			while (!(a.done || b.done)) {
				let output = [a.value, b.value];
				yield output;
				a = gen1.next(), b = gen2.next();
			}
		}
		, YTThumbnail: function getYoutubeThumbnails(
			URLArray = [],
			resolution = "max", // options: small/low/min, medium, large/high, max
			alwaysReturnArray = false,
			secureURL = true
		) {
			typeof URLArray === "string" && (URLArray = [URLArray]);
			if (type(URLArray, 1) !== "arr") return alwaysReturnArray ? [] : null;

			const isShort = url => /^https:\/\/www\.youtube\.com\/shorts\//.test(url),
				outputArray = [];

			for (const url of URLArray)
				outputArray.push(`http${
					secureURL ? "s" : ""
				}://img.youtube.com/vi/${url.match(/[^/=]+$/)[0]}/${{
					small: "",
					low: "",
					min: "",
					medium: "mq",
					large: "hq",
					high: "hq",
					max: "maxres"
				}[resolution]}default.jpg`);
			return alwaysReturnArray || outputArray.length - 1 ? outputArray : outputArray[0];
		}
		, "call toGenerator"() {
			function *Generator() {
				if (isIterable(thing))
					for (const e of thing)
						yield e;
				else yield thing;
			}
			function toGenerator(thing) {
				return thing?.constructor?.prototype?.[Symbol.toStringTag] === "Generator" ?
					thing :
					Generator(thing);
			}
			return toGenerator.Generator = Generator, toGenerator;
		}
		, fstrdiff         : function firstStringDifferenceIndex(s1, s2) {
			// returns the index of the first difference in two strings.
			// returns NaN if either input is not a string.
			// it is considered a string if it is the built-in string or...
			// if input.__type__() returns "string"
			// returns -1 if there is no difference
			if (type(s1) !== "string" || type(s2) !== "string") return NaN;
			for (var i = 0, n = Math.min(s1.length, s2.length) - 1 ; i < n; i++)
				if (s1[i] !== s2[i]) return i;
			return s1.length === s2.length ? -1 : i;
		}
		, lstrdiff         : function lastStringDifferenceIndex(s1, s2) {
			// returns the index of the last difference in two strings.
			// otherwise, same rules as fstrdiff(a, b)
			if (type(s1) !== "string" || type(s2) !== "string") return NaN;
			for (var i = Math.min(s1.length, s2.length); i --> 0 ;)
				if (s1[i] !== s2[i]) return i;
			return -1;
		}
		, nsub             : function substituteNInBigIntegers(num, n=1) {
			return typeof num === "bigint" ?
				n * Number(num) :
				num;
		}
		, revLList         : function reverseLinkedList(list) {
			for (let cur = list.head, prev = null, next; current ;) 
				[next, cur.next, prev, cur] = [cur.next, prev, cur, next];
			list.head = prev ?? list.head;
			return list;
		}
		, numToWords       : function numberToWords(number, fancyInfinity=true) {
			if (abs(number) === Infinity) return `${number<0?"negative ":""}${fancyInfinity?"apeirogintillion":"infinity"}`;
			// TODO: Update to use a loop or something to expand to as close to infinity as possible
			if (rMath.isNaN(number)) throw Error(`Expected a number, and found a(n) ${type(number)}`);
			var string = `${number}`.remove(/\.$/);
			number = Number(number);
			switch (!0) {
				case /\./.in(string):
					var decimals = `${numberToWords(string.substring(0, string.io(".")))} point`;
					for (var i = string.io(".") + 1; i < len(string); i++)
						decimals += ` ${numberToWords(string[i])}`;
					return decimals;
				case string < 0 || Object.is(Number(string), -0): return `negative ${numberToWords(string.slice(1))}`;
				case string ==  0: return "zero";
				case string ==  1: return "one";
				case string ==  2: return "two";
				case string ==  3: return "three";
				case string ==  4: return "four";
				case string ==  5: return "five";
				case string ==  6: return "six";
				case string ==  7: return "seven";
				case string ==  8: return "eight";
				case string ==  9: return "nine";
				case string == 10: return "ten";
				case string == 11: return "eleven";
				case string == 12: return "twelve";
				case string == 13: return "thirteen";
				case string == 15: return "fifteen";
				case string == 18: return "eighteen";
				case string  < 20: return `${numberToWords(string[1])}teen`;
				case string == 20: return "twenty";
				case string  < 30: return `twenty-${numberToWords(string[1])}`;
				case string == 30: return "thirty";
				case string  < 40: return `thirty-${numberToWords(string[1])}`;
				case string == 40: return "forty";
				case string  < 50: return `forty-${numberToWords(string[1])}`;
				case string == 50: return "fifty";
				case string  < 60: return `fifty-${numberToWords(string[1])}`;
				case string == 60: return "sixty";
				case string  < 70: return `sixty-${numberToWords(string[1])}`;
				case string == 70: return "seventy";
				case string  < 80: return `seventy-${numberToWords(string[1])}`;
				case string == 80: return "eighty";
				case string  < 90: return `eighty-${numberToWords(string[1])}`;
				case string == 90: return "ninety";
				case string < 100: return `ninety-${numberToWords(string[1])}`;
				case string % 100===0 && len(string)===3: return `${numberToWords(string[0])} hundred`;
				case string < 1e3: return `${numberToWords(string[0])} hundred and ${numberToWords(string.substr(1,2))}`;
				case string % 1e3===0 && len(string)===4: return `${numberToWords(string[0])} thousand`;
				case string < 1e4: return `${numberToWords(string[0])} thousand ${numberToWords(string.substr(1,3))}`;
				case string % 1e3===0 && len(string)===5: return `${numberToWords(string.substr(0,2))} thousand`;
				case string < 1e5: return`${numberToWords(string.substr(0,2))} thousand ${numberToWords(string.slice(2))}`;
				case string % 1e3===0 && len(string)===6: return `${numberToWords(string.substr(0,3))} thousand`;
				case string < 1e6: return`${numberToWords(string.substr(0,3))} thousand ${numberToWords(string.slice(3))}`;
				case string % 1e6===0 && len(string)===7: return `${numberToWords(string[0])} million`;
				case string < 1e7: return`${numberToWords(string[0])} million ${numberToWords(string.slice(1))}`;
				case string % 1e6===0 && len(string)===8: return `${numberToWords(string.substr(0,2))} million`;
				case string < 1e8: return `${numberToWords(string.substr(0,2))} million ${numberToWords(string.slice(2))}`;
				case string % 1e6===0 && len(string)===9: return `${numberToWords(string.substr(0,3))} million`;
				case string < 1e9: return `${numberToWords(string.substr(0,3))} million ${numberToWords(string.slice(3))}`;
				case string % 1e9===0 && len(string)===10: return `${numberToWords(string[0])} billion`;
				case string < 1e10: return `${numberToWords(string[0])} billion ${numberToWords(string.slice(1))}`;
				case string % 1e9===0 && len(string)===11: return `${numberToWords(string.substr(0,2))} billion`;
				case string < 1e11: return `${numberToWords(string.substr(0,2))} billion ${numberToWords(string.slice(2))}`;
				default: throw Error(`Invalid Number. The function Only works for {x:|x| < 1e11}\n\t\tinput: ${numToStrW_s(number)}`);
			}
		}
		, minifyjson       : function minifyJSON(code) {
			// removes all the unnecessary spaces and things
			return formatjson(code, {
				objectNewline      : !0, // less conditionals are checked if this is set to true
				tab                : "",
				newline            : "",
				space              : "",
				arrayOneLine       : !1, // less conditionals
				arrayAlwaysOneLine : !1,
				arrayOneLineSpace  : "",
			})
		}
		, "deprecated dir" : function currentDirectory(loc = globalThis.Error().stack) {
			// sometimes doesn't work
			return `${loc}`.slice(13).replace(/(.|\s)*(?=file:)|\s*at(.|\s)*|\)(?=\s+|$)/g, "");
		}
		, "defer call MutableString"() {
			// TODO: Make safety things for the functions so the user doesn't add non-character things
			var MutStr = class MutableString extends Array {
				constructor() {
					super();
					this.pop(); // there shouldn't be anything, but indexes were off before, so idk.
					for (const e of arguments) {
						// type() and not typeof so mutable strings also work
						type(e) === "string" && this.union(e.split(""));
						if (isArr(e) && e.every(e => typeof e === "string"))
							this.union(e);
					}
				}
				__type__() { return "mutstr" }
				toString(joiner="") { return this.join(joiner) }
				valueOf(/*arguments*/) { return Array.prototype.valueOf.apply(this, arguments) }
				concat() { return Array.prototype.concat.apply(this, arguments) }
			};
			let protoArray = Reflect.ownKeys(MutStr.prototype);

			for (const s of Reflect.ownKeys(String.prototype))
				protoArray.incl(s) || (MutStr.prototype[s] = String.prototype[s]);

			function MutableString(/*arguments*/) { return new MutStr(...arguments) }
			MutableString.fromCharCode = function fromCharCode(code) {
				return this (isArr(code) ? code.map(e => chr(e)) : chr(code));
			}
			return MutableString;
		}
		, str: function String(a) { return a?.toString?.call?.( [].slice.call(arguments, 1) ) }
		, async getIp() { return (await fetch("https://api.ipify.org/")).text() }
		, complex(re=0, im=0) { return cMath.new(re, im) }
		, valueCompare(
			a = null,
			b = null,
			unknown = function unknownCompare(a, b) {
				throw Error("unknown type passed to valueCompare()");
			}
		) {
			// essentially a === b
			if (Number.isNaN(a)) return Number.isNaN(a);
			if (a === undefined) return b === undefined;
			if (a === null) return b === null;

			if (a.constructor !== b.constructor) return false;

			if (
				a.constructor === Boolean ||
				a.constructor === Number  ||
				a.constructor === BigInt  ||
				a.constructor === String
			) return a === b;
			else if (a.constructor === Array) {
				if (a.length !== b.length) return false;

				for (var i = a.length; i --> 0 ;)
					if ( !valueCompare(a[i], b[i]) )
						return false;

				return true;

			}
			else if (a.constructor === Object) {
				const aKeys = Reflect.ownKeys(a);
				const bKeys = Reflect.ownKeys(b);

				if (!valueCompare(aKeys, bKeys))
					return false;

				for (var key of aKeys)
					if ( !valueCompare(aKeys, bKeys) )
						return false;

				return true;
			}
			else if (a.constructor === Symbol) {
				const keyA = Symbol.keyFor(a);
				return keyA == null ? a === b : valueCompare(keyA, Symbol.keyFor(b));
			}
			else if (a.constructor === Function)
				return valueCompare( a.functionType(), b.functionType() ) &&
					valueCompare( a.args(), b.args() ) &&
					valueCompare( a.code(), b.code() );
			else if (a.constructor === RegExp)
				return valueCompare(a.source, b.source) &&
					valueCompare(a.flags, b.flags);
			else if (a.constructor === fMath.Fraction)
				return valueCompare(a.numer, b.numer) &&
					valueCompare(a.denom, b.denom);
			else if (a.constructor === cMath.Complex)
				return valueCompare(a.re, b.re) &&
					valueCompare(a.im, b.im);
			else if (a.constructor === MutableString)
				return valueCompare(a + "", b + "");
			else if (a.constructor === rMath.Set)
				return valueCompare( Array.from(a), Array.from(b) );
			else
				unknown(a, b);
		}
		, "call native RegExp"() {
			const _RegExp = RegExp
			, regex = function RegExp(source="(?:)", flags="") {
				return /*this.*/_RegExp(
					typeof source === "symbol" ?
						symbToStr(source).replace(/([-+.?*^$()[\]{}\\/\|])/g, "\\$1") :
						source?.toString?.() ?? "(?:)",
					Array.from( new Set(flags?.toString?.().toLowerCase?.()) ).join("") // remove repeats
				);
			};

			// I tried both Reflect and Object.setPrototypeOf(obj, proto), neither had any effect
			regex.prototype = _RegExp.prototype;

			Reflect.defineProperty(regex, "_RegExp", {
				get: function() { return _RegExp }
				, set: function() { throw Error("'_RegExp' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "length", {
				get: function() { return this._RegExp.length }
				, set: function() { throw Error("'length' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "name", {
				get: function() { return this._RegExp.name }
				, set: function() { throw Error("'name' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});

			// all of the remaining properties are deprecated.
			Reflect.defineProperty(regex, Symbol.species, {
				get: function() { return this._RegExp[Symbol.species] }
				, set: function() { throw Error("`Symbol.species` property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "rightContent", {
				get: function() { return this._RegExp.rightContent }
				, set: function() { throw Error("'rightContent' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "leftContent", {
				get: function() { return this._RegExp.leftContent }
				, set: function() { throw Error("'leftContent' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "lastMatch", {
				get: function() { return this._RegExp.lastMatch }
				, set: function() { throw Error("'lastMatch' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "lastParen", {
				get: function() { return this._RegExp.lastParen }
				, set: function() { throw Error("'lastParen' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "input", {
				get: function() { return this._RegExp.input }
				, set: function() { throw Error("'input' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$&", {
				get: function() { return this._RegExp["$&"] }
				, set: function() { throw Error("'$&' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			}); // lastMatch
			Reflect.defineProperty(regex, "$+", {
				get: function() { return this._RegExp["$+"] }
				, set: function() { throw Error("'$+' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			}); // lastParen
			Reflect.defineProperty(regex, "$_", {
				get: function() { return this._RegExp.$_ }
				, set: function() { throw Error("'$_' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			}); // input
			Reflect.defineProperty(regex, "$'", {
				get: function() { return this._RegExp["$'"] }
				, set: function() { throw Error("\"'$'\" property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			}); // rightContent
			Reflect.defineProperty(regex, "$`", {
				get: function() { return this._RegExp["$`"] }
				, set: function() { throw Error("'$`' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			}); // leftContent
			Reflect.defineProperty(regex, "$1", {
				get: function() { return this._RegExp.$1 }
				, set: function() { throw Error("'$1' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$2", {
				get: function() { return this._RegExp.$2 }
				, set: function() { throw Error("'$2' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$3", {
				get: function() { return this._RegExp.$3 }
				, set: function() { throw Error("'$3' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$4", {
				get: function() { return this._RegExp.$4 }
				, set: function() { throw Error("'$4' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$5", {
				get: function() { return this._RegExp.$5 }
				, set: function() { throw Error("'$5' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$6", {
				get: function() { return this._RegExp.$6 }
				, set: function() { throw Error("'$6' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$7", {
				get: function() { return this._RegExp.$7 }
				, set: function() { throw Error("'$7' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$8", {
				get: function() { return this._RegExp.$8 }
				, set: function() { throw Error("'$8' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});
			Reflect.defineProperty(regex, "$9", {
				get: function() { return this._RegExp.$9 }
				, set: function() { throw Error("'$9' property of RegExp cannot be changed or deleted.") }
				, enumerable: false
				, configurable: false
			});

			return regex.prototype.constructor = regex, regex;
		}
		, HTMLElementToString(element) {
			if (element?.constructor?.name === "DocumentType") return `<!DOCTYPE ${element?.name ?? "html"}>`;
			if (element?.constructor?.name === "CDATASection") return `<![CDATA[${element?.textContent ?? ""}]]>`;
			if (element?.constructor?.name === "Comment") return `<!--${element.textContent ?? ""}-->`;
			if (element?.constructor?.name === "Text") return element?.textContent ?? "";
			if (["Document", "HTMLDocument"].includes(element?.constructor?.name))
				return Array.from(element.childNodes).map(e => HTMLElementToString(e)).join("\n");
			
			if (/$HTML\w+/.test(element?.constructor?.name)) return element?.outerHTML ?? "";
			return "";
			// ShadowRoot?
		}
		, isHTMLElement(element) {
			if (element == null || element.constructor == null)
				return false;
			const name = element.constructor.name;
			if ( [
				"Text"
				, "Image"
				, "Comment"
				, "DocumentType"
				, "CDATASection"
				, "HTMLDocument", "Document"
			].includes(element) ) return true;
			return /$HTML\w+/.test(element.constructor.name);
		}
		, stringifyMath  : stringifyMath
		, createElement  : createElement
		, getNewGlobals  : getNewGlobals
		, getDocstring   : getDocstring
		, getArguments   : getArguments
		, isEnumerable   : isEnumerable
		, bisectRight    : bisectRight
		, MathObjects    : MathObjects
		, isIterable     : isIterable
		, bisectLeft     : bisectLeft
		, numStrNorm     : numStrNorm
		, formatjson     : formatjson
		, symbToStr      : symbToStr
		, strToObj       : strToObj
		, deepCopy       : deepCopy
		, randint        : randint
		, sizeof         : sizeof
		, strMul         : strMul
		, bisect         : bisect
		, arrzip         : arrzip
		, constr         : constr
		, qsort          : qsort
		, msort          : msort
		, round          : round
		, floor          : floor
		, fpart          : fpart
		, isArr          : isArr
		, range          : range
		, type           : type
		, ceil           : ceil
		, dict           : dict
		, json           : json
		, list           : list
		, rand           : rand
		, abs            : abs
		, sgn            : sgn
		, int            : int
		, dim            : dim
		, len            : len
		, chr            : chr
		, ord            : ord // idk, it's called "ord" in python.
		, π              : π
		, "symbol <0x200b>": "​" // zero width space
		, "symbol <0xfeff>": "﻿" // byte order mark
		, "symbol <0x00a0>": " " // non-(line-)breaking space
		, "ignore getOldGlobals": getOldGlobals
		, "native clearInterval": clearInterval
		, "native setInterval": setInterval
		, "archived clearInterval": clearInterval._clearInterval
		, "archived Math": globalThis.Math
		, "archived setInterval": setInterval._setInterval
		, "local numToStrW_s": numToStrW_s
		, "local stringifyScope": stringifyScope
		, "local base62Numbers": base62Numbers
		, "local LibSettings": LibSettings
		, "local characters": characters
		, "local alphabetL": alphabetL
		, "local alphabetU": alphabetU
		, "local intervals": intervals
		, "local alphabet": alphabet
		, "local numbers": numbers
		, "local pi_2": π_2
		, "local pi_3": π_3
		, "local pi2_3": π2_3
		, "local pi_4": π_4
		, "local pi3_4": π3_4
		, "local pi5_4": π5_4
		, "local pi7_4": π7_4
		, "local pi_5": π_5
		, "local pi_6": π_6
		, "local pi5_6": π5_6
		, "local pi7_6": π7_6
		, "local pi11_6": π11_6
		, "local pi_7": π_7
		, "local pi_8": π_8
		, "local pi_9": π_9
		, "local pi_10": π_10
		, "local pi_11": π_11
		, "local pi_12": π_12
		, "local pi": pi
		, "local tau": tau
		, "local e": e
		, "local phi": phi
		, "local foia1": foia1
		, "local foia2": foia2
		, "local emc": emc
		, "local omega": omega
		, "local define": define
		// the built-in methods are enumerable for the next three
		, "ifdom prototype NodeList": { last: lastElement }
		, "ifdom prototype HTMLCollection": { last: lastElement }
		, "ifdom prototype HTMLAllCollection": { last: lastElement }
		, "object Object": {
			"property copy" : deepCopy,
			"property keyof": keyof,
			"call native property create"() {
				const _create = Object.create;
				function create(proto, properties) {
					// normally if you pass in undefined, it throws an error, but null works fine.
					return _create(proto ?? null, properties);
				}
				return create._create = _create, create;
			}
		}
		, "try object jQuery.fn": {
			merge: function ( second ) {
				return jQuery.merge( this, second );
			}
			, mergeRight: function ( first ) {
				return jQuery.merge( first, this );
			}
			, checked: function ( value ) {
				value == null ?
					this[0]?.checked :
					this.each( (_i, e) => (e.checked = !!value, true) );
			}
		}
		, "prototype Object": {
			"archived property tofar": function toFlatArray() {
				// TODO/FIX: Fix for 'Arguments' objects and HTML elements
				var val = this;
				return [
					"number"
					, "string"
					, "symbol"
					, "boolean"
					, "bigint"
					, "function"
				].includes(typeof val) || val == null || val?.constructor?.name === "Object" ?
					[this].flatten() :
					Array.from(this).flatten();
			},
		}
		, "prototype RegExp": {
			"property in": RegExp.prototype.test
			, "property all": function all(str="") { return RegExp(`^(${this.source})$`, "").test(str) }
			, "property toRegex": function toRegex(flags=this.flags) { return RegExp(this.source, flags) },
		}
		, "prototype Array": {
			"property append": Array.prototype.push
			, "property io": Array.prototype.indexOf
			, "property rev": Array.prototype.reverse
			, "property lio": Array.prototype.lastIndexOf
			, "property incl": (function create_incl() {
				const _includes = Array.prototype.includes;
				function includes(searchElement, fromIndex=0, compare=(a,b) => a === b) {
					for (var i = this.length; i --> fromIndex ;) {
						if ( compare(this[i], searchElement) )
							return true;
					}
					return false;
				}
				includes._includes = _includes;
				return includes;

			})()
			, "property last": lastElement
			, "property nincl": function doesntInclude() {
				return !Array.prototype.incl.apply(this, arguments);
			}
			, "call property any"() {
				const _some = Array.prototype.some;
				function any(callback=e=>e, thisArg=void 0) { return _some.call(this, callback, thisArg) }
				return any._some = _some, any;
			}
			, "native property some": function some(fn) {
				// "some" implies plurality. use "any" for any. some != any
				var num = 0;

				for (var i = this.length; i --> 0 ;) {
					num += !!fn(this);
					if (num > 1) return !0;
				}

				return !1;
			}
			, "property for": function forEachReturn(f=(e, i, a)=>e, ret) {
				// don't change order from ltr to rtl
				for (var a = this, i = 0, n = a.length; i < n ;)
					f(a[i], i++, a);

				return ret;
			}
			, "property shift2": function shift2(num=1) {
				while ( num --> 0 ) Array.prototype.shift.call(this);
				return this;
			}
			, "property union": function union(array) {
				["NodeList", "HTMLAllCollection", "HTMLCollection"].incl(array?.constructor?.name) &&
					(array = Array.from(array));
				for (var arr = this.concat(array), i = arr.length; i --> 0 ;)
					this[i] = arr[i];
				return this;
			}// TODO/ADD: Add Array.prototype.fconcat. basically a mixture between concat and unshift
			// TODO/ADD: Add Array.prototype.funion. basically a mixture between union and unshift
			, "property pop2": function pop2(num=1) {
				while ( num --> 0 ) Array.prototype.pop.call(this);
				return this;
			}
			, "property splice2": function splice2(a, b, ...c) {
				var d = this;
				d.splice(a, b);
				return c.flatten().for((e, i) => d.splice(a + i, 0, e), d);
			}
			, "property push2": function push2(e, ...i) {
				// TODO/FIN: Finish implementing pushing multiple values for other methods
				let a = this, j, n;
				i = i.flatten();
				if (e === void 0) {
					for (j = 0, n = i.length; j < n; j++)
						if (typeof i[j] === "number") a.push(a[i[j]]);
				}
				else {
					if (/\S+=>{}/.test(`${e}`) && type(e, 1) === "func") a.push(void 0);
					else a.push(e);
					for (j = 0, n = i.length; j < n; j++)
						a.push(i[j]);
				}
				return a;
			}
			, "property unshift2": function unshift2(e, ...i) {
				let a = this, j, n;
				i = i.flatten();
				if (e === void 0) {
					for (j = 0, n = i.length; j < n; j++)
						if (typeof i[j] === "number")
							a.unshift(a[i[j]]);
				} else {
					if (/\S+=>{}/.in(`${e}`) && type(e, 1) === "func") a.unshift(void 0);
					else a.unshift(e);
					for (j = 0, n = i.length; j < n; j++)
						a.unshift(i[j]);
				}
				return a;
			}
			, "property toLList": function toLinkedList() {
				if (globalThis.LinkedList == null) throw Error(`${LibSettings.Environment_Global_String}.LinkedList == null`);
				let a = new globalThis.LinkedList();
				for (const e of this.rev()) a.insertFirst(e);
				return a;
			}
			, "property toGen": function* toGenerator() { for (const e of this) yield e }
			, "property remove": function remove(e) {
				return this.incl(e) && this.splice(this.io(e), 1), this;
			}
			, "property removeAll": function removeAll(e) {
				while (this.incl(e)) this.splice(this.io(e), 1);
				return this;
			}
			, "property hasDupes": function hasDuplicates() {
				for (var a = deepCopy(this), i = a.length; i --> 0 ;)
					if (a.includes(a.pop())) return !0;
				return !1;
			}
			, "property mod": function modify(indices, func) {
				indices = indices.flatten();
				let a = this, n = indices.length;
				if (type(func, 1) === "arr") func = func.flatten();
				else func = [].len(n).fill(func);
				func = func.extend(indices.length - func.length, e => e, "new");

				for (var i = 0; i < n; i++)
					a[indices[i]] = func[i](a[indices[i]], indices[i]);
				return a;
			}
			, "property remrep": function removeRepeats() { return Array.from(new Set(this)) }
			, "property random": function random() { return this[ randint(0, this.length - 1) ] }
			, "previous property rand": null
			, "property insrand": function insertRandomLocation(thing) {
				this.splice(randint(this.length), 0, thing);
				return this;
			}
			, "property insrands": function insertThingsRandomLocation(...things) {
				for (const thing of things) this.insrand(thing);
				return this;
			}
			, "property insSorted": function insertSorted(thing) {
				return this.splice2( this.bisectLeft(thing), 0, thing 
				);
			}
			, "previous property insertSorted": null
			, "property insSorteds": function insertThingsSorted(...things) {
				for (let thing of things)
					this.insSorted(thing);
				return this;
			}
			, "property slc": function slice(
				start,
				end,
				startOffset = 0,
				endOffset = 0,
				includeEnd = false,
			) {
				start ??= 0; // can't be default arg value
				end ??= Infinity; // can't be default arg value
				// last index = end - 1
				end < 0 && (end += this.length);
				end += endOffset + includeEnd;
				for (var a = this
					, b = []
					, i = start + startOffset
					, n = rMath.min(a.length, end)
				; i < n; i++) b.push( a[i] );
				return b;
			}
			, "property print": function print(print=console.log) { return print(this), this }
			, "property printEach": function printEach(print=console.log) {
				for (const e of this) print(e);
				return this;
			}
			, "property printStr": function printString(joiner=",", print=console.log) {
				print( Array.prototype.map.call(this, e => String(e)).join(joiner) )
				return this;
			}
			, "property swap": function swap(i1=0, i2=1) {
				const A = this, B = A[i1];
				A[i1] = A[i2];
				A[i2] = B;
				return A;
			}
			, "property smap": function setMap(f=(e, i)=>e) {
				// array.smap also counts empty indexes as existing unlike array.map.
				for (var arr = this, i = arr.length; i --> 0 ;)
					arr[i] = f(arr[i], i, arr);
				return arr;
			}
			, "property sfilter": function setFilter(f=(e, i)=>e) {
				for (var i = this.length; i --> 0 ;)
					f(this[i]) || this.splice(i, 1);
				return this;
			}
			, "property mapf": function mapThenFilter(f1=(e, i, a) => e, f2=(e, i, a) => e) {
				return this.map(f1).filter(f2);
			}
			, "property fmap": function filterThenMap(f1=(e, i, a) => e, f2=(e, i, a) => e) {
				return this.filter(f1).map(f2);
			}
			, "property fsmap": function filterThenMap(f1=(e, i, a) => e, f2=(e, i, a) => e) {
				return this.sfilter(f1).smap(f2);
			}
			, "property smapf": function setMapThenFilter(f1=(e, i, a) => e, f2=(e, i, a) => e) {
				return this.smap(f1).sfilter(f2);
			}
			, "property rotr3": function rotate3itemsRight(i1=0, i2=1, i3=2) {
				const A = this, TMP = A[i1];
				A[i1] = A[i3];
				A[i3] = A[i2];
				A[i2] = TMP;
				return A;
			}
			, "property dupf": function duplicateFromFirst(num=1, newindex=0) {
				return this.dup(num, 0, newindex);
			}
			, "property duptf": function duplicateToFirst(num=1, index=0) {
				return this.dup(num, index, 0);
			}
			, "property dupl": function duplicateFromLast(num=1, newindex=0) {
				return this.dup(num, this.length - 1, newindex);
			}
			, "property duptl": function duplicateToLast(num=1, index=0) {
				return this.dup(num, index, this.length - 1);
			}
			, "property dup": function duplicate(num=1, from=null, newindex=Infinity) {
				// by default duplicates the last element in the array
				var a = this;
				for (var b = a[from === null ? a.length - 1 : from], j = 0; j++ < num ;)
					a.splice(newindex, 0, b);
				return a;
			}
			, "property rotr": function rotateRight(num=1) {
				for (num %= this.length; num --> 0 ;)
					this.unshift(this.pop());
				return this;
			}
			, "property rotl": function rotateRight(num=1) {
				for (num %= this.length; num --> 0 ;)
					this.push(this.shift());
				return this;
			}
			, "property rotl3": function rotate3itemsLeft(i1=0, i2=1, i3=2) {
				var a = this, b = a[i1];
				a[i1] = a[i2];
				a[i2] = a[i3];
				a[i3] = b;
				return a;
			}
			, "property len": function setLength(num, filler=undefined) {
				this.length = isIterable(num) ?
					num.length :
					Number.isNaN(num = Number(num)) ?
						NaN :
						rMath.max(num, 0);
				filler == null || this.fill(filler); // !??
				return this;
			}
			, "property extend": function extend(length, filler, form="new") {
				if (form === "new")
					return this.concat( Array(length).fill(filler) );
				else if (form === "add")
					return this.union( Array(length).fill(filler) );
				else if (form === "total") {
					if (length <= this.length) return this;
					else return this.concat( Array(length).fill(filler) );
				}
				/*else */return a;
			}
			, "property startsWith": function startsWith(item) { return this[0] === item }
			, "previous property sw": null
			, "property endsWith": function endsWith(item) { return this.last() === item }
			, "previous property ew": null
			, "property flatten": function flatten() { return this.flat(Infinity) }
			, "overwrite property sort": (function create_sort() {
				const _sort = Array.prototype.sort;
				function sort(update=true) {
					return Array.prototype.any.call(
						this,
						e => typeof e !== "bigint" && typeof e !== "number"
					) ?
						_sort.call(this) :
						update ?
							qsort(this) : // quick-sort, O(n^2), Ω(nlogn), returns changed array
							msort(this); // merge-sort, Ө(nlogn). returns new array
				}
				return sort._sort = _sort, sort;
			})()
			, "property shuffle": function shuffle(times=1) {
				// I think this is a slightly different Fisher-Yates shuffle...
				// but I do not know or care.
				var arr = this;
				for (; times --> 0 ;)
					for (var i = arr.length, arr2 = []; i --> 1 ;)
						arr2.push( arr.splice(randint(i), 1)[0] )
				return this.union(arr2); // put the elements back in the array
			}
			, "property isNaN": function isNaN(strict=false) {
				const fn = (strict ? globalThis : rMath).isNaN;
				for (const val of Array.from(this))
					if (fn(val)) return !0;
				return !1;
			}
			, "property clear": function clear() { return this.length = 0, this }
			, "property getDupes": function getDupes() {
				for (var arr = deepCopy(this), dupes = [], i = arr.length, val; i --> 0 ;)
					arr.includes(val = arr.pop()) && dupes.push([i, val]);
				return dupes.length ? dupes : null;
			}
			, "property bisectLeft": function bisectLeftArray(x, low=0, high=null) {
				return bisectLeft(this, x, low, high);
			}
			, "property bisectRight": function bisectRightArray(x, low=0, high=null) {
				return bisectRight(this, x, low, high);
			}
			, "property bisect": function bisectArray(x, orientation="left", low=0, high=null) {
				return bisect(this, x, orientation, low, high);
			},
		}
		, "prototype Function": {
			"property args": function getArgs() { return getArguments(this) }
			, "property code": function getCode() {
				// TODO/FIX: Fix function
				// remove args, then find the code from there
				// async function () {}
				// async function *() {}
				// async a => 3
				// ({method() {}}).method
				// ... (a=")" ...) => ...
				// function (a=")" ...) { ... }
				/*
					

				*/
				var s = this + "";
				if (s.sw("class")) return false;
				else if (s.sw("function")) {
					s = s.slc("(", void 0, 1);
					for (var parenCount = 1, i = 0, n = s.length; parenCount && i < n; i++) {
						if (s[i] === "(") parenCount++; else
						if (s[i] === ")") parenCount--;
					}
					while ( /^\s$/.test(s[i]) ) i++;
					return s.substring(i + 1, s.length - 1);
				}
				else if (s[0] === "(") { // arrow function with perens around arguments
					s = s.slice(1);
					for (var parenCount = 1, i = 0, n = s.length; parenCount && i < n; i++) {
						if (s[i] === "(") parenCount++; else
						if (s[i] === ")") parenCount--;
					}
					while ( /^\s$/.test(s[i]) ) i++;
					i += 2;
					while ( /^\s$/.test(s[i]) ) i++;
					return s[i] === "{" ?
						s.substring(i + 1, s.length - 1) :
						s.slice(i);
				}
				else { // arrow function without perens around arguments
					s = s.remove(/^\w+\s*=>\s*/);
					return s[0] === "{" ?
						s.substring(1, s.length - 1) :
						s;
				}
			}
			, "property isArrow": function isArrowFunction() {
				var s = this + "";
				return !(s.sw("function") || s.sw("class"));
			}
			, "property isClass": function isClass() { return (this + "").sw("class") }
			, "property isRegular": function isRegularFunction() { return (this + "").sw("function") }
			, "property isFunction": function isFunction() { return this.isRegular() || this.isArrow() }
			, "property isCallable": function isCallable() { return typeof this === "function" }
			, "property functionType": function functionType() {
				return this.isRegular() ?
					"original" :
					this.isClass() ?
						"class" :
						this.isArrow() ?
							"arrow" :
							"unknown";
			}
		}
		, "object Function": {
			"overwrite property args": function getArgs(fn) { return getArguments(fn) }
			, "overwrite property code": function getCode(fn) {
				return typeof fn === "function" ?
					fn.code() :
					"";
			}
			, "overwrite property isArrow": function isArrowFunction(fn) {
				return typeof fn === "function" ?
					fn.isArrow() :
					!1;
			}
			, "overwrite property isClass"(fn) {
				return typeof fn === "function" ?
					fn.isClass() :
					!1;
			}
			, "overwrite property isRegular": function isRegularFunction(fn) {
				return typeof fn === "function" ?
					fn.isRegular() :
					!1;
			}
			, "overwrite property isFunction"(fn) { return typeof fn === "function" ? fn.isFunction() : !1 }
			, "overwrite property isCallable"(fn) { return typeof fn === "function" }
			, "overwrite property functionType": function functionType(fn) {
				return fn.isRegular() ?
					"original" :
					fn.isClass() ?
						"class" :
						fn.isArrow() ?
							"arrow" :
							"unknown";
			}
		}
		, "prototype String": {
			"property io"       : String.prototype.indexOf
			, "property lio"    : String.prototype.lastIndexOf
			, "property strip"  : String.prototype.trim
			, "property lstrip" : String.prototype.trimLeft
			, "property rstrip" : String.prototype.trimRight
			, "property mul"    : String.prototype.repeat
			, "property last"   : lastElement
			, "property toRegex": function toRegularExpression(flags="", stt="", end="", form="escaped") {
				// `stt` and `end` are not escaped in escape mode
				if (type(stt) !== "string" || type(end) !== "string")
					throw Error("invalid types for last two arguments of String.prototype.toRegex(). both should be string or MutableString");

				if (form === "escaped" || form === "e")
					for (var i = 0, b = "", l = this.length; i < l; i++)
						b += "$^()+*\\|[]{}?.".includes(this[i]) ?
							`\\${this[i]}` :
							this[i];
				else if (form === "unescaped" || form === "u")
					return RegExp(stt + this + end, flags);
				else throw Error("invalid form (2nd) argument for String.prototype.toRegex().");

				return RegExp(stt + b + end, flags); // escaped
			}
			, "call native property startsWith"() {
				function startsWith(input, index=0) {
					// input is regex(es), string(s), or array of arrays of ...
					if (typeof index === "bigint")
						index = Number(index);
					if (typeof index !== "number" || index % 1)
						throw Error`index must be an integer`;

					if (type(input, 1) === "arr") return input.map(
						e => this.startsWith(e, index, flags)
					);
					type(input) === "string" && ( input = input.toRegex() );

					if (type(input, 1) === "regex") {
						const match = RegExp(
							input.source, input.flags + "d"
						).exec( this.slice(index) );
						if (match === null) return !1;
						return match.indices[0][0] === 0;
					}

					throw Error`invalid input`;
				}

				return startsWith._startsWith = String.prototype.startsWith,
					startsWith;
			}
			, "previous property sw": null
			, "call native property endsWith"() {
				function endsWith(input, index=0, flags="") {
					// input is a regex, or string, or array of arrays (circular), regexes, or strings.
					return type(input, 1) === "arr" ?
						input.map( e => this.endsWith(e, index, flags) ) :
						`${ type(input, 1) === "regex" ? input.source : input }`
							.toRegex(flags, void 0, "$").test( this.slice(index) );
				}
				endsWith._endsWith = String.prototype.endsWith;
				return endsWith;
			}
			, "previous property ew": null
			, "property splitIndex": function splitIndex(index) {
				return [this.slice(0, index), this.slice(index)];
			}
			, "previous property splitI": null
			, "call native property replace"() {
				let _replace = String.prototype.replace;
				function replace(search, replacer) {
					isArr(search) || (search = [search]);
					isArr(replacer) || (replacer = [replacer]);
					var output = this;
					for (let [a, b] of arrzip(search, replacer))
						output = _replace.call(output, a, b);
					return output;
				}
				replace._replace = _replace;
				return replace;
			}
			, "property startsLike": function startsLike(input="", index=0) {
				return this.startsWith(input, index, "i");
			}
			, "previous property sL": null
			, "property endsLike": function endsLike(input="", index=0) {
				return this.endsWith(input, index, "i");
			}
			, "previous property eL": null
			, "property shuffle": function shuffle(times=1) {
				return this.split("").shuffle(times).join("");
			}
			, "property ios": function indexesOf(chars="") {
				return type(chars) === "string" ?
					Object.keys(this).filter( i => chars?.incl?.(this[i]) ).map(s => +s) :
					[];
			}
			, "property slc": function slc(
				start = 0,
				end = Infinity,
				startOffset = 0,
				endOffset = 0,
				substr = false,
				includeEnd = false,
				outOfBoundsStringEndInfinity = false
			) {
				// last index = end - 1
				if (type(start) === "string") {
					start = this.io(start);
					start < 0 && (start = 0);
				}
				if (type(end) === "string") {
					end = this.io(end);
					end < 0 && (end = outOfBoundsStringEndInfinity ? Infinity : 0);
				}
				return this.split("").slc(
					start,
					end,
					startOffset,
					endOffset,
					includeEnd
				).join("");
			}
			, "property tag": function tag(tagName) {
				if (!tagName || type(tagName) !== "string") return this;
				return `<${tagName}>${this}</${tagName}>`;
			}
			, "property rand": function random() { return Array.prototype.rand.call(this) }
			, "property upper": function upper(length=Infinity, start=0, end=-1) {
				return !isFinite(Number(length)) || isNaN(length) ? this.toUpperCase() :
				end === -1 ?
					this.substr(0, start) +
						this.substr(start, length).toUpperCase() +
						this.substr(start + length) :
					this.substr(0, start) +
						this.substring(start, end).toUpperCase() +
						this.substr(end);
			}
			, "property lower": function lower(length=Infinity, start=0, end=-1) {
				return !isFinite(Number(length)) || isNaN(length) ? this.toLowerCase() :
				end === -1 ?
					this.substr(0, start) +
						this.substr(start, length).toLowerCase() +
						this.substr(start + length) :
					this.substr(0, start) +
						this.substring(start, end).toLowerCase() +
						this.substr(end);
			}
			, "property toObj": function toObject(obj=globalThis) { return strToObj(this, obj) }
			, "property hasDupesA": function hasDuplicatesAll() {
				return/(.|\n)\1/.test(this.split("").sort().join(""));
			}
			, "property hasDupesL": function hasDuplicateLetters() {
				return/(\w)\1/.test(this.split("").sort().join(""));
			}
			, "property reverse": function reverse() { return this.split("").reverse().join("") }
			, "property remrep": function removeRepeats() {
				// this also sorts the string. *shrugs*, whatever idc
				return Array.from( new Set(this) ).join("");
			}
			, "property remove": function remove(text) { return this.replace(text, "") }
			, "property removeAll": function removeAll(text) {
				return typeof text === "string" ?
					this.remove( RegExp(text, "g") ) :
					type(text, 1) === "regex" ?
						this.remove( RegExp(text.source, (text.flags + "g").remrep()) ) :
						this;
			}
			, "property each": function putArgBetweenEachCharacter(joiner="") {
				return this.split("").join( joiner.toString() );
			}
			, "property toFunc": function toNamedFunction(name="anonymous") {
				var s = this.valueOf();
				if (s.sw("Symbol(") && s.ew(")")) throw Error("Can't parse Symbol().");
				s = (""+s).remove(/^(\s*function\s*\w*\s*\(\s*)/);
				var args = s.slc(0, ")");
				return (
					(fn, name) => (Function(
						`return function(call){return function ${name}() { return call (this, arguments) }}`
					)())(Function.apply.bind(fn))
				)(Function(args, s.replace(
					RegExp(`^(${(z=>{
						for (var i=z.length, g=""; i --> 0 ;) g += (/[$^()+*|[\]{}?.]/.test(z[i]) && "\\") + z[i];
						return g;
				})(args)}\\)\\s*\\{)`,"g"), "").remove(/\s*;*\s*}\s*;*\s*/)), name);
			}
			, "property toFun": function toNamelessFunction() {
				var f = () => Function(this).call(this)
				return () => f();
			}
			, "property toNumber": function toNumber() { return +this }
			, "previous property toNum": null
			, "property toBigInt": function toBigInteger() {
				try { return BigInt(this) }
				catch { throw TypeError(`Cannot convert input to BigInt. input: '${this}'`) }
			}
			, "property pop2": function pop2() { return this.substr(0, this.length - 1) }
			, "property unescape": function unescape() {
				return this.split("").map(
					e => e === "\n" ? "\\n" : e === "\0" ? "\\0" : e === "\t" ? "\\t" : e === "\f" ? "\\f" :
						e === "\r" ? "\\r" : e === "\v" ? "\\v" : e === "\b" ? "\\b" : e === "\\" ? "\\\\" :
							ord(e) < 127 && ord(e) > 31 ? e :
								ord(e) < 32 ?
									(s => "\\x" + strMul("0", 2 - s.length) + s)(ord(e).toString(16)) :
									(s => "\\u" + strMul("0", 4 - s.length) + s)(ord(e).toString(16))
				).join("");
			}
			, "property incl": function includes(input) { return input.toRegex().in(this);
			}, "property nincl": function doesntInclude(input) { return !this.incl(input) }
			, "property start": function start(start="") {
				// if the string is empty it returns the argument
				return this || `${start}`;
			}
			, "property begin": function begin(text="") {
				// basically Array.unshift2 for strings
				return `${text}${this}`;
			}
			, "property splitn": function splitNTimes(
				input,
				times = 1,
				joinUsingInput = true,
				customJoiner = ""
			)
			{
				var joiner = joinUsingInput ? input : customJoiner;
				if (type(input, 1) !== "regex" && type(input) !== "string")
					throw Error("function requires a regular expression or a string");
				for (var i = 0, arr = this.split(input), arr2 = [], n = arr.length; i < n && i++ < times ;)
					arr2.push(arr.shift());
				if (arr.length) arr2.push(arr.join(joiner));
				return arr2;
			}
			, "property inRange": function inRange(n1, n2=arguments[0], include=true) {
				return isNaN(this) ?
					!1 :
					(+this).inRange(n1, n2, include);
			}
			, "property isInteger": function isInteger() {
				var a = this;
				if ( isNaN(a) ) return !1;
				if (a.io(".") === -1) return !0;
				a = a.slc(".");
				for (var i = a.length; i --> 1 ;)
					if (a[i] !== "0") return !1;
				return !0;
			}
			, "previous property isInt": null
			, "property exists": function exists() { return this !== "" }
			, "property line": function line(index=Infinity) {
				if (rMath.isNaN(index)) return false;
				for (var line = 1, i = 0; i < this.length; this[i] === "\n" && line++, i++)
					if (i === index) return line;
				return line;
			}
			, "property rotr": function rotateRight(n=1) { return this.split("").rotr(n).join("") }
			, "property rotl": function rotateLeft(n=1) { return this.split("").rotl(n).join("") }
			,
		}
		, "prototype Number": {
			"property bitLength": function bitLength() { return abs(this).toString(2).length }
			, "property isPrime": function isPrime() {
				if (!Number.isInteger(this)) return !1;
				if (this === 2) return !0;
				if (this < 2 || !(this % 2)) return !1;

				for (var i = 3, max = rMath.isqrt(this); i <= max; i += 2)
					if (!(this % i)) return !1;

				return !0;
			}
			, "property inRange": function inRange(n1, n2=n1, include=true) {
				return include ?
					this >= n1 && this <= n2 :
					this > n1 && this < n2;
			}
			, "property shl": function shiftLeft(num) { return this << Number(num) }
			, "property shr": function shiftRight(num) { return this >> Number(num) }
			, "property shru": function shiftRightUnsigned(num) { return this >>> Number(num) }
			, "property isInteger": function isInteger() { return this === Number.parseInt(this) }
			, "previous property isInt": null
			, "property add": function add(number = 0) { return this + Number(number) }
			, "property sub": function subtract(number = 0) { return this - Number(number) }
			, "property mul": function multiply(number = 0) { return this * Number(number) }
			, "property div": function divide(number = 0) { return this / Number(number) }
			, "property mod": function modulo(number = 0) { return this % Number(number) }
			, "property pow": function power(number = 0) { return this ** Number(number) }
		}
		, "prototype BigInt": {
			"property isPrime": function isPrime() {
				if (this === 2n) return !0;
				if (this < 2n || !(this % 2n)) return !1;

				for (var i = 3n, sqrt = bMath.sqrt(this); i <= sqrt; i += 2n)
					if (!(this % i)) return !1;

				return !0;
			}
			, "property inRange": function inRange(n1, n2=n1, include=true) {
				return include ?
					this >= n1 && this <= n2 :
					this > n1 && this < n2;
			}
			, "property toExponential": function toExponential(maxDigits=16, form=String) {
				var a = `${this}`;
				maxDigits < 0 && (maxDigits = 0); // max(0, x)
				var decimal = maxDigits && a.length > 1 && +a.slc(1) ? "." : "",
					rest = a.substr(1, maxDigits);
				rest = +rest ? rest : "";
				if (form === String)
					return `${a[0]}${decimal}${rest}e+${dim(a)}`.replace(".e", "e");
				else if (form === Number)
					return +`${a[0]}.${a.substr(1, 50)}e+${dim(a)}`;
				else throw Error`Invalid second argument to BigInt.prototype.toExponential()`;
			}
			, "property shl": function shiftLeft(int = 0n) { return this << BigInt(int) }
			, "property shr": function shiftRight(int = 0n) { return this >> BigInt(int) }
			, "property add": function add(int = 0n) { return this + BigInt(int) }
			, "property sub": function subtract(int = 0n) { return this - BigInt(int) }
			, "property mul": function multiply(int = 0n) { return this * BigInt(int) }
			, "property div": function divide(int = 0n) { return this / BigInt(int) }
			, "property mod": function modulo(int = 0n) { return this % BigInt(int) }
			, "property pow": function power(int = 0n) { return this ** BigInt(int) }
			, "property length": function length(n = 0) { return `${this}`.length - n }
			, "property isInteger": function isInteger() { return !0 }
			, "previous property isInt": null
		}
		, "archive instance Logic": class Logic {
			// archive doesn't work
			constructor(
				bitwise = LibSettings.Logic_Bitwise_Argument
				, comparatives = LibSettings.Logic_Comparatives_Argument
				, help = LibSettings.Logic_Help_Argument
				,
			) {
				// TODO/ADD: Add the other logic gates to bitwise
				if (bitwise) this.bit = {
					shr: (a, b) => a >> b,
					shru: (a, b) => a >>> b,
					shl: (a, b) => a << b,
					not: (...a) => len(a = a.flatten()) == 1 ? ~a[0] : a.map(b => ~b),
					and: function and(...a) {
						return type(a[0], 1) !== "arr" ?
							this.xor(a, len(a)) :
							this.xor(a[0], len(a[0]));
					},
					nand: null,
					or: function or(a, b) { return this.xor([a, b], [1, 2]) },
					nor: function nor(...b) { return this.xor(b, [0]) },
					xor: (ns, range=[1]) => {
						if (isNaN( (ns = ns.flatten()).join("") )) throw TypeError("numbers req. for 1st parameter");
						if (isNaN( (range = range.flatten()).join("") )) throw TypeError("numbers req. for 2nd parameter");
						// fix range
						const min = rMath.min(range), max = rMath.max(range);
						range = [
							min < 0 ? 0 : int(min),
							max > len(ns) - 1 ? len(ns) - 1 : int(max)
						];
						ns = ns.map(b => b.toString(2));
						const maxlen = rMath.max( ns.map(b => len(b)) );
						// normalize the string lengths
						ns.for((e, i) => {
							while (len(e) < maxlen)
								e = `0${e}`;
							ns[i] = e;
						});
						// get the totals per bit, and store into 'bits'
						for (var str_i = 0, arr_i = 0, bits = "", total, output = "";
							str_i < maxlen;
							str_i++, bits += total
						) {
							for (arr_i = 0, total = 0; arr_i < len(ns); arr_i++)
								total += ns[arr_i][str_i] == 1;
						}

						// get the true or false per bit ans stor into 'output'
						for (str_i = 0; str_i < len(bits); str_i++)
							output += (Number(bits[str_i])).inRange(range[0], range[1]) ? 1 : 0;

						return Number(`0b${output}`);
					},

					nxor: function xnor(a, b) {
						return this.not(// TODO: Figure out what this is supposed to be for and fix it

						);
					},
					imply: null,
					nimply: null,
				};
				if (comparatives) this.eq = {
					  gt: (a, b) => a > b
					, lt: (a, b) => a < b
					, ge: (a, b) => a >= b
					, le: (a, b) => a <= b
					, leq: (a, b) => a == b
					, lne: (a, b) => a != b
					, seq: (a, b) => a === b
					, sne: (a, b) => a !== b
					,
				};
				// TODO/FIN: finish Logic help text
				if (help) this.help = {
					not: "Logical NOT gate. takes any amount of arguments either directly or in an array. if there is only 1 argument, it returns !arg, otherwise it returns an array, where each element is not of the corresponding argument.",
					and: "Takes any number of arguments either directly or in an array. returns true if all of the arguments coerce to true. Logical AND gate",
					nand: "Takes any number of arguments either directly or in an array. returns true as long as not all the arguments coerce to true",
					or: "takes any amount of arguments either directly or in an array. returns true if any of the arguments coerce to true. Logical OR gate",
					nor: "Takes any amount of arguments either directly or in an array. returns true if all the inputs are false. Logical NOR gate",
					xor: "Takes any amount of arguments either directly or in an array.  returns true if half of the arguments coerce to true. Logical XOR gate.",
					xor2: "Takes any amount of arguments either directly or in an array.  returns true if an odd number of the arguments coerce to true. Logical XOR gate.",
					nxor: "Takes any amount of arguments either directly or in an array. returns false if half of the arguments coerce to true, otherwise it returns true. Boolean Algebra 'if and only if'. Logical XNOR gate.",
					nxor2: "Takes any amount of arguments either directly or in an array. returns false if an odd number of the inputs coerce to false, otherwise it returns true. Boolean Algebra 'if and only if'. Logical XNOR gate.",
					iff: "Takes 2 arguments. returns true if both arguments coerce to the same boolean value, otherwise it returns false. ",
					if: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra if. Logical IMPLY gate.",
					imply: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra if. Logical IMPLY gate.",
					nimply: "Takes 2 arguments. returns false if the first argument coerces to true, and the second argument coerces to false, otherwise returns true. Boolean Algebra '-->/'. Logical NIMPLY gate.",
					xnor: "returns false",
					is: "Takes any number of arguments. returns true if all the inputs are exactly equal to the first argument, although, objects can be different objects with the same values",
					isnt: "Takes any number of arguments. returns true as long as any of the arguments is different from any other",
					near: "Takes 3 paramaters.  1: fist number.  2: second number.  3?: range.  returns true if the numbers are in the range of eachother. the default range is ±3e-16, which should be enough to account for rounding errors. the same as python's math.isclose() function but with a different default range.",
					bit: {
						xor: "adds up the numbers in the first array bitwise, and returns 1 for bits in range of, or equal to the second array, returns zero for the others, and returns the answer in base 10. xor([a,b])==a^b.",
						not:    "if there is one argument, returns ~argument.  if there is more than 1 argument, returns an array. example: Logic.bit.not(4,5,-1) returns [~4,~5,~-1]",
						nil:    "if all of the inputs are zero for a given bit, it outputs one. Inverse &.",
						and:    "a & b",
						or:     "a | b",
						left:   "a << b",
						right:  "a >> b",
						right2: "a >>> b",
					},
					eq: {
						self: "equality"
						, gt: "greater than (>)"
						, ge: "greater than or equal to (>=)"
						, lt: "less than (<)"
						, le: "less than or equal to (<=)"
						, leq: "loose equality (==)"
						, seq: "strict equality (===)"
						, lne: "loose non-equality (!=)"
						, sne: "strict non-equality (!==)"
					}
				}
			}
			not(...a) {// NOT gate
				// +---+-----+
				// | p | ¬ p |
				// +---+-----+
				// | T |  F  |
				// | F |  T  |
				// +---+-----+
				return a.length === 1 ? !a[0] : a.map(b=>!b);
			}
			and(...a) {// AND gate
				// +---+---+-------+
				// | p | q | p ∧ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!(a = a.flatten()).length) return !1;
				for (var i = a.length; i --> 0 ;)
					if (!a[i]) return !1;
				return !0;
			}
			nand(...a) {// not (p and q)
				// +---+---+-------+
				// | p | q | p ⊼ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.and(a);
			}
			or(...a) {// OR gate
				// +---+---+-------+
				// | p | q | p ∨ q |
				// +---+---+-------+
				// | T | T |   T   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!(a = a.flatten()).length) return !1;
				for (var i = a.length; i --> 0 ;)
					if (!!a[i]) return !0;
				return !1;
			}
			nor(...a) {// not (p or q)
				// +---+---+-------+
				// | p | q | p ⊽ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   F   |
				// | F | T |   F   |
				// | F | F |   T   |
				// +---+---+-------+
				return !this.or(a);
			}
			xor(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!(a = a.flatten()).length) return !1;
				return a.filter(b => b).length === a.length / 2
			}
			xor2(...a) {// exclusive or gate
				// +---+---+-------+
				// | p | q | p ⊻ q |
				// +---+---+-------+
				// | T | T |   F   |
				// | T | F |   T   |
				// | F | T |   T   |
				// | F | F |   F   |
				// +---+---+-------+
				if (!(a = a.flatten()).length) return !1;
				return a.filter(b => b).length === a.length % 2 > 0
			}
			nxor(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				// should be nxor because it is not xor and not exclusive nor
				return !this.xor(a);
			}
			nxor2(...a) {// boolean algebra '↔' (<->); not(p xor q); usually 'xnor', but that is wrong
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				// should be nxor because it is not xor and not exclusive nor
				return !this.xor2(a);
			}
			iff(...a) {// boolean algebra name for 'if and only if' (↔, <-->); not(p xor q)
				// +---+---+----------+
				// | p | q | p xnor q |
				// +---+---+----------+
				// | T | T |     T    |
				// | T | F |     F    |
				// | F | T |     F    |
				// | F | F |     T    |
				// +---+---+----------+
				return !this.xor(a);
			}
			if(a, b) {// boolean algebra name for 'IMPLY gate'.
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return this.imply(a, b);
			}
			imply(a, b) {// IMPLY gate; P --> Q
				// +---+---+---------+
				// | p | q | p --> q |
				// +---+---+---------+
				// | T | T |    T    |
				// | T | F |    F    |
				// | F | T |    T    |
				// | F | F |    T    |
				// +---+---+---------+
				return a ? !!b : !0;
			}
			nimply(a, b) {// not (P --> Q)
				// +---+---+---------+
				// | p | q | p -/> q |
				// +---+---+---------+
				// | T | T |    F    |
				// | T | F |    T    |
				// | F | T |    F    |
				// | F | F |    F    |
				// +---+---+---------+
				return !this.if(a, b);
			}
			xnor() {// exclusive-nor but what it does what it says it does
				// for xnor to return true:
				// the inputs have to both be false, hence the 'nor' part.
				// the inputs have to both be different, hence the 'exclusive' part.
				// +---+---+-------------+---------+
				// | p | q | p nor q (r) | excls r |
				// +---+---+-------------+---------+
				// | T | T |    False    |  False  |
				// | T | F |    False    |  False  |
				// | F | T |    False    |  False  |
				// | F | F |    True     |  False  |
				// +---+---+-------------+---------+
				return !1;
			}
			is(...a) {// Object.is() but more than 2 inputs
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = a.length; i --> 0 ;)
					if (a[i] !== a[0]) return !1;
				return !0;
			}
			isnt(...a) {// returns true if any item is different from any other item
				a = a.map(b => `${b}` === "NaN" ? "NaN" : Object.is(b, -0) ? "-0" : json.stringify(b));
				for (var i = a.length; i --> 1 ;) {
					const tmp = a.pop();
					if ( a.filter(b => Object.is(b, tmp)).length )
						return !1;
				}
				return !0;
			}
			near(n1, n2, range=Number.EPSILON) {
				// same as python math.isclose() with different default range
				return n1 > n2 - range && n1 < n2 + range ?
					!0 :
					!1;
			}
		}
		, "math bMath": class BigIntRealMath {
			constructor(
				help = LibSettings.bMath_Help_Argument
				, degTrig = LibSettings.bMath_DegTrig_Argument
				, comparatives = LibSettings.bMath_Comparatives_Argument
				,
			) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				comparatives === "default" && (comparatives = !0);

				this.googol = 10_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n;

				if (help) this.help = {};
				if (degTrig) this.deg = {};
				if (comparatives) this.eq = {};
			}
			pow(x, y) {
				return this.isNaN(x) || this.isNaN(y) ?
					NaN :
					y < 0 ? 1n / x ** -y : x ** y;
			}
			isBigInt(x) { return typeof x === "bigint" }
			isNaN(x)    { return typeof x !== "bigint" }
			sgn(x)      { return x < 0 ? -1n : BigInt(x > 0) }
			sign(x)     { return x < 0 ? -1n : BigInt(x > 0) }
			abs(x)      { return x * this.sgn(x) }
			add(a, b)   { return a + b }
			sub(a, b)   { return a - b }
			mul(a, b)   { return a * b }
			div(a, b)   { return a / b }
			sqrt(x=1n)  {
				if (x < 0) throw Error("non-negative value required");
				if (x < 2) return x;

				var x1 = x >> 1n, x0; // current, previous

				do [x1, x0] = [x1 + x / x1 >> 1n, x1];
				while (x1 < x0);
				// `while  x1 !== x0` doesn't work...
				// sqrt(24n) ends up in a loop between 4n and 5n and...
				// adding a second lookbehind seems like a temporary solution

				return x0; // last accurate value
			}
			isqrt(x) { return this.sqrt.apply(this, arguments) }
			prime(n=1n, a=0n) {
				// nth prime >= a
				// out >= a
				if (typeof n !== "bigint" ||
					typeof a !== "bigint" ||
					n < 1n
				) throw Error`Invalid inputs to bMath.prime`;

				a < 1n && (a = 1n);

				if (n === 1n && a <= 2n) return 2n;
				a += BigInt( !(a % 2n) ); // next odd number, has to be after 2 check

				for (var k = a, i = BigInt(a <= 2n);
					( i += BigInt(k.isPrime()) ) < n
				;) k += 2n;

				return k;
			}
		}
		, "math sMath": class stringRealMath {
			constructor(
				help = LibSettings.sMath_Help_Argument
				, degTrig = LibSettings.sMath_DegTrig_Argument
				, comparatives = LibSettings.sMath_Comparatives_Argument
				,
			) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);
				comparatives === "default" && (comparatives = !0);

				this.zero = "0.0"; // canonical format for 0.
				this.one = "1.0"; // canonical format for 1.
				this.negative_one = "-1.0"; // canonical format for -1.

				if (help) this.help = {
					add: "Takes 2 string number arguments (a and b). returns a + b as a string with maximum precision and no floating point errors",
					sub: "Takes 2 string number arguments (a and b). returns a - b as a string with maximum precision and no floating point errors",
					mul: "Takes 2 string number arguments (a and b). returns a * b as a string with maximum precision and no floating point errors",
					mul10: "Takes 2 arguments. 1: string number (n).  2: integer (x).  returns n * 10^x as a string more efficiently than mul(n, 10) would. see mul, div10",
					div: "Takes 3 arguments. (string number or number, string number or number, precision). division",
					fdiv: "Takes 2 string number arguments. returns the floored division of the two numbers faster than flooring the result of div() would. see div, div10. basically just Python's '//' operator. the argument order is numerator then denominator.",
					div10: "Takes 2 arguments. 1: string number (n).  2: integer (x).  returns n / 10^x as a string more efficiently than div(n, 10) would. see div, fdiv, mul10",
					idiv: "Takes 3 arguments. the same as div() but only for integers. should be faster, and doesn't check for invalid inputs",
					mod: "Takes 3 arguments. 2 string number arguments and 1 positive integer argument for the precision of tge division. modulo operator.",
					ipow: "2 string number arguments. power but only for integer powers",
					ifact: "1 string number argument. integer factorial",
					neg: "Takes 1 string number argument. negates the input",
					sgn: "1 string number argument. returns the sign of the input. sgn(0) = 0.  see sign, abs, neg",
					sign: "1 string number argument. returns the sign of the input. sgn(0) = 0. see sgn, abs, neg",
					ssgn: "Takes 1 argument. returns the sign as a string. see sgn, sign, ssign",
					ssign: "Takes 1 argument. returns the sign as a string. see sgn, sign, ssgn",
					abs: "1 string number argument. returns the absolute value of the input.",
					fpart: "Takes 1 string number argument. returns the fractional part of the input as a string. the output is always positive.",
					ipart: "takes 1 string number argument. returns the truncated version. same as Math.trunc, but for strings. rounds towards zero. see trunc, floor, ceil, round",
					square: "Takes 1 string number argument. squares the argument and returns it.",
					cube: "Takes 1 string number argument. cubes the argument and returns it.",
					tesseract: "Takes 1 string number argument. raises it the the fourth power and returns it.",
					norm: `Takes 1 string number argument. calls ${LibSettings.Environment_Global_String}.numStrNorm(argument). normalizes the number, ie: remove leading zeros, remove trailing decimal zeros.`,
					decr: "Takes 1 string number argument (x). returns x - 1 as a string, more efficiently (I think), than sub(x, 1) would. see incr, sub",
					incr: "Takes 1 string number argument (x). as of aug 4, 2022, this function just calls add(x, 1). see decr, add",
					isNaN: "Takes 1 string number argument. returns true, if it is NOT a number, and false if it is a number. the cases that it will return false in are if it has characters outside of the decimal numerals (and period), it has multiple periods, or it is't a string all together",
					isInt: "Takes 1 string number argument. returns whether or not the input is an integer. It does not assume the argument is normalized.",
					isIntN: `Takes 1 string number argument. returns whether or not the input is an integer. It assumes the argument is correct and normalized as per sMath.norm or ${LibSettings.Environment_Global_String}.numStrNorm (they're the same function). In this case it is faster to use this function than the regular isInt`,
					isFloat: "Takes 1 string number argument. returns whether or not the input has non-zero decimal places. It does not assume the argument is normalized.",
					isFloatN: `Takes 1 string number argument. returns whether or not the input has non-zero decimal places. It assumes the argument is correct and normalized as per sMath.norm or ${LibSettings.Environment_Global_String}.numStrNorm (they're the same function). In this case it is faster to use this function than the regular isFloat`,
					min: "Takes any amount of string number arguments. the arguments can be passed in via an array or directly. the minimum value will be returned. if no arguments are given, the default return value is 0, or more specificly, \"0.0\". see sMath.zero, max",
					max: "Takes any amount of string number arguments. the arguments can be passed in via an array or directly. the maximum value will be returned. if no arguments are given, the default return value is 0, or more specificly, \"0.0\". see sMath.zero, min",
					_lmgf: `This function is used internally to act as both gcf/gcd and lcm in one function. Takes 1 named argument for either lcm or gcf/gcd. the rest of the arguments should be string numbers that are normalized with either sMath.norm or ${LibSettings.Environment_Global_String}.numStrNorm.`,
					floor: "Takes 1 string number argument. returns the floored version of it. (round towards negative infinity)",
					ceil: "Takes 1 string number argument. returns the ceilinged version of it. (round towards positive infinity)",
					round: "Takes 1 string number argument. returns number rounded to the nearest integer.",
					trunc: "takes 1 string number argument. returns the truncated version. same as Math.trunc, but for strings. rounds towards zero. see ipart, floor, ceil, round",
					new: "Takes 1 numerical argument. returns the input in the canonical string form. It also works if the input isn't a number. In this case, it just returns String(input)",
					lcm: null,
					gcf: null,
					gcd: null,
					eq: {
						gt: "Takes 2 string number arguments (a, b). returns a > b",
						ge: "Takes 2 string number arguments (a, b). returns a ≥ b",
						lt: "Takes 2 string number arguments (a, b). returns a < b",
						le: "Takes 2 string number arguments (a, b). returns a ≤ b",
						eq: "Takes 2 string number arguments (a, b). returns a == b",
						ne: "Takes 2 string number arguments (a, b). returns a ≠ b",
						iz: "Takes 1 string number argument (x). returns x == 0. using this function is more efficient than using the two argumented counterpart.",
						nz: "Takes 1 string number argument (x). returns x ≠ 0. using this function is more efficient than using the two argumented counterpart.",
						ng: "Takes 1 string number argument (x). returns x < 0. negative. using this function is more efficient than using the two argumented counterpart.",
						nn: "Takes 1 string number argument (x). returns x ≥ 0. not negative. using this function is more efficient than using the two argumented counterpart.",
						ps: "Takes 1 string number argument (x). returns x > 0. positive. using this function is more efficient than using the two argumented counterpart.",
						np: "Takes 1 string number argument (x). returns x ≤ 0. not positive. using this function is more efficient than using the two argumented counterpart.",
					},
				};
				if (degTrig) this.deg = {};
				// TODO: update to use -0 as 0
				if (comparatives) this.eq = {
					_parent: this
					, gt: function greaterThan(a="0.0", b="0.0") {
						// use ps(a) for a > 0
						if (
							Number.isNaN(a = this._parent.norm(a, NaN)) ||
							Number.isNaN(b = this._parent.norm(b, NaN))
						) return NaN;

						if (this._parent.sgn(a) >= 0 && this._parent.sgn(b) < 0) return !0;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) >= 0) return !1;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) < 0) {
							a = a.slice(1); b = b.slice(1);
							if (this.eq(a, b)) return !1;
							return !this.gt(a, b);
						}
						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						}
						for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						}
						if ( a.io(".") - a_index > b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", b.length - a.length );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", a.length - b.length );
						for (var i = 0, n = a.length; i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) > Number(b[i])) return !0;
							if (Number(a[i]) < Number(b[i])) return !1;
						}
						return !1;
					}
					, ge: function greaterOrEqual(a="0.0", b="0.0") {
						// use nn(a) for a >= 0
						return this.gt(a, b) || this.eq(a, b);
					}
					, lt: function lessThan(a="0.0", b="0.0") {
						// use ng(a) for a < 0
						if (
							Number.isNaN(a = this._parent.norm(a, NaN)) ||
							Number.isNaN(b = this._parent.norm(b, NaN))
						) return NaN;

						if (this._parent.sgn(a) >= 0 && this._parent.sgn(b) < 0) return !1;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) >= 0) return !0;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) < 0) {
							a = a.slice(1); b = b.slice(1);
							return this.eq(a, b) ? !1 : !this.lt(a, b);
						}

						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						}
						for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						}
						if ( a.io(".") - a_index < b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", b.length - a.length );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", a.length - b.length );
						for (var i = 0, n = a.length; i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) < Number(b[i])) return !0;
							if (Number(a[i]) > Number(b[i])) return !1;
						}
						return !1;
					}
					, le: function LessOrEqual(a="0.0", b="0.0") {
						// use np(a) for a <= 0
						return this.lt(a, b) || this.eq(a, b);
					}
					, eq: function equal(a="0.0", b="0.0") {
						// use iz(a) for a === 0
						if (
							Number.isNaN(a = this._parent.norm(a, NaN)) ||
							Number.isNaN(b = this._parent.norm(b, NaN))
						) return NaN;

						if (this._parent.sgn(a) >= 0 && this._parent.sgn(b) < 0) return !1;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) >= 0) return !1;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) < 0)
							return this.eq( a.slice(1), b.slice(1) );

						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						}
						for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						}
						if ( a.io(".") - a_index !== b.io(".") - b_index ) return !1;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", b.length - a.length );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", a.length - b.length );
						for (var i = 0, n = a.length; i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) !== Number(b[i])) return !1;
						}
						return !0;
					}
					, ne: function notEqual(a="0.0", b="0.0") {
						// use nz(a) for a !== 0
						if (
							Number.isNaN(a = this._parent.norm(a, NaN)) ||
							Number.isNaN(b = this._parent.norm(b, NaN))
						) return NaN;

						if (this._parent.sgn(a) >= 0 && this._parent.sgn(b) < 0) return !0;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) >= 0) return !0;
						if (this._parent.sgn(a) < 0 && this._parent.sgn(b) < 0) return this.ne( a.slice(1), b.slice(1) );

						for (var a_index = 0 ;;) {
							if (a[a_index] === "0") {
								a_index++;
								continue;
							}
							if (a[a_index] == null) a_index = Infinity;
							break;
						}
						for (var b_index = 0 ;;) {
							if (b[b_index] === "0") {
								b_index++;
								continue;
							}
							if (b[b_index] == null) b_index = Infinity;
							break;
						}
						if ( a.io(".") - a_index > b.io(".") - b_index ) return !0;

						a = strMul( "0", b.io(".") - a.io(".") ) + a + strMul( "0", b.length - a.length );
						b = strMul( "0", a.io(".") - b.io(".") ) + b + strMul( "0", a.length - b.length );
						for (var i = 0, n = a.length; i < n; i++) {
							if (a[i] === ".") continue;
							if (Number(a[i]) !== Number(b[i])) return !0;
						}
						return !1;
					}
					, iz: function isZero(snum="0.0") {
						// x == 0. subset of eq(a, b)
						for (var i = 0, n = snum.length; i < n; i++)
							if (snum[i] !== "0" && snum[i] !== ".") return !1;
						return !0;
					}
					, nz: function notZero(snum="0.0") {
						// x != 0. subset of ne(a, b)
						for (var i = 0; i < snum.length; i++)
							if (snum[i] !== "0" && snum[i] !== ".") return !0;
						return !1;
					}
					, ng: function negative(snum="0.0") {
						// x < 0. subset of lt(a, b)
						return snum[0] === "-"; // assumes not "-0"
					}
					, nn: function notNegative(snum="0.0") {
						// x >= 0. subet of ge(a, b)
						return snum[0] !== "-";
					}
					, ps: function positive(snum="0.0") {
						// x > 0. subset of gt(a, b)
						return snum[0] !== "-" && this.nz(snum);
					}
					, np: function notPositive(snum="0.0") {
						// x <= 0. subset of le(a, b)
						return snum[0] === "-" || this.iz(snum);
					}
				};
			}
			new(snum=1n, defaultValue=NaN) { return numStrNorm(snum, defaultValue) }
			norm/*alize*/() { return this.new.apply(this, arguments) }
			snum() { return this.new.apply(this, arguments) }
			add(...snums) {
				snums[0] instanceof Array && (snums = snums[0]);
				if (snums.length > 2) return this.add(
					this.add( snums[0], snums[1] ),
					...snums.slice(2),
				);

				var [a, b] = snums;
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a ); b = this.norm( b );
				if (a[0] === "-" && b[0] === "-") return "-" + this.add(a.slice(1), b.slice(1));
				if (a[0] === "-" && b[0] !== "-") return this.sub(b, a.slice(1));
				if (a[0] !== "-" && b[0] === "-") return this.sub(a, b.slice(1));

				// do not change to use +=
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", b.slc(".").length - a.slc(".").length);
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", a.slc(".").length - b.slc(".").length);
				a = a.split("."); b = b.split(".");

				let c = [
					[ a[0], b[0] ],
					[ a[1], b[1] ],
				].map( e => e.map(f=>f.split("")) )
				.map( o => o[0].map((e,i) => Number(e) + Number(o[1][i])) );
				for (var i = 2; i --> 0 ;) {
					for (var j = c[i].length, tmp; j --> 0 ;) {
						tmp = floor( c[i][j] / 10 );
						c[i][j] -= 10*tmp;
						if (tmp) {
							if (j) c[i][j-1] += tmp;
							else i === 1 ? c[0][c[0].length - 1] += tmp : c[i].unshift(tmp);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".").remove(/\.0+$/);
				return this.norm( c.incl(".") ? c : `${c}.0` );
			}
			sub(...snums) {
				snums[0] instanceof Array && (snums = snums[0]);
				if (snums.length > 2) return this.sub(
					this.sub( snums[0], snums[1] ),
					...snums.slice(2),
				);
				var [a, b] = snums;

				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a ); b = this.norm( b );
				if (a[0] !== "-" && b[0] === "-") return this.add(a, b.slice(1));
				if (a[0] === "-" && b[0] === "-") return this.sub(b.slice(1), a.slice(1));
				if (a[0] === "-" && b[0] !== "-") return "-" + this.add(a.slice(1), b);
				if (this.eq.gt(b, a)) return "-" + this.sub(b, a);
				// do not change to +=
				a = strMul("0", b.io(".") - a.io(".")) + a + strMul("0", b.slc(".").length - a.slc(".").length);
				b = strMul("0", a.io(".") - b.io(".")) + b + strMul("0", a.slc(".").length - b.slc(".").length);
				a = a.split("."); b = b.split(".");

				let c = [
					[ a[0], b[0] ],
					[ a[1], b[1] ],
				].map( e => e.map(f=>f.split("")) )
					.map( o => o[0].map((e,i) => Number(e) - Number(o[1][i])) )
				, neg = c[0][0] < 0;
				for (var i = 2, j, tmp; i --> 0 ;) { // c[1] then c[0]
					for (j = c[i].length; j --> 0 ;) { // for each element in c[i]
						tmp = rMath.abs( floor(c[i][j] / 10) );
						while (c[i][j] < 0) {
							i + j && (c[i][j] += 10);
							if (j) c[i][j-1] -= tmp;
							else if (i === 1) c[0][c[0].length - 1] -= tmp;
							else throw Error(`Broken. End value shouldn't be negative.`);
						}
					}
				}
				c = c.map( e => e.join("") ).join(".");
				return this.norm( c.incl(".") ? c : `${c}.0` );
			}
			mul(...snums) {
				snums[0] instanceof Array && (snums = snums[0]);
				if (snums.length > 2) return this.mul(
					this.mul( snums[0], snums[1] ),
					...snums.slice(2),
				);
				var [a, b] = snums;

				
				if (rMath.isNaN(a) || rMath.isNaN(b)) return NaN;
				a = this.norm( a ); b = this.norm( b );
				const sign = this.sgn(a) === this.sgn(b) ? 1 : -1;
				a = this.abs(a); b = this.abs(b);
				if (this.eq.iz(a) || this.eq.iz(b)) return "0.0";

				a = a.remove(/\.?0+$/g); b = b.remove(/\.?0+$/g);
				var dec = 0;
				a.io(".") > 0 && (dec += a.length - 1 - a.io("."));
				b.io(".") > 0 && (dec += b.length - 1 - b.io("."));
				a = a.remove("."); b = b.remove(".");
				for (var i = b.length, arr = [], carryover, tmp, str, j; i --> 0 ;) {
					for (j = a.length, str = "", carryover = 0; j --> 0 ;) {
						tmp = multable[ b[i] ][ a[j] ] + carryover + "";
						carryover = tmp.length - 1 ? Number(tmp[0]) : 0;
						tmp = Number(tmp[tmp.length - 1]);
						str = tmp + str;
						!j && carryover && (str = carryover + str);
					}
					arr.push(str);
				}
				for (var i = arr.length; i --> 0 ;) arr[i] += strMul("0", i);
				for (var total = "0.0", i = arr.length; i --> 0 ;)
					total = this.add(arr[i], total).remove(/\.0+$/);
				total = (
					total.substr(0, total.length - dec)
					+ "."
					+ total.slice(total.length - dec)
				).replace(/\.$/, ".0");
				return sign === -1 ? this.neg( total ) : total;
			}
			mul10(snum="0.0", n=1) {
				// multiplies snum by 10^int(n) (moves decimal n places to the right)
				if (Number.isNaN( n = Number(n) ) || !Number.isInteger(n)) return NaN;
				if (Number.isNaN( snum = this.norm(snum, NaN) )) return NaN;

				if ( n === 0 ) return snum; // x * 10^0
				if ( n < 0 ) return this.div10(snum, -n);

				let i = snum.io(".")
					, tmp = snum.slice(0, i) + snum.slice(i + 1, i + n + 1);
				return this.norm(
					tmp + strMul("0", i + n - tmp.length) + "." + snum.slice(i + n + 1)
				);
			}
			div10(snum="0.0", n=1) {
				// divide snum by 10^n
				if (Number.isNaN( n = Number(n) ) || !Number.isInteger(n)) return NaN;
				if (Number.isNaN( snum = this.norm(snum, NaN) )) return NaN;

				if ( n === 0 ) return snum; // x / 10^0
				if ( n < 0 ) return this.mul10(snum, -n);

				const sign = this.sgn(snum), i = snum.io(".");
				snum = this.abs(snum);

				snum = snum.substring(0, i - n) + "." + strMul("0", n - i) +
					snum.substring(i - n, i) + snum.substr(i+1);

				return this.norm( sign < 0 ? this.neg(snum) : snum );
			}
			div(num="0.0", denom="1.0", precision=18) {
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				Number.isNaN(precision = Number(precision)) && (precision = 18);
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				if ( this.eq.iz(denom) )
					return this.eq.iz(num) ?
						NaN :
						Infinity;
				if ( this.eq.iz(num) ) return "0.0";
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(this.fpart(num).length, this.fpart(denom).length) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);
				// return this.idiv(num, denom); // extra checks for the same cases.
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (!precision) return `${ansString}.0`;
				var remainder = this.mul10( this.sub(num, this.mul(ans, denom)) );
				if (this.eq.nz(remainder)) ansString += ".";
				for (var i = 0, j; this.eq.nz(remainder) && i++ < precision ;) {
					for (j = 9; this.eq.ng(this.sub(remainder, table[j])) ;) j--;
					remainder = this.mul10( this.sub(remainder, table[j]) );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sign === -1 ? `-${ansString}` : ansString;
			}
			fdiv(num="0.0", denom="1.0") {
				// floored division
				// NOTE: Will break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				if ( this.eq.iz(denom) )
					return this.eq.iz(num) ?
						NaN :
						Infinity;
				if ( this.eq.iz(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(this.fpart(num).length, this.fpart(denom).length) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);

				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				return `${sign === -1 && this.eq.nz( this.sub(num, this.mul(ans, denom)) ) ?
					-++ans :
					ans
				}.0`;
			}
			rdiv(num="0.0", denom="1.0") {
				// rounded division
				throw Error("Not Implemented");
			}
			cdiv(num="0.0", denom="1.0") {
				// ceiling division
				// NOTE: Will probably break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				if ( this.eq.iz(denom) )
					return this.eq.iz(num) ?
						NaN :
						Infinity;
				if ( this.eq.iz(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(this.fpart(num).length, this.fpart(denom).length) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);

				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				return `${(
					sign == 1 && this.eq.nz( this.sub(num, this.mul(ans, denom)) ) ?
						++ans :
						-ans
				)}.0`;
			}
			tdiv(num="0.0", denom="1.0") {
				// truncated division
				// NOTE: Will probably break the denominator is "-0". I'm not going to fix it either
				if (rMath.isNaN(num) || rMath.isNaN(denom)) return NaN;
				if ( this.eq.iz(denom) )
					return this.eq.iz(num) ?
						NaN :
						Infinity;
				if ( this.eq.iz(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				let exponent = rMath.max(this.fpart(num).length, this.fpart(denom).length) - 2;
				num = this.mul10(num, exponent); denom = this.mul10(denom, exponent);

				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				return `${ BigInt(sign) * ans}.0`;
			}
			idiv(num="0.0", denom="1.0", precision=18) {
				// assumes correct input. (sNumber, sNumber, Positive-Integer)
				// should be faster than div when applicable
				// I do not remember where the "i" came from
				if ( this.eq.iz(denom) )
					return this.eq.iz(num) ?
						NaN :
						Infinity;
				if ( this.eq.iz(num) ) return "0.0";
				num = this.norm( num+"" ); denom = this.norm( denom+"" );
				const sign = this.sgn(num) * this.sgn(denom);
				num = this.abs(num); denom = this.abs(denom);
				for (var i = 10, table = []; i --> 0 ;) table[i] = this.mul(i, denom);
				let tmp1 = num, tmp2 = denom, tmp3, ans = 0n;
				while ( this.eq.nn(tmp3 = this.sub(tmp1, tmp2)) ) {
					tmp1 = tmp3;
					ans++;
				}
				var ansString = `${ans}`;
				if (precision < 1) return `${ansString}.0`;
				var remainder = this.mul10( this.sub(num, this.mul(ans, denom)) );
				if (this.eq.nz(remainder)) ansString += ".";
				for (var i = 0, j; this.eq.nz(remainder) && i++ < precision ;) {
					for (j = 9; this.eq.ng(this.sub(remainder, table[j])) ;) j--;
					remainder = this.mul10( this.sub(remainder, table[j]) );
					ansString += `${j}`;
				}
				ansString.io(".") < 0 && (ansString += ".0");
				return sign === -1 ? `-${ansString}` : ansString;
			}
			mod(a="0.0", b="0.0") { return this.sub( a, this.mul(b, this.fdiv(a, b)) ) }
			ipow(a="0.0", b="1.0") {
				a = this.norm(a); b = this.norm(b);
				if (!this.isIntN(b)) return NaN;
				var t = "1.0";
				if (this.sgn(b) >= 0)
					for (; b > 0; b = this.decr(b))
						t = this.mul(t, a);
				else for (; b < 0; b = this.add(b, 1))
					t = this.div(t, a);
				return t;
			}
			neg(snum="0.0") {
				// negate
				return this.eq.iz(snum) ?
					snum :
					snum[0] === "-" ?
						snum.slice(1) :
						`-${snum}`;
			}
			sgn(snum="0.0") {
				// string sign. sMath.sgn("-0") => -1
				return snum[0] === "-" ?
					-1 :
					/0+\.?0*/.all(snum) ?
						0 :
						1;
			}
			sign(snum="0.0") { return this.sgn(snum) }
			ssgn(snum="0.0") {
				// string sign. sMath.ssgn("-0") => "-1.0"
				return snum[0] === "-" ?
					"-1.0" :
					/0+\.?0*/.all(snum) ?
						"0.0" :
						"1.0";
			}
			ssign(snum="0.0") { return this.ssgn(snum) }
			abs(snum="0.0") { return snum[0] === "-" ? snum.slice(1) : snum }
			fpart(snum="0.0") {
				snum = this.norm(snum, NaN);
				return Number.isNaN(snum) ?
					NaN :
					fpart(snum, !1);
			}
			ipart(snum="0.0") {
				snum = this.norm(snum);
				return snum.slc(0, ".") + ".0";
			}
			square(n="0.0") { return this.mul(n, n) }
			cube(n="0.0") { return this.mul(this.square(n), n) }
			tesseract(snum="0.0") {
				// x^4, because a tesseract is a 4d cube.
				return this.square(this.square(snum));
				// this.mul(this.cube(n), n);
				// probably slower, but faster if it was a bigint for some strange reason...
				// i * i * i * i is faster than (i ** 2) ** 2 with bigint...
				// I ran millions of tests over ranges of values and it was faster much more often.
			}
			decr(snum="1.0") {
				// probably faster than sMath.sub(x, 1) because there is less array manipulation
				// the drawback is there is more string manipulation, which is probably slower.
				if ("0-.".incl(snum[0])) return this.sub(snum, "1.0");
				var i1 = snum.io("."), i2;

				if (i1 < 0) throw Error("sMath.decr's argument had no '.'");
				for (i2 = i1; snum[--i1] === "0" ;);
				snum = snum.slc(0, i1) + Number(snum[i1])-1 + snum.slc(i1+1);
				for (; ++i1 < i2 ;)
					snum = snum.slc(0, i1) + "9" + snum.slc(i1+1);
				return snum;
			}
			incr(snum="0.0") {
				return this.add(snum, "1.0");
				// return x + 1
			}
			isNaN(snum="0.0") {
				if (type(snum) !== "string") return !0;
				for (var i = 0, n = snum.length, period = !1; i < n; i++) {
					if (snum[i] === ".") {
						if (period) return !0;
						period = !0;
					} else if ( !"0123456789".includes(snum[i]) ) return !0;
				}
				return !1;
			}
			isInt(snum="0.0") {
				if (type(snum) !== "string") return !1; // !== string | MutableString
				var i = snum.io(".");
				if (i === -1 || i === snum.length - 1) return !0;
				for (var n = snum.length; ++i < n ;)
					if (snum[i] !== "0") return !1;
				return !0;
			}
			isIntN(snum="0.0") {
				// isInt Normalized, meaning `snum` is already normalized
				return snum.slice(-2) === ".0";
			}
			isFloat(snum="0.0") {
				// not actually a float, but floats have decimals and it checks for decimals, so whatever
				// theoretically faster than !isInt(snum)
				if (type(snum) !== "string") return !1;
				var i = snum.io(".");
				if (i === -1 || i === snum.length - 1) return !1;
				for (var n = snum.length; ++i < n ;)
					if (snum[i] !== "0") return !0;
				return !1;
			}
			isFloatN(snum="0.0") {
				// isFloat Normalized, meaning `snum` is already normalized
				return snum.slice(-2) !== ".0";
			}
			min(...snums) {
				if (!snums.length) return "0.0";
				snums = snums.flatten();
				for (var min = snums[0], i = snums.length; i --> 1 ;)
					this.eq.lt(snums[i], min) && (min = snums[i]);
				return min;
			}
			max(...snums) {
				if (!snums.length) return "0.0";
				var snums = snums.flatten();
				for (var max = snums[0], i = snums.length; i --> 1 ;)
					this.eq.gt(snums[i], max) && (max = snums[i]);
				return max;
			}
			_lmgf(t="lcm", ...ns) {
				// TODO: deprecate _lmgf
				// throw Error("not implemented");
				// least commond multiple and greatest common factor
				// the arguments should be correctly formatted, or it will not always work
				ns = ns.flatten();
				["l", "lcm", "g", "gcf", "gcd"].includes(t) || (t = "lcm");
				if (t[0] === "g") {
					for (const e of ns)
						if (this.isFloatN(e))
							return "1.0";
				}
				else if (t[0] === "l") {
					for (const e of ns) {
						if (this.isFloatN(e))
							return ns.reduce((t, e) => this.mul(t, e), "1.0");
					}
				}
				else throw Error("invalid first argument for sMath.lmgf");
				for (var i = t[0] === "l" ? this.max(ns) : this.min(ns), c
					;;
					i = t[0] === "l" ? this.incr(i) : this.decr(i)
				) {
					for (var j = ns.length; j --> 0 ;) {
						if (this.eq.nz(t[0] === "l" ? this.mod(i, ns[j]) : this.mod(ns[j], i))) {
							c = !1;
							break;
						}
						c = !0;
					}
					if (c) return i;
				}
			}
			floor(snum="0.0") {
				snum = this.norm(snum);
				var ans = this.ipart(snum);
				snum[0] === "-" && this.isFloat(snum) && (ans = this.decr(ans));
				return ans;
			}
			ceil(snum="0.0") {
				snum = this.norm(snum);
				var ans = this.ipart(snum);
				this.eq.ps(snum) && this.isFloat(snum) && (ans = this.add(ans, 1));
				return ans;
			}
			round(snum="0.0") {
				snum = this.norm(snum);
				return this.eq.lt(this.fpart(snum), "0.5") ?
					this.ipart(snum) :
					this.add(this.ipart(snum), this.sgn(snum)+"")
			}
			trunc(snum="0.0") { return this.ipart(snum) }
			lcm(...snums) { return this._lmgf("lcm", ...snums) } // TODO/CHG: Change to use the same method as rMath
			gcd(...snums) { return this._lmgf("gcd", ...snums) } // TODO/CHG: Change to use the same method as rMath
			gcf(...snums) { return this._lmgf("gcf", ...snums) } // TODO/CHG: Change to use the same method as rMath
			int(n="0.0") { return this.ipart(n) }
			truncate(n="0.0") { return this.ipart(n) }
			ifact(n="1.0") {
				n = this.norm(n);
				if (this.isNaN(n) || this.eq.ng(n)) return NaN;
				if ( this.eq.nz(this.fpart(n)) ) throw Error("No decimals allowed.");
				for (var i = n+"", total = "1.0"; this.eq.gt(i, "0.0"); i = this.decr(i))
					total = this.mul(i, total);
				return total;
			}
			sum(n, last, fn=n=>n, inc="1.0", divPrecision=18) {
				// if divPrecision is falsy, it won't change the function
				if (this.isNaN( n = this.norm(n) )) return NaN;
				if (this.isNaN( last = this.norm(last) ) ) return NaN;
				if (type(fn, 1) !== "func") return NaN;
				if ( divPrecision && /[-+*/%!^]/.test(fn.code()) )
					fn = stringifyMath(fn, fn.args(), "", divPrecision);
				if (this.isNaN( inc = this.norm(inc) )) return NaN;
				for (var total = "0.0"; this.eq.le(n, last); n = this.add(n, inc))
					total = this.add(total, fn(n));
				return total;
			}
			atanh(x, n="100.0", divPrecision=18) {
				x = this.norm(x);
				if (this.isNaN(x)) return NaN;
				const y = sMath.incr( sMath.mul(2, k) );
				return this.sum(
					"0.0" // first
					, n // last
					, k => sMath.div( sMath.ipow(x, y), y, divPrecision ) // function
					, "1.0" // increment
					, divPrecision // divPrecision
				)
			}
			ln(x, n="100.0", divPrecision=18) {
				x = this.norm(x);
				return this.mul(
					this.atanh(
						this.div( this.decr(x), this.incr(x), divPrecision ),
						n, divPrecision
					), "2.0"
				);
			}
		}
		, "math rMath": class RealMath {
			constructor(
				degTrig = LibSettings.rMath_DegTrig_Argument
				, help = LibSettings.rMath_Help_Argument
				, comparatives = LibSettings.rMath_Comparatives_Argument
				, constants = LibSettings.rMath_Constants_Argument
				,
			) {
				degTrig      === "default" && (degTrig = !0);
				help         === "default" && (help = !0);
				comparatives === "default" && (comparatives = !0);
				constants    === "default" && (constants = !0);

				var HelpText = help ? (function create_HelpText() {
					var helptext = class HelpText {
						constructor({
							name = null
							, field = null
							, method = null
							, args = {
								names: null
								, defaults: null
								, types: null
								, number: null
							}
							, description = null
							, miscellaneous = null
							, see = null
						}={}, isfunction = true) {
							this.name = name ?? null;
							this.field = field ?? null;
							if (isfunction)
								this.method = method ?? null,
								this.arguments = {
									names: args?.names ?? null
									, defaults: args?.defaults ?? null
									, types: args?.types ?? null
									, number: args?.number ??
										args?.types?.length ??
										args?.defaults?.length ??
										args?.names?.length ?? null
								};

							this.description = description ?? null;
							this.miscellaneous = miscellaneous ?? null;
							this.see = see ?? null;
							this.isfunction = !!isfunction;
						}
						format() {
							throw Error("Not Implemented. for now use this.getHelpString")
						}
					}
					return function HelpText() { return new helptext(...arguments) }
				})() : !1
				, rSet = class RealSet {
					// Probably not constant time lookup.
					constructor(...args) {
						args = args.flatten().filter(e => typeof e === "number").sort();
						for (let x of args) Array.prototype.push.call(this, x);
						this.length ??= 0;
					}
					add(number=0) {
						if (typeof number !== "number") return this;
						!this.has(number) && Array.prototype.push.call(this, number);
						return this;
					}
					cumsum() {
						// cumulative sum
						var sum = 0;
						for (const x of this) sum += x;
						return sum;
					}
					delete(number=0) { return Array.prototype.remove.call(this, number) }
					has(number=0) { return Array.prototype.includes.call(this, number) }
					union(set, New=true) {
						// TODO/FIX: I think this is broken, but I'm not sure
						if (type(set, 1) !== "set") return this;
						if (New) {
							let output = new this.constructor;
							for (var i = rMath.max(this.length, set.length); i --> 0 ;)
								output.add(this[i])
								, output.add(set[i]);
							return output;
						} else for (var i = set.length; i --> 0 ;)
							this.add(set[i]);
						return this;
					}
					intersection(set, New=true) {
						// TODO/FIN: Implement
						if (type(set, 1) !== "set") return this;
						throw Error("Not Implemented");
					}
					difference(set, New=true) {
						// TODO/FIN: Implement
						if (type(set, 1) !== "set") return this;
						throw Error("Not Implemented");
					}
					isSuperset(set) {
						// TODO/FIN: Implement
						// loose superset, can be the same set
						if (type(set, 1) !== "set") return !0;
						throw Error("Not Implemented");
					}
					isSubset(set) {
						// TODO/FIN: Implement
						// loose subset, can be the same set
						if (type(set, 1) !== "set") return !1;
						throw Error("Not Implemented");
					}
					isStrictSuperset(set) {
						// TODO/FIN: Implement
						// can't be the same set
						if (type(set, 1) !== "set") return !0;
						throw Error("Not Implemented");
					}
					isStrictSubset(set) {
						// TODO/FIN: Implement
						// can't be the same set
						if (type(set, 1) !== "set") return !1;
						throw Error("Not Implemented");
					}
					isSameset(set) {
						if (type(set, 1) !== "set") return !1;
						if (set.length !== this.length) return !1;

						for (var i = 0; i < set.length; i++)
							if ( !this.has(set[i]) )
								return !1;
						return !0;
					}
					reverse() {
						// also changes the object
						return Array.prototype.reverse.call(this);
					}
					__type__() { return "set" }
					sortA() { return qsort(this) }
					sortD() { return this.sortA().reverse() }
					sort(type="A") {
						try {
							return this[`sort${type[0].upper()}`];
						} catch {
							return !1;
						}
					}
					cardinality() { return this.length }
					size() { return this.length }
					clear() { this.length = 0 }
				};

				Reflect.defineProperty(this, "_HelpText", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: help ? HelpText : null
				});
				Reflect.defineProperty(this, Symbol.toStringTag, {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: "rMath"
				});
				Reflect.defineProperty(this, "Set", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: rSet
				});
				Reflect.defineProperty(this.Set.prototype, "⋃", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.union
				});
				Reflect.defineProperty(this.Set.prototype, "⋂", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.intersection
				});
				Reflect.defineProperty(this.Set.prototype, "⊂", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isStrictSubset
				});
				Reflect.defineProperty(this.Set.prototype, "⊃", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isStrictSuperset
				});
				Reflect.defineProperty(this.Set.prototype, "⊊", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isStrictSubset
				});
				Reflect.defineProperty(this.Set.prototype, "⊋", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isStrictSuperset
				});
				Reflect.defineProperty(this.Set.prototype, "⊆", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isSubset
				});
				Reflect.defineProperty(this.Set.prototype, "⊇", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.isSuperset
				});
				Reflect.defineProperty(this.Set.prototype, "∈", {
					configurable : false
					, writable   : false
					, enumerable : false
					, value: this.Set.prototype.has
				});

				this.phi = phi;
				this.tau = tau;
				this.emc = this.ec = emc;
				this.e   = this.E = e;
				this.pi  = this.PI = π;
				this.Phi     = -.6180339887498949  ; this.sqrt3    = 1.7320508075688772 ;
				this.omega   = 0.5671432904097838  ; this.LN2      = 0.6931471805599453 ;
				this.ln2     = .69314718055994531  ; this.LN10     = 2.3025850929940450 ;
				this.ln10    = 2.3025850929940456  ; this.LOG2E    = 1.4426950408889634 ;
				this.log2e   = 1.4426950408889634  ; this.LOG10E   = 0.4342944819032518 ;
				this.loge    = .43429448190325183  ; this.SQRT1_2  = 0.7071067811865476 ;
				this.sqrt1_2 = .70710678118654752  ; this.SQRT2    = 1.4142135623730951 ;
				this.sqrt2   = 1.4142135623730951  ; this.logpi10  = 2.0114658675880609 ;
				this.sqrt5   = 2.2360679774997894  ; this.logtaupi = .62285443720447269 ;
				this.dtor    = .017453292519943295 ; this.rtod     = 57.29577951308232  ;
				this.sqrtpi  = 1.772453850905516   ; this.sqrtpi_2 = 0.886226925452758  ;
				this.sqrttau = 2.5066282746310007  ;
				this.π_2 = π_2; // Math.π_2 === Math.π/2 but faster probably
				this.Math = Math;
				this.nullSet = this.emptySet = this.voidSet = new this.Set();
				/* G = 6.67m³/(10¹¹ kg s²)
					"–" !== "-"
					roman numerals 1:ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅬⅭⅮⅯ
					roman numerals 2:ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻⅼⅽⅾⅿ
	
					control characters:␀␁␂␃␄␅␆␇␈␉␊␋␌␍␎␏␐␑␒␓␔␕␖␗␘␙␚␛␜␝␞␟␡
					superscript:⁽°⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼ⁿ⁾ᒻᒽᒼ
					subscript:₀₁₂₃˷
					∑∏Δ×∙÷±∓∀∃∄∤⌈⌉⌊⌋⋯〈〉√∛∜≤≥≠≈≉≋≔⩴≟≝⩮⩯≡≢→↦↛⇒⇔⇋⇏⊕⊝∧∨⋀⋁⋂⋃∞¬∴∵∶∷∼⊨⊽⊻∫∬∭⨌
					∠⟂∥∦⊯⊮⊭⊬⊫⊪∈∉∋∌∖∕⅟∩∪⊂⊃⊄⊅⊆⊇⊈⊉℉℃ℵƒ∅∂ℷℎℏ℮Ω℧ℕℝℚ𝕀ℙℤℍℂℼℿℽℾ𝕋⅀ⅅⅆⅇⅈⅉ⩵⩶≶≷π


					∮∯∰∱∲∳⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚⨛⨜⌀∡⦜∢⦝⦞⦟∟△□▭▱○◊⋄≍⋚⋛⊊⊋⊍⊎⋐⋑⋒⋓⋔⋲⋳⋴⋵⋶⋷⋹⋺⋻⋼⋽⋾𝜕ℶ∁∇⋎⋏Ↄ
				*/// TODO/UPD: Update rMath.help
				if (help) this.help = {
					format: HelpText({
						name: "string for official name or array of strings of names."
						, field: "string or array of strings for field(s) item is used in, or at the very least, which field(s) it comes from. There might be more, for instance sin is everywhere but it only says Trigonometry, because that is where it originates and the main field."
						, method: "only for functions, the method used for calculation"
						, args: {
							self: "optional. only for functions"
							, names: "array of strings for the names of the arguments. they are in the same order as they are passed into the function."
							, defaults: "array of values for the default values of the arguments."
							, types: "array of strings for the types of the arguments which are detailed in rMath.help.types. if something is in parentheses, ie: (Radians), then that is the units. if there are no units, units are irrellivant, ie: an index doesn't have units."
							, number: "optional. The number of Arguments. if it is not provided, it will be calculated from the other things given."
						}
						, description: "string or array of strings. description of what the function does, assuming knowledge of the names of the arguments and the types (for functions). or a description of what the item is."
						, miscellaneous: [
							"\"miscellaneous\" is an optional string or array of strings for miscellaneous description or information."
							, "everything ends with a period."
							, "everything uses double quotes as opposed to single quotes or back ticks."
							, "things like \"see trig.cos\" have an implicit \"rMath.help.\"."
							, "\"self\" refers to the parent object. for instance rMath.help.format.arguments.self refers to rMath.help.format.arguments, and rMath.help.trig.self refers to rMath.help.trig."
							, "the documentation for some things might be just a string because either they are something that is describable in a simple sentence, or they are a constant or something."
						]
						, see: "string or list of strings of related functions or constants."
					})
					, types: {
						"Real Number": "built in JavaScript Number. Number in [a,b] is interval notation."
						, "Big Integer": "BigInt"
						, "Integer": "Positive and Negative Whole-Numbers, and 0"
						, "Positive": "as for a number: x > 0 (prefix)"
						, "NonNegative": "as for a number: x ≥ 0 (prefix)"
						, "Complex": "Complex Number. cMath.Complex object. (prefix)"
						, "Imaginary": "any number a·i. what a is depends on the rest, ie \"Imaginary Integer\" means a is an integer. a defaults to \"Real Number\""
						, "Rational": "any number a/b such that a and b are Integers."
						, "Algebraic": "countable infinite subset of the complex numbers such that it is a root to a polynomial with integer coefficients. Algebraic Reals are a subset of the Real numbers."
						, "Irrational": "uncountable infinte subset of numbers such that it is not rational."
						, "Transcendental": "a number that is irrational and not algebraic, for instance, π and e."
						, "Natural Number": "NonNegative Integers. Positive Whole-Numbers and 0."
						, "Function": "a function"
						, "String": "a built in string"
						, "Mutable String": "a custom MutableString class"
						, "Symbol": "Symbol"
						, "Array": "Built in Array"
						, "Set": "rMath.RealSet"
						, "Nullish": "null, undefined, or sometimes NaN"
						, "Boolean": "built in boolean value."
						, "Snum": "String Number. not a custom class, but merely a format for numbers in strings. everything is in decimal. 1/2 would be \"0.5\" instead of \".5\". there are no trailing zeros at the end. \"2.4\" cannot be \"2.40\". The only time there are trailing decimal places is if it is an integer. the number 2 would be \"2.0\" as if it were a floating point number. there is no -0, just \"0.0\". negative numbers just have a minus sign at the beginning as normal. there are no spaces."
					}
					, self: HelpText({
						description: "rMath.help is the documentation for rMath."
						, see: ["null", "undefined", "NaN", "format"]
					})
					, null: HelpText({
						description: "If a value in the help object is null or missing, then just directly check what the function does or wait until the documentation is updated (may take a while)."
						, see: ["format", "help", "undefined", "NaN"]
					})
					, undefined: HelpText({
						description: "If a value in the help object is undefined but there, It means that it was added and not comleted, then removed, but it is planned to be re-implemented at a later date."
						, see: ["format", "help", "null", "NaN"]
					})
					, NaN: HelpText({
						description: "if a value in the help object is NaN, It means that I do not know what the thing does/means."
						, see: ["format", "null", "undefined", "help"]
					})
					, trig: {
						self: HelpText({
							name: "self"
							, description: "Short for \"Trigonometric Functions\"."
						}, !1)
						, sin: HelpText({
							name: "Sine"
							, field: "Trigonometry"
							, method: "Maclaurin expansion of cos. sin(x) = cos(π/2 - x)"
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns sin(θ). the accuracy is the degree of the taylor expansion."
							, see: ["trig.asin", "trig.csc", "trig.sinh", "trig.deg.sin", "trig.cos"]
						})
						, cos: HelpText({
							name: ["Complimentary Sine", "Co-Sine"]
							, field: "Trigonometry"
							, method: "Maclaurin series expansion of cos"
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns cos(θ). the accuracy is the degree of the taylor expansion."
							, see: ["trig.acos", "trig.cosh", "trig.sec", "trig.deg.cos", "trig.sin"]
						})
						, tan: HelpText({
							name: "Tangent"
							, field: "Trigonometry"
							, method: "Maclaurin series expansions of cos"
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns tan(x). the accuracy is the degrees of the taylor expansions of cos."
							, see: [
								"trig.sin"
								, "trig.cos"
								, "trig.cot"
								, "trig.tanh"
								, "trig.atan"
								, "trig.tanc"
								, "trig.atan2"
								, "trig.deg.tan"]
						})
						, sinc: HelpText({
							name: ["Un-Normalized Sine C", "Sampling Function", "Sa(x)"]
							, field: ["Trigonometry", "Physics", "Engineering", "Signal Processing", "Spectroscopy"]
							, method: "maclaurin series definition of cos. if x=0, the limit of 1 is used instead."
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns sin(x) / x or sinc(x). the accuracy is the degree of the taylor expansion."
							, see: ["trig.sin", "trig.nsinc", "trig.deg.sinc", "trig.cosc"]
						})
						, nsinc: HelpText({
							name: "Normalized Sine C"
							, field: ["Signal Processing", "Trigonometry", "Information Theory", "Spectroscopy"]
							, method: "maclaurin series expansion of cos. if x=0, the limit of 1 is used instead."
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns sin(πx) / πx. the accuracy is the degree of the taylor expansion."
							, see: ["trig.sin", "trig.sinc", "trig.deg.nsinc", "trig.ncosc"]
						})
						, cosc: HelpText({
							name: ["Complimentary Sine C", "Co-Sine C"]
							, field: "Trigonometry"
							, method: "maclaurin series expansion of cos"
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns cos(x) / x. the accuracy is the degree of the taylor expansion."
							, see: ["trig.cos", "trig.ncosc", "trig.deg.cosc", "trig.sinc"]
						})
						, ncosc: HelpText({
							name: ["Normalized Complimentary Sine C", "Normalized Co-Sine C"]
							, field: "Trigonometry"
							, method: "maclaurin series expansion of cos."
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns cos(πx) / πx. the accuracy is the degree of the taylor expansion."
							, miscellaneous: "undefined at x=0. the limit also doesn't exist."
							, see: ["trig.cos", "trig.cosc", "trig.deg.ncosc"]
						})
						, tanc: HelpText({
							name: "Tangent C"
							, field: "Trigonometry"
							, method: "maclaurin series expansions of cos. at x=0, the limit of 1 is used instead."
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns tan(x) / x. the accuracy is the degrees of the taylor expansions of cos."
							, see: ["trig.tan", "trig.ntanc", "trig.tanhc", "trig.deg.tanc"]
						})
						, ntanc: HelpText({
							name: "Normalized Tangent C"
							, field: "Trigonometry"
							, method: "Maclaurin series expansions of cos. at x=0, the limit of 1 is used instead."
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns tan(πx) / πx. the accuracy is the degrees of the taylor expansions of cos."
							, see: ["trig.tan", "trig.tanc", "trig.deg.tanc"]
						})
						, csc: HelpText({
							name: ["Complimentary Secant", "Co-Secant"]
							, field: ["Trigonometry", "Gamma Calculus"]
							, method: "Maclaurin series expansion of cos."
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns 1 / sin(θ). accuracy is the degree of the taylor expansion."
							, see: ["trig.sin", "trig.acsc", "trig.csch", "trig.deg.csc", "trig.sec"]
						})
						, sec: HelpText({
							name: "Secant"
							, field: "Trigonometry"
							, method: "reciprocal of taylor series expansion of cos."
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns 1 / cos(θ). accuracy is the degree of the taylor expansion."
							, see: ["trig.cos", "trig.asec", "trig.sech", "lam", "trig.deg.sec", "trig.csc"]
						})
						, cot: HelpText({
							name: ["Complimentary Tangent", "Co-Tangent"]
							, field: "Trigonometry"
							, method: "Maclaurin series expansions of cos."
							, args: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns 1 / tan(θ). the accuracy is the degree of the taylor expansions of cos."
							, see: ["trig.sin", "trig.coth", "trig.cos", "trig.tan", "trig.acot", "trig.deg.cot"]
						})
						, asin: HelpText({
							name: ["Arc Sine", "Inverse Sine"]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "recursive definition of arctan. arcsin(x) = arctan( x / √[1-x²] )"
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number in [0,1]", "Natural Number"]
							}
							, description: "returns arcsin(x) with the output in radians. the accuracy is the number of iterations of arctan."
							, see: ["trig.sin", "trig.asinh", "trig.deg.asin", "trig.acos"]
						})
						, acos: HelpText({
							name: [
								"Arc Complimentary Sine"
								, "Arc Co-Sine"
								, "Inverse Complimentary Sine"
								, "Inverse Co-Sine"
							]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "recursive definition of arctan. acos(x) = π/2 - asin(x). asin(x) = atan( x / √[1-x²] )"
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number 0 ≤ x ≤ 1", "Natural Number"]
							}
							, description: "returns π/2 - arcsin(x) with the output in radians.  the accuracy is the number of iterations of arctan."
							, see: ["trig.cos", "trig.acosh", "trig.deg.acos", "trig.asin"]
						})
						, atan: HelpText({
							name: ["Arc Tangent", "Inverse Tangent"]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "iterative definition. 2·atan(x) = sgn(x)(|x|>1)·π - atan( 2x/[x²-1] )"
							, args: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number", "Natural Number"]
							}
							, description: "returns arctan(x). the accuracy is the number of iterations."
							, see: ["trig.tan", "trig.atan2", "trig.atanh", "trig.deg.atan", "trig.acot"]
						})
						, atan2: HelpText({
							name: [
								"Arc Tangent 2"
								, "Inverse Tangent 2"
								, "Expanded Arc Tangent"
								, "Expanded Inverse Tangent"
								, "Complex Argument"
							]
							, field: ["Trigonometry", "Inverse Trigonometry", "Complex Analysis"]
							, method: "expansion of atan(x). to [-π/2, π/2]"
							, args: {
								names: ["x", "y", "accuracy", "flipArgs"]
								, defaults: [undefined, undefined, 100, false]
								, types: ["Real Number", "Real Number", "Natural Number", "Boolean"]
							}
							, description: "returns atan2(x, y) in radians. If the third argument is true, the arguments of the function will be reversed. see 'https://bit.ly/3j5X03W' for image of formula. normally, the arguments are (y, x). the accuracy is the number of iterations of arctan."
							, see: ["trig.atan", "trig.tan", "trig.deg.atan2"]
						})
						, acsc: HelpText({
							name: [
								"Arc Complimentary Secant"
								, "Inverse Complimentary Secant"
								, "Complimentary Inverse Secant"
								, "Complimentary Arc Secant"
								, "Arc Co-Secant"
							]
							, field: ["Trigonometry", "Inverse Trigonometry", "Inverse Gamma Calculus"]
							, method: "iterative definition of arctan. asin(x) = atan( x / √[1-x²] ). acsc(x) = asin(1/x)."
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number in [-1,1]", "Natural Number"]
							}
							, description: "returns arccsc(x). the accuracy is the number of iterations of atan."
							, see: ["trig.asin", "trig.csc", "trig.deg.acsc", "trig.asec", "trig.acsch"]
						})
						, asec: HelpText({
							name: ["Arc Secant", "Inverse Secant"]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "iterative definition of arctan. asin(x) = atan( x / √[1-x²] ). acos(x) = π/2 - asin(x). asec(x) = acos(1/x)."
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number in [-1,1]", "Natural Number"]
							}
							, description: "returns acos(1/x) with output in radians. the accuracy is the number of iterations of arctan."
							, see: [
								"trig.acos"
								, "trig.asin"
								, "trig.acsc"
								, "trig.asech"
								, "trig.atan"
								, "trig.sec"
								, "trig.deg.asec"
							]
						})
						, acot: HelpText({
							name: [
								"Arc Complimentary Tangent"
								, "Arc Co-Tangent"
								, "Inverse Complimentary Tangent"
								, "Inverse Co-Tangent"
							]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "iterative definition of arctan(x). acot(x) = atan(1/x) + π·(x<0)"
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number",  "Natural Number"]
							}
							, description: "returns arccot(x) with an output in radians. the accuracy is the number of iterations of arctan."
							, see: ["trig.atan", "trig.acoth", "trig.cot", "trig.deg.acot"]
						})
						, excst: HelpText({
							name: [
								"Hypotenuse between External Secant and Complimentary Tangent"
								, "Hypotenuse between Ex-Secant and Co-Tangent"
							]
							, field: "Trigonometry"
							, method: "hypotenuse of triangle with legs exsec(x) and cot(x)."
							, arguments: {
								names: ["θ", "accuracy-1", "accuracy-2"]
								, defaults: [undefined, 25, 25]
								, types: ["Real Number (Radians)", "Natural Number", "Natural Number"]
							}
							, description: "returns √(exsec²x + cot²x)."
							, see: ["trig.sec", "trig.exsec", "hypot", "trig.cot"]
						})
						, exset: HelpText({
							name: [
								"Hypotenuse between External Secant and Tangent"
								, "Hypotenuse between Ex-Secant and Tangent"
							]
							, field: "Trigonometry"
							, method: "hypotenuse of triangle with legs exsec(x) and tan(x)."
							, arguments: {
								names: ["θ", "accuracy-1", "accuracy-2"]
								, defaults: [undefined, 25, 25]
								, types: ["Real Number (Radians)", "Natural Number", "Natural Number"]
							}
							, description: "returns √(exsec²x + tan²x)"
							, see: ["trig.sec", "trig.exsec", "hypot", "trig.tan", "trig.deg.exset"]
						})
						, sqvcs: HelpText({
							name: [
								"Hypotenuse between Sine and Versed Complimentary Sine"
								, "Hypotenuse between Sine and Ver-Co-Sine"
							]
							, field: "Trigonometry"
							, method: "hypotenuse of triangle with legs vrc(x) and sin(x)."
							, arguments: {
								names: ["θ", "accuracy-1", "accuracy-2"]
								, defaults: [undefined, 25, 25]
								, types: ["Real Number (Radians)", "Natural Number", "Natural Number"]
							}
							, description: "returns √(vrc²x + sin²x)"
							, see: ["trig.hypot", "trig.vrc", "trig.sin", "trig.deg.sqvcs"]
						})
						, sq1s: HelpText({
							name: "Square root of One Plus Sine Squared"
							, field: "Trigonometry"
							, method: "Maclaurin expansion of sin"
							, arguments: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns √( 1 + sin²x )"
							, see: ["hypot", "sqrt", "square", "trig.sin", "trig.asq1s", "trig.deg.sq1s"]
						})
						, asq1s: HelpText({
							name: [
								"Arc (Square root of One Plus Sine Squared)"
								, "Inverse (Square root of One Plus Sine Squared)"
							]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "recursive definition of arctan"
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number ∈ [-√2,-1] ⋃ [1,√2]", "Real Number"]
							}
							, description: "returns arcsin( √(x² - 1) ) with the output in radians. the accuracy is the number of iterations of arctan."
							, see: ["sqrt", "square", "trig.asin", "trig.sq1s", "trig.deg.asq1s"]
						})
						, csq1s: HelpText({
							name: [
								"Complimentary Square root of One Plus Sine Squared"
								, "Square root of One Plus Complimentary Sine Squared"
								, "Square root of One Plus Co-Sine Squared"

							]
							, field: "Trigonometry"
							, method: "Maclaurin series expansion of cos"
							, arguments: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns √( 1 + cos²x )."
							, see: ["sqrt", "square", "trig.cos", "trig.sq1s", "trig.acsq1s", "trig.deg.csq1s"]
						})
						, acsq1s: HelpText({
							name: [
								"Arc (Square root of One Plus Sine Squared)"
								, "Inverse (Square root of One Plus Sine Squared)"
							]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "recursive definition of arctan"
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "1 argument (x). returns acos( √(x² - 1) ) with input in radians"
							, see: [
								"hypot"
								, "trig.atan"
								, "trig.asin"
								, "trig.acos"
								, "trig.csq1s"
								, "trig.deg.acsq1s"
							]
						})
						, crd: HelpText({
							name: "Chord"
							, field: "Trigonometry"
							, method: "Maclaurin expansion of cos. crd(x) = 2·sin(x/2), sin(x) = cos(π/2 - x)"
							, arguments: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns 2·sin(x/2)"
							, miscellaneous: "this function is named chord because in the geometric interpretation, it is a chord of the circle."
							, see: ["trig.sin", "trig.cos", "trig.acrd", "trig.deg.crd"]
						})
						, acrd: HelpText({
							name: ["Arc Chord", "Inverse Chord"]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "recursive definition of arctan. acrd(x) = "
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number in [-2,2]"]
							}
							, description: "returns 2 arcsin(x/2) with an output in radians"
							, see: ["trig.crd", "trig.deg.acrd", "trig.accrd", "trig.asin", "trig.atan"]
						})
						, ccrd: HelpText({
							name: ["Complimentary Chord", "Co-Chord"]
							, field: "Trigonometry"
							, method: "Maclaurin series expansion of cos. ccrd(x) = 2·cos(x/2)"
							, arguments: {
								names: ["θ", "accuracy"]
								, defaults: [undefined, 25]
								, types: ["Real Number (Radians)", "Natural Number"]
							}
							, description: "returns 2·cos(x/2)."
							, see: ["trig.accrd", "trig.crd", "trig.deg.ccrd", "trig.cos"]
						})
						, accrd: {
							name: [
								"Inverse Complimentary Chord"
								, "Arc Complimentary Chord"
								, "Inverse Co-Chord"
								, "Arc Co-Chord"
							]
							, field: ["Trigonometry", "Inverse Trigonometry"]
							, method: "iterative definition of arctan. accrd(x) = π/2 - acrd(x). acrd(x) = 2 asin(x/2)."
							, arguments: {
								names: ["x", "accuracy"]
								, defaults: [undefined, 100]
								, types: ["Real Number in [-2,2]", "Natural Number"]
							}
							, description: "returns π/2 - acrd(x) with the output in radians."
							, see: [
								"trig.ccrd", "trig.acrd"
								, "trig.atan", "trig.accrdh"
								, "trig.deg.accrd", "const.pi"
							]
						}
						, exsec: "1 argument. returns secx - 1 in radians"
						, aexsec: "1 argument. returns asec(x + 1) with an input in radians"
						, excsc: "1 argument. returns cscx - 1 in radians"
						, aexcsc: "1 argument. returns acsc(x + 1) with an input in radians"
						, vrs: "1 argument. returns 1 - cosx in radians"
						, avrs: "1 argument. returns acos(x + 1) with an input in radians"
						, vrc: "1 argument. returns 1 + cosx in radians"
						, avrc: "1 argument. returns acos(x - 1) with an input in radians"
						, cvs: "1 argument. returns 1 - sinx in radians"
						, acvs: "1 argument. returns asin(1 - x) with an input in radians"
						, cvrc: "1 argument. returns 1 + sinx in radians"
						, acvrc: "1 argument. returns asin(x - 1) with an input in radians"
						, hav: "1 argument. returns versx / 2 in radians"
						, ahav: "1 argument. returns acos(1 - 2x) with an input in radians"
						, hvrc: "1 argument. returns vercx / 2 in radians"
						, ahvrc: "1 argument. returns acos(2x - 1) with an input in radians"
						, hcvrs: "1 argument. returns cversx / 2 in radians"
						, ahcvrs: "1 argument. returns asin(1 - 2x) in radians"
						, hcc: "1 argument. returns cversx / 2 in radians"
						, ahcc: "1 argument. returns asin(2x - 1) with an input in radians"
						, sinh: "1 argument (x). returns sinh(x) using the taylor series definition of sinh."
						, cosh: "1 argument (x). returns cosh(x) using the taylor series definition of cosh"
						, tanh: "1 argument (x). returns sinh(x) / cosh(x)"
						, csch: "1 argument (x). returns 1 / sinh(x)"
						, sech: "1 argument (x). returns 1 / cosh(x)"
						, coth: "1 argument (x). returns 1 / tanh(x)"
						, asinh: "1 argument (x). returns ln(x + √(x**2 + 1))"
						, acosh: "1 argument (x). returns ln(x + √(x**2 - 1))"
						, atanh: "the same as the original Math.atanh."
						, acsch: "1 argument. returns asinh(1/arg)"
						, asech: "1 argument. returns acosh(1/arg)"
						, acoth: "1 argument. returns atanh(1/arg)"
						, excsth: "1 argument. returns √( exsech^2(x) +  coth^2(x) )"
						, exseth: "1 argument. returns √( exsech^2(x) +  tanh^2(x) )"
						, vcsh: "1 argument. returns √( vercosinh^2(x) +  sinh^2(x) )"
						, sq1sh: "1 argument. returns √( 1 + sinh^2(x) )"
						, asq1sh: "1 argument. returns asinh( x^2 - 1 )"
						, ccvsh: "1 argument. returns √( 1 +  cosh^2(x) )"
						, accvsh: "1 argument. returns acosh( x^2 - 1 )"
						, csq1sh: "1 argument. returns √( 1 +  cosh^2(x) )"
						, acsq1sh: "1 argument. returns acosh( x^2 - 1 )"
						, crdh: "1 argument. returns sinh(x/2)"
						, acrdh: "1 argument. returns 2asinh(x/2)"
						, ccrdh: "1 argument. returns cosh(x/2)"
						, accrdh: "1 argument. returns π/2 - acrdhx"
						, exsech: "1 argument. returns sechx - 1"
						, aexsech: "1 argument. returns asech(x + 1)"
						, excsch: "1 argument. returns cschx - 1"
						, aexcsch: "1 argument. returns acsch(x + 1)"
						, vrsh: "1 argument. returns 1 - coshx"
						, avrsh: "1 argument. returns acosh(x + 1)"
						, vrch: "1 argument. returns 1 + coshx"
						, avrch: "1 argument. returns acosh(x - 1)"
						, cvsh: "1 argument. returns 1 - sinhx"
						, acvsh: "1 argument. returns asinh(1 - x)"
						, cvrch: "1 argument. returns 1 + sinhx"
						, acvrch: "1 argument. returns asinh(x - 1)"
						, hvrsh: "1 argument. returns vershx / 2"
						, ahvrsh: "1 argument. returns acosh(1 - 2x)"
						, hvrch: "1 argument. returns verch(x) / 2"
						, ahvrch: "1 argument. returns acosh(2x - 1)"
						, hcvrsh: "1 argument. returns cvsh(x) / 2"
						, ahcvrsh: "1 argument. returns asinh(1 - 2x)"
						, hcch: "1 argument. returns cversh(x) / 2"
						, ahcch: "1 argument. returns asinh(2x - 1)"
						, deg: /*not done*/ {
							self: "trig.deg refers to trig functions that take degrees or return degrees rather than radians. there are no hyperbolic functions here because theyuse the area instead of angle."
							, sin: "1 argument. sine. returns sin(angle°), using the taylor series definition of sin."
							, sinc: undefined
							, nsinc: undefined
							, cos: "1 argument. co-sine. returns cos(angle°), using the taylor series definition of cos."
							, tan: "1 argument. tangent. returns sin(angle°) / cos(angle°)"
							, csc: "1 argument. co-secant. returns 1 / sin(angle°)"
							, sec: "1 argument. secant. returns 1 / cos(angle°)"
							, cot: "1 argument. co-tangent. returns 1 / tan(angle°)"
							, asin: "1 argument. arc-sine. returns arcsine(argument) using the taylor series definition of arcsine."
							, acos: "1 argument. arc-co-sine. returns 90 - asin(argument)"
							, atan: "1 argument. arc-tangent. returns 180/π atan(argument)"
							, atan2: "Takes 2 numeric arguments (x, and y) and 1 boolean argument (b), and returns atan2(x, y) in degrees. If b is true, the arguments of the function will be reversed, being atan2(y, x) instead, but this argument is defaulted to false. see 'https://bit.ly/3j5X03W' or 'https://bit.ly/3DzmCQq' for a better explanation."
							, acsc: "1 argument. returns asin(1/arg)"
							, asec: "1 argument. returns acos(1/arg)"
							, acot: "1 argument. if the argument is loosely equal to zero, returns 90.  if the argument is less than zero, returns 180 + atan(arg), otherwise it returns atan(arg)."
							, excst: "1 argument. returns √( exsec^2(x) +  cot^2(x) ) in degrees"
							, exset: "1 argument. returns √( exsec^2(x) +  tan^2(x) ) in degrees"
							, sqvcs: "1 argument. returns √( vercosin^2(x) +  sin^2(x) ) in degrees"
							, sq1s: "1 argument. returns √( 1 +  sin^2(x) ) in degrees"
							, asq1s: "1 argument. returns asin( x^2 - 1 ) with an input in degrees"
							, ccvs: "1 argument. returns √( 1 +  cos^2(x) ) in degrees"
							, accvs: "1 argument. returns acos( x^2 - 1 ) with an input in degrees"
							, csq1s: "1 argument. returns √( 1 +  cos^2(x) ) in degrees"
							, acsq1s: "1 argument. returns acos( x^2 - 1 ) with an input in degrees"
							, crd: "1 argument. returns sin(x/2) in degrees"
							, acrd: "1 argument. returns 2asin(x/2) with an input in degrees"
							, ccrd: "1 argument. returns cos(x/2) in degrees"
							, accrd: "1 argument. returns π/2 - acrdx in degrees"
							, exsec: "1 argument. returns secx - 1 in degrees"
							, aexsec: "1 argument. returns asec(x + 1) with an input in degrees"
							, excsc: "1 argument. returns cscx - 1 in degrees"
							, aexcsc: "1 argument. returns acsc(x + 1) with an input in degrees"
							, vrs: "1 argument. versine. returns 1 - cosx in degrees"
							, avrs: "1 argument. returns acos(x + 1) with an input in degrees"
							, vrc: "1 argument. returns 1 + cosx in degrees"
							, avrc: "1 argument. returns acos(x - 1) with an input in degrees"
							, cvs: "1 argument. returns 1 - sinx in degrees"
							, acvs: "1 argument. returns asin(1 - x) with an input in degrees"
							, cvrc: "1 argument. returns 1 + sinx in degrees"
							, acvrc: "1 argument. returns asin(x - 1) with an input in degrees"
							, hav: "1 argument. returns versx / 2 in degrees"
							, ahav: "1 argument. returns acos(1 - 2x) with an input in degrees"
							, hvrc: "1 argument. returns vercx / 2 in degrees"
							, ahvrc: "1 argument. returns acos(2x - 1) with an input in degrees"
							, hcvrs: "1 argument. returns cversx / 2 in degrees"
							, ahcvrs: "1 argument. returns asin(1 - 2x) in degrees"
							, hcc: "1 argument. returns cversx / 2 in degrees"
							, ahcc: "1 argument. returns asin(2x - 1) with an input in degrees"
						}
					}
					, const: /*not done*/ {
						self: "help text for constants on the rMath object."
						, foia1: "foia's first constant."
						, foia2: "foia's second constant."
						, ɡ: "gravitational constant. 9.80665 m/s². see const.gravity"
						, gravity: "gravitational constant. 9.80665 m/s². see const.ɡ (not a regular g)"
						, avogadro: "Avogadro's number; Avogadro's constant. the number of particles in one mole."
						, bohrMagneton: NaN
						, bohrRadius: NaN
						, boltzmann: NaN
						, classicalElectronRadius: NaN
						, deuteronMass: NaN
						, efimovFactor: NaN
						, electronMass: "Mass of an Electron in Kilograms"
						, electronicConstant: NaN
						, faraday: "Faraday's constant. the electric charge per mole of elementary charges"
						, fermiCoupling: NaN
						, fineStructure: "the elementary charge squared divided by the Planck charge squared. ~1/(4π³+π²+π)"
						, firstRadiation: NaN
						, gasConstant: NaN
						, inverseConductanceQuantum: NaN
						, klitzing: NaN
						, loschmidt: NaN
						, magneticConstant: NaN
						, magneticFluxQuantum: NaN
						, molarMass: NaN
						, molarMassC12: NaN
						, molarVolume: NaN
						, neutronMass: "Mass of a neutron in Kilograms"
						, nuclearMagneton: NaN
						, planckCharge: NaN
						, planckLength: "The shortest length possible"
						, planckMass: "The smallest mass possible"
						, planckTemperature: "The largest temperature possible"
						, planckTime: "The smallest time frame possible"
						, planckConstant: "The relationship between a photon's energy and frequency"
						, reducedPlanckConstant: "ħ := h/tau"
						, speedOfLight: "The speed of light in a vacuum in meters per second"
						, molarPlanckConstant: NaN
						, rydberg: NaN
						, sackurTetrode: NaN
						, secondRadiation: NaN
						, stefanBoltzmann: NaN
						, weakMixingAngle: NaN
						, sunLuminosity: NaN
						, EarthMass: "A unit of measure based on the mass of Earth in kilograms"
						, googol: "10^100; 1 with 100 zeros."
						, centillion: "10^303."
						, EarthMasses: "The mass of common objects in Earth masses"
						, EarthRadius: "The Radius of Earth in different units"
						, planck: "An object with all the planck constants"
						, solarConstants: "Solar constants of planets in the solar system. perihelion, aphelion, and mean"
						, dragCoefficient: "Drag coefficients of common objects"
						// Guaranteed Constants
						, phi: null
						, e: null
						, E: null
						, ec: "Euler-Mascheroni constant; Euler's constant; lowercase gamma. see const.emc"
						, emc: "Euler-Mascheroni constant; Euler's constant; lowercase gamma. see const.ec"
						, pi: null
						, PI: null
						, tau: null
						, Phi: null
						, sqrt3: "the principle square root of three. approximately 1.7321"
						, omega: null
						, LN2: null
						, ln2: null
						, LN10: null
						, ln10: null
						, LOG2E: null
						, log2e: null
						, LOG10E: null
						, loge: null
						, SQRT1_2: null
						, sqrt1_2: null
						, SQRT2: null
						, sqrt2: null
						, logpi10: null
						, sqrt5: null
						, logtaupi: null
						, dtor: null
						, rtod: null
						, sqrtpi: null
						, sqrtpi_2: null
						, sqrttau: null
						, π_2: null
						, Math: null
						, nullSet: null
						, emptySet: null
						, voidSet: null
					}
					, eq: /*done*/ {
						self: "Help text for rMath.eq comparative functions."
						, gt: {
							name: "Greater Than (>)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.gt`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a > b) to infinite precision using string arithmetic."]
							, see: ["eq.ge", "eq.lt"]
						}
						, ge: {
							name: "Greater Than or Equal to (⩾, ≥)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.ge`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a ⩾ b) to infinite precision using string arithmetic."]
							, see: ["eq.gt", "eq.le"]
						}
						, lt: {
							name: "Less Than (<)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.lt`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a < b) to infinite precision using string arithmetic."]
							, see: ["eq.gt", "eq.le"]
						}
						, le: {
							name: "Less Than or Equal to (⩽, ≤)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.le`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a ⩽ b) to infinite precision using string arithmetic."]
							, see: ["eq.ge", "eq.lt"]
						}
						, leq: {
							name: "Loose Equal to (==)"
							, field: ["Everything", "Logic Theory"]
							, method: "returns Number(a) === Number(b) and only has around 16 digits of accuracy."
							, arguments: {
								names: ["a", "b"]
								, defaults: [0, 0]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a == b) to double floating point precision using built in Numbers."]
							, see: ["eq.seq", "eq.lneq"]
						}
						, seq: {
							name: "Strict Equal to (===)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.eq`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a === b) to infinite precision using string arithmetic."]
							, see: ["eq.leq", "eq.sneq"]
						}
						, lneq: {
							name: "Loose Not Equal to (!=)"
							, field: ["Everything", "Logic Theory"]
							, method: "returns Number(a) !== Number(b) and only has around 16 digits of accuracy."
							, arguments: {
								names: ["a", "b"]
								, defaults: [0, 0]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a ≠ b) to double floating point precision using built in Numbers."]
							, see: ["eq.sneq", "eq.neq"]
						}
						, sneq: {
							name: "Strict Not Equal to (!==)"
							, field: ["Everything", "Logic Theory"]
							, method: `calls to ${LibSettings.Environment_Global_String}.sMath.eq.ne`
							, arguments: {
								names: ["a", "b"]
								, defaults: ["0.0", "0.0"]
								, types: ["Snum, Bigint, Real Number", "Snum, Bigint, Real Number"]
							}
							, description: ["returns (a ≠ b) to infinite precision using string arithmetic."]
							, see: ["eq.seq", "eq.lneq"]
						}
					}
					, Omega: null
					, ζ: null
					, Rzeta: null
					, Hzeta: null
					, π: null
					, clbz: null
					, cebz: null
					, hypot: null
					, conjugate: null
					, sum: null
					, infsum: null
					, prod: null
					, int: null
					, log: null
					, logbase: null
					, primeCount: null
					, expm: null
					, expm1: null
					, clz32: null
					, sgn: null
					, abs: null
					, cabs: null
					, plusOrMinus: null
					, minusOrPlus: null
					, log2: null
					, log10: null
					, logpi: null
					, lnnp: null
					, ln1p: null
					, integral: null
					, inverse: null
					, _: null
					, stats: null
					, total: null
					, product: null
					, max: null
					, min: null
					, mean: null
					, median: null
					, mode: null
					, mad: null
					, lfence: null
					, ufence: null
					, quartile: null
					, Q1: null
					, Q3: null
					, IQR: null
					, IQM: null
					, TM: null
					, CHM: null
					, GM: null
					, HM: null
					, MR: null
					, MH: null
					, MS: null
					, MAE: null
					, ME: null
					, SE: null
					, svar: null
					, pvar: null
					, scov: null
					, pcov: null
					, sPearson: null
					, pPearson: null
					, absdev: null
					, lehmer: null
					, quadraticmean: null
					, cubicmean: null
					, quarticmean: null
					, quinticmean: null
					, powmean: null
					, linReg: null
					, erf: null
					, erfinv: null
					, erfinvC: null
					, erfc: null
					, erfcinv: null
					, erfiinv: null
					, nCr: null
					, nPr: null
					, lcm: null
					, gcd: null
					, percentError: null
					, range: null
					, trimean: null
					, med: null
					, medianindex: null
					, quartile0: null
					, quartile1: null
					, quartile2: null
					, quartile3: null
					, quartile4: null
					, Q0: null
					, Q2: null
					, Q4: null
					, AM: null
					, RMS: null
					, PE: null
					, SSD: null
					, PSD: null
					, SD: null
					, var: null
					, cov: null
					, stdev: null
					, stdDev: null
					, midrange: null
					, midhinge: null
					, heronian: null
					, comb: null
					, perm: null
					, gcf: null
					, ifact: null
					, fact: null
					, factorial: null
					, risingFactorial: null
					, pochHammer: null
					, qPochHammer: null
					, fallingFactorial: null
					, invifact: null
					, invfact: null
					, invgamma: null
					, nfactorial: null
					, doublefactorial: null
					, gamma: null
					, beta: null
					, igammal: null
					, igammau: null
					, isPrime: null
					, pascal: null
					, fib: null
					, fibonacci: null
					, lucas: null
					, primeFactorInt: null
					, findFactors: null
					, iMaxFactor: null
					, synthDiv: null
					, simpRad: null
					, PythagTriple: null
					, iPythagorean: null
					, neg: null
					, ssgn: null
					, ssign: null
					, sabs: null
					, add: null
					, sub: null
					, mul: null
					, div: null
					, cdiv: null
					, fdiv: null
					, rdiv: null
					, tdiv: null
					, mod: null
					, rem: null
					, remainder: null
					, parity: null
					, isClose: null
					, dist: null
					, dist2: null
					, copysign: null
					, trunc: null
					, truncate: null
					, isNaN: null
					, isAN: null
					, isaN: null
					, isNNaN: null
					, imul: null
					, fround: null
					, sqrt: null
					, cbrt: null
					, sign: null
					, exp: null
					, round: null
					, floor: null
					, ceil: null
					, rand: null
					, random: null
					, pow: null
					, nthrt: null
					, square: null
					, cube: null
					, tesseract: null
					, findPrimesRange: null
					, findPrimesLen: null
					, findPrimes: null
					, li: null
					, Li: null
					, Ei: null
					, tetrate: null
					, hyper0: null
					, hyper1: null
					, hyper2: null
					, hyper3: null
					, hyper4: null
					, hyperN: null
					, H: null
					, W: null
					, productLog: null
					, deriv: null
					, tanLine: null
					, base10Conv: null
					, bin: null
					, oct: null
					, hex: null
					, timesTable: null
					, cosNxSimplify: null
					, sinNxSimplify: null
					, heron: null
					, tempConv: null
					, coprime: null
					, ncoprime: null
					, cumsum: null
					, set: null
					, setUnion: null
					, setIntersection: null
					, setDifference: null
					, isSameset: null
					, isSubset: null
					, isSuperset: null
					, isStrictSubset: null
					, isStrictSuperset: null
					, harmonic: null
					, fraction: null
					, complex: null
					, bigint: null
					, number: null
					, toAccountingStr: null
					, collatz: null
					, _pow: null
					, nextUp: null
					, nextDown: null
					, nextAfter: null
					, ulp: null
					, midpoint: null
					, δ: null
					, dirac: null
					, solveCubic: null
					, solveQuadratic: null
					, solveLinear: null
					, fix: null
					, binom: null
					, pronic: null
					, areaRegularPolygon: null
					, areaEllipse: null
					, areaCircle: null
					, areaEquilateralTriangle: null
					, getHelpString: null
				};
				if (degTrig) this.deg = {
					sin: θ => Number.isNaN( θ = Number(θ) ) ? θ : this.sin(θ*this.dtor)
					, sinc: θ => Number.isNaN( θ = Number(θ) ) ? θ : this.sinc(θ*this.dtor)
					, nsinc: θ => Number.isNaN( θ = Number(θ) ) ? θ : this.nsinc(θ*this.dtor)
					, cos: θ => Number.isNaN( θ = Number(θ) ) ? θ : this.cos(θ*this.dtor)
					, tan: θ => Number.isNaN( θ = Number(θ) ) ? θ : this.deg.sin(θ) / this.deg.cos(θ)
					, csc: θ => Number.isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.sin(θ)
					, sec: θ => Number.isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.cos(θ)
					, cot: θ => Number.isNaN( θ = Number(θ) ) ? θ : 1 / this.deg.tan(θ)
					// TODO: Make deg asin and atan use the same formula as the radian types
					, asin: x => Number.isNaN( x = Number(x) ) ? x :
						x > 1 || x < -1 ? NaN :
							this.sum(0, 80, n => this.fact(2*n) /
								(4**n*this.fact(n)**2 * (2*n+1)) * x**(2*n+1)
							) * this.rtod
					, acos: x => Number.isNaN( x = Number(x) ) ? x : 90 - this.deg.asin(x)
					, atan: x => Number.isNaN( x = Number(x) ) ? x : this.atan(x) * this.rtod
					, atan2: (x, y, flipArgs=false) =>
						Number.isNaN( x = Number(x) ) || Number.isNaN( y = Number(y) ) ? NaN : (
							flipArgs ? this.atan2(y, x) : this.atan2(x, y)
						) * this.rtod
					, acsc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(1/x)
					, asec: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acos(1/x)
					, acot: x => Number.isNaN( x = Number(x) ) ? x : !x ? 90 : this.deg.atan(1/x) + 180*(x < 0)
					, excst: x => Number.isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.cot(x))
					// aexcst: x => Error("not implemented"),
					, exset: x => Number.isNaN( x = Number(x) ) ? x : this.hypot(this.deg.exsec(x), this.deg.tan(x))
					// aexset: x => Error("not implemented"),
					, sqvcs: x => Number.isNaN( x = Number(x) ) ? x : this.hypot(this.deg.vrc(x), this.deg.sin(x))
					// avcs: x => Error("not implemented"),
					, sq1s: x => Number.isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.sin(x))
					, asq1s: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(x**2 - 1)
					, ccvs: null
					, accvs: null
					, csq1s: x => Number.isNaN( x = Number(x) ) ? x : this.hypot(1, this.deg.cos(x))
					, acsq1s: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acos(x**2 - 1)
					, crd: x => Number.isNaN( x = Number(x) ) ? x : 2 * this.deg.sin(x / 2)
					, acrd: x => Number.isNaN( x = Number(x) ) ? x : 2 * this.deg.asin(x / 2)
					, ccrd: x => Number.isNaN( x = Number(x) ) ? x : 2 * this.deg.cos(x / 2)
					, accrd: x => Number.isNaN( x = Number(x) ) ? x : π_2 - this.deg.acrd(x)
					, exsec: x => Number.isNaN( x = Number(x) ) ? x : this.deg.sec(x) - 1
					, aexsec: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asec(x + 1)
					, excsc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.csc(x) - 1
					, aexcsc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acsc(x + 1)
					, vrs: x => Number.isNaN( x = Number(x) ) ? x : 1 - this.deg.cos(x)
					, avrs: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acos(x + 1)
					, vrc: x => Number.isNaN( x = Number(x) ) ? x : 1 + this.deg.cos(x)
					, avrc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acos(x - 1)
					, cvs: x => Number.isNaN( x = Number(x) ) ? x : 1 - this.deg.sin(x)
					, acvs: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(1 - x)
					, cvrc: x => Number.isNaN( x = Number(x) ) ? x : 1 + this.deg.sin(x)
					, acvrc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(x - 1)
					, hav: x => Number.isNaN( x = Number(x) ) ? x : this.deg.vrs(x) / 2
					, ahav: x => Number.isNaN( x = Number(x) ) ? x : this.acos(1 - 2*x)
					, hvrc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.vrc(x) / 2
					, ahvrc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.acos(2*x - 1)
					, hcvrs: x => Number.isNaN( x = Number(x) ) ? x : this.deg.cvs(x) / 2
					, ahcvrs: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(1 - 2*x)
					, hcc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.cvrc(x) / 2
					, ahcc: x => Number.isNaN( x = Number(x) ) ? x : this.deg.asin(2*x - 1)
					,
				};
				if (comparatives) this.eq = {
					gt(a="0.0", b="0.0") { return sMath.eq.gt(a, b) }
					, ge(a="0.0", b="0.0") { return this.gt(a, b) || this.seq(a, b) }
					, lt(a="0.0", b="0.0") { return sMath.eq.lt(a, b) }
					, le(a="0.0", b="0.0") { return this.lt(a, b) || this.seq(a, b) }
					, leq(a=0, b=0) { return Number(a) === Number(b) }
					, seq(a="0.0", b="0.0") { return sMath.eq.eq(a, b) }
					, lneq(a=0, b=0) { return Number(a) !== Number(b) }
					, sneq(a="0.0", b="0.0") { return sMath.eq.ne(a, b) }
					,
				};
				if (constants) {
					this.foia1 = foia1                                     ;
					this.foia2 = foia2                                     ;
					this.ɡ = this.gravity = 9.80665                        ;
					this.avogadro = 6.02214076e+23                         ;
					this.bohrMagneton = 9.2740100783e-24                   ;
					this.bohrRadius = 5.29177210903e-11                    ;
					this.boltzmann = 1.380649e-23                          ;
					this.classicalElectronRadius = 2.8179403262e-15        ;
					this.deuteronMass = 3.3435830926e-27                   ;
					this.efimovFactor = 22.7                               ;
					this.electronMass = 9.1093837015e-31                   ;
					this.electronicConstant = 8.8541878128e-12             ;
					this.faraday = 96485.33212331001                       ;
					this.fermiCoupling = 454379605398214.1                 ;
					this.fineStructure = 0.007297352573756914 /*no units*/ ;
					this.firstRadiation = 3.7417718521927573e-16           ;
					this.gasConstant = 8.31446261815324                    ;
					this.inverseConductanceQuantum = 12906.403729652257    ;
					this.klitzing = 25812.807459304513                     ;
					this.loschmidt = 2.686780111798444e+25                 ;
					this.magneticConstant = 0.00000125663706212            ;
					this.magneticFluxQuantum = 2.0678338484619295e-15      ;
					this.molarMass = 0.00099999999965                      ;
					this.molarMassC12 = 0.0119999999958                    ;
					this.molarVolume = 0.022413969545014137                ;
					this.neutronMass = 1.6749271613e-27                    ;
					this.nuclearMagneton = 5.0507837461e-27                ;
					this.planckCharge = 1.87554603778e-18                  ;
					this.planckLength = 1.616255e-35                       ;
					this.planckMass = 2.176435e-8                          ;
					this.planckTemperature = 1.416785e+32                  ;
					this.planckTime = 5.391245e-44                         ;
					this.planckConstant = 6.62607015e-34                   ;
					this.molarPlanckConstant = 3.990312712893431e-10       ;
					this.reducedPlanckConstant = 1.0545718176461565e-34    ;
					this.rydberg = 10973731.56816                          ;
					this.sackurTetrode = -1.16487052358                    ;
					this.secondRadiation = 0.014387768775039337            ;
					this.speedOfLight = this.c = 299_792_458 /*m/s*/       ;
					this.stefanBoltzmann = 5.67037441918443e-8             ;
					this.weakMixingAngle = 0.2229                          ;
					this.sunLuminosity = 3.828e+26 /*watts*/               ;
					this.EarthMass = 5.9722e+24 /* ± 6e20. kilograms. */   ;
					this.googol = 1e+100                                   ;
					this.centillion = 1e+303                               ;
					this.EarthMasses = {
						Moon          : 0.0123000371
						, Sun         : 332_946.0487 /* ± 0.0007 */
						, Mercury     : 0.0553
						, Venus       : 0.815
						, Earth       : 1
						, Mars        : 0.107
						, Jupiter     : 317.8
						, Saturn      : 95.2
						, Uranus      : 14.5
						, Neptune     : 17.1
						, Pluto       : 0.0025
						, Eris        : 0.0027
						, Gliese667Cc : 3.8
						, Kepler442b  : 4.6 // estimate, 1.0 – 8.2
						,
					};
					this.EarthRadius = {
						m    : 6_378_100 // 6.35 million give or take up to 50_000
						, km : 6367.445 // 6357 to 6378
						, mi : 3956.547 // 3950 to 3963
						,
					};
					this.planck = {
						charge            : this.planckCharge
						, length          : this.planckLength
						, mass            : this.planckMass
						, temperature     : this.planckTemperature
						, time            : this.planckTime
						, constant        : this.planckConstant
						, reducedConstant : this.reducedPlanckConstant
						, molarConstant   : this.molarPlanckConstant
						,
					};
					this.solarConstants = {
						// TABLE 2. Solar Irradiance at the Planets
						// Planet Solar Irradiance, W/m-2
						// perihelion : close :: aphelion (apsis) : far
						Mercury: {
							mean: 9116.4,
							perihelion: 14_447.5,
							aphelion:  6271.1,
						}
						, Venus: {
							mean: 2611.0,
							perihelion: 2646.4,
							aphelion:  2575.7,
						}
						, Earth: {
							mean: 1366.1,
							perihelion: 1412.5,
							aphelion:  1321.7,
						}
						, Mars: {
							mean: 588.6,
							perihelion: 715.9,
							aphelion:  491.7,
						}
						, Jupiter: {
							mean: 50.5,
							perihelion: 55.7,
							aphelion:  45.9,
						}
						, Saturn: {
							mean: 15.04,
							perihelion: 16.76,
							aphelion:  13.53,
						}
						, Uranus: {
							mean: 3.72,
							perihelion: 4.11,
							aphelion: 3.37,
						}
						, Neptune: {
							mean: 1.510,
							perihelion: 1.515,
							aphelion:  1.507,
						}
						, Pluto: {
							mean: 0.878,
							perihelion: 1.571,
							aphelion:  0.560,
						}
						,
					};
					this.dragCoefficient = { // C_D
						// link 1:  https://bit.ly/3TufCLt
						// link 2:  https://bit.ly/3T8jthf
						// DragCoefficient = 2*DragForce   /   MassDensity*FlowSpeed²Area
						sphere                : 0.47
						, halfSphere          : 0.42
						, spheroid3to4        : 0.59
						, cone60degrees       : 0.5
						, cube                : 1.65
						, angledCube          : 1.05 // 45° rotation
						, bullet              : 0.2 // 0.1 – 0.3
						, longCylinder        : 0.82
						, shortCylinder       : 1.15
						, streamlinedBody     : 0.04 // idk, look at the picture in link 1
						, streamlinedHalfBody : 0.09
						,
					};
				};
			}
			toString() { return "[object rMath]" }
			Omega(x=Math.E, i=10_000) {
				// Ω(x) * x^Ω(x) ≈ 1
				// approximate because some inputs oscilate between outputs, such as Ω(349)
				// "i" cannot default to Infinity due to this oscilation
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (Number.isNaN( i = Number(i) )) return NaN;
				var ans = x, prev;
				if (x < 142) {
					while ( i --> 0 ) {
						prev = ans;
						ans -= (ans*x**ans-1) / (x**ans*(ans+1)-(ans+2)*(ans*x**ans-1)/(2*ans+2));
						if (prev === ans) break;
					}
				}
				else {
					while ( i --> 0 ) {
						prev = ans;
						ans = (1 + ans) / (1 + x**ans)
						if (prev === ans) break;
					}
				}
				return ans;
			}
			ζ(s, a=0, acy=1000, gAcy=1e3, gInc=.1) {
				return Number.isNaN(s = Number(s)) ||
					Number.isNaN(a = Number(a)) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						s === Infinity ?
							1 :
							!s ?
								-0.5 :
								s === 1 ?
									Infinity :
									s < 1 ?
										2**s * π**(s-1) * this.sin(π_2*s) *
											this.gamma(1-s, gAcy, gInc) * this.ζ(1-s, a, acy) :
										this.sum(1, acy, n => (n + a)**-s);
			}
			Rzeta(s, acy=1000, gAcy=1e3, gInc=.1) {
				// Reimann zeta function
				return this.ζ(s, 0, acy, gAcy, gInc);
			}
			Hzeta(s, a=0, acy=1e3, gAcy=1e3, gInc=.1) {
				// Hurwitz zeta function
				return this.ζ(s, a, acy, gAcy, gInc);
			}
			π(x, form=1) {
				if (Number.isNaN( x = floor(Number(x)) )) return NaN;
				if (x < 2) return 0;
				if (x === Infinity) return x;
				if (form === 1) {
					for (var i = x + 1, total = 0; i --> 1 ;)
						total += i.isPrime();
					return total;
				}
				if (form === 2) return this.li(x);
				if (form === 3) return x / this.ln(x);
				return NaN;
			}
			P(...set) {
				// power set, set of all subsets
				set = set.flatten();
				var strict = !1;
				if (set.includes("strict")) {
					set.remove("strict");
					strict = !0;
				}
				if ( set.hasDupes() ) throw Error("rMath.P() cannot have duplicate arguments");
				set = set.map( e => [e] );
				if ( set.isNaN() ) throw TypeError("rMath.P() can only have numeric arguments");
				function subP(set) {
					return set.map(
						e => {
							for (var i = 0, n = len(set), arr = []; i < n ; i++)
								arr.push( [e[0], set[i]] );
							return arr;
						}
					).flat().map( e => e.sort().join() ).remrep().map(
						e => e.split(",").map(e => Number(e)).sort()
					).map( e => e.sort().join() ).remrep().map( // double check is required
						e => e.split(",").map(e => Number(e)).sort()
					).filter( e => !e.hasDupes() );
				}
				var out = [[null]];
				do {
					out = out.concat(set);
					set = subP(set);
				} while (json.stringify(set) !== "[]");
				strict && out.length > 1 && out.pop();
				return out;
			}
			clbz(n) {
				// count leading binary zeros
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (n < 0 || n > 2_147_483_647) return 0; // 2^31 - 1. max uint32 value
				return n = n.toString(2), (strMul("0", 32 - n.length) + n).remove(/1.*/).length;
			}
			cebz(x) {
				// count ending binary zeros
				// log2(x & -x) for |x| < 2^32
				if (this.isNaN(x)) return NaN;
				return x = BigInt(x).toString(2), x.length - x.lio("1") - 1;
			}
			hypot(...args) {
				args = args.flatten();
				for (var total = 0, i = args.length; i --> 0 ;)
					total += args[i]**2;
				return this.sqrt(total);
			}
			conjugate(x) {
				// complex conjugate
				// TODO/ADD: Expand to CFractions
				return type(x, 1) === "complex" ? cMath.conjugate(x) : x;
			}
			sum(n /*start, first*/, last, fn=n=>n, inc=1) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (Number.isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func") return NaN;
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				if (inc === 0) throw Error("increment to rMath.sum() cannot be 0.");
				var total = 0;
				if (last === Infinity) {
					for (var prev; n <= last; n += inc) {
						if (total === prev) break;
						prev = total;
						total += fn(n);
					}
				} else for (; n <= last; n += inc)
					total += fn(n);
				return total;
			}
			infsum(start=0/*, last=Infinity*/, fn=n=>1/n, inc=1) {
				// infinite summation
				return this.sum(
					start,
					Infinity,
					fn,
					inc
				);
			}
			prod(n, last, fn=n=>n, inc=1) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (Number.isNaN( last = Number(last) )) return NaN;
				if (type(fn, 1) !== "func") return NaN;
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				for (var total = 1; n <= last; n += inc)
					total *= fn(n);
				return total;
			}
			int(x/*start*/, end, f=x=>x, inc=.001) {
				// start and end are included.
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (Number.isNaN( end = Number(end) )) return NaN;
				if (type(f, 1) !== "func") return NaN;
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				let ans = 0;
				if (end > x) {
					if ( isNaN(f(x)) ) {
						// if f(x) is not defined for the starting point, ev
						let chng = Number.EPSILON;
						while ( isNaN(f(x)) )
							x += chng,
							chng = this.nextUp(chng);
					}
					if ( isNaN(f(end)) )
						for (; x < end; x += inc)
							ans += (f(x) + f(x + inc)) / 2 * inc;
					else for (; x <= end; x += inc) ans += (f(x) + f(x + inc)) / 2 * inc;
				}
				else if (x > end) return -this.int(end, x, f, inc);
				/*else */return ans;
			}
			log(x, base=LibSettings.MATH_LOG_DEFAULT_BASE, number=true) {
				// really slow for large Xs
				if (Number.isNaN(x = Number(x)) || Number.isNaN(base = Number(base)) || base <= 0 || x <= 0 || base == 1) return NaN;
				if (base === Infinity) return x === Infinity  ?  NaN  :  number ? 0 : 0n;
				if (x == base) return number ? 1 : 1n;
				if (x === Infinity) return Infinity;
				var x2 = BigInt(int(x)), b2 = BigInt(int(base)), ans = floor(x2 / b2), chng = x2, i;
				while (chng /= 10n) {
					while (ans != (
						ans += bMath.abs( x2 - bMath.pow(b2, ans - chng) ) < bMath.abs( x2 - bMath.pow(b2, ans) ) ? -chng :
							bMath.abs( x2 - bMath.pow(b2, ans + chng) ) < bMath.abs( x2 - bMath.pow(b2, ans) ) ? chng : 0n
					));
					if (ans < 0n && x > base) ans = 1n;
				}
				if (!number) return ans;
				for (ans = Number(ans), chng = 0.1; ans != ans + chng; chng /= 10) while (
					ans != (ans += abs(x - base**(ans - chng)) < abs(x - base**ans) ? -chng :
						abs(x - base**(ans + chng)) < abs(x - base**ans) ? chng : 0)
				);
				return ans;
			}
			logbase(base, x) {
				return Number.isNaN( base = Number(base) ) || Number.isNaN( x = Number(x) ) ?
					NaN :
					this.log( x, base );
			}
			primeCount(x, form=1) { return this.π(x, form) }
			prime(n=1, a=0) {
				// nth prime >= a
				// out >= a
				// prime(a, b) === findPrimesLen(b, a).last()
				// prime(1, n) === findPrimesLen(n, 1)[0]
				if (Number.isNaN( n = Number(n) ) ||
					Number.isNaN( a = Number(a) ) ||
					n < 1 || n % 1
				) return NaN;

				a = ceil(a);
				a < 1 && (a = 1);

				if (n == 1 && a <= 2) return 2;
				a += !(a % 2); // next odd number, has to be after 2 check

				for (var k = a, i =+ (a <= 2); (i += k.isPrime()) < n ;)
					k += 2;

				return k;
			}
			expm(x, n=1) { return e ** x - n }
			expm1(x) { return this.expm(x) }
			clz32(n) { return this.clbz(n) }
			sgn(x) { return Number.isNaN( x = Number(x) ) ? NaN : x < 0 ? -1 : +(x > 0) }
			abs(x) { return Number.isNaN( x = Number(x) ) ? NaN : this.sgn(x) * x }
			cabs(cnum) { return cMath.abs(cnum) }
			plusOrMinus(x) { return x = Number(x), [+x, -x] }
			minusOrPlus(x) { return x = Number(x), [-x, +x] }
			ln(n) { return Number.isNaN(n = Number(n)) ? NaN : this.log(n, e) }
			log2(x) { return this.log(x, 2) }
			log10(x) { return this.log(x, 10) }
			logpi(x) { return this.log(x, π) }
			log1p(/*x*/) { return this.ln1p.apply(this, arguments) }
			lnnp(x, n=1) { return Number.isNaN( x = Number(x) ) ? x : this.ln(n + x) }
			ln1p(x) { return Number.isNaN( x = Number(x) ) ? x : this.ln(1 + x) }
			integral() { return this.int.apply(this, arguments) }
			inverse(n) { 1 / Number(n) }
			_(n) { 1 / Number(n) }
			/////////////////////////////////////// STATISTICS START ///////////////////////////////////////
			stats(...dataset) {
				return dataset = msort( dataset.flatten() ), {
					dataset: dataset,
					length: dataset.length,
					gcd: this.gcd(dataset), // greatest common denominator
					lcm: this.lcm(dataset), // least common multiple
					range: this.range(dataset),
					mode: this.mode(dataset), 
					meanAbsoluteDeviation: this.mad(dataset), // mean absolute deviation
					medianIndex: this.medianindex(dataset),
					median: this.median(dataset),
					min: dataset[0],
					max: dataset[dataset.length - 1],
					interquartileRange: this.IQR(dataset),
					lowerfence: this.lfence(dataset),
					upperfence: this.ufence(dataset),
					midrange: this.MR(dataset),
					midhinge: this.MH(dataset),
					meanSquare: this.MS(dataset),
					rootMeanSquare: this.RMS(dataset),
					sampleStdDev: this.SSD(dataset),
					populationStdDev: this.PSD(dataset),
					sampleVariance: this.svar(dataset),
					populationVariance: this.pvar(dataset),
					absoluteDeviation: this.absdev(dataset),
					total: this.total(dataset),
					product: this.product(dataset),
					sumOfSquares: dataset.reduce((t, e) => t + e**2, 0),
					quartile: [
						dataset[0],
						this.Q1(dataset),
						this.median(dataset),
						this.Q3(dataset),
						dataset[dataset.length - 1],
					]
					, mean: {
						interquartile: this.IQM(dataset),
						arithmetic: this.mean(dataset),
						geometric: this.GM(dataset),
						trimean: this.TM(dataset),
						contraharmonic: this.CHM(dataset),
						harmonic: this.HM(dataset),
						quadratic: this.quadraticmean(dataset),
						cubic: this.cubicmean(dataset),
						quartic: this.quarticmean(dataset),
						quintic: this.quinticmean(dataset),
						heronian: { // heronian mean can only take 2 values
							minmax: this.heronian(dataset[0], dataset[dataset.length - 1]),
							q1q3: this.heronian(this.Q1(dataset), this.Q3(dataset)),
							fences: this.heronian(this.lfence(dataset), this.ufence(dataset)),
							p0p1: this.heronian(dataset[0], dataset[1]),
								// datapoint 0, datapoint 1
							pn1pn2: this.heronian(dataset[dataset.length - 1], dataset[dataset.length - 2]),
								// datapoint -1, datapoint -2
						}
						, lehmer: [ // lehmer mean has to take a second parameter
							this.lehmer(0, dataset),
							this.lehmer(1, dataset),
							this.lehmer(2, dataset),
							this.lehmer(3, dataset),
							this.lehmer(4, dataset),
						]
						,
					}
					,
				};
			}
			total(...dataset) {
				return Array.prototype.reduce.call(
					Array.prototype.flatten.call(dataset)
					, (t, e) => t + e
					, 0
				);
				// so it also works with rMath.Set objects.
			}
			product(...dataset) {
				return Array.prototype.reduce.call(
					Array.prototype.flatten.call(dataset)
					, (t, e) => t * e
					, 1
				);
				// so it also works with rMath.Set objects.
			}
			max(...dataset) {
				dataset = dataset.flatten();
				if (!dataset.length) return -Infinity;
				if ( dataset.isNaN() ) return NaN;
				let max = dataset[0];
				for (let i of dataset) i > max && (max = i);
				return max;
			}
			min(...dataset) {
				dataset = dataset.flatten();
				if (!dataset.length) return Infinity;
				if ( dataset.isNaN() ) return NaN;
				let min = dataset[0];
				for (let i of dataset) i < min && (min = i);
				return min;
			}
			mean(...dataset) {
				// arithmetic mean
				dataset = dataset.flatten();
				return dataset.reduce((t, e) => t + e, 0) / dataset.length
			}
			median(...dataset) {
				dataset = dataset.flatten().sort();
				return dataset.length % 2 ?
					dataset[(dataset.length - 1) / 2] :
					(dataset[dataset.length / 2 - 1] + dataset[dataset.length / 2]) / 2;
			}
			mode(...dataset) {
				/* returns the minimum value that appears the most in the dataset.
					ie:
					for [1, 2, 3], it returns 1.
					for [3,3, 2,2, 0], it returns 2.
					for [1, 2, 3, 4,4, 5], it returns 4.
					etc.
				*/
				dataset = dataset.flatten();
				if ( dataset.isNaN() ) return NaN;
				const obj = Object.create(null);
				for (const n of dataset) n in obj ? obj[n]++ : (obj[n] = 1);
				return + keyof( obj, this.max(Object.values(obj)) );
			}
			mad(...dataset) {
				// mean absolute deviation
				dataset = dataset.flatten();
				return this.absdev(dataset) / dataset.length;
			}
			lfence(...dataset) {
				// lower fence. (for determining outliers)
				dataset = dataset.flatten();
				return this.Q1(dataset) - 1.5*this.IQR(dataset);
			}
			ufence(...dataset) {
				// upper fence. (for determining outliers)
				dataset = dataset.flatten();
				return this.Q3(dataset) + 1.5*this.IQR(dataset);
			}
			quartile(q, ...dataset) {
				return !q ? this.Q0(dataset) :
				q === 1 ? this.Q1(dataset) :
				q === 2 ? this.Q2(dataset) :
				q === 3 ? this.Q3(dataset) :
				q === 4 ? this.Q4(dataset) :
				NaN;
			}
			Q1(...dataset) {
				// https://en.wikipedia.org/wiki/Quartile method 4
				dataset = dataset.flatten().sort();
				return this.median( dataset.slice( 0, ceil((dataset.length - 1) / 2) ) );
			}
			Q3(...dataset) {
				// https://en.wikipedia.org/wiki/Quartile method 4
				dataset = dataset.flatten().sort();
				return this.median( dataset.slice( ceil(dataset.length / 2) ) );
			}
			IQR(...dataset) {
				// inter-quartile range
				dataset = dataset.flatten().sort();
				return this.Q3(dataset) - this.Q1(dataset);
			}
			IQM(...dataset) {
				// interquartile mean
				dataset = dataset.flatten().sort();
				const n = dataset.length;
				return 2/n * this.sum(floor(1+n/4), floor(3*n/4), i => dataset[i], 1 )
			}
			TM(...dataset) {
				// trimean
				dataset = dataset.flatten().sort();
				return (this.Q1(dataset) + 2*this.Q2(dataset) + this.Q3(dataset)) / 4
			}
			CHM(...dataset) {
				// contraharmonic mean
				dataset = dataset.flatten();
				return dataset.reduce((t, e) => t + e**2, 0) / this.total(dataset);
			}
			GM(...dataset) {
				// geometric mean
				dataset = dataset.flatten();
				return this.nthrt( abs(this.product(dataset)), dataset.length );
			}
			HM(...dataset) {
				// harmonic mean
				dataset = dataset.flatten();
				return dataset.length / dataset.reduce((t, x) => t + 1 / x, 0);
			}
			MR(...dataset) {
				// mid-range
				return dataset = dataset.flatten(),
					(this.min(dataset) + this.max(dataset)) / 2;
			}
			MH(...dataset) {
				// mid-hinge
				return dataset = dataset.flatten().sort(),
					(this.Q1(dataset) + this.Q3(dataset)) / 2;
			}
			MS(...dataset) {
				// mean square
				return dataset = dataset.flatten(),
					dataset.reduce( (t, e) => t + e**2, 0 ) / dataset.length;
			}
			MAE(Ys, Xs) {
				// mean absolute error
				Ys = Ys.flatten();
				Xs = Xs.flatten();
				return Ys.reduce((t, e, i) => t + abs(e + Xs[i]), 0) / Ys.length;
			}
			ME(Ys, Xs) {
				// mean error
				Ys = Ys.flatten();
				Xs = Xs.flatten();
				return Ys.reduce((t, e, i) => t + e + Xs[i], 0) / Ys.length;
			}
			SE(...dataset) {
				// standard error
				dataset = dataset.flatten();
				return this.PSD(dataset) / this.sqrt(dataset.length);
			}
			svar(...dataset) {
				// sample variance
				// var(X + Y) == var X + var Y
				const MEAN = this.mean(dataset = dataset.flatten());
				return dataset.reduce((t, v) => (v - MEAN)**2, 0) / (dataset.length - 1);
			}
			pvar(...dataset) {
				// population variance
				const MEAN = this.mean(dataset = dataset.flatten());
				return dataset.reduce((t, v) => (v - MEAN)**2, 0) / dataset.length;
			}
			scov(x, y) {
				// sample covariance
				const x̄ = this.mean(x);
				const ȳ = this.mean(y);
				const N = this.min(x.length, y.length);
				return this.sum( 0, N-1, i => (x[i]-x̄)*(y[i]-ȳ) ) / (N-1)
			}
			pcov(x, y) {
				// population covariance
				const x̄ = this.mean(x);
				const ȳ = this.mean(y);
				const N = this.min(x.length, y.length);
				return this.sum( 0, N-1, i => (x[i]-x̄)*(y[i]-ȳ) ) / N;
			}
			sPearson(X, Y) {
				// sample pearson correlation
				return this.cov(X, Y) / (this.SSD(X) * this.SSD(Y));
			}
			pPearson(X, Y) {
				// population pearson correlation
				return this.pcov(X, Y) / (this.PSD(X) * this.PSD(Y));
			}
			absdev(...dataset) {
				// absolute deviation
				if ( (dataset = dataset.flatten()).isNaN() ) return NaN;
				const MEAN = this.mean(dataset);
				return dataset.reduce((absDev, x) => absDev + this.abs(x - MEAN), 0);
			}
			lehmer(power, ...dataset) {
				// lehmer mean
				return dataset = dataset.flatten(), 
					dataset.reduce((t, e) => t + e**power, 0) /
					dataset.reduce((t, e) => t + e**(power-1), 0)
			}
			quadraticmean(...dataset) {
				return dataset = dataset.flatten(),
					this.sqrt( dataset.reduce((t, e) => t + e**2, 0) / dataset.length );
			}
			cubicmean(...dataset) {
				return dataset = dataset.flatten(),
					this.cbrt( dataset.reduce((t, e) => t + e**3, 0) / dataset.length );
			}
			quarticmean(...dataset) {
				return dataset = dataset.flatten(),
					this.nthrt( dataset.reduce((t, e) => t + e**4, 0) / dataset.length, 4 );
			}
			quinticmean(...dataset) {
				return dataset = dataset.flatten(),
					this.nthrt( ardatasetgdatasets.reduce((t, e) => t + e**5, 0) / dataset.length, 5 );
			}
			powmean(power, ...dataset) {
				return dataset = dataset.flatten(),
					this.nthrt( dataset.reduce((t, e) => t + e**power, 0) / dataset.length, power );
			}
			linReg(xs=[], ys=[], Return="obj") {
				// linear regression
				if (!isArr(xs)) throw Error("first parameter of rMath.linReg() is not an array");
				if (!isArr(ys)) throw Error("second parameter of rMath.linReg() is not an array");
				if (!xs.length) throw Error("No elements given for first parameter of rMath.linReg()");
				if (!ys.length) throw Error("No elements given for second parameter of rMath.linReg()");
				if ( xs.isNaN() )
					throw TypeError(`array of numbers required for first parameter of rMath.linReg(). Inputs: ${xs}`);
				if ( ys.isNaN() )
					throw TypeError(`array of numbers required for second parameter of rMath.linReg(). Inputs: ${ys}`);
				if (xs.length === 1 || ys.length === 1) {
					return Return === "obj" ? {
						a: ys[0] / xs[0],
						b: 0
					} :
						Return === "arr" ?
							[ys[0] / xs[0], 0]:
							`y = ${ys[0] / xs[0]}x + 0`;
				}
				if (xs.length !== ys.length) {
					const MIN = this.min(xs.length, ys.length);
					for (; xs.length > MIN ;) xs.pop();
					for (; ys.length > MIN ;) ys.pop();
				}
				var m = (
					xs.length * this.sum(0, xs.length - 1, n=>xs[n]*ys[n]) -
					this.total(xs) * this.total(ys)
				) / (xs.length * this.total(xs.map(e => e**2)) - this.total(xs)**2),
				b = (this.total(ys) - m * this.total(xs)) / xs.length;
				if (Return === "obj") return {a: m, b: b};
				if (Return === "arr") return [m, b];
				return `y = ${m}x + ${b}`;
			}
			erf(z) {
				return Number.isNaN( z = Number(z) ) ?
					NaN :
					1.1283791670955126 * this.int(0, z, t => 1 / e**t**2);
					// 2 / sqrt(pi) * ...
				// erf(x) ≈ 3126/3125 sgn(x)sqrt(1-exp(-x^2))
			}
			erfinv(z, acy=10) {
				// compositional inverse of erf(x)
				// \lim_{y->\infty} erf( erfinv(x,y) ) = x
				return this.sum( 0, acy, k => this.erfinvC(k) / (2*k+1) * (this.sqrtpi_2*z)**(2*k+1) );
			}
			erfinvC(k=0) { return Number.isNaN(k = Number(k)) || k < 0 ?
				// constants for erf⁻¹(x) and erfi⁻¹(x) Maclaurin series
				NaN :
				!k ?
					1 :
					this.sum( 0, k-1, m => (this.erfinvC(m)*this.erfinvC(k-m-1)) / ((m+1)*(2*m+1)) );
			}
			erfc(z) {
				return Number.isNaN( z = Number(z) ) ?
					NaN :
					1 - this.erf(z);
			}
			erfcinv(z, acy=10) {
				// compositional inverse of erfc(x)
				// \lim_{y->\infty} erfc( erfcinv(x,y) ) = x
				return this.erfinv(z, acy) / (1 - z)
			}
			erfiinv(z, acy=10) {
				// compositional inverse of erfi(x)
				// \lim_{y->\infty} erfi( erfiinv(x,y) ) = x
				return this.sum( 0, acy, k => (-1)**k * this.erfinvC(k) / (2*k+1) * (this.sqrtpi_2*z)**(2*k+1) );
			}
			nCr(n=1, k=1) {
				return Number.isNaN( n = Number(n) ) ||
					Number.isNaN( k = Number(k) ) ?
					NaN : this.nPr(n, k) / this.fact(k);
			}
			nPr(n=1, k=1) {
				return Number.isNaN( n = Number(n) ) ||
					Number.isNaN( k = Number(k) ) ?
					NaN : this.fact(n) /
						this.fact(n - k);
			}
			lcm(...args) {
				if (isArr(args[0])) args = args[0];
				return !args.length ?
					0 :
				args.isNaN() ?
					NaN :
				!(args.length - 1) ?
					args[0] :
				args.length > 2 ?
					this.lcm( args[0], this.lcm(args.slice(1)) ) :
					abs(args[0] * args[1]) / this.gcd(args);
			}
			gcd(...args) {
				if (isArr(args[0])) args = args[0];
				if (!args.length) return 0;
				if (args.isNaN()) return NaN;
				if (!(args.length - 1)) return args[0];
				if (args.length > 2) return this.gcd( args[0], this.gcd(args.slice(1)) );
				while (args[1]) args = [args[1], this.mod(...args)];
				return args[0];
			}
			percentError(expected, actual, times100=true) {
				return this.abs(actual - expected) / this.abs(expected) * (times100 ? 100 : 1);
				// |experimental - theoretical| / |theoretical| * 100
			}
			range(...dataset) { return this.max(dataset = dataset.flatten()) - this.min(dataset) }
			trimean() { return this.TM.apply(this, arguments) }
			med() { return this.median.apply(this, arguments) }
			medianindex() { return (Array.from(arguments).flatten().length - 1) / 2 }
			quartile0() { return this.Q0.apply(this, arguments) }
			quartile1() { return this.Q1.apply(this, arguments) }
			quartile2() { return this.Q2.apply(this, arguments) }
			quartile3() { return this.Q3.apply(this, arguments) }
			quartile4() { return this.Q4.apply(this, arguments) }
			Q0() { return this.min.apply(this, arguments) }
			Q2() { return this.median.apply(this, arguments) }
			Q4() { return this.max.apply(this, arguments) }
			AM() { return this.mean.apply(this, arguments) /* arithmetic mean */ }
			RMS(...dataset) { return this.sqrt( this.MS(dataset) ) /* root mean square */ }
			PE() { return this.percentError.apply(this, arguments) }
			SSD(...dataset) { return this.sqrt( this.svar(dataset) ) /* sample standard deviation */ }
			PSD(...dataset) { return this.sqrt( this.pvar(dataset) ) /* population standard deviation */ }
			SD(...dataset) { return this.sqrt( this.svar(dataset) ) /* sample standard deviation */ }
			var() { return this.svar.apply(this, arguments) /* sample variance */ }
			cov() { return this.scov.apply(this, arguments) /* sample covariance */ }
			stdev() { return this.SD.apply(this, arguments) }
			stdDev() { return this.SD.apply(this, arguments) }
			midrange() { return this.MR.apply(this, arguments) }
			midhinge() { return this.MH.apply(this, arguments) }
			heronian(a, b) { return (a + b + this.sqrt(a*b)) / 3 /* heronian mean */ }
			comb(n=1, k=1) { return this.nCr(n, k) /* combination */ }
			perm(n=1, k=1) { return this.nPr(n, k) /* permuation */ }
			gcf() { return this.gcd.apply(this, arguments) }
			//////////////////////////////////////// STATISTICS END ////////////////////////////////////////
			ifact(n) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (!n) return 1;
				if (n < 0) return NaN;
				for (var ans = 1, cur = 1; cur <= n; cur++)
					ans *= cur;
				return ans;
			}
			fact(x, acy=1e3, inc=.1) {
				// TODO/FIN: implement the following formula, and maybe a lookup table for the integral values...
				// or a regression instead of an integral.
				//       / ∫_0^∞ exp(xlnt-t) dt              , 0 ≤ x ≤ 1
				// x! = <| (x % 1)! / Π_{k=1}^{-⌊x⌋} (x + k) , x < 0
				//       \ (x % 1)! Π_{k=1}^{⌊x⌋} (x%1 + k)  , x > 1
				// (x-⌊x⌋-1)!(x-⌊x⌋)^{\overline{1+⌊x⌋}}
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (Number.isNaN( acy = Number(acy) )) return NaN;
				if (Number.isNaN( inc = Number(inc) ) || !inc) return NaN;
				if ( x.isInt() ) return x < 0 ? NaN : this.ifact(x); // never -0
				if (x < 0) {
					const ans = this.fact(this.mod(x, 1), acy, inc) / this.prod(1, -floor(x),  j => x+j);
					return ans === 0 ? 0 : ans; // -0
				}
				if (x > 1) {
					let x_mod_1 = this.mod(x, 1);
					const ans = this.prod(1, floor(x), n => n + x_mod_1) *
						this.fact(x_mod_1, acy, inc);
					return ans === 0 ? 0 : ans; // -0
				}
				var ans = this.int(0, acy, t=>t**x/e**t, inc);
				return ans === 0 ? 0 : ans; // -0
				return /*type(ans, 1) === "inf" ? NaN : */ans;
			}
			factorial() { return this.fact.apply(this, arguments) }
			risingFactorial(/*x, n*/) { return this.pochHammer.apply(this, arguments) }
			pochHammer(x, n) {
				if ( Number.isNaN(n = Number(n)) ) return NaN;
				if ( Number.isNaN(x = Number(x)) ) return NaN;
				return x * this.prod(1, n-1, k => x+k);
			}
			qPochHammer(x, n, q) {
				if ( Number.isNaN(n = Number(n)) ) return NaN;
				if ( Number.isNaN(x = Number(x)) ) return NaN;
				if ( Number.isNaN(q = Number(q)) ) return NaN;
				return n === 0 ?
					1 :
					n > 0 ?
						this.prod(0, n-1, k => 1-x/q**k) :
						// n < 0
						1 / this.prod(1, this.abs(n), k => 1-x/q**k)
			}
			fallingFactorial(x, n) { return (-1)**n * this.pochHammer(-x, n) }
			invifact(n) {
				// compositional inverse integer factorial
				if (Number.isNaN(n = Number(n))) return NaN;
				if (fpart(n) != 0) return this.invfact(n);
				for (var i = 0 ;; i++) {
					let tmp = this.ifact(i);
					if (tmp === n) return i;
				}
			}
			invfact(x) {
				// compositional inverse factorial function
				// not exact, but pretty accurate after ~1/2? I think.
				// I found this formula here:
					// https://math.stackexchange.com/questions/2078997/inverse-of-a-factorial
				// which likes to the full one here:
					// https://math.stackexchange.com/a/2078194/13854
				return this.exp( 1 + this.W(this.ln(x / this.sqrttau) / e) ) - 0.5;
			}
			invgamma(x) {
				/*
					compositional-inverse gamma-function.
					defined for all integers.
					η(x) := Γ⁻¹(x)
					πcsc(πx) = Γ(x)Γ(1-x)
					η(x) = 1/π arccsc( x/π Γ(1-η(x)) )
					not defined for |x| < ~3.6 or some positive non integer values.
					the actual equation is that it is defined such that the following is true:
						|xΓ(1-η(x))| ≥ π
						this just covers that it has to be greater than like 3.6 ...
						and doesn't account for it not being defined for all reals greater than it.
				*/
				if (Number.isNaN( x = Number(x) ))
					return NaN;
				if (x === Infinity) return Infinity
				if (x === -Infinity) return NaN; // every possible answer has an undefined limit.
				// η(x) = csc⁻¹( x Γ(1-η(x)) / π ) / π
				// η(x) = csc⁻¹( x Γ(1-x) / π ) / π
				// csc +- Infinity ==> 0
				// x2 is closer to the answer
				let x2 = Number.isInteger(x) && x > 0 ?
					0 :
					this.acsc(x * this.gamma(1 - x) / π) / π;

				// x === x
				// x2 === eta_n(x)
				// new x2 === eta_{n-1}(x)

				while (x2 !== x)
					[x, x2] = [x2, this.acsc(
						x * this.gamma(1 - x2) / π
					) / π];

				return x2;



			}
			nfactorial(x, n=2) {
				// like double factorial or triple factorial, but n. so basically just more generalized.
				return n**((1+x) / n - 1) * this.fact(x/n) / this.fact(1/n);
			}
			doublefactorial(x) { return this.sqrt2 ** (1 + x) * this.fact(x / 2) / this.sqrtpi }
			gamma(n, acy=1e3, inc=.1) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (Number.isNaN( acy = Number(acy) )) return NaN;
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				return this.fact(n-1, acy, inc);
			}
			beta(m, n, acy=1e3, inc=.1) {
				// Beta Function
				//           Γ(m)Γ(n)
				// β(m, n) = --------
				//           Γ(m + n)

				// β(m, n) = β(n, m)
				// β(x, 0) = 1
				// β(x, 1) = 1/x
				// β(m, -n) = und.

				//               Γ(m)√π
				// β(m, 1/2) = ----------
				//             Γ(m + 1/2)

				return this.gamma(m, acy, inc) * this.gamma(n, acy, inc) /
					this.gamma(m + n, acy, inc);
			}
			igammal(n, inc=.1) {
				// lower incomplete gamma function
				if (Number.isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				n--;
				var ans = this.int(0, n, t => t**n / e**t, inc);
				return type(ans, 1) === "inf" ? NaN : n;
			}
			igammau(n, acy=1000, inc=.1) {
				// upper incomplete gamma function
				if (Number.isNaN( n = Number(n) )) return NaN;
				if ( n.isInt() ) return this.ifact(n-1);
				if (Number.isNaN( acy = Number(acy) )) return NaN;
				if (Number.isNaN( inc = Number(inc) )) return NaN;
				n--;
				var ans = this.int(n, acy, t => t**n / e**t, inc);
				return type(ans, 1) === "inf" ? NaN : n;
			}
			isPrime(n) { return this.isNaN(n) ? NaN : n.isPrime() }
			pascal(row, col) {
				// pascal's triangle
				if (Number.isNaN( row = Number(row) )) return NaN;
				if (col !== "all") col = Number(col);
				if (typeof col !== "number" && col !== "all") return NaN;
				row--;
				if (col?.lower?.() !== "all") return this.nCr(row, col-1);
				for (var i = 0, arr = []; i <= row ;)
					arr.push( this.nCr(row, i++) );
				return arr;
			}
			fib(n=1) {
				// nth fibonacci number
				// "round" is needed to counteract the floating point rounding errors.
				return Number.isNaN( n = Number(n) ) ? NaN : round(
					( phi**n - this.Phi**n ) / this.sqrt5
				);
				// ⌊ ϕⁿ/√5 ⌉ ∀ n∈ℤ > -1
			}
			fibonacci(/*n*/) { return this.fib.apply(this, arguments) }
			lucas(n=1) {
				return Number.isNaN( n = Number(n) ) ?
					NaN :
					round( phi**n + this.Phi**n );
				// ⌊ϕⁿ⌉, n ∈ ℕ>1
			}
			primeFactorInt(n) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				if ( n.isPrime() ) return n;
				for (var i = 2, primeFactors = []; i <= n; ++i) {
					if (!(n % i)) {
						primeFactors.push( this.primeFactorInt(i).flatten() );
						n /= i;
						i = 1;
					}
				}
				return primeFactors;
			}
			findFactors(n) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				for (var i = 2, factors = [1, n], n = this.sqrt(n); i <= n; i++)
					if (!(n % i)) factors.push(i, n / i);
				return factors;
			}
			iMaxFactor(n) {
				if (Number.isNaN( n = Number(n) )) return NaN;
				for (var i = n;;)
					if (!(n % --i))
						return i;
			}
			synthDiv(coeffs, /*x-*/divisor, includeRemainder=true, remainderType="string") {
				if (type(coeffs, 1) !== "arr") return NaN;
				if (type(remainderType) !== "string") return NaN;
				if (Number.isNaN( divisor = Number(divisor) )) return NaN;
				for (var coeff = coeffs[0], coeffs2 = [coeffs[0]], n = coeffs.length, i = 1; i < n; i++) {
					coeff = coeff * divisor + coeffs[i];
					coeffs2.push(coeff);
				}
				coeffs = ["string", "str"].includes(remainderType.lower()) ?
					coeffs2.mod(coeffs2.length - 1, e => this.isClose(e, 0, 1e-11) ?
						0 :
						`${e}/${divisor < 0 ?
							`(x+${-divisor})` :
							`(x-${divisor})`}`) :
					coeffs2;
				return includeRemainder ? coeffs : coeffs.pop2();
			}
			simpRad(rad) {
				if (Number.isNaN( rad = Number(rad) )) return NaN;
				for (var factor = 1, i = 2, sqrt = this.sqrt(this.abs(rad)); i <= sqrt; i += 1 + (i > 2))
					while ( !(rad % i**2) ) {
						rad /= i**2;
						factor *= i;
					}
				return `${factor}${rad < 0 ? "i" : ""}√${this.abs(rad)}`.remove(/^1|√1$/);
			}
			PythagTriple(maxSize=1000) {
				// TODO/FIX: Fix
				if (typeof maxSize !== "number") maxSize = 1000;
				for (var a = 1, b = 1, c, triples = []; a < maxSize; a++) {
					for (b = 1; b < maxSize; b++) {
						c = this.hypot(a, b);
						if (!c.isInt()) continue;
						if (
							!triples.filter(
								e => c%e[2] && ( a%e[0] && b%e[1] || a%e[1] && b%e[0] )
							).length
						) triples.push([a, b, c]);
					}
				}
				return triples;
			}
			iPythagorean(a=1, m=1, form=Array) {
				// only finds integer pythagorean triples
				// (a+m) mod₀ 2 = 0  <-->  formula works
				// (a+b) modₖ 2 = (a-b) modₖ 2
				// a^2 + b^2 = (b+m)^2
				if (Number.isNaN( a = Number(a) )) return "No Solution";
				if (Number.isNaN( m = Number(m) )) return "No Solution";
				if (fpart(a) || fpart(m))   return "No Solution";
				if (this.mod(a+m, 2))       return "No Solution";

				var b = (a**2 - m**2) / (2*m),
					c = b + m;
				if (fpart(b) || fpart(c)) return "No Solution";
				return form === Array ?
					[a, b, c] :
					{ a: a, b: b, c: c };
			}
			neg(n=0, num=false) { return num ? -n : n[0] === "-" ? n.slice(1) : `-${n}` /* negate */ }
			ssgn(snum="0.0") { return snum[0] === "-" ? -1 : +!/0+\.?0*/.test(snum); /* string sign */ }
			ssign(snum="0.0") { return this.ssgn(snum); /* string sign */ }
			sabs(snum="0.0") { return snum[0] === "-" ? snum.slice(1) : snum /* string absolute value */ }
			add(a="0.0", b="0.0", number=true) { return number ? Number(sMath.add(a,b)) : sMath.add(a,b) }
			sub(a="0.0", b="0.0", number=true) { return number ? Number(sMath.sub(a,b)) : sMath.sub(a,b) }
			mul(a="0.0", b="0.0", number=true) { return number ? Number(sMath.mul(a,b)) : sMath.mul(a,b) }
			div(num="0.0", denom="1.0", number=true, precision=18) {
				return number ?
					Number(sMath.div(a, b, precision)) :
					sMath.div(a, b, precision);
			}
			cdiv(num="0.0", denom="1.0", number=true) { return this.ceil (this.div(num,denom,number,1)) }
			fdiv(num="0.0", denom="1.0", number=true) { return this.floor(this.div(num,denom,number,1)) }
			rdiv(num="0.0", denom="1.0", number=true) { return this.round(this.div(num,denom,number,1)) }
			tdiv(num="0.0", denom="1.0", number=true) { return this.trunc(this.div(num,denom,number,1)) }
			mod(a, n=1, k=0) {
				// a modₖ n
				// modulo using the formula
				if (Number.isNaN( a = Number(a) )) return NaN;
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (Number.isNaN( k = Number(k) )) return NaN;
				return a - n*floor(a/n) + k;
			}
			rem(a, n=1, k=0) {
				// a remₖ n
				// different from mod()
				if (Number.isNaN( a = Number(a) )) return NaN;
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (Number.isNaN( k = Number(k) )) return NaN;
				return a - n*int(a/n) + k; // truncate
			}
			isClose(n1, n2, range=Number.EPSILON) {
				return Number.isNaN( n1 = Number(n1) ) ||
					Number.isNaN( n2 = Number(n2) ) ||
					Number.isNaN( range = Number(range) ) ?
						NaN :
						n1 > n2 - range && n1 < n2 + range;
			}
			dist(x1=0, y1=0, x2=0, y2=0) {
				if (Number.isNaN( x1 = Number(x1) )) return NaN;
				if (Number.isNaN( y1 = Number(y1) )) return NaN;
				if (Number.isNaN( x2 = Number(x2) )) return NaN;
				if (Number.isNaN( y2 = Number(y2) )) return NaN;
				return this.hypot(x2-x1, y2-y1);
			}
			dist2(x_0, y_0, a, b, c) {
				// minimum distance from a line to a point
				// (x₀, y₀) , ax+by=c
				if (Number.isNaN( x_0 = Number(x_0) )) return NaN;
				if (Number.isNaN( y_0 = Number(y_0) )) return NaN;
				if (Number.isNaN( a = Number(a) )) return NaN;
				if (Number.isNaN( b = Number(b) )) return NaN;
				if (Number.isNaN( c = Number(c) )) return NaN;
				return this.abs(a*x_0 + b*y_0 + c) / this.hypot(a, b);
			}
			copysign(a, b) {
				return Number.isNaN( a = Number(a) ) || Number.isNaN( b = Number(b) ) ?
					NaN :
					this.abs(a) * this.sgn(b);
			}
			remainder(/*a, n, k*/) { return this.rem.apply(this, arguments) }
			parity(x=0) { return x % 2 ? "odd" : "even" }
			trunc(n) { return Number.isNaN( n = Number(n) ) ? n : Number.parseInt(n) }
			truncate(n) { return this.trunc.apply(this, arguments) }
			isNaN(e) { return isNaN( Number(e) ) /* is not a number */ } // TODO/FIG: idk what it does
			isAN(e) { return !this.isNaN(e) /* is a number */ }
			isaN(e) { return this.isAN(e) /* is a number */ }
			isNNaN(e) { return this.isAN(e) /* is not not a number. isaN, isAN */ }
			fround(n) { return Number.isNaN( n = Number(n) ) ? n : this.Math.fround(n) }
			sqrt(n) { return Number.isNaN( n = Number(n) ) ? n : this.nthrt(n, 2) }
			isqrt(x = 1)     {
				if (Number.isNaN(x = Number(x)) || x < 0) return NaN;
				x = floor(x);
				if (x < 2) return x;

				var x1 = floor(x / 2), x0; // current, previous

				do [x1, x0] = [floor((x1 + x / x1) / 2), x1];
				while (x1 < x0);

				return x0; // last accurate value
			}
			cbrt(n) { return Number.isNaN( n = Number(n) ) ? n : this.nthrt(n, 3) }
			sign(n) { return Number.isNaN( n = Number(n) ) ? n : this.sgn(n) }
			exp(n, x=e) {
				return Number.isNaN( n = Number(n) ) ||
					Number.isNaN( x = Number(x) ) ?
					NaN :
					x ** n;
			}
			round(n) { return round(n) }
			floor(n) { return Number.isNaN( n = Number(n) ) ? n : floor(n) }
			ceil(n) { return Number.isNaN( n = Number(n) ) ? n : ceil(n) }
			rand() { return rand() }
			random() { return rand() }
			imul(a, b) {
				return Number.isNaN(a = Number(a)) || Number.isNaN(b = Number(b)) ?
					NaN :
					this.Math.imul(a, b);
			}
			pow(a=1, b=1) {
				// TODO: Make "pow" and "nthrt" faster
				if (Number.isNaN( a = Number(a) )) return NaN;
				if (Number.isNaN( b = Number(b) )) return NaN;
				for (var y = 1, c = b, d = a ;; a *= a) {
					b & 1 && (y *= a);
					b >>= 1;
					if (!b) return (this.nthrt(d, 1 / fpart(c)) || 1) * y;
				}
			}
			nthrt(x, rt=2) {
				if (
					Number.isNaN( x = Number(x) ) ||
					Number.isNaN( rt = Number(rt) )
				) return NaN;

				if (rt < 0) return this.pow(x, rt);
				if (!rt || !(rt % 2) && x < 0) return NaN;
				if (!x) return 0;
				for (var ans = floor(x/2/rt), tmp=1, i=1000; i --> 0 && ans != ans + tmp; tmp /= 10) while (
					ans != (ans += abs(x - (ans - tmp)**rt) < abs(x - ans**rt) ? -tmp :
						abs(x - (ans + tmp)**rt) < abs(x - ans**rt) ? tmp : 0)
				);
				return this.copysign(ans, x);
			}
			square(n) { return Number.isNaN( n = Number(n) ) ? n : n ** 2 }
			cube(n) { return Number.isNaN( n = Number(n) ) ? n : n ** 3 }
			tesseract(n) { return Number.isNaN( n = Number(n) ) ? n : n ** 4 }
			findPrimesRange(a=2, b=100) {
				// find primes in the range [a, b]
				if (Number.isNaN( a = Number.parseInt(Number(a)) )) return NaN;
				if (Number.isNaN( b = Number.parseInt(Number(b)) )) return NaN;
				if (a < 2) a = 2;
				if (a > b) return [];
				var primes = a === 2 ? [2] : [];
				for (a % 2 ? (a.isPrime() && primes.push(a), a += 2) : a++; a <= b; a += 2)
					a.isPrime() && primes.push(a);
				return primes;
			}
			findPrimesLen(a=2, l=100) {
				// find the next "l" (lowercase L) primes greater than or equal to "a"
				if (Number.isNaN( a = Number.parseInt(Number(a)) )) return NaN;
				if (Number.isNaN( l = Number.parseInt(Number(l)) )) return NaN;
				if (a < 2) a = 2;
				var primes = a === 2 ? [2] : [];
				for (a % 2 ? (a.isPrime() && primes.push(a), a += 2) : a++; primes.length < l; a += 2)
					a.isPrime() && primes.push(a);
				return primes;
			}
			findPrimes(rangeStart=2, rangeEnd=100) {
				// find primes in the range [rangeStart, rangeEnd]
				return this.findPrimesRange.apply(this, arguments);
			}
			li(x, incOrAcy=.001, form=1) {
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (Number.isNaN( incOrAcy = Number(incOrAcy) )) return NaN;
				if (x < 0) return NaN;
				if (form === 3) { // fast mode uses the following: li(x) ~ π(x)
					// not 100% accurate, but with large values,
					// it is so much faster that the inaccuracy doesn't matter
					return this.π(x);
				}
				else if (form === 1) { // uses increment for integrals
					return x === Infinity || !x ?
						x :
						x.inRange(0, 1, false) ?
							this.int(1e-20, x, x => 1/this.ln(x), incOrAcy) :
							1.045163780117493 + this.int(2, x, t => 1/this.ln(t), incOrAcy);
				}
				else if (form === 2) { // uses accuracy for infinite summation
					const f = x => emc + this.ln(this.ln(x)) + this.sqrt(x) * 
						this.sum(1, incOrAcy, n=>((-1)**(n-1) * this.ln(x)**n) / (this.fact(n) * 2**(n-1)) * 
							this.sum(0, floor( (n-1) / 2), k=>1/(2*k+1), 1), 1),
						ans = f(x);
					while ( isNaN(ans) ) {
						incOrAcy /= 2;
						ans = f(x);
					}
					return ans;
				}
			}
			Li(x, incOrAcy=.001, form=1) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( incOrAcy = Number(incOrAcy) ) ?
					NaN :
					this.li.apply(this, arguments) -
						1.045163780117493;
			}
			Ei(x, incOrAcy=.001, form=1) {
				return Number.isNaN( x = Number(x) ) ?
					NaN :
					this.li(e**x, incOrAcy, form);
				// Exponential integral
				// Ei(x) = li(e^x) ∀ -π < Im(x) ≤ π
			}
			tetrate(a, n, {Switch=false, number=false}={}) {
				return this.hyper4(a, n, {
					Switch: Switch,
					number: number
				});
			}
			hyper0(/*a, */b) { return Number.isNaN(b = Number(b)) ? NaN : this.add(b, 1) }
			hyper1(a, b) {
				return Number.isNaN(a = Number(a)) ||
					Number.isNaN(b = Number(b)) ?
					NaN :
					this.add(a, b);
			}
			hyper2(a, b) {
				return Number.isNaN(a = Number(a)) ||
					Number.isNaN(b = Number(b)) ?
						NaN :
						this.mul(a, b);
				}
			hyper3(a, b) { return Number.isNaN(a = Number(a)) || Number.isNaN(b = Number(b)) ? NaN : a ** b }
			hyper4(a, b) {
				// tetration.  a ↑↑ b = a^^b = a^a^a^... (b times) = ⁿa = a ↑² b
				if (this.isNaN( a = BigInt(a) )) return NaN;
				if (this.isNaN( b = BigInt(b) )) return NaN;
				for (var A = a; b --> 1 ;) a = A ** a;
				return a;
			}
			hyperN(a, n=2n, b) {
				// a ↑ⁿ b == a ↑ⁿ⁻¹ [a ↑ⁿ (b-1)]
				// a [n] b = a [n-1] ( a [n] (b-1) )
				// a [n] 0 = 1 if n >= 3
				
				// a[n]1 == a[n-1]1 if n>=3
				// a[2]1 == a
				// a[1]1 == a+1
				// a[0]1 == 2

				// a[n]b = a ↑ⁿ⁻² b

				if (
					this.isNaN( a = BigInt(a) ) ||
					this.isNaN( n = BigInt(n) ) ||
					this.isNaN( b = BigInt(b) )
				) return NaN;

				if (n === 0n) return b + 1;
				else if (n === 1n) return a + b;
				else if (n === 2n) return a * b;
				else if (n === 3n) return a ** b;

				for (var _a = a; b --> 1 ;)
					a = this.hyperN(_a, n-1, a);

				return a;
			}
			////////////////////////////////////// TRIGONOMETRY START //////////////////////////////////////
			sin(θ, acy=25) {
				return this.cos(π_2 - θ, acy);
				// return Number.isNaN( θ = Number(θ) ) || Number.isNaN( acy = Number(acy) ) ?
				// 	θ : this.sum(0, acy, n => (-1)**n / this.ifact(2*n+1)*(θ%tau)**(2*n+1) );
			}
			cos(θ, acy=25) {
				return Number.isNaN( θ = Number(θ) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						θ :
						this.sum(0, acy, n => (-1)**n /
							this.ifact(2*n)*(θ%tau)**(2*n) );
			}
			tan(θ, acy=25) { return this.sin(θ, acy) / this.cos(θ, acy) }
			sinc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? x : x === 0 ? 1 : this.sin(x, acy) / x }
			nsinc(x, acy=25) {
				return Number.isNaN( x = Number(x) ) ?
					x :
					x === 0 ?
						1 :
						this.sin(π*x, acy) / (x*π);
			}
			cosc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? x : this.cos(x) / x }
			ncosc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? x : this.cos(π*x) / (x*π) }
			tanc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? NaN : x === 0 ? 1 : this.tan(x, acy) / x }
			ntanc(x, acy=25) {
				return Number.isNaN( x = Number(x) ) ?
					NaN :
					x === 0 ?
						1 :
						this.tan(π*x, acy) / (x*π);
			}
			csc(θ, acy=25) {
				return Number.isNaN( θ = Number(θ) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						θ :
						1 / this.sin(θ);
			}
			sec(θ, acy=25) {
				return Number.isNaN( θ = Number(θ) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						θ :
						1 / this.cos(θ);
			}
			cot(θ, acy=25) {
				return Number.isNaN( θ = Number(θ) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						θ :
						1 / this.tan(θ);
			}
			asin(x, acy=100) {
				return Number.isNaN( x = Number(x) ) || x > 1 || x < -1 ? NaN :
					this.atan(x / this.sqrt(1 - x**2), acy)
					// this.sum(0, acy, n=>this.ifact(2*n) /
						// (4**n*this.ifact(n)**2 *
						// (2*n+1))*(x**(2*n+1)));
			}
			acos(x, acy=100) { return Number.isNaN( x = Number(x) ) ? z : π_2 - this.asin(x, acy) }
			atan(x, acy=100) {
				// 2 arctan(x) = sgn(x)(|x|>1)π - arctan( 2x/(x²-1) )
				if (Number.isNaN(x = Number(x))) return NaN;
				if (Number.isNaN(acy = Number(acy))) acy = 100;
				if (acy <= 0) return x;
				if (x === 0) return 0; // -0

				acy = floor(acy);
				for (var denom = sgn(x), ans = 0; acy --> 0 ;) {
					const next = 2*x / (1 - x**2);
					ans += π_2 * (x > 1 || x <- 1) / denom;
					denom *= sgn(next) * 2;
					x = sgn(next) * next;
				}
				return ans;
				// return Number.isNaN(x = Number(x)) ? z : this.asin(x / this.hypot(x, 1));
			}
			atan2(x, y, acy=100, flipArgs=false) {
				// most places use atan2(y, x), but that is stupid.
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (Number.isNaN( y = Number(y) )) return NaN;
				if (flipArgs) return this.atan2(y, x, acy, !1);
				const output = this.atan(y / x, acy);
				return x > 0 ?
					output :
					!x ?
						this.sgn(y)**2 / this.sgn(y) * π_2 :
						y >= 0 ? output + π : output - π;
			}
			acsc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asin(1/x, acy) }
			asec(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acos(1/x, acy) }
			acot(x, acy=100) {
				return Number.isNaN( x = Number(x) ) ?
					x :
					!x ?
						π_2 :
						this.atan(1/x, acy) +
							π*(x < 0);
			}
			excst(θ, acy1=25, acy2=25) {
				return Number.isNaN( θ = Number(θ) ) ? θ : this.hypot(
					this.exsec(θ, acy1),
					this.cot(θ, acy2)
				)
			}
			exset(θ, acy1=25, acy2=25) {
				return Number.isNaN( θ = Number(θ) ) ? θ : this.hypot(
					this.exsec(θ, acy1),
					this.tan(θ, acy2)
				);
			}
			sqvcs(θ, acy1=25, acy2=25) {
				return Number.isNaN( θ = Number(θ) ) ? θ : this.hypot(
					this.vrc(θ, acy1),
					this.sin(θ, acy2)
				);
			}
			sq1s(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.hypot( 1, this.sin(θ, acy) ) }
			asq1s(x, acy=100) {
				return Number.isNaN( x = Number(x) ) ?
					x :
					this.asin( this.sqrt(x**2 - 1), acy );
			}
			// ccvs
			// accvs
			csq1s(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.hypot( 1, this.cos(θ, acy) ) }
			acsq1s(x, acy=100) {
				return Number.isNaN( x = Number(x) ) ?
					x :
					this.acos(
						this.sqrt(x**2 - 1)
						, acy
					);
			}
			crd(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 2 * this.sin(θ/2, acy) }
			acrd(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : 2 * this.asin(x/2, acy) }
			ccrd(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 2 * this.cos(θ/2, acy) }
			accrd(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : π_2 - this.acrd(x, acy) }
			exsec(x, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.sec(θ, acy) - 1 }
			aexsec(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asec(x+1, acy) }
			excsc(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.csc(θ, acy) - 1 }
			aexcsc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acsc(x+1, acy) }
			vrs(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 1 - this.cos(θ, acy) }
			avrs(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acos(x+1, acy) }
			vrc(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 1 + this.cos(θ, acy) }
			avrc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acos(x-1, acy) }
			cvs(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 1 - this.sin(θ, acy) }
			acvs(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asin(1 - x, acy) }
			cvrc(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : 1 + this.sin(θ, acy) }
			acvrc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asin(x - 1, acy) }
			hav(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.vrs(θ, acy) / 2 }
			ahav(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acos(1 - 2*x, acy) }
			hvrc(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.vrc(θ, acy) / 2 }
			ahvrc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.acos(2*x - 1, acy) }
			hcvrs(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.cvs(θ, acy) / 2 }
			ahcvrs(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asin(1 - 2*x, acy) }
			hcc(θ, acy=25) { return Number.isNaN( θ = Number(θ) ) ? θ : this.cvrc(θ, acy) / 2 }
			ahcc(x, acy=100) { return Number.isNaN( x = Number(x) ) ? x : this.asin(2*x - 1, acy) }
			/////////// HYPERBOLIC TRIGONOMETRY
			sinh(x) { return Number.isNaN( x = Number(x) ) ? x : (e**x - e**-x) / 2 }
			cosh(x) { return Number.isNaN( x = Number(x) ) ? x : (e**x + e**-x) / 2 }
			tanh(x) { return Number.isNaN( x = Number(x) ) ? x : this.sinh(x) / this.cosh(x) }
			sinhc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? NaN : x === 0 ? 1 : this.sinh(x) / x }
			coshc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? x : this.cosh(x) / x }
			tanhc(x, acy=25) { return Number.isNaN( x = Number(x) ) ? NaN : x === 0 ? 1 : this.tanh(x) / x }
			csch(x) { return Number.isNaN( x = Number(x) ) ? x : 1 / this.sinh(x) }
			sech(x) { return Number.isNaN( x = Number(x) ) ? x : 1 / this.cosh(x) }
			coth(x) { return Number.isNaN( x = Number(x) ) ? x : 1 / this.tanh(x) }
			asinh(x) { return Number.isNaN( x = Number(x) ) ? x : this.ln( x + this.hypot(x, 1) ) }
			acosh(x) { return Number.isNaN( x = Number(x) ) ? x : this.ln( x + this.sqrt(x**2-1) ) }
			atanh(x) { return Number.isNaN( x = Number(x) ) ? x : this.ln( (x+1) / (1-x) ) / 2 }
			acsch(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(1/x) }
			asech(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(1/x) }
			acoth(x) { return Number.isNaN( x = Number(x) ) ? x : this.atanh(1/x) }
			excsth(x) { return Number.isNaN( x = Number(x) ) ? x : this.hypot( this.coth(x), this.exsech(x) ) }
			exseth(x) { return Number.isNaN( x = Number(x) ) ? x : this.hypot( this.exsech(x), this.tanh(x) ) }
			vcsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.hypot( this.vrch(x), this.sinh(x) ) }
			sq1sh(x) { return Number.isNaN( x = Number(x) ) ? x : this.hypot( 1, this.sinh(x) ) }
			sq1sh(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(x**2 - 1) }
			csq1sh(x) { return Number.isNaN( x = Number(x) ) ? x : this.hypot( 1, this.cosh(x) ) }
			acsq1sh(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(x**2 - 1) }
			// ccvsh
			// accvsh
			crdh(x) { return Number.isNaN( x = Number(x) ) ? x : 2*this.sinh(x / 2) }
			acrdh(x) { return Number.isNaN( x = Number(x) ) ? x : 2*this.asinh(x / 2) }
			ccrdh(x) { return Number.isNaN( x = Number(x) ) ? x : 2*this.cosh(x / 2) }
			accrdh(x) { return Number.isNaN( x = Number(x) ) ? x : π_2 - 2*this.asinh(x / 2) }
			exsech(x) { return Number.isNaN( x = Number(x) ) ? x : this.sech(x) - 1 }
			aexsech(x) { return Number.isNaN( x = Number(x) ) ? x : this.asech(x + 1) }
			excsch(x) { return Number.isNaN( x = Number(x) ) ? x : this.csch(x) - 1 }
			aexcsch(x) { return Number.isNaN( x = Number(x) ) ? x : this.acsch(x + 1) }
			vrsh(x) { return Number.isNaN( x = Number(x) ) ? x : 1 - this.cosh(x) }
			avrsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(x + 1) }
			vrch(x) { return Number.isNaN( x = Number(x) ) ? x : 1 + this.cosh(x) }
			avrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(x - 1) }
			cvsh(x) { return Number.isNaN( x = Number(x) ) ? x : 1 - this.sinh(x) }
			acvsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(1 - x) }
			cvrch(x) { return Number.isNaN( x = Number(x) ) ? x : 1 + this.sinh(x) }
			acvrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(x - 1) }
			hvrsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.vrsh(x) / 2 }
			ahvrsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(1 - 2*x) }
			hvrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.vrch(x) / 2 }
			ahvrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.acosh(2*x - 1) }
			hcvrsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.cvsh(x) / 2 }
			ahcvrsh(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(1 - 2*x) }
			hcvrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.cvrch(x) / 2 }
			ahcvrch(x) { return Number.isNaN( x = Number(x) ) ? x : this.asinh(2*x - 1) }
			degrees(n) { return Number.isNaN( n = Number(n) ) ? n : n * this.rtod }
			radians(n) { return Number.isNaN( n = Number(n) ) ? n : n * this.dtor }
			// integral trig functions
			Si(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						this.int(0, x, t => this.sinc(t, acy), inc);
			}
			si(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(acy) ) ||
					Number.isNaN( inc = Number(acy) ) ?
						NaN :
						this.Si(x, inc, acy) - π_2;
			}
			nSi(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						this.int(0, x, t => this.nsinc(t, acy), inc);
			}
			nsi(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						this.nSi(x, inc, acy) - π_2;
			}
			Cin(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						this.int(0, x, t => ( 1 - this.cos(t, acy) ) / t, inc );
			}
			Ci(x, inc=.001, acy=25) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ?
						NaN :
						emc + this.ln(x) -
							this.Cin(x, inc, acy);
			}
			ci() { return this.Ci.apply(this, arguments) }
			Shi(x, inc=.001) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ?
						NaN :
						this.int(0, x, t => this.sinhc(t), inc);
			}
			Chi(x, inc=.001) {
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ?
						NaN :
						emc + this.ln(x) +
							this.int(0, x, t =>
								(this.cosh(t) - 1) / t, inc
							);
			}
			gd(x, inc=.001) {
				return Number.isNaN( x = Number(x) ) ? x : this.int(0, x, t => this.sech(t), inc);
				// gudermannian function
			}
			lam(x, inc=.001, acy=25) {
				// inverse gudermannian function
				// Lambertian function
				return Number.isNaN( x = Number(x) ) ||
					Number.isNaN( inc = Number(inc) ) ||
					Number.isNaN( acy = Number(acy) ) ||
					abs(x) >= π_2 ?
					NaN :
					this.int(0, x, t => this.sec(t, acy), inc);
			}
			/////////////////////////////////////// TRIGONOMETRY END ///////////////////////////////////////
			H(x, form=1) {
				// Heaveside step function, Heaveside theta function
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (form === 1) return this.sgn( this.sgn(x) + 1 )
				if (form === 2) return (1 + this.sgn(x)) / 2
				return +(x > 0);
			}
			W(x, acy=Infinity) {
				// Lambert W function, product log
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (x < -1 / e) return NaN;
				if (x < e) {
					if (acy === Infinity) {
						for (var total = e**-x, prev;;)
							if ( (prev = total) === (total = e**-(x*total)) ) break
					}
					else for (var total = e**-x; acy --> 0 ;)
						total = e**-(x*total);
					return x * total;
				}
				else {
					if (acy === Infinity) {
						for (var total = this.ln(x), prev;;)
							if ( (prev = total) === (total = this.ln( x / total )) ) break
					}
					else for (var total = this.ln(x); acy --> 0 ;)
						total = this.ln( x / total );
					return total;
				}
			}
			productLog(/*x, acy*/) { return this.W.apply(this, arguments) }
			deriv/*ative*/(f=x=>2*x+1, x=1, Δx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used as the variable
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "") throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = RegExp(`\\d+${VARIABLE}`, "g")
						, arr = []
						, values = f.matchAll(regex)
						, value = values.next();
					while (!value.done) {
						arr.push(value.value);
						value = values.next();
					}
					arr = arr.filter(e=>e.index > 0).smap(e=>[e[0], e.index]);
					for (const a of arr) {
						f = f.substr(0, a[1]) +
						a[0].replace(/(?<=\d+)/, "*") +
						f.slice(a[1] + len(a[0]))
					}
					try { f = Function(`${VARIABLE}`,`return ${f.replace(/\^/g, "**")}`) }
					catch { throw Error("Variable name declaration is missing, and `x` was not used.") }
				}

				if (!( f(x) || f(x + Δx) )) return 0;
				let numerator = f(x + Δx) - f(x);
				while ( !numerator ) {
					Δx *= 10;
					numerator = f(x + Δx) - f(x);
				}
				return numerator / Δx;
			}
			tanLine(f=x=>x, x=1, ret=Object, Δx=1/1_073_741_824) {
				if (type(f) === "string") {
					if (f.io(":") < 0) f = `x:${f}`; // just assume x is used.
					const VARIABLE = f.slc(0, ":").remove(/\s+/g);
					if (VARIABLE === "") throw Error(`Invalid String input`);
					f = f.slc(":", Infinity, 1);
					let regex = RegExp(`\\d+${VARIABLE}`, "g")
						, arr = []
						, values = f.matchAll(regex)
						, value = values.next();
					while (!value.done) {
						arr.push(value.value);
						value = values.next();
					}
					for (const a of arr.smap(e=>[e[0], e.index]).reverse()) {
						f = f.substr(0, a[1]) +
						a[0].replace(/(?<=\d+)/, "*") +
						f.substr(a[1] + len(a[0]))
					}
					try { f = Function(`${VARIABLE}`,`return ${f.replace(/\^/g, "**")}`) }
					catch { throw Error("Variable name declaration is missing, and `x` was not used.") }
				}

				var m;
				if (!( f(x) || f(x + Δx) )) m = 0;
				else {
					let numerator = f(x + Δx) - f(x);
					while ( !numerator ) {
						Δx *= 2;
						numerator = f(x + Δx) - f(x);
					}
					m = numerator / Δx;
				}
				const b = f(x) - x*m;
				type(ret, 1) === "str" && (ret = ret.lower());
				if ( [Object, "o", "obj", "object"].includes(ret) ) return {
					m: m,
					b: b
				}
				else if ( [String, "s", "str", "string"].includes(ret) )
					return `${ m ? `${m}x` : "" }${ b<0 ? `${b}` : b ? `${m ? "+" : ""}${b}` : "" }`.
						start("0").remove(/1(?=x)/);
			}
			base10Conv(n, base, decAcy=54, numberOnly=false) {
				// only works for base <= 10
				// TODO/FIX: Fix
				if (Number.isNaN( n = Number(n) )) return NaN;
				if (Number.isNaN( n = Number(n) ) || base < 2) return NaN;
				if (Number.isNaN( base = Number(base) )) return NaN;
				if (base < 2) throw Error("Base must be greater than 2");
				if (base > 10) throw Error("base x > 10 is not supported yet");
				var iPart = sMath.ipart(`${n}`),
					fPart = `${fpart(n, 0)}`;
				var str = "";
				while (sMath.eq.nz(iPart)) {
					str += sMath.mod(iPart, base);
					iPart = sMath.fdiv(iPart, base);
				}
				str = str.reverse();
				fPart && (str += ".");
				var str_len = str.length;
				while (fPart !== 0) {
					fPart *= base;
					str += base > 10 ?
						this.base10Conv(floor(fPart)) :
						floor(fPart);
					fPart = fpart(fPart);
					if (str.length - str_len >= decAcy) break;
				}
				return `${numberOnly ? "" : `${base}:`}${str}`.remove(/\.?0*$/);
			}
			bin(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0b" : colon ? "2:" : ""}${this.base10Conv(x, 2).slc(2)}`;
			}
			oct(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0o" : colon ? "8:" : ""}${this.base10Conv(x, 8).slc(2)}`;
			}
			hex(x, cstyle=true, colon=false) {
				return this.isNaN( x = Number(x) ) ? x :
					`${cstyle ? "0x" : colon ? "16:" : ""}${this.base10Conv(x, 16).slc(3)}`;
			}
			timesTable(start=0, end=9) {
				for (var i = floor(++end), j, table = []; i --> start ;)
					for (j = floor(end), table[i] = []; j --> start ;)
						table[i][j] = i * j;
				return table;
			}
			cosNxSimplify(str="cos(x)") {
				// TODO/ADD: make cosNxSimplify() as good as sinNxSimplify()
				typeof str === "number" && !(str % 1) && (str = `cos(${str}x)`);
				if (typeof str !== "string") return "";
				if (/^cos\d+x$/.test(str)) str = `cos(${str.match(/\d+/)[0]}x)`;

				for (var tmp; /\(\d+x\)/.in(str) ;) {
					str = str.replace(/\(-?1x\)/g, "(x)"); // only for cos
					str = str.replace(/cos\(-?0x\)/g, "1"); // only for cos
					// str = str.replace(/cos\(-?0x\)/g, "0"); // only for sin
					tmp = /cos\((\d+)x\)/.exec(str);
					if (tmp?.[1]) str = str.replace(/cos\((\d+)x\)/, `[2cosxcos(${+tmp[1]-1}x)-cos(${+tmp[1]-2}x)]`);
					str = str.replace(/\(-?1x\)/g, "(x)").replace(/cos\(-?0x\)/g, "1");
				}
				str = str.replace(/\(x\)/g, "x").replace(/cosxcosx/g, "cos²x");
				return str.substring( 1, str.length - 1 ).replace(/^os$/, "cosx");
			}
			sinNxSimplify(str="sinx") {
				(typeof str === "number" && !(str % 1) || typeof str === "bigint") && (str = `sin${str}x`);
				if (typeof str !== "string") return "";

				str = str.replace([
					/sin\((-?\d+)x\)/g,
					/(?<!\d)1x/g,
					/sin-?0x/g
				], [
					"sin$1x",
					"x",
					"0"
				]);

				for (var tmp; /-?\d+x|-x/.in(str) ;) {
					multiply: {
						let tmp2 = /(-?\d*)sin-(\d*)x/g.exec(str);
						if (tmp2 === null) break multiply;
						str = tmp2[1] === "" ?
							str.replace(/sin-(\d*)x/g, "-sin$1x") :
							str.replace(/(-?\d+)sin-(\d*)x/g, `${sMath.mul(tmp2[1], -1).remove(/\.0+$/)}sin$2x`);
					}

					tmp = /sin(\d+)x/.exec(str);
					if (tmp) str = str.replace(/sin(\d+)x/, `[2cosxsin${+tmp[1]-1 === 1 ? "" : +tmp[1]-1}x${
						+tmp[1]-2 === 0 ? "" :
						+tmp[1]-2 === 1 ? `-sinx` :
						`-sin${+tmp[1]-2}x`
					}]`);
					str = str.replace(/sin-?0x/g, "0");
				}
				multiplyConstants: {
					// TODO: Do something about 0 constants
					let tmp2 = /^(-?\d+\.?\d*)\*?\[(-?\d+)/.exec(str);
					if (tmp2 === null) break multiplyConstants;
					str = str.replace(/^(-?\d+\.?\d*)\*?\[(-?\d+)/, sMath.mul( tmp2[1], tmp2[2] ).remove(/\.0+$/)+"[");
				}

				return str.replace(/2cosx\[2cosxsinx]/g, "4cos²xsinx").replace(/\[2cosxsinx]/g, "2sinxcosx");
			}
			heron(a=1, b=1, c=1) {
				if (
					Number.isNaN( a = Number(a) ) ||
					Number.isNaN( b = Number(b) ) ||
					Number.isNaN( c = Number(c) )
				) return NaN;

				const s = (a + b + c) / 2;
				return this.sqrt(s * (s-a) * (s-b) * (s-c));
			}
			tempConv(value=0, startSystem="f", endSystem=LibSettings.MATH_TEMPCONV_DEFAULT_END_SYSTEM) {
				// temperature converter
				if (this.isNaN(value)) return NaN;
				if (type(startSystem) !== "string") return NaN;
				if (type(endSystem) !== "string") return NaN;
				startSystem.lower() === "celcius"     && (startSystem = "c");
				startSystem.lower() === "fahrenheit"  && (startSystem = "f");
				startSystem.lower() === "kelvin"      && (startSystem = "k");
				/ra(nkine)?/i.in(startSystem.lower()) && (startSystem = "r");
				endSystem  .lower() === "celcius"     && ( endSystem  = "c");
				endSystem  .lower() === "fahrenheit"  && ( endSystem  = "f");
				endSystem  .lower() === "kelvin"      && ( endSystem  = "k");
				/ra(nkine)?/i.in( endSystem .lower()) && ( endSystem  = "r");
				startSystem = startSystem.lower(); endSystem = endSystem.lower();
				if (startSystem === endSystem) return value;
				switch (startSystem) { // convert to celcius
					case "c":                               break;
					case "f": value = (5/9) * (value - 32); break;
					case "k": value -= 273.15             ; break;
					case "r": value = (5/9)*value - 273.15; break;
					default: throw Error("Invalid 2nd Input to function");
				}
				switch (endSystem) { // convert from celcius
					case "c": return value;
					case "f": return 1.8*value + 32;
					case "k": return value + 273.15;
					case "r": return 1.8*value + 491.67; // (9/5) (x + 273.15)
					default: throw Error("Invalid 3rd Input to function");
				}
			}
			coprime(a, b) { return this.gcd(a, b) === 1 /* coprimality of a and b */ }
			ncoprime(a, b) { return this.gcd(a, b) !== 1 /* inverse coprimality of a and b */ }
			///////////////////////////////////// SET OPERATIONS START /////////////////////////////////////
			cumsum(set) { return type(set, 1) === "set" ? set.cumsum() : NaN; /* cumulative sum */ }
			set(...args) { return new this.Set( ...args.flatten() ) }
			setUnion(set1, set2) {
				return type(set1, 1) === "set" ?
					type(set2, 1) === "set" ?
						set1.length >= set2.length ?
							set1.union( set2, 1 ) :
							set2.union( set1, 1 ) :
						set1 :
					type(set2, 1) === "set" ?
						set2 :
						this.nullSet;
			}
			setIntersection(set1, set2) {
				return type(set1, 1) === "set" ?
					type(set2, 1) === "set" ?
						set1.length >= set2.length ?
							set1.intersection( set2, 1 ) :
							set2.intersection( set1, 1 ) :
						set1 :
					type(set2, 1) === "set" ?
						set2 :
						!1;
			}
			setDifference(set1, set2) { return set1.difference(set2) }
			isSameset(set1, set2) {
				type(set1, 1) !== "set" ||
					type(set2, 1) !== "set" ||
					set1.length !== set2.length ?
					!1 :
					set1.isSameset(set2);
			}
			isSubset(set1, set2) {
				type(set1, 1) === "set" &&
					type(set2, 1) === "set" &&
					set1.length < set2.length ?
					set1.isSubset(set2) :
					!1;
			}
			isSuperset(set1, set2) { type(set1, 1) === "set" ? set1.isSuperset(set2) : !1 }
			isStrictSubset(set1, set2) { type(set1, 1) === "set" ? set1.isStrictSubset(set2) : !1 }
			isStrictSuperset(set1, set2) { type(set1, 1) === "set" ? set1.isStrictSuperset(set2) : !1 }
			////////////////////////////////////// SET OPERATIONS END //////////////////////////////////////
			harmonic(n=1, decimals=18) {
				// harmonic series
				// TODO/ADD: Expand to the real numbers
				return this.sum(
					1,
					Number.parseInt(n),
					n => this.div(1, n, !0, 18)
				)
			}
			fraction(numer=0, denom=0) { return fMath.new(numer, denom) }
			complex(re=0, im=0) { return cMath.new(re, im) }
			bigint(value=0) { try { return BigInt(value) } catch { return NaN } }
			number(value=0) { try { return Number(value) } catch { return NaN } }
			toAccountingStr(n=0) { return this.isNaN(n) ? NaN : n < 0 ? `(${-n})` : n+"" }
			collatz(x=2, ltx=true) {
				if (this.isNaN(x) || x < 0) return NaN;
				x = BigInt( Number.parseInt(x) );
				const infinity = 10n**312n;
				if (ltx) {
					if (x === 1n) return 0n; 
					let y = x;
					for (var i = 0n; x >= y && i < infinity; i++)
						x = x % 2n ? 3n*x+1n : x >> 1n;
				} else {
					for (var i = 0n; x !== 1n && i < infinity; i++)
						x = x % 2n ? 3n*x+1n : x >> 1n;
				}
				return i === infinity ? Infinity : i;
			}
			_pow(x=0) {
				// returns the number of multiplicaions required to take a value to the xth power using optimal methods.
				if (!x) return [0];
				if (fpart(x) || this.isNaN(x)) return NaN;
				x = Number.parseInt(x);
				var negative = !1;
				if (x < 0) {
					negative = !0;
					x *= -1;
				}
				let arr = [1];
				while (arr.last() < x) for (var i = arr.length; i --> 0 ;) if (x >= arr.last() + arr[i]) {
					arr.push( arr.last() + arr[i] );
					break;
				}
				negative && arr.push(-arr.last());
				return arr;
			}
			nextUp(x=0) {
				if (Number.isNaN( x = Number(x) )) return NaN;
				if (x === -Infinity) return -Number.MAX_VALUE;
				if (x === Infinity) return Infinity;
				if (x === Number.MAX_VALUE) return Infinity;
				var y = x * (x < 0 ? 1 - Number.EPSILON / 2 : 1 + Number.EPSILON);
				if (y === x)
					y = x + Number.MIN_VALUE *
						(Number.MIN_VALUE *
							Number.EPSILON > 0 ?
							Number.EPSILON : 1
						);
				if (y === Infinity) y = Number.MAX_VALUE;
				var b = x + (y - x) / 2;
				if (x < b && b < y) y = b;
				var c = (y + x) / 2;
				if (x < c && c < y) y = c;
				return y === 0 ? -0 : y;
			}
			nextDown(x=0) { return -this.nextUp(-x) }
			nextAfter(x=0, y=Infinity) { return x === y ? x : x > y ? this.nextDown(x) : this.nextUp(x) }
			ulp(x=1) { return x < 0 ? this.nextUp(x) - x : x - this.nextDown(x) }
			midpoint([x1, y1], [x2, y2]) {
				// TODO/ADD: make this work with OrderPairs, Vectors, and Arrays once they are implemented
				return [(x1+x2)/2, (y1+y2)/2];
			}
			δ(x) {
				// dirac delta function

				//             1       /  x  \
				// δ(x) = Lim --- sinc | --- |
				//        a→0  a       \  a  /


				// δ(x) = Lim a·sinc(ax)a
				//        a→∞
				return this.isNaN(x) ? NaN : x == 0 ? Infinity : 0;
			}
			dirac(x) { return this.isNaN(x) ? NaN : x == 0 ? Infinity : 0; /* dirac delta function */ }
			solveCubic(a, b, c, d) {
				if (
					Number.isNaN(a = Number(a)) ||
					Number.isNaN(b = Number(b)) ||
					Number.isNaN(c = Number(c)) ||
					Number.isNaN(d = Number(d))
				) return NaN;
				// ax³ + bx² + cx + d  =  0
				if (a === 0) return this.solveQuadratic(b, c, d);
				const L = -b / (3*a)
					, E = L**3 + b*c / (6*a**2) - d / (2*a)
					, F = c / (3*a) - L**2
					, G = this.sqrt(E**2 + F**3);
				return this.cbrt(E + G) + this.cbrt(E - G) + L
			}
			solveQuadratic(a, b, c) {
				// ax² + bx + c  =  0
				return Number.isNaN(a = Number(a)) ||
					Number.isNaN(b = Number(b)) ||
					Number.isNaN(c = Number(c)) ?
					NaN :
					a ?
						(function() {
							a *= 2;
							const d = this.sqrt(b**2 - 2*a*c);
							return [(d-b)/a, -(b+d)/a];
						})() :
						this.solveLinear(b, c);
			}
			solveLinear(a, b) {
				// ax + b  =  0
				return Number.isNaN(a = Number(a)) ||
					Number.isNaN(b = Number(b)) ?
						NaN :
						a ?
							-b / a :
							b ?
				// No Solution, real or complex
								NaN :
				// maybe this should return like 0 or something instead of a string.
								"All Real";
			}
			fix() { return this.trunc.apply(this, arguments) }
			binom(n=1, k=1) { return this.nCr(n, k) }
			pronic(n) {
				// pronic numbers
				return Number.isNaN(n = Number(n)) ?
					NaN :
					n * (n + 1);
				// P(-n) = P(n-1)
			}
			areaRegularPolygon(sides, radius) {
				// area of a regular polygon given the number of sides and the radius.
				// it makes no sense for non integer s, or s < 2.
				// NOTE: There could be an interesting iterative formula for π here,
				// since (s, r, y) -→ (∞, 1, π) ==> A -→ π.

				//     |  r²s         y  |
				// A = | ----- sin 2 --- | such that y = π for radians, or 180°.
				//     |   2          s  |

				return this.abs(  r**2 * s/2 * this.sin(tau / s)  );
			}
			areaEllipse(a=1, b=1, r=1) {
				//  /  x - h  \ 2    /  y - k  \ 2
				//  | ------- |   +  | ------- |   =  r²
				//  \    a    /      \    b    /
				return r**2 * a * b * π;
			}
			areaCircle(r=1) {
				// (x - h)² + (y - k)² = r²
				return π * r**2;
			}
			areaEquilateralTriangle(sidelength=1) {
				// area of equilateral, equiangular triangle

				//  s² √3
				// -------
				//    4
				return sidelength**2 * 0.4330127018922193;
			}
			getHelpString(str="format", format="string", helpObject=this.help) {
				// use dot notation or computed member access without strings. it was too hard ok? shut up. it doesn't even matter.
				if (str === "types") return this.help.types;
				// get the object
				if (["str", "mutstr"].nincl( type(str, 1) )) return "The requested help text doesn't exist. try using a string.";
				var prefixText = str === "format " ?
					"rMath Format Help Text:\n\n" :
					`rMath Help Text for (${str}):\n\n`
				, obj = str.replace([/\[/g, /]/g], [".", ""]).split(".").
					reduce((obj, key) => obj?.[key], helpObject), text = "";
				if (typeof obj === "string") {
					if (["l", "log", console.log, 2].incl(format))
						console.log(`${prefixText}Description:\n\t` + obj.
							remove(/\n+$/).replace(/\n(?!\t)/g, "\n\t")
						);
					return obj;
				}
				else if (obj === null) return "The requested help text hasn't been written due to lack of caring. try crying? Or I just haven't gotten there yet.";
				else if (obj === void 0) return "The requested help text is for a deleted object or doesn't exist. try waiting? or crying?";
				else if (obj != obj) return "The requested help text hasn't been written due to lack of knowledge. try waiting?"
				if (constr(obj) !== "HelpText") return "The requested help text doesn't exist. try something else?";
				if (["o", "obj", "object", Object, 0].incl(format)) return obj;
				// format help object
				text += `Name${type(obj.name, 1) === "arr" && obj.name.length > 1 ? "s" : ""}:`;
				if (["str", "mutstr"].incl( type(obj.name, 1) )) text += `\n\t${obj.name}`;
				else if (type(obj.name, 1) === "arr" && obj.name.length !== 0)
					for (var i = 0; i < obj.name.length; i++) text += `\n\t${obj.name[i]}`;
				else text += "\n\tunknown";
				text += "\n\n";
				if (obj.field != null) {
					text += `Field${type(obj.field, 1) === "arr" && obj.field.length > 1 ? "s" : ""}:`;
					if (["str", "mutstr"].incl( type(obj.field, 1) )) text += `\n\t${obj.field}`;
					else if (type(obj.field, 1) === "arr" && obj.field.length !== 0)
						for (var i = 0; i < obj.field.length; i++) text += `\n\t${obj.field[i]}`;
					else text += "\n\tunknown";
					text += "\n\n";
				}
				if (obj.method != null) {
					text += "Method:";
					if (["str", "mutstr"].incl( type(obj.method, 1) ))
						text += `\n\t${obj.method}`;
					else if (type(obj.method, 1) === "arr" && obj.method.length !== 0)
						for (var i = 0; i < obj.method.length; i++)
							text += `\n\t${obj.method[i]}`;
					else text += "\n\tunknown";
					text += "\n\n";
				}
				if (obj.isfunction && obj.arguments != null) {
					if (
						obj.arguments.number   != null ||
						obj.arguments.names    != null ||
						obj.arguments.defaults != null ||
						obj.arguments.types    != null
					)
						text += `Argument${obj.arguments.number > 1 ? "s" : ""}:`;
					if (obj.arguments.number != null) {
						text += "\n\n\tNumber of Arguments: ";
						if (["num", "bigint", "str", "mutstr"].incl( type(obj.arguments.number, 1) ))
							text += obj.arguments.number;
						else text += "unknown";
					}
					if (obj.arguments.names != null) {
						text += "\n\n\tNames:";
						if (["str", "mutstr"].incl( type(obj.arguments.names, 1) ))
							text += `\n\t\t${obj.arguments.names}`;
						else if (type(obj.arguments.names, 1) === "arr" && obj.arguments.names.length !== 0)
							for (var i = 0; i < obj.arguments.names.length; i++)
								text += `\n\t\t${obj.arguments.names[i]}`;
						else text += "\n\t\tunknown";
					}
					if (obj.arguments.defaults != null) {
						text += "\n\n\tDefaults:";
						if (["str", "mutstr"].incl( type(obj.arguments.defaults, 1) ))
							text += `\n\t\t${json.stringify(obj.arguments.defaults)}`;
						else if (type(obj.arguments.defaults, 1) === "arr" && obj.arguments.defaults.length !== 0)
							for (var i = 0; i < obj.arguments.defaults.length; i++)
								text += `\n\t\t${
									json.stringify(obj.arguments.defaults[i]) ||
									obj.arguments.defaults[i]?.toString?.() ||
									obj.arguments.defaults[i]
								}`;
						else text += "\n\t\tunknown";
					}
					if (obj.arguments.types != null) {
						text += "\n\n\tTypes:";
						if (["str", "mutstr"].incl( type(obj.arguments.types, 1) )) text += `\n\t\t${obj.arguments.types}`;
						else if (type(obj.arguments.types, 1) === "arr" && obj.arguments.types.length !== 0)
							for (var i = 0; i < obj.arguments.types.length; i++) text += `\n\t\t${obj.arguments.types[i]}`;
						else text += "\n\t\tunknown";
					}
					if (
						obj.arguments.number   != null ||
						obj.arguments.names    != null ||
						obj.arguments.defaults != null ||
						obj.arguments.types    != null
					)
						text += "\n\n";
				}
				text += "Description:";
				if (["str", "mutstr"].incl( type(obj.description, 1) ))
					text += `\n\t${obj.description}`.replace(/\n(?!\t)/g, "\n\t");
				else if (type(obj.description, 1) === "arr" && obj.description.length !== 0)
					for (var i = 0; i < obj.description.length; i++)
						text += `\n\t${obj.description[i]}`.replace(/\n(?!\t)/g, "\n\t");
				else text += "\n\tN/A";
				text += "\n\n";
				if (obj.miscellaneous != null) {
					text += "Miscellaneous Information:";
					if (["str", "mutstr"].incl( type(obj.miscellaneous, 1) ))
						text += `\n\t${obj.miscellaneous}`.replace(/\n(?!\t)/g, "\n\t");
					else if (type(obj.miscellaneous, 1) === "arr" && obj.miscellaneous.length !== 0)
						for (var i = 0; i < obj.miscellaneous.length; i++)
							text += `\n\t${obj.miscellaneous[i]}`.replace(/\n(?!\t)/g, "\n\t");
					else text += "\n\tN/A";
					text += "\n\n";
				}
				if (obj.see != null) {
					text += "Related Functions & Constants:";
					if (["str", "mutstr"].incl( type(obj.see, 1) ))
						text += `\n\t${obj.see}`.replace(/\n(?!\t)/g, "\n\t");
					else if (type(obj.see, 1) === "arr" && obj.see.length !== 0)
						for (var i = 0; i < obj.see.length; i++)
							text += `\n\t${obj.see[i]}`.replace(/\n(?!\t)/g, "\n\t");
					else text += "\n\tN/A";
				}
				text = prefixText + text.remove(/\n+$/);
				if (["s", "str", "string", "String", String, 1].incl(format)) return text;
				if (["c", "cl", "l", "log", "print", "Print", "Log", "console.log", console, console.log, 2].incl(format))
					return console.log(text), text;
				return "The requested format doesn't exist";
			}

			CHSolutionFunctions = (function create_CHSF() {
				// Continuum Hypothesis Solution Functions
				function indexToReal(n = 1n) {
					if (typeof n !== "bigint")
						throw Error`bigint argument is required for indexToReal()`;
					const a = bMath.sqrt(1n + 4n*n) + 1n >> 1n
						, b = n - a*(a - 1n) >> 1n;
					return `${n % 2n ? "-" : ""}${b}.` + `${a - b - 1n}`.reverse();
				}
				function realToIndex(string) {
					if (typeof string !== "string") throw Error`string argument required`;
					const match = /^-??(\d+)\.(\d+)$/.exec(string);
					if (match == null) throw Error`string number argument required`;
					const x = BigInt(match[1]), y = BigInt(match[2].reverse());

					return (x+y)**2n + 3n*x + y + BigInt(string[0] === "-")
				}

				indexToReal.inverse = realToIndex;
				realToIndex.inverse = indexToReal;

				return {
					getReal : indexToReal,
					inverse : realToIndex,
				};
			})()

			// Things planned to be implemented:

			// polygonal numbers
			// figurate numbers
			// nth dimentional triangular numbers
			// polynomial regression
			// basil functions
			// piApprox
			// solveQuartic
			// simplify tan(nx)
			// quantile
			// bell numbers
			// pell numbers
			// polylogarithms
			// Bernoulli numbers
			// K-function
			// vector dot product
			// vector cross product
			// catalan
			// determinant
			// line intersection
			// scalar operations
			// eigs matrix, eigs value
			// sets of things other than just real (non-bigint) numbers
			// Matrix
			// Vector
			// OrderedPair
			// matrix identity
			// matrix inverse
			// Kullback-Leibler (KL) divergence between two distributions.
			// kronecker product of 2 matrices or vectors.
			// nthrts, probably for cMath
			// coulomb
			// electrical things
			// p-adic integers
			// pisano period
			// perfect numbers
			// highly composite numbers
			// superior highly composite numbers
			// carmichael numbers
			// pseudoprimes
			// Barnes G-Function
			// Euler's totient function #(k < n st coprime(n,k))
		}
		, "math cMath": class ComplexMath {
			constructor(
				degTrig = LibSettings.cMath_DegTrig_Argument
				, help = LibSettings.cMath_Help_Argument
				,
			) {
				degTrig === "default" && (degTrig = !0);
				help === "default" && (help = !0);

				this.Complex = class Complex {
					constructor(re=0, im=0) {
						if (Number.isNaN(re = Number(re))) re = 0;
						if (Number.isNaN(im = Number(im))) im = 0;

						Object.is(re, -0) && (re = 0);
						Object.is(im, -0) && (im = 0);

						this.re = re;
						this.im = im;
					}
					__type__() { return "complex" }
					isComplex() { return !!this.im }
					toPolar(doubleStar=false) {
						return `${
							cMath.abs(this)
						}e${
							doubleStar ? "**" :  "^"
						}(${ this.arg() }i)`;
					}
					toString({polar=false, char="i", parens=false, doubleStar=false, exp=false}={}) {
						char = char[0] || "i";
						return polar ?
							`${cMath.abs(this)}${exp ? "exp(" : "e"}${exp ? "" : doubleStar ? "**" : "^"}${parens ? "(" : ""}${this.arg()}${char}${parens ? ")" : ""}${exp ? ")" : ""}`.remove(
								RegExp(`^1(?=e)|e\\^\\(0${char}\\)`, "g")
							).start("1").replace([/^0.*/, /0\./g], ["0", "."]) :
							this.re ? // rectangular
								this.im ?
									this.im > 0 ?
										`${this.re}+${this.im ===  1 ? ""  : this.im}${char}` :
										`${this.re}${ this.im === -1 ? "-" : this.im}${char}` :
									`${this.re}` :
								this.im ?
									this.im > 0 ?
										`${this.im ===  1  ? ""  : this.im}${char}` :
										`${this.im === -1  ? "-" : this.im}${char}` :
									"0";
					}
					toArr() { return [this.re, this.im] }
					toLList() { return this.toArr().toLList() /* to linked list */ }
					toRegObj() {
						// to regular object.
						// because for...of/in doesn't work with class objects ...
						// because of the non-enumerable properties
						return { re: this.re, im: this.im };
					}
					arg(form="radians") {
						return ["d", "deg", "degree", "degrees"].includes(form?.lower?.()) ?
							rMath.deg.atan2(this.re, this.im) :
							rMath.atan2(this.re, this.im);
					}
					add(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re + num.re,
							this.im + num.im
						);
						this.re += num.re;
						this.im += num.im;
						return this;
					}
					sub(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re - num.re,
							this.im - num.im
						);
						this.re -= num.re;
						this.im -= num.im;
						return this;
					}
					mul(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							this.re*num.re - this.im*num.im,
							this.re*num.im + this.im*num.re
						);
						const tmp = this.re;
						this.re = tmp*num.re - this.im*num.im;
						this.im = tmp*num.im + this.im*num.re;
						return this;
					}
					div(num, New=true) {
						if (typeof num !== "number" && type(num, 1) !== "complex")
							throw Error("Invalid input to function");
						typeof num === "number" && (num = new this.constructor(num, 0));
						if (New) return new this.constructor(
							(this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2),
							(this.im*num.re - this.re*num.im) / (num.re**2 + num.im**2)
						);
						const tmp = this.re;
						this.re = (this.re*num.re + this.im*num.im) / (num.re**2 + num.im**2);
						this.im = (this.im*num.re - tmp*num.im) / (num.re**2 + num.im**2);
						return this;
					}
					floor(New=true) {
						if (New) return new this.constructor(
							floor(this.re),
							floor(this.im)
						);
						this.re = floor(this.re);
						this.im = floor(this.im);
						return this;
					}
					ceil(New=true) {
						if (New) return new this.constructor(
							ceil(this.re),
							ceil(this.im)
						);
						this.re = ceil(this.re);
						this.im = ceil(this.im);
						return this;
					}
					round(New=true) {
						if (New) return new this.constructor(
							round(this.re),
							round(this.im)
						);
						this.re = round(this.re);
						this.im = round(this.im);
						return this;
					}
					frac(New=true) {
						if (New) return new this.constructor(
							fpart(this.re),
							fpart(this.im)
						);
						this.re = fpart(this.re);
						this.im = fpart(this.im);
						return this;
					}
					pow(num, New=true) {
						typeof num === "number" && (num = new this.constructor(num, 0));

						if (!this.im && !num.im) return new this.constructor(this.re ** num.re, 0);
						if (type(num, 1) !== "complex") return NaN;

						const r = (this.re**2+this.im**2) ** (num.re/2) / e ** ( num.im*this.arg(this) ),
							θ = num.re*this.arg() + num.im*rMath.ln( this.abs() )
						if (New) return new this.constructor(
							r * rMath.cos(θ),
							r * rMath.sin(θ)
						);
						this.re = r * rMath.cos(θ);
						this.im = r * rMath.sin(θ);
						return this;
					}
					exp(New=true) {
						const r = e ** this.re;
						if (New) return new this.constructor(
							r * rMath.cos(this.im),
							r * rMath.sin(this.im)
						);
						this.re = r * rMath.cos(this.im);
						this.im = r * rMath.sin(this.im);
					}
					fpart(New=true) { return this.frac(New) }
					abs() { return cMath.abs(this) }
				};
				this.lnNeg1       = this.new(0, π);
				this.lni          = this.new(0, π_2);
				this.i            = this.new(0, 1);
				this.pi  = this.π = this.new(π, 0);
				this.tau = this.new(tau, 0);
				this.e   = this.new(e, 0);

				if (degTrig) this.deg = {};
				if (help) this.help = {};
			}
			new(re=0, im=0) {
				if (type(re, 1) === "complex") return this.new(re.re, re.im);
				isArr(re) && ([re, im] = re);
				if (rMath.isNaN(re) || rMath.isNaN(im)) return NaN;

				if (typeof re === "number" && typeof im === "number")
					return new this.Complex(re, im);
				return NaN;
			}
			complex(/*re=0, im=0*/) { return this.new.apply(this, arguments) }
			add(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re + b.re, a.im + b.im);
			}
			sub(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re - b.re, a.im - b.im);
			}
			mul(a, b)  {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(a.re*b.re - a.im*b.im, a.re*b.im + b.re*a.im);
			}
			div(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.new(
						(a.re*b.re + a.im*b.im) / (b.re**2 + b.im**2),
						(a.im*b.re - a.re*b.im) / (b.re**2 + b.im**2)
					);
			}
			fdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.floor( this.div(a, b) );
			}
			cdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.ceil( this.div(a, b) );
			}
			rdiv(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" && type(b, 1) !== "complex" ?
					NaN :
					this.round( this.div(a, b) );
			}
			mod(a, b) {
				typeof a === "number" && (a = this.new(a, 0));
				typeof b === "number" && (b = this.new(b, 0));
				return type(a, 1) !== "complex" || type(b, 1) !== "complex" ?
					NaN :
					this.sub(
						a,
						this.mul(
							b,
							this.floor( this.div(a, b) )
						)
					)
				// a - b*floor(a/b)
			}
			floor(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					floor(z.re),
					floor(z.im),
				);
			}
			ceil(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					ceil(z.re),
					ceil(z.im),
				);
			}
			round(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					round(z.re),
					round(z.im),
				);
			}
			arg(z, n=0, form="rad") {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return form === "degrees" || form === "deg" || form === "d" ?
					rMath.deg.atan2(z.re, z.im) + 360*int(n) :
					rMath.atan2(z.re, z.im) + tau*int(n);
			}
			ln(z, n=0) {
				if (typeof z === "number") return z < 0 ?
					this.new( rMath.ln(-z), π ) :
					!z ?
						NaN :
						this.new( rMath.ln(z), 0 );

				if (type(z, 1) !== "complex") return NaN;
				return this.new(
					rMath.ln( this.abs(z) ),
					this.arg(z, int(n))
				);
				// ln(0 + bi) = ln|b| + isgn(b)π/2
				// ln(z) = ln|z| + Arg(z)i
			}
			log(z, base=null, n=0) {
				typeof z === "number" && (z = this.new(z, 0));
				typeof base === "number" && (base = this.new(base, 0));
				if (base === null) return this.ln(z, n);
				if (type(z, 1) !== "complex") return NaN;
				if (type(base, 1) !== "complex") return NaN;
				return this.ln(z, n).div( this.ln(base, n) );
				// log_{a+bi}(c+di) = ln(c+di) / ln(a+bi)
			}
			logbase(base, z, n=0) {
				typeof base === "number" && (base = this.new(base, 0));
				typeof z === "number" && (z = this.new(z, 0));
				if (type(base, 1) !== "complex") return NaN;
				if (type(z, 1) !== "complex") return NaN;
				return this.log( z, base, n );
			}
			pow(z1, z2, n=0) {
				typeof z1 === "number" && (z1 = this.new(z1, 0));
				typeof z2 === "number" && (z2 = this.new(z2, 0));

				if (!z1.im && !z2.im) {
					let pow = z1.re ** z2.re;
					if (Number.isNaN(pow)) return this.new(0, (-z1.re) ** z2.re);
					return this.new(z1.re ** z2.re, 0);
				}
				if (type(z1, 1) !== "complex") return NaN;
				if (type(z2, 1) !== "complex") return NaN;

				const r = (z1.re**2 + z1.im**2) ** (z2.re / 2)  /  rMath.e ** ( z2.im*this.arg(z1, n) ),
					θ = z2.re*this.arg(z1, n) + z2.im*rMath.ln(this.abs(z1))
				//re^iθ = rcosθ + risinθ
				return this.new(r*rMath.cos(θ), r*rMath.sin(θ));
			}
			exp(z) {
				typeof z === "number" && (z = this.new(z, 0));
				return this.pow(this.e, z);
			}
			expi(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				const r = e ** -z.im;
				return this.new( r*rMath.cos(z.re), r*rMath.sin(z.re) );
			}
			cis(/*z*/) { return this.expi.apply(this, arguments) }
			abs(z) {
				if (typeof z === "number") return rMath.abs(z);
				if (type(z, 1) !== "complex") return NaN;
				return rMath.hypot(z.re, z.im);
			}
			sgn(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.div(z, this.abs(z) );
				// exp(i arg num);
				// |z| sgn(z) = z <==> sgn(z) = z/|z|
			}
			sign(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.sgn(z);
			}
			nthrt(z, rt=2, n=0) {
				typeof z === "number" && (z = this.new(z, 0));
				typeof rt === "number" && (rt = this.new(rt, 0));
				if (type(z, 1) !== "complex") return NaN;
				if (type(rt, 1) === "complex") {
					let c2d2 = rt.re**2 + rt.im**2;
					return this.pow(z, this.new(rt.re/c2d2, -rt.im/c2d2));
				}
				if (typeof rt !== "number") return NaN;

				return this.exp(
					this.new( 0, this.arg(z, n) / rt )
				).mul(
					rMath.nthrt( this.abs(z), rt )
				);
			}
			sqrt(z) {
				return typeof z !== "number" && type(z, 1) !== "complex" ?
					NaN :
					this.nthrt(z, 2);
			}
			cbrt(z) {
				typeof z === "number" && (z = this.new(z, 0));
				if (type(z, 1) !== "complex") return NaN;
				return this.nthrt(z, 3);
			}
			rect(r, θ) {
				/* polar to rectangular */
				typeof r === "number" && (r = this.new(r, 0));
				typeof θ === "number" && (θ = this.new(θ, 0));
				if (type(r, 1) !== "complex") return NaN;
				if (type(θ, 1) !== "complex") return NaN;
				return this.exp(θ).mul(r);
			}
			isClose(z1, z2, range=Number.EPSILON) {
				typeof z1 === "number" && (z1 = this.new(z1, 0));
				typeof z2 === "number" && (z2 = this.new(z2, 0));
				if (type(z1, 1) !== "complex") return NaN;
				if (type(z2, 1) !== "complex") return NaN;
				return rMath.isClose(this.abs(z1), this.abs(z2), range) &&
					rMath.isClose(z1.re, z2,re, range) &&
					rMath.isClose(z1.im, z2,im, range);
			}
			sum(n, last, func=z=>z, inc=1) {
				typeof n === "number" && (n = this.new(n, 0));
				typeof last === "number" && (last = this.new(last, 0));
				typeof inc === "number" && (inc = this.new(inc, 0));
				// complex less than or equal to
				// comp let
				const complet = (a, b) => !a.im && !b.im ?
					a.re <= b.re :
					!a.re && !b.re ?
					a.im <= b.im :
					this.abs(a) <= this.abs(b);
				
				if (type(n, 1) !== "complex") return NaN;
				if (type(last, 1) !== "complex") return NaN;
				if (type(func, 1) !== "func") return NaN;
				if (type(inc, 1) !== "complex") return NaN;

				for ( var total = this.new(0, 0) ; complet(n, last) ; n.add(inc, 0) )
					total.add( func(n, 0), 0 );
				return total;
			}
			conjugate(z) { return type(z, 1) !== "complex" ? NaN : this.new(z.re, -z.im) }
			inverse(z) { return type(z, 1) !== "complex" ? NaN : this.new(1/z.re, 1/z.im) }
			isPrime(z) {
				// TODO/FIN: implement
				if (typeof z === "number") return z.isPrime();
				if (type(z, 1) !== "complex") return NaN;
				throw Error("Not Implemented");
			}
		}
		, "math fMath": class FractionalStringMath {
			// TODO: Make the functions convert numbers into fractions if they are inputed
			constructor(
				help = LibSettings.fMath_Help_Argument
				, degTrig = LibSettings.fMath_DegTrig_Argument
				,
			) {
				help === "default" && (help = !0);
				degTrig === "default" && (degTrig = !0);

				this.Fraction = class Fraction {
					constructor(numerator="1.0", denominator="1.0") {
						if (Number.isNaN(numerator = sMath.new(numerator, NaN)) ||
							Number.isNaN(denominator = sMath.new(denominator, NaN)))
							throw Error("fMath.Fraction() requires string number arguments.");
						if (sMath.eq.iz(denominator)) throw Error("fMath.Fraction() cannot have a zero denominator");
						var gcd = sMath.gcd(numerator, denominator);
						this.numer = sMath.div(numerator, gcd);
						this.denom = sMath.div(denominator, gcd);
					}
					__type__() { return "fraction" }
				};
				this.one = this.new("1.0", "1.0"); // can't move to before the class declaration
				if (help) this.help = {
					"Fraction": "create a new fraction. takes 2 string number arguments. for the numerator then denominator.",
				};
				if (degTrig) this.deg = {};
			}
			new(numerator="1.0", denominator="1.0") { return new this.Fraction(numerator, denominator) }
			fraction(numerator="1.0", denominator="1.0") { return this.new(numerator, denominator) }
			simplify(fraction) { return this.simp(fraction) }
			simp(fraction) {
				["number", "bigint", "string"].incl( type(fraction) ) && (fraction = this.new(numStrNorm(fraction), "1.0"));
				if (type(fraction, 1) !== "fraction") return NaN;
				if ( sMath.isNaN(fraction.numer) ) return NaN;
				if ( sMath.isNaN(fraction.denom) ) return NaN;
				var gcd = sMath.gcd(fraction.numer, fraction.denom);
				return this.new(
					sMath.idiv(fraction.numer, gcd),
					sMath.idiv(fraction.denom, gcd),
				);
			}
			add(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(
					this.new(
						sMath.add( sMath.mul(a.numer, b.denom), sMath.mul(b.numer, a.denom) ),
						sMath.mul(a.denom, b.denom)
					)
				);
			}
			sub(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp(
					this.new(
						sMath.sub( sMath.mul(a.numer, b.denom), sMath.mul(b.numer, a.denom) ),
						sMath.mul(a.denom, b.denom),
					)
				);
			}
			mul(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp( this.new(sMath.mul(a.numer, b.numer), sMath.mul(a.denom, b.denom)) );
			}
			div(a, b) {
				if (type(a, 1) !== "fraction" || type(b, 1) !== "fraction") return NaN;
				return this.simp( this.new(sMath.mul(a.numer, b.denom), sMath.mul(a.denom, b.numer)) );
			}
		}
		, "math cfMath": class ComplexFractionalStringMath {
			constructor( help = LibSettings.cfMath_Help_Argument ) {
				help === "default" && (help = !0);

				this.CFraction = class ComplexFraction {
					constructor(re=fMath.one, im=fMath.one) {
						if (type(re, 1) !== "fraction" || type(im, 1) !== "fraction")
							throw TypeError("cfMath.CFraction requires 2 fractional arguments.");
						this.re = fMath.simp(re);
						this.im = fMath.simp(im);
					}
				};

				if (help) this.help = {
					CFraction: null,
				};
			}
			new(re=fMath.one, im=fMath.one) { return new this.CFraction(re, im) }
		}
		, "math call aMath"() {
			// name of math object
			var _getNameOf = obj => keyof(globalThis.MathObjects, obj, 1, (a, b) => a === b)
			// get prototype's properties
			, _protoProps = e => Reflect.ownKeys(e.constructor.prototype) // e.__proto__
			, _typeToObj = {
				// use type(x, thing!)
				num : rMath, bigint : bMath, fraction : fMath, // string : sMath,
				str : sMath, mutstr : sMath, complex  : cMath, // number : rMath,
			};
			function _call(fname, typ=null, ...args) {
				typ === null && (typ = type(args[0], 1));
				var fn = _typeToObj?.[typ?.lower?.()]?.[fname];
				if (fn) return fn.apply( _typeToObj[typ], args );
				if (_typeToObj[typ] !== void 0)
					throw Error(`${_getNameOf(_typeToObj[typ])}["${fname}"] doesn't exist`);
				/*else*/
				throw Error(`there is no Math object for type '${typ}'. (type(x, 1) was used). see ${LibSettings.Environment_Global_String}.MathObjects for all Math objects`);
			}
			function _call_attr(fname, attr, typ=null, ...args) {
				typ === null && (typ = type(args[0], 1));
				var fn = _typeToObj?.[typ?.lower?.()]?.[attr]?.[fname];
				if (fn) return fn.apply( _typeToObj[typ], args );
				if (_typeToObj[typ] !== void 0)
					throw Error(`${_getNameOf(_typeToObj[typ])}["${fname}"] doesn't exist`);
				/*else*/
				throw Error(`there is no Math object for type '${typ}'. (type(x, 1) was used). see ${LibSettings.Environment_Global_String}.MathObjects for all Math objects`);
			}

			class AllMath { // aMath will call the correct function based upon the inputs' types
				constructor() {
					if (LibSettings.aMath_Help_Argument)
					this.help = `see the help attributes of the other math functions, which are at '${
						LibSettings.Environment_Global_String
					}.MathObjects'.  'this' refers to the current AllMath object. this._internals.call() ${""
					}and this._internals.call_attr() just call functions from the correct math object. ${""
					}call_attr() uses the correct attribute from the math object. not all the functions are ${""
					}guaranteed to work for all types. this._internals._getNameOf() gets the name of a math ${""
					}object given the object. this._internals._typeToObj gives the corresponding math object ${""
					}based on the type (the key).`;
				}
			}
			for (const fname of Object.values(MathObjects).map(e => _protoProps(e)).flat().remrep().remove("constructor"))
				AllMath.prototype[fname] = function () { return _call(fname, null, ...arguments) }
			if (LibSettings.aMath_DegTrig_Argument) {
				AllMath.prototype.deg = {};
				for (const fname of Reflect.ownKeys(rMath.deg))
					AllMath.prototype.deg[fname] = function () { return _call_attr(fname, "deg", null, ...arguments) }
			}
			if (LibSettings.aMath_Comparatives_Argument) {
				AllMath.prototype.eq = {};
				for (const fname of [].concat(
					Reflect.ownKeys(rMath.deg)
					, Reflect.ownKeys(sMath.deg)
					, Reflect.ownKeys(bMath.deg)
					,
				)) AllMath.prototype.eq[fname] = function () { return _call_attr(fname, "eq", null, ...arguments) }
			}
			if (LibSettings.aMath_Internals_Argument) AllMath.prototype._internals = {
				  _call       : _call
				, _call_attr  : _call_attr
				, _getNameOf  : _getNameOf
				, _protoProps : _protoProps
				, _typeToObj  : _typeToObj
			};
			return new AllMath;
		}
		, "defer call Types"() {
			return {
				Function  : Function
				, Boolean : Boolean
				, String  : String
				, RegExp  : RegExp
				, BigInt  : BigInt
				, Number  : Number
				, Array   : Array
				,  Int8Array        : Int8Array
				, Uint8Array        : Uint8Array
				,  Int16Array       : Int16Array
				, Uint16Array       : Uint16Array
				,  Int32Array       : Int32Array
				, Uint32Array       : Uint32Array
				, ArrayBuffer       : ArrayBuffer
				, Float32Array      : Float32Array
				, Float64Array      : Float64Array
				,  BigInt64Array    : BigInt64Array
				, BigUint64Array    : BigUint64Array
				, Uint8ClampedArray : Uint8ClampedArray
				, Object(input, handle=!1) {
					return typeof input === "object" ?
						input :
						handle == !0 ?
							{ data: input } :
							void 0
				}
				, Symbol(input, handle=!1) {
					return typeof input === "symbol" ?
						input :
						handle == !0 ?
							Symbol.for(input) :
							void 0
				}
				, undefined() {}
				, null() { return null }
				, dict          : dict
				, RealSet       : rMath.Set
				, Complex       : cMath.Complex
				, Fraction      : fMath.Fraction
				, CFraction     : cfMath.CFraction
				, LinkedList    : LinkedList
				, MutableString : MutableString
				,
			}
		}
		, "defer call local finalize_math"() {
			function definer(obj, name, value, writable=!0, enumerable=!1, configurable=!0) {
				return Reflect.defineProperty(obj, name, {
					value: value
					, writable: writable
					, enumerable: enumerable
					, configurable: configurable
				});
			}
			for (let obj of Reflect.ownKeys(MathObjects).map(s => MathObjects[s]))
				Reflect.ownKeys(MathObjects).forEach( s => definer(obj, s, MathObjects[s]) )
				, definer(obj, "+", obj.add), definer(obj, "-", obj.sub)
				, definer(obj, "*", obj.mul), definer(obj, "/", obj.div)
				, definer(obj, "^", obj.pow), definer(obj, "%", obj.mod)
				, definer(obj, "∫", obj.int), definer(obj, "Σ", obj.sum)
				, definer(obj, "Π", obj.prod), definer(obj, "√", obj.sqrt)
				, definer(obj, "**", obj.pow), definer(obj, "e^", obj.exp)
				, definer(obj, "∛", obj.cbrt), definer(obj, "!", obj.ifact)
				, definer(obj, "Γ", obj.gamma), definer(obj, "//", obj.fdiv);

			definer(MathObjects, "Math", rMath.Math, !1, !1, !1);
			// TODO/FIN: remove "**" after sMath.pow exists
			definer(sMath, "**", sMath.ipow);
			definer(sMath, "^", sMath.ipow);
			definer(sMath, "ℙ", sMath.P);

			define( (LibSettings.Alert_Conflict_For_Math !== "default" && LibSettings.Alert_Conflict_For_Math ?
				"" : "overwrite ") + (LibSettings.Output_Math_Variable === "default" ?
					"Math" : LibSettings.Output_Math_Variable), 0, globalThis, MathObjects[ LibSettings.
				Input_Math_Variable === "default" ? "rMath" : LibSettings.Input_Math_Variable ]
			);
			return void 0;
		}
		,
		};
		if (LibSettings.Global_Library_Object_Name != null) LIBRARY_VARIABLES [
			LibSettings.Global_Library_Object_Name === "default" ?
				"LIBRARY_VARIABLES" :
				LibSettings.Global_Library_Object_Name
		] = LIBRARY_VARIABLES;
	}
	/* Conflict & Assignment: */ {

		--> assignment and conflict things

		for (const key of Reflect.ownKeys(LIBRARY_VARIABLES))
			define(key, 0);

		--> document things

		if (LibSettings.Use_Document) {
			let _ael = EventTarget.prototype.addEventListener
				, _rel = EventTarget.prototype.removeEventListener
				, listeners = dict()
				, _click = HTMLElement.prototype.click;

			function addEventListener(Type, listener=null, options={
				capture    : false
				, passive  : false
				, once     : false
				, type     : arguments[0]
				, listener : arguments[1]
				,
			})
			{
				typeof options === "boolean" && (options = {
					capture  : options,
					passive  : !1,
					once     : !1,
					type     : Type,
					listener : listener
				});

				_ael.call(this, Type, listener, options);

				if (listeners[Type] === void 0) listeners[Type] = [];

				listeners[Type].push({
					object   : this,
					capture  : options.capture,
					passive  : options.passive,
					once     : options.once,
					type     : options.type,
					listener : options.listener
				});
				return this;
			}
			function removeEventListener(Type, listener=null, options={
				capture    : false
				, passive  : false
				, once     : false
				, type     : arguments[0]
				, listener : arguments[1]
				,
			})
			{
				typeof options === "boolean" && (options = {
					capture  : options,
					passive  : !1,
					once     : !1,
					type     : Type,
					listener : listener
				});

				_rel.call(this, Type, listener, options);

				for (var i = listeners[Type]?.length; i --> 0 ;) {
					if (listeners[Type][i].capture  === options.capture  &&
						listeners[Type][i].passive  === options.passive  &&
						listeners[Type][i].once     === options.once     &&
						listeners[Type][i].type     === options.type     &&
						listeners[Type][i].listener === options.listener
					) listeners[Type].splice(i, 1);
				}
				return this;
			}
			function getEventListeners() {
				// gets all event listeners for all objects.
				return listeners;
			}
			function getMyEventListeners() {
				// gets all event listeners on the current EventTarget object the function is called from
				return dict.fromEntries(
					listeners.entries().map( e => {
						const value = e[1].filter(e => e.object === (this || globalThis));
						return value.length ? [e[0], value] : [];
					}).filter(e => e.length)
				);
			}
			function click(times=1) {
				if (Number.isNaN( times = Number(times) )) times = 1;
				while (times --> 0) _click.call(this);
				return this;
			}

			addEventListener._ael = _ael; // doesn't actually work. just for storing purposes
			removeEventListener._rel = _rel; // doesn't actually work. just for storing purposes
			click._click = _click; // doesn't actually work. just for storing purposes

			EventTarget.prototype.ael   = EventTarget.prototype.addEventListener    = addEventListener    ;
			EventTarget.prototype.rel   = EventTarget.prototype.removeEventListener = removeEventListener ;
			EventTarget.prototype.gel   = EventTarget.prototype.getEventListeners   = getEventListeners   ;
			EventTarget.prototype.gml   = EventTarget.prototype.getMyEventListeners = getMyEventListeners ;
			HTMLElement.prototype.click = click;
			// window should probably work fine here because there is no document anyway in NodeJS, but it doesn't hurt
			Document.prototype.click = function click(times=1) { return globalThis.document.head.click(times) }
			// document.all == null for some reason.
			document.doctype && document.all !== void 0 && (document.all.doctype = document.doctype);

			if (
				LibSettings.Creepily_Watch_Every_Action &&
				LibSettings.Creepily_Watch_Every_Action !== "default"
			)
			{
				let log = console.log;
				document.ael("click"            , e => { log(e.type); this[e.type] = e });
				document.ael("dblclick"         , e => { log(e.type); this[e.type] = e });
				document.ael("auxclick"         , e => { log(e.type); this[e.type] = e });
				document.ael("contextmenu"      , e => { log(e.type); this[e.type] = e });
				document.ael("mousemove"        , e => { log(e.type); this[e.type] = e });
				document.ael("mousedown"        , e => { log(e.type); this[e.type] = e });
				document.ael("mouseup"          , e => { log(e.type); this[e.type] = e });
				document.ael("mouseover"        , e => { log(e.type); this[e.type] = e });
				document.ael("mouseout"         , e => { log(e.type); this[e.type] = e });
				document.ael("mouseenter"       , e => { log(e.type); this[e.type] = e });
				document.ael("mouseleave"       , e => { log(e.type); this[e.type] = e });
				document.ael("wheel"            , e => { log(e.type); this[e.type] = e });
				document.ael("pointerover"      , e => { log(e.type); this[e.type] = e });
				document.ael("pointerout"       , e => { log(e.type); this[e.type] = e });
				document.ael("pointerenter"     , e => { log(e.type); this[e.type] = e });
				document.ael("pointerleave"     , e => { log(e.type); this[e.type] = e });
				document.ael("pointerdown"      , e => { log(e.type); this[e.type] = e });
				document.ael("pointerup"        , e => { log(e.type); this[e.type] = e });
				document.ael("pointermove"      , e => { log(e.type); this[e.type] = e });
				document.ael("pointercancel"    , e => { log(e.type); this[e.type] = e });
				document.ael("gotpointercapture", e => { log(e.type); this[e.type] = e });
				document.ael("drag"             , e => { log(e.type); this[e.type] = e });
				document.ael("dragstart"        , e => { log(e.type); this[e.type] = e });
				document.ael("dragend"          , e => { log(e.type); this[e.type] = e });
				document.ael("dragover"         , e => { log(e.type); this[e.type] = e });
				document.ael("dragenter"        , e => { log(e.type); this[e.type] = e });
				document.ael("dragleave"        , e => { log(e.type); this[e.type] = e });
				document.ael("drop"             , e => { log(e.type); this[e.type] = e });
				document.ael("keypress"         , e => { log(e.type); this[e.type] = e });
				document.ael("keydown"          , e => { log(e.type); this[e.type] = e });
				document.ael("keyup"            , e => { log(e.type); this[e.type] = e });
				document.ael("copy"             , e => { log(e.type); this[e.type] = e });
				document.ael("paste"            , e => { log(e.type); this[e.type] = e });
				document.ael("beforecopy"       , e => { log(e.type); this[e.type] = e });
				document.ael("beforepaste"      , e => { log(e.type); this[e.type] = e });
				document.ael("beforecut"        , e => { log(e.type); this[e.type] = e });
				document.ael("input"            , e => { log(e.type); this[e.type] = e });
				document.ael("devicemotion"     , e => { log(e.type); this[e.type] = e });
				document.ael("deviceorientation", e => { log(e.type); this[e.type] = e });
				document.ael("DOMContentLoaded" , e => { log(e.type); this[e.type] = e });
				document.ael("scroll"           , e => { log(e.type); this[e.type] = e });
				document.ael("touchstart"       , e => { log(e.type); this[e.type] = e });
				document.ael("touchmove"        , e => { log(e.type); this[e.type] = e });
				document.ael("touchend"         , e => { log(e.type); this[e.type] = e });
				document.ael("touchcancel"      , e => { log(e.type); this[e.type] = e });
				this    .ael("load"             , e => { log(e.type); this[e.type] = e });
				this    .ael("focus"            , e => { log(e.type); this[e.type] = e });
				this    .ael("resize"           , e => { log(e.type); this[e.type] = e });
				this    .ael("blur"             , e => { log(e.type); this.blurevt = e });
			}

			if (LibSettings.Run_KeyLogger === "default" ? !1 : LibSettings.Run_KeyLogger) {
				let debug = LibSettings.KeyLogger_Debug_Argument === "default" ?
					!1 : LibSettings.KeyLogger_Debug_Argument
				, variable = LibSettings.KeyLogger_Variable_Argument === "default" ?
					Symbol.for('keys') :
					LibSettings.KeyLogger_Variable_Argument
				, copy_object = LibSettings.KeyLogger_Copy_Obj_Argument === "default" ?
					!0 : LibSettings.KeyLogger_Copy_Obj_Argument
				, type = LibSettings.KeyLogger_Type_Argument === "default" ?
					"keydown" : LibSettings.KeyLogger_Type_Argument;

				const handler = e => {
					globalThis[variable] += e.key;
					debug && console.log(`${typ} detected: \`${e.key}\`\nkeys: \`${globalThis[variable]}\`\nKeyboardEvent Object: %o`, e);
					copy_object && (globalThis.keypressObj = e);
				};

				define("stopKeylogger", 0, globalThis, function stopKeylogger() {
					var alert =  LibSettings.KeyLogger_Alert_Start_Stop || LibSettings.KeyLogger_Debug_Argument
					, type = LibSettings.KeyLogger_Debug_Argument;
					type === "default" && (type = "keydown");
					alert && console.log("keylogger manually terminated.");
					document.body.removeEventListener(type, handler);
					return !0;
				});

				(function key_logger_v3() {
					if (globalThis[variable] !== void 0) return debug &&
						console.log(`${LibSettings.Environment_Global_String}[${variable}] is already defined.\nkeylogger launch failed`);
					globalThis[variable] = "";
					document.body.ael(type, handler);
					(debug || LibSettings.KeyLogger_Alert_Start_Stop) && console.log(`Keylogger started\nSettings:\n\tdebug: ${
						LibSettings.KeyLogger_Debug_Argument
					}${
						LibSettings.KeyLogger_Debug_Argument === "default" ? ` (${debug})` : ""
					}\n\tvariable: ${ LibSettings.KeyLogger_Variable_Argument === "default" ? `default (${
							LibSettings.Environment_Global_String
						}[Symbol.for('keys')])` : `${ LibSettings.Environment_Global_String
						}[${ LibSettings.KeyLogger_Variable_Argument
						}]`
					}\n\tcopy obj to ${ LibSettings.Environment_Global_String
					}.keypressObj: ${ LibSettings.KeyLogger_Copy_Obj_Argument
					}${ LibSettings.KeyLogger_Copy_Obj_Argument === "default" ? ` (${copy_object})` : ""
					}\n\ttype: ${ LibSettings.KeyLogger_Type_Argument
					}${ LibSettings.KeyLogger_Type_Argument === "default" ? ` (${type})` : ""
					}`);
				})();
			}
			else if (LibSettings.KeyLogger_Alert_Unused && LibSettings.KeyLogger_Alert_Unused !== "default")
				console.log("keylogger launch failed due to library settings");
		}
	}
	/* Error Handling & Exiting: */ {
		for (const s of DEFER_ARR) define(s, 1);
		for (const s of LOCAL_DEFER_ARR) define(s, 1);
		if (LibSettings.Freeze_Math_Objects && LibSettings.Freeze_Math_Objects !== "default") {
			for (let o of Object.values(MathObjects)) Object.freeze(o);
			Object.freeze(MathObjects);
		}
		LIBRARY_VARIABLES.settings = LibSettings; // this will not be defined globally ...
		// but it makes it much easier to access the settings.
		if (LibSettings.Freeze_Library_Object && LibSettings.Freeze_Library_Object !== "default")
			Object.freeze(LIBRARY_VARIABLES);
		if (!LibSettings.rMath_Help_Argument) rMath.getHelpString = void 0; // delete doesn't work


		const CONFLICT_ARR2 = Array.from(CONFLICT_ARR);
		if (LibSettings.Alert_Conflict_OverWritten && CONFLICT_ARR2.length) {
			switch (LibSettings.ON_CONFLICT) {
				case "crash": throw Error("there was a conflict and the program hasn't crashed yet.");
				case "assert":
					console.assert(!1, "Global Variables Overwritten: %o", CONFLICT_ARR2);
					break;
				case "debug": console.debug("Global Variables Overwritten: %o", CONFLICT_ARR2); break;
				case "info": console.info("Global Variables Overwritten: %o", CONFLICT_ARR2); break;
				case "warn": console.warn("Global Variables Overwritten: %o", CONFLICT_ARR2); break;
				case "error": console.error("Global Variables Overwritten: %o", CONFLICT_ARR2); break;
				case "log": console.log("Global Variables Overwritten: %o", CONFLICT_ARR2); break;
				case "alert":
					LibSettings.Use_Document &&
						alert(`Global Variables Overwritten: ${CONFLICT_ARR2.join(", ")}`);
					break;
				case "return": return `Global Variables Overwritten: ${CONFLICT_ARR2.join(", ")}`;
				case "throw": throw `Global Variables Overwritten: ${CONFLICT_ARR2.join(", ")}`;
				// case "cry": break;
				// case "debugger": break;
				// case "none": break;
				// default: break;
			}
			if (LibSettings.ON_CONFLICT !== "cry" && LibSettings.ON_CONFLICT !== "debugger") {
				LibSettings.ON_CONFLICT === "none" ||
					console.debug(`${LibSettings.LIBRARY_NAME} encountered variable conflicts`);
				return 1;
			}
		}
		LibSettings.Alert_Library_Load_Finished && LibSettings.Alert_Library_Load_Finished !== "default" && (
			LibSettings.Library_Startup_Function === "default" ? console.log : LibSettings.Library_Startup_Function
		)( LibSettings.Library_Startup_Message === "default" ? `${LibSettings.LIBRARY_NAME} loaded` : LibSettings.Library_Startup_Message );
		return 0;
	}
})(); /*
	var piApprox = (function create_piApprox() {
		var a = n => n ? (a(n-1) + b(n-1)) / 2 : 1
		, b = n => n ? (a(n-1) * b(n-1))**.5 : Math.SQRT1_2
		, t = n => n ? t(n-1) - 2**(n-1) * (a(n-1) - a(n))**2 : .25
		, piApprox = n => a(n+1)**2 / t(n);
		return piApprox;
	})();

	// sMath.sqrt, sMath.pow


	var piApproxStr = (function create_piApproxStr() {
		var a = n => n ? sMath.div( sMath.add(a(n-1), b(n-1)) , 2 ) : "1.0"
		, b = n => n ? sMath.sqrt(sMath.mul(a(n-1), b(n-1))) : "0.7071067811865476"
		, t = n => n ? t(n-1) - sMath.mul(sMath.ipow("2.0", sMath.new(n-1)), sMath.square(sMath.sub(a(n-1), a(n)))) : "0.25"
		, piApproxStr = n => sMath.div(sMath.square(a(n+1)), t(n));
		return piApproxStr;
	})();
*//*
					1                             1     x     5
   ----------------------------------- ≈ tan(x), --- ≤ --- ≤ ---
	 √12         /  3       3  \                  6     π     6
	----- cos ⁻¹ | --- x - --- | - √3
	  π          \  π       2  /

	cos⁻¹(-x) = π - cos⁻¹(x)

	f(x) := cos(πx)
	g(x) := sin(πx)
	s(x) := sgn([x mod 2] - 1/2) · sgn([x mod 2] - 3/2)
	mean(a, b) := (a + b)/2
	1 / s(x) := s(x) // so there is no 1/0 nonsense.
	identities:
		f(-x) = f(x)
		f(x) = s(x)√[1-f²(1/2 - x)]
		f(x + n) = (1-2[n mod 2])·f(x)
			f(x + 1) = -f(x)
			f(x + 2) = f(x)
		f(1/2 - x) = g(x)
		f(1/2 + x) = √[1-f²(x)]·sgn([x mod 2] - 1)
		f(a + b) = f(a)·f(b) - f(1/2 - a)·f(1/2 - b)
		sgn[f(x)] = s(x)
		f(x) = s(x)·√([1 - f(2x)] / 2) = 2f²(x/2)-1
		f(c+x) + f(c-x) = 2f(x)·f(cx)
		f(x) = f(3x) / [2f(2x) - 1]
		f(x) = [2f(2x/3)-1]·f(x/3)
		f(x) - f(y) = 2f([1+x±y]/2)·f([1-x±y]/2)
		f(3x) = f(x) - 2√[ (1-f²x)·(1-f²2x) ]·sgn([x mod 2] - 1)·sgn(2[x mod 1] - 1)
*/

///// experimental things

document._createCDATASection = (function create__createCDATASection() {
	const doc = new Document;
	function createCDATASection(text="") { return doc.createCDATASection(text) }
	return createCDATASection._document = doc, createCDATASection;
})();
var _printCallStack = (function create_printCallStack() {
	function demargin(fn) {
		var code = fn + "", tabs = code.match(/\n(\s*)}$/)?.[1];

		return tabs == null ?
			code :
			code.remove( RegExpg("(?<=\n)" + tabs, "g") );
	}

	function printCallStack() {
		for (var current = arguments[0] === true ? arguments.callee : arguments.callee.caller, i = 1;
			current !== null;
			current = current.caller
		) console.log(
			"--------------------------------------------------------------------------------\nindex: %o    name: %o    arguments: %o\n%s",
			i++,
			current.name,
			Array.from(current.arguments),
			demargin(current)
		);
		console.log(null);
	}
	printCallStack._demargin = demargin;

	return printCallStack;
})();

Reflect.defineProperty(rMath, "_primeFactor", {
	value: (function create_primeFactor() {
		// prime factor by base conversion

		function intlen(str) {
			// bigint length
			// len(str) % 3 === 0.
			if (str == null) return 0n;
			for (var i = 0n; str[i] != null ;) i += 3n;
			return i;
		}

		function convertBase(n, b = 2n) {
			// base 10 --> base b

			if (!n) return "2:";

			var m = [];

			while (n !== 0n)
				m.push(n % b),
				n /= b;

			return `${b}:(${ m.reverse().join(")(") })`;
		}

		function convertBase2(n, b = 2n) {
			// base a --> base b
			if (typeof n === "number") {
				if (n === 0) return "2:";

				var m = [];

				while (n !== 0n)
					m.push(n % b),
					n /= b;

				return `${b}:(${ m.reverse().join(")(") })`;
			}

		}

		function convert10(number) {
			// number as returned from convert_base()
			// base-b string --> base-10 number
			if (/\d+:/.all(number)) return 0n;

			var b = BigInt( number.slc(0, ":") );

			return number.split(/(?=\()/g)
				.slice(1)
				.reverse()
				.map( (d, i) => b**BigInt(i) * BigInt(d.slice(1, -1)) )
				.reduce((t, n) => t + n, 0n);
		}

		function primeFactor(number) {
			// 0n and -1n are included in prime factors when applicable.
			if (typeof number !== "bigint")
				try { number = BigInt(number) }
				catch { throw Error`only bigints and numbers can be prime factored` }

			if (abs(number) === 1n || number === 0n)
				return [number];
				// `-0n` is not a thing

			var factorList = [], base = 1n;

			if (number < 0n)
				factorList.push(-1n),
				number *= -1n;

			while (number !== 1n) {

				base = bMath.prime(1n, base + 1n), number = convertBase(number, base);

				for (var i = intlen(number.match(/(?:\(0\))+$/)?.[0]) / 3n; i --> 0n ;)
					factorList.push(base);

				number = convert10( number.remove(/(?:\(0\))+$/) );
			}

			/*do {
				base = bMath.prime(1n, base + 1n), number = convertBase2(number, base);

				for (var i = intlen(number.match(/(?:\(0\))+$/)?.[0]) / 3n; i --> 0n ;)
					factorList.push(base);

				number = number.remove(/(?:\(0\))+$/);

			} while ( !/^\d+:(\(1\))$/.test(number) );*/

			return factorList;
		}

		return primeFactor._convertBase = convertBase,
			primeFactor._convert10 = convert10,
			primeFactor._intlen = intlen,
			primeFactor;
	})()
	, writable: true
	, enumerable: true
	, configurable: true
});

void function removeAmlaut(str) { return str.replace([/ü/g, /Ü/g], ["u", "U"]) }
void function removeTilde(str) { return str.replace([/ñ/g, /Ñ/g], ["n", "N"]) }
var removeAcuteAccents = (function create_removeAcuteAccents() {
	const map = {
		A: "Á" , a: "á" ,
		E: "É" , e: "é" ,
		I: "Í" , i: "í" ,
		O: "Ó" , o: "ó" ,
		U: "Ú" , u: "ú" ,
	}
	, keys = Reflect.ownKeys(map)

	function removeAcuteAccents(str) {
		return keys.reduce((curStr, curMap) => curStr.replaceAll(map[curMap], curMap), str);
	}

	// removeAcuteAccents._map = map;
	// removeAcuteAccents._keys = keys;

	return removeAcuteAccents;
})();


(function () {
	function findEndParentheses(str, i) {
		if ( !"([{".includes(str[i]) ) return i;

		const sttparen = str[i], endparen = String.fromCharCode(
			sttparen.charCodeAt() + (sttparen.charCodeAt() > 40) + 1
		);

		for (var parens = 1; parens; ) {
			if (i === str.length) throw Error`invalid input string`;
			parens += str[++i] == endparen ? -1 : str[i] == sttparen ? 1 : 0;
		}
		return i;
	}

	return function asdf(str) {
		str = str.remove(/\s/g);
	}
})();

var validFlags = (function getValidRegexFlags() {
	var validFlags = "";

	for (var char of LIBRARY_VARIABLES["local alphabetL"])
		try { RegExp("", char); validFlags += char } catch {}

	return validFlags;
})();
