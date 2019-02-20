// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs = require('fs');
const os = require('os');
const path = require("path");
// const rp = require("request-promise");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function showQuickPickSimpleTrans(key,editor) {
	let i = 0;
	const result = await vscode.window.showQuickPick(["{{ ucwords(trans('misc." + key + "')) }}", "{{ trans('misc." + key + "') }}", "{{ ucfirst(trans_choice('misc." + key + "', 1)) }}"], {
		placeHolder: "{{ ucwords(trans('misc." + key + "')) }},{{ trans('misc." + key + "') }}, {{ ucfirst(trans_choice('misc." + key + "', 1)) }}",
		// onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
		onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
	});
	
	vscode.window.showInformationMessage(`${result}`);

	var selection = editor.selection;
	editor.edit(builder => builder.replace(selection, result));
	
}

function generateArrayNotation(param_array){
	var index;
	var paramater_string_array_format;
	for (index = 0; index < param_array.length; ++index) {
	


	}

return " 'param1'=>'blah','param2'=>'blah2'  ";
}

async function showQuickPickAdvancedTrans(key, editor, parameter_template_string,param_list) {
	// {{ __('settings.send_billsheet_link_as_pdf', ['billingsheet' => {{ ucfirst(Setting::get('language_bill_sheet', trans_choice('billing.sheet', 1))) }}]) }}
	var array_string = "";

	for (var k = 0; k < param_list.length; k++) {
		array_string += '"'+param_list[k]+'"'+'=>'+'""';
		if (k < param_list.length){
			array_string += ",";
		}
	}
	let i = 0;
	const result = await vscode.window.showQuickPick(['{{ __t("' + key + '"),[' + array_string + '] }}'], {
		placeHolder: '{{ __t("' + key + '"),[' + array_string + '] }}',
		// onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
		onDidSelectItem: item => vscode.window.showInformationMessage(`${item}`)
	});

	// var selection = editor.selection;

	// vscode.window.showInformationMessage(`${result}`);

	// editor.edit(builder => builder.replace(selection, result + "\n" + parameter_template_string + "\n"));

}

function isAdvanced(text){
	if (text.indexOf('{') > -1) {
		return true;
	}
	return false;
}
function replaceRange(s, start, end, substitute) {
	return s.substring(0, start) + substitute + s.substring(end);
}

function allIndexOf(str, toSearch) {
	var indices = [];
	for (var pos = str.indexOf(toSearch); pos !== -1; pos = str.indexOf(toSearch, pos + 1)) {
		indices.push(pos);
	}
	return indices;
}
function get3Words(str) {
	return str.split(/\s+/).slice(0, 3).join(" ").replace("{{", "").replace("}}", "");
}
async function insertNewTranslation(){
	// const editor = vscode.window.activeTextEditor;
	// const rp = require("request-promise");
	var editor = vscode.window.activeTextEditor;
	
	if (!editor) {
		vscode.window.showInformationMessage("Please select text first!!!");
	}
	else {
		var text = editor.document.getText(editor.selection);
		if(text.length === 0){
			vscode.window.showInformationMessage("Please select text first!!!");
			return;
		}
		var languageFilePath = os.homedir() +"/auto_lang.php";
		// vscode.window.showInformationMessage("Saving translation to" + languageFilePath);
		var clean_key;
		var entry;
		if(isAdvanced(text)){
			var param_list = [];
			var parameter_template_string = text;
			var translation_indices_left = allIndexOf(text, "{{");
			var translation_indices_right = allIndexOf(text, "}}");
			var index_loop_count = translation_indices_left.length;
			

			var index;
			for (index = 0; index < index_loop_count; ++index) {
				parameter_template_string = replaceRange(parameter_template_string, translation_indices_left[0], (translation_indices_right[0]+2), ":param"+index); 
				param_list.push("param" + index);
				// vscode.window.showInformationMessage(parameter_template_string);
				/* reset indices array because string length changes every iteration */
				translation_indices_left = allIndexOf(parameter_template_string, "{{");
				translation_indices_right = allIndexOf(parameter_template_string, "}}");	
			}

			// clean_key = parameter_template_string.replace(/[^\w\s]/gi, '').toLowerCase();
			// clean_key = vscode.window.activeTextEditor.document.fileName.replace(/[^\w\s]/gi, '').toLowerCase();

			var n = vscode.window.activeTextEditor.document.fileName.lastIndexOf('/');
			// var delimiter = '_',
			// 	start = 0,
			// 	tokens = parameter_template_string.replace(/ /g, "_").split(delimiter).slice(start),
			// 	result = tokens.join(delimiter); // those.that
			var first_3_words = get3Words(text).replace(/ /g, "_").toLowerCase();
			clean_key = vscode.window.activeTextEditor.document.fileName.substring(n + 1).replace(".blade.php", "") + '.' + first_3_words;

			

			entry = "\"" + clean_key + "\"" + "=>" + "\"" + parameter_template_string + "\",";
			
			fs.appendFile(languageFilePath, entry + "\n", function (err) {
				if (err) {
					vscode.window.showInformationMessage(`${err}`);
				}
			});
			showQuickPickAdvancedTrans(clean_key, editor, parameter_template_string, param_list);
		}
		else {
			clean_key = text.replace(/[^\w\s]/gi, '').toLowerCase();
			entry = "\"" + clean_key.replace(/ /g, "_") + "\"" + "=>" + "\"" + text + "\",";

			fs.appendFile(languageFilePath, entry + "\n", function (err) {
				if (err) {
					vscode.window.showInformationMessage(`${err}`);
				}
			});
			showQuickPickSimpleTrans(clean_key.replace(/ /g, "_"), editor);
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "laravel-translation-inserter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.insertSimpleTranslation', () => {
		// The code you place here will be executed every time your command is executed
		// var selectedText = textEditor
		// Display a message box to the user
		insertNewTranslation(

		); 
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
