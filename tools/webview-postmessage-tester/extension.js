const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand("webviewTester.open", () => {
    const panel = vscode.window.createWebviewPanel(
      "webviewTester",
      "WebView Tester",
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    const testUrl = "http://localhost:4321/boards/LicheePi4A/Coremark/";

    panel.webview.html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;overflow:hidden">
    <iframe src="${testUrl}" style="border:0;width:100vw;height:100vh"></iframe>
  </body>
</html>`;

    panel.webview.onDidReceiveMessage((msg) => {
      console.log("[WebView message]", msg);
      vscode.window.showInformationMessage(`收到消息: ${JSON.stringify(msg)}`);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
