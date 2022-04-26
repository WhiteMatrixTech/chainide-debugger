import RemixDebug from '@remix-project/remix-debug';

export function getChainNameById(id: string): string | undefined {
  const chains = {
    '0x5': 'goerli',
    '0x3': 'ropsten',
    '0x116e1': 'goldwoken',
    '0x315db00000006': 'nervosTestNetV1',
    '0x406': 'confluxESpace'
  };
  return chains[id];
}

export default function web3DebugNode(network: string) {
  const web3DebugNodes = {
    main: 'https://rpc.archivenode.io/e50zmkroshle2e2e50zm0044i7ao04ym',
    rinkeby: 'https://remix-rinkeby.ethdevops.io',
    ropsten: 'https://remix-ropsten.ethdevops.io',
    goerli: 'https://remix-goerli.ethdevops.io'
  };
  if (web3DebugNodes[network]) {
    return RemixDebug.init.loadWeb3(web3DebugNodes[network]);
  }
  return null;
}
