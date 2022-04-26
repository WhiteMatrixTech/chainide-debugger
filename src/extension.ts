import { Controls } from './components/control';
import { PluginType, Plugin, PluginContext } from '@modules/extensions/types';
import chainIDE from '@modules/extensions/client/chainIdeProxyImpl';

export const pluginConfig: Plugin = {
  activate(ctx: PluginContext) {
    const addControl = chainIDE.addControl({
      componentId: 'chainide-debugger',
      componentFunc: Controls,
      name: 'Debug',
      iconName: 'Bug'
    });

    const command = chainIDE.registerCommand({
      name: 'chainIDE-pluginId.testCommand',
      callback: () => {
        alert('test command');
      }
    });

    const registerFunc = chainIDE.registerFunction({
      name: 'chainIDE-pluginId.testFunction',
      function: () => {
        console.log('register function');
      }
    });

    ctx.subscriptions.push(addControl, command, registerFunc);
  },
  deactivate(_ctx: PluginContext) {
    console.log('deactivate plugin');
  },
  config: {
    pluginId: 'chainIDE-debugger',
    version: '0.0.1',
    type: PluginType.view,
    active: false,
    description: {
      title: 'ChainIDE Debugger',
      icon: '#CommentSolid',
      description: 'extensionDescription'
    }
  },
  store: undefined,
  context: {
    subscriptions: []
  }
};
