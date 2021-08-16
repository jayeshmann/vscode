/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { generateUuid } from 'vs/base/common/uuid';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { BaseExtHostTerminalService, ExtHostTerminal, ITerminalInternalOptions } from 'vs/workbench/api/common/extHostTerminalService';
import type * as vscode from 'vscode';

export class ExtHostTerminalService extends BaseExtHostTerminalService {

	constructor(
		@IExtHostRpcService extHostRpc: IExtHostRpcService
	) {
		super(true, extHostRpc);
	}

	public createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal {
		return this.createTerminalFromOptions({ name, shellPath, shellArgs });
	}

	public createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal {
		const terminal = new ExtHostTerminal(this._proxy, generateUuid(), options, options.name);
		this._terminals.push(terminal);
		if (options.location && typeof options.location === 'object' && 'parentTerminal' in options.location) {
			const p = options.location.parentTerminal;
			if (p) {
				const t = this._terminals.find(t => t.value === p);
				internalOptions = internalOptions ? internalOptions : {};
				internalOptions.parentTerminal = t;
			}
		}
		terminal.create(options, internalOptions);
		return terminal.value;
	}
}
