import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ColorsViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ColorsViewProvider.viewType,
      provider,
    ),
  );
}

class ColorsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'antd-code-helper.table';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'showColumnsCopyedInfo': {
          vscode.window.showInformationMessage('columns Copyed!');
          break;
        }
        case 'insertIntoCursorCurrent': {
          vscode.window.activeTextEditor?.insertSnippet(
            new vscode.SnippetString(`${data.value}`),
          );
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'resources', 'index.js'),
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'resources', 'reset.css'),
    );
    // const styleVSCodeUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, 'resources', 'vscode.css'),
    // );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'resources', 'index.css'),
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>antd-code-helper</title>
			</head>
			<body>
          <textarea
          class="table-input"
          placeholder="如：{
          /** 子设备名称 */
          name?: string;
          /** 子设备ID */
          subDeviceId?: string;
          [key: string]: any;
        } 或者{
          lineId: string; // 线路ID
          name: string; // 线路名称
          [key: string]: any;
        }"
        ></textarea>
        <textarea class="table-output"></textarea>
        <button class="table-button">生成并复制到剪贴板</button>
        <button class="cursor-button">生成并插入到当前光标位置</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
