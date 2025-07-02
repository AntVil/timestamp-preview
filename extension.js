const vscode = require('vscode');

const fancyNumberRegex = /-?[\d_]+/;
const dateStringRegex = /\d{4}[-_\/\.]\d{2}[-_\/\.]\d{2}T\d{2}[-_\/\.:]\d{2}[-_\/\.:]\d{2}(\.\d+)?([-+]\d{2}(:\d{2})|Z)?/;

function activate(context) {
    vscode.commands.registerCommand('timestamp-preview.toTimestampS', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.edit(editBuilder => {
            for (const selection of editor.selections) {
                const selectedText = editor.document.getText(selection);
                if (!dateStringRegex.test(selectedText)) {
                    return
                }
                const newText = `${Math.floor((new Date(selectedText.replace(/( |_|\/|\.)/gm, "-"))).getTime() / 1000)}`;
                if (isNaN(newText)) {
                    return
                }
                editBuilder.replace(selection, newText);
            }
        });
    });

    vscode.commands.registerCommand('timestamp-preview.toTimestampMs', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.edit(editBuilder => {
            for (const selection of editor.selections) {
                const selectedText = editor.document.getText(selection);
                if (!dateStringRegex.test(selectedText)) {
                    return
                }
                const newText = `${Math.floor((new Date(selectedText.replace(/( |_|\/|\.)/gm, "-"))).getTime())}`;
                if (isNaN(newText)) {
                    return
                }
                editBuilder.replace(selection, newText);
            }
        });
    });

    vscode.commands.registerCommand('timestamp-preview.toISODateString', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        editor.edit(editBuilder => {
            for (const selection of editor.selections) {
                const selectedText = editor.document.getText(selection);
                if (!fancyNumberRegex.test(selectedText)) {
                    return
                }
                const timestamp = parseInt(selectedText.replace(/_/g, ""));

                const dateSeconds = new Date(timestamp * 1000);
				const dateMilliSeconds = new Date(timestamp);

                let newText = null;

				if(yearIsInteresting(dateSeconds.getFullYear())) {
					newText = dateSeconds.toISOString().replace(/\.\d+/, "");
				}
				if(yearIsInteresting(dateMilliSeconds.getFullYear())) {
					newText = dateMilliSeconds.toISOString().replace(/\.\d+/, "");
				}

				if (newText === null) {
					return null;
				}

                editBuilder.replace(selection, newText);
            }
        });
    });

	// timestamp to iso (human readable)
    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ scheme: 'file' }, {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, fancyNumberRegex);

				if(range === undefined) {
					return null;
				}

				const timestamp = parseInt(document.getText(range).replace(/_/g, ""));

				const dateSeconds = new Date(timestamp * 1000);
				const dateMilliSeconds = new Date(timestamp);

				let content = null;

				if(yearIsInteresting(dateSeconds.getFullYear())) {
					content = `${dateSeconds.toISOString()} (s)`;
				}
				if(yearIsInteresting(dateMilliSeconds.getFullYear())) {
					content = `${dateMilliSeconds.toISOString()} (ms)`;
				}

				if (content === null) {
					return null;
				}

                const hoverContent = new vscode.MarkdownString(content);
				return new vscode.Hover(hoverContent);
            }
        })
    );

	// iso (human readable) to timestamp
	context.subscriptions.push(
        vscode.languages.registerHoverProvider({ scheme: 'file' }, {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, dateStringRegex);

				if(range === undefined) {
					return null;
				}

				const filteredRange = document.getText(range).replace(/[_\/\.]/, "-")

				const date = new Date(filteredRange);

                const hoverContent = new vscode.MarkdownString(
					`${date.getTime() / 1000} (s)\n\n${date.getTime()} (ms)`
				);
				return new vscode.Hover(hoverContent);
            }
        })
    );
}

function yearIsInteresting(year) {
	return year > 1900 && year < 2100;
}

module.exports = {
	activate
}
