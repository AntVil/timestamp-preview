const vscode = require('vscode');

const fancyNumberRegex = /[0-9_]+/;

function activate(context) {
	// timestamp to iso (human readable)
    context.subscriptions.push(
        vscode.languages.registerHoverProvider("*", {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, /[\d_]+/);

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
        vscode.languages.registerHoverProvider("*", {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([-+]\d{2}:\d{2}|Z)/);

				if(range === undefined) {
					return null;
				}

				const date = new Date(document.getText(range));

                const hoverContent = new vscode.MarkdownString(
					`${date.getTime() / 1000} (s)\n\n${date.getTime()} (ms)`
				);
				return new vscode.Hover(hoverContent);
            }
        })
    );
}

function yearIsInteresting(year) {
	return year > 1970 && year < 2100;
}

module.exports = {
	activate
}
