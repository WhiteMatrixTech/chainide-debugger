/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo
} from 'react';
import {
  Stack,
  PrimaryButton,
  TextField,
  Dropdown,
  Icon
} from 'office-ui-fabric-react';
import cn from 'classnames';
import RemixDebug, {
  BreakpointManager,
  TransactionDebugger as Debugger,
  sourceMappingDecoder
} from '@remix-project/remix-debug';
import Collapse from 'rc-collapse';
import { useSelector } from 'react-redux';
import chainIDE from 'chainIDE';
import { Locale } from '@modules/editor/actions/locale.actions';
import { IStateTypes } from '@store/types';
import { editorService } from '@modules/editor/services/editorService';
import tabService from '@modules/editor/services/tabService';
import { notification } from '@modules/common/components/notification';
import AssemblyItems from './assembly-items';
import { toUri } from '../libs/utils/toUri';

import styles from './control.less';

const { Panel } = Collapse;

export const Controls = () => {
  const { language } = useSelector((state: IStateTypes) => state.language);
  const [compiledFiles, setCompiledFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [openedPanels, setOpenedPanels] = useState<any>([]);
  const [hash, setHash] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [vmDebugger, setVMDebugger] = useState<any>();
  const [debugData, setDebugData] = useState<any>({
    trace: null,
    currentTrace: null
  });
  const codeViewRef = useRef(null);
  const [stepState, setStepState] = useState('initial');
  const [step, setStep] = useState(0);
  const [callMemory, setCallMemory] = useState({});
  const [stack, setStack] = useState([]);
  const [callstack, setCallstack] = useState([]);
  const [returnValue, setReturnValue] = useState<any>(null);
  const [storageChanges, setStorageChanges] = useState({});
  const [globals, setGlobals] = useState<any>({});
  const [functionPanel, setFunctionPanel] = useState(null);
  const [stepDetail, setStepDetail] = useState({
    'vm trace step': '-',
    'execution step': '-',
    'add memory': '',
    gas: '',
    'remaining gas': '-',
    'loaded address': '-'
  });
  const [solidityState, setSolidityState] = useState({
    calldata: null,
    message: null
  });
  const [solidityLocals, setSolidityLocals] = useState({
    calldata: null,
    message: null
  });

  const documentLink = useMemo(() => {
    if (language === Locale.ZH) {
      return 'https://chainide.gitbook.io/chainide-chinese/4.-chainide-quan-ti-bu-ju/4.7.-cha-jian-xi-tong-mo-kuai/3.7.1-chainide-debugger';
    } else {
      return 'https://chainide.gitbook.io/chainide-english-1/chainide-modules/4.7-plug-in-system-module/3.7.1-chainide-debugger';
    }
  }, [language]);

  const buttonState = useMemo(() => {
    return {
      intoBackDisabled: stepState === 'initial',
      overBackDisabled: stepState === 'initial',
      jumpPreviousBreakpointDisabled: stepState === 'initial',
      intoForwardDisabled: stepState === 'end',
      overForwardDisabled: stepState === 'end',
      jumpNextBreakpointDisabled: stepState === 'end'
    };
  }, [stepState]);
  const updateContentInPlugin = useCallback(() => {
    chainIDE.fileSystemService
      .getAllPathByRegex(
        chainIDE.currentProject?.currentProjectId || '',
        '.*.sol.compiled$'
      )
      .then((res) => {
        setCompiledFiles(res);
      })
      .catch((e) => console.log(e));
  }, []);

  // 监听文件更新
  useEffect(() => {
    if (!selectedFile) return;
    chainIDE.fileSystemService
      .readFileString(
        toUri(chainIDE.currentProject?.currentProjectId || '', selectedFile)
      )
      .then((res) => {
        setFileContent(res);
      })
      .catch((e) => console.log(e));
  }, [selectedFile]);

  React.useEffect(() => {
    updateContentInPlugin();
  }, [updateContentInPlugin]);

  return (
    <div className={styles.controls}>
      <div style={{ padding: 15, paddingTop: 0 }}>
        Docs:{' '}
        <a
          href={documentLink}
          style={{ color: '#226FB9' }}
          target="_blank"
          rel="noreferrer"
        >
          Debugger
        </a>
      </div>
      <Stack
        tokens={{ childrenGap: 15 }}
        style={{ padding: 15, paddingTop: 0 }}
      >
        <Dropdown
          label="Compiled File"
          onChanged={handleSelectNetwork}
          onClick={updateContentInPlugin}
          placeholder="Select a compiled file"
          options={compiledFiles.map((o) => ({
            key: o,
            text: o
          }))}
        />

        <TextField
          label="Transaction hash"
          placeholder="Transaction hash, should start with 0x"
          value={hash}
          onChange={handleTxHashChange}
        />

        <PrimaryButton
          size={20}
          onClick={isDebugging ? handleStopDebug : handleStartDebug}
          disabled={!fileContent || !hash}
        >
          {isDebugging ? 'Stop Debug' : 'Start Debug'}
        </PrimaryButton>

        {vmDebugger && (
          <>
            <div>
              <input
                type="range"
                min={0}
                max={debugData.trace?.length || 20}
                value={step}
                style={{ width: '100%' }}
                onChange={(evt) => handleStepChange(+evt.target.value)}
              />
            </div>
            <div className={styles.debug_btns}>
              <PrimaryButton
                onClick={handleStepOverBack}
                iconProps={{ iconName: 'Undo' }}
                disabled={buttonState.overBackDisabled}
              />
              <PrimaryButton
                onClick={handleStepIntoBack}
                iconProps={{ iconName: 'Back' }}
                disabled={buttonState.intoBackDisabled}
              />
              <PrimaryButton
                onClick={handleStepIntoForward}
                iconProps={{ iconName: 'Forward' }}
                disabled={buttonState.intoForwardDisabled}
              />
              <PrimaryButton
                onClick={handleStepOverForward}
                iconProps={{ iconName: 'Redo' }}
                disabled={buttonState.overForwardDisabled}
              />
            </div>
          </>
        )}

        {vmDebugger && (
          <div className={styles.breakpoints_btns}>
            <PrimaryButton
              onClick={handleJumpToPrevBreakpoint}
              iconProps={{ iconName: 'DoubleChevronLeft' }}
              title="Jump to the prev breakpoint"
            />
            <PrimaryButton
              onClick={handleJumpToNextBreakpoint}
              iconProps={{ iconName: 'DoubleChevronRight' }}
              title="Jump to the next breakpoint"
            />
          </div>
        )}
      </Stack>
      <Collapse
        activeKey={openedPanels}
        onChange={handlePanelChange}
        expandIcon={({ isActive }: any) => (
          <Icon
            iconName={isActive ? 'ChevronDown' : 'ChevronRight'}
            style={{ marginRight: 4 }}
          />
        )}
      >
        {vmDebugger && (
          <>
            <Panel
              key="function"
              header="function"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <span className={styles.trace_grid}>{functionPanel}</span>
            </Panel>

            <Panel
              key="locals"
              header="Locals"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              {solidityLocals.message && (
                <span className={styles.trace_grid}>
                  {solidityLocals.message}
                </span>
              )}
              {solidityLocals.calldata &&
                Object.keys(solidityLocals.calldata).map((key) => (
                  <div className={styles.trace_grid} key={key}>
                    {key}: {solidityLocals?.calldata?.[key].type}{' '}
                    {typeof solidityLocals?.calldata?.[key].value === 'object'
                      ? solidityLocals?.calldata?.[key].value?.value
                      : solidityLocals?.calldata?.[key].value}
                  </div>
                ))}
            </Panel>

            <Panel
              key="state"
              header="State"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              {solidityState.message && (
                <span className={styles.trace_grid}>
                  {solidityState.message}
                </span>
              )}
              {solidityState.calldata &&
                Object.keys(solidityState.calldata).map((key) => (
                  <div className={styles.trace_grid} key={key}>
                    {key}: {solidityState?.calldata?.[key].type}{' '}
                    {Array.isArray(solidityState?.calldata?.[key].value)
                      ? solidityState?.calldata?.[key]?.value?.[0]?.value
                      : typeof solidityState?.calldata?.[key]?.value ===
                        'object'
                      ? solidityState?.calldata?.[key]?.value.value
                      : solidityState?.calldata?.[key]?.value}
                  </div>
                ))}
            </Panel>

            <div
              className={cn(styles.trace_grid, styles.opcodes)}
              ref={codeViewRef}
            >
              <AssemblyItems
                registerEvent={vmDebugger?.vmDebuggerLogic?.event?.register?.bind(
                  vmDebugger.vmDebuggerLogic.event
                )}
              />
            </div>

            <Panel
              key="stepDetail"
              header="Step Details"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div
                style={{ overflowWrap: 'anywhere' }}
                className={styles.trace_grid}
              >
                <div>vm trace step: {stepDetail['vm trace step']}</div>
                <div>execution step: {stepDetail['execution step']}</div>
                <div>add memory: {stepDetail['add memory']}</div>
                <div>gas cost: {stepDetail.gas}</div>
                <div>add memory:</div>
                <div>remaining gas: {stepDetail['remaining gas']}</div>
                <div>loaded address: {stepDetail['loaded address']}</div>
              </div>
            </Panel>

            <Panel
              key="stack"
              header="Stack"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div className={styles.trace_grid}>
                {stack?.map((o: any, index: number) => (
                  <div key={index} style={{ wordBreak: 'break-all' }}>
                    {index}: {o}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              key="memory"
              header="Memory"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div className={styles.trace_grid}>
                {Object.keys(callMemory)?.map((o, index) => (
                  <div key={index}>
                    {o}: {callMemory[o]}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              key="callstack"
              header="CallStack"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div className={styles.trace_grid}>
                {callstack?.map((o: any, index: number) => (
                  <div key={index}>
                    {index}: {o}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              key="calldata"
              header="CallData"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div
                style={{ overflowWrap: 'anywhere' }}
                className={styles.trace_grid}
              >
                {debugData.calldata}
              </div>
            </Panel>

            <Panel
              key="globalvariables"
              header="Global Variables"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div
                style={{ overflowWrap: 'anywhere' }}
                className={styles.trace_grid}
              >
                {Object.keys(globals).map((item) => (
                  <div key={item}>
                    {item}: {globals[item]}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              key="returnValue"
              header="Return Value"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div className={styles.trace_grid}>
                {Object.keys(returnValue || {})?.map((o, index) => (
                  <div key={index}>
                    {Array.isArray(returnValue[o])
                      ? returnValue[o].map((j: any, index: any) => (
                          <div key={index} style={{ wordBreak: 'break-all' }}>
                            {index}: {j}
                          </div>
                        ))
                      : typeof returnValue[o]}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel
              key="storagechanges"
              header="Full Storage Changes"
              className={styles.panel_item}
              headerClass={styles.panel_header}
            >
              <div className={styles.trace_grid}>
                {Object.keys(storageChanges)?.map((o, index) => (
                  <div key={index}>
                    {o}: {typeof storageChanges[o]}
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </Collapse>
    </div>
  );

  function handlePanelChange(keys: any) {
    setOpenedPanels([...keys]);
  }

  async function getCurrentOpendFile() {
    const { activeGroupKey, groups } = await tabService.getGroupTabs(
      chainIDE.currentProject?.currentProjectId || ''
    );
    const activeGroup = groups.find((o) => o.groupKey === activeGroupKey);
    if (activeGroup) {
      const tab = activeGroup.tabs.find(
        (o) => activeGroup.activeTabKey === o.key
      );
      if (tab) {
        tab.content = await chainIDE.fileSystemService.readFileString(
          toUri(chainIDE.currentProject?.currentProjectId || '', tab.path)
        );
      }
      return tab;
    }

    return null;
  }

  function initDebugger(res: any) {
    if (vmDebugger) return vmDebugger;
    if ((window as any).evmWeb3) {
      RemixDebug.init.extendWeb3((window as any).evmWeb3);
    } else {
      notification.error('Please connect to Javascript VM');
      return;
    }
    const ddebugger = new Debugger({
      web3: (window as any).evmWeb3,
      compilationResult: () => {
        return { data: JSON.parse(res) }; // that helps resolving source location
      },
      debugWithGeneratedSources: true
    });
    setVMDebugger(ddebugger);
    return ddebugger;
  }

  function handleSelectNetwork({ key }: any) {
    setSelectedFile(key);
  }

  function handleStepIndexChanged(index: number) {
    if (index < 0) return;
    const codeView = codeViewRef.current;
    const currentItem = codeView?.children[index];
    if (currentItem) {
      codeView.scrollTop = currentItem.offsetTop - parseInt(codeView.offsetTop);
    }
  }

  function handleTxHashChange(
    _evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string
  ) {
    setHash(value);
  }

  async function handleStepChange(step: number) {
    vmDebugger.step_manager.jumpTo(step);
    setStep(step);
    const calldata = await vmDebugger.debugger.traceManager.getCallDataAt(step);
    setDebugData({
      trace: vmDebugger.step_manager.traceManager.trace,
      currentTrace: vmDebugger.step_manager.traceManager.trace?.[step],
      calldata
    });
  }

  function handleStepOverForward() {
    vmDebugger.step_manager.stepOverForward();
  }

  function handleStepOverBack() {
    vmDebugger.step_manager.stepOverBack();
  }

  function handleStepIntoForward() {
    vmDebugger.step_manager.stepIntoForward();
  }

  function handleStepIntoBack() {
    vmDebugger.step_manager.stepIntoBack();
  }

  function handleJumpToNextBreakpoint() {
    (window as any).direction = 1;
    vmDebugger.step_manager.jumpNextBreakpoint();
  }

  function handleJumpToPrevBreakpoint() {
    (window as any).direction = -1;
    vmDebugger.step_manager.jumpPreviousBreakpoint();
  }

  function listenEvents(vmDebugger: any) {
    const registerEvent = vmDebugger.vmDebuggerLogic.event.register.bind(
      vmDebugger.vmDebuggerLogic.event
    );
    if (!registerEvent) return;

    vmDebugger.step_manager.event.register(
      'indexChanged',
      handleStepIndexChanged
    );

    vmDebugger.step_manager.event.register(
      'stepChanged',
      async (step: number, state: any) => {
        setStepState(state);
        setStep(step);
        const calldata = await vmDebugger.debugger.traceManager.getCallDataAt(
          step
        );
        setDebugData({
          trace: vmDebugger.step_manager.traceManager.trace,
          currentTrace: vmDebugger.step_manager.traceManager.trace?.[step],
          calldata
        });
      }
    );

    registerEvent('functionsStackUpdate', (stack: any) => {
      if (stack === null || stack.length === 0) return;
      const functions: any = [];
      for (const func of stack) {
        functions.push(
          `${func.functionDefinition.name}(${func.inputs.join(', ')})`
        );
      }
      setFunctionPanel(() => functions);
    });

    registerEvent('traceUnloaded', () => {
      setStepDetail(() => {
        return {
          'vm trace step': '-',
          'execution step': '-',
          'add memory': '',
          gas: '',
          'remaining gas': '-',
          'loaded address': '-'
        };
      });
    });

    registerEvent('newTraceLoaded', () => {
      setStepDetail(() => {
        return {
          'vm trace step': '-',
          'execution step': '-',
          'add memory': '',
          gas: '',
          'remaining gas': '-',
          'loaded address': '-'
        };
      });
    });

    registerEvent('traceCurrentStepUpdate', (error: any, step: any) => {
      setStepDetail((prevState) => {
        return { ...prevState, 'execution step': error ? '-' : step };
      });
    });

    registerEvent('traceMemExpandUpdate', (error: any, addmem: any) => {
      setStepDetail((prevState) => {
        return { ...prevState, 'add memory': error ? '-' : addmem };
      });
    });

    registerEvent('traceStepCostUpdate', (error: any, gas: any) => {
      setStepDetail((prevState) => {
        return { ...prevState, gas: error ? '-' : gas };
      });
    });

    registerEvent(
      'traceCurrentCalledAddressAtUpdate',
      (error: any, address: any) => {
        setStepDetail((prevState) => {
          return { ...prevState, 'loaded address': error ? '-' : address };
        });
      }
    );

    registerEvent(
      'traceRemainingGasUpdate',
      (error: any, remainingGas: any) => {
        setStepDetail((prevState) => {
          return {
            ...prevState,
            'remaining gas': error ? '-' : remainingGas
          };
        });
      }
    );

    registerEvent('indexUpdate', (index: any) => {
      setStepDetail((prevState) => {
        return { ...prevState, 'vm trace step': index };
      });
    });

    registerEvent('solidityState', (calldata: any) => {
      setSolidityState(() => {
        return { ...solidityState, calldata };
      });
    });

    registerEvent('solidityStateMessage', (message: any) => {
      setSolidityState(() => {
        return { ...solidityState, message };
      });
    });

    registerEvent('solidityLocals', (calldata: any) => {
      setSolidityLocals(() => {
        return { ...solidityLocals, calldata };
      });
    });

    registerEvent('solidityLocalsMessage', (message: any) => {
      setSolidityLocals(() => {
        return { ...solidityLocals, message };
      });
    });

    registerEvent('traceManagerMemoryUpdate', (calldata: any) => {
      setCallMemory(calldata);
    });

    registerEvent('traceManagerCallStackUpdate', (calldata: any) => {
      setCallstack(calldata);
    });

    registerEvent('traceStorageUpdate', (calldata: any) => {
      setStorageChanges(calldata);
    });

    registerEvent('traceManagerStackUpdate', (calldata: any) => {
      setStack(calldata);
    });

    registerEvent('traceReturnValueUpdate', (calldata: any) => {
      console.log(calldata);
      if (
        calldata?.find((o: any) => o instanceof Error) ||
        !calldata ||
        !calldata.length
      ) {
        setReturnValue(calldata);
        return;
      }
      setReturnValue(calldata);
    });
  }

  async function handleStartDebug() {
    if (!(window as any).evmWeb3) {
      return notification.error('Please connect to Javascript VM');
    }
    const file = await getCurrentOpendFile();
    const breakpoints = editorService.getBreakPoints(
      toUri(file?.projectId, file?.path)
    );
    const vmDebugger = initDebugger(fileContent);
    const web3 = (window as any).evmWeb3;
    const tx = await web3.eth.getTransaction(hash);
    const block = await web3.eth.getBlock(tx.blockNumber);
    const globals = {
      'block.chainid': tx.chainId,
      'block.coinbase': block.miner,
      'block.difficulty': block.difficulty,
      'block.gaslimit': block.gasLimit,
      'block.number': block.number,
      'block.timestamp': block.timestamp,
      'msg.sender': tx.from,
      'msg.sig': tx.input.substring(0, 10),
      'msg.value': `${tx.value} Wei`,
      'tx.origin': tx.from
    };
    setGlobals(globals);
    vmDebugger.debugger.callTree.event.register('callTreeReady', () => {
      const { traceManager, callTree, solidityProxy } = vmDebugger.debugger;
      const breakpointManager = new BreakpointManager({
        traceManager,
        callTree,
        solidityProxy,
        locationToRowConverter: (rawLocation: any) => {
          return sourceMappingDecoder.convertOffsetToLineColumn(
            rawLocation,
            sourceMappingDecoder.getLinebreakPositions(file?.content || '')
          );
        }
      });

      vmDebugger.debugger.setBreakpointManager(breakpointManager);
      breakpoints.forEach((item) => {
        breakpointManager.add({
          fileName: `fs://${toUri(file?.projectId, file?.path)}`,
          row: item.lineNumber
        });
      });
      breakpointManager.event.register(
        'breakpointHit',
        async (_sourceLocation: any, step: any) => {
          vmDebugger.step_manager.jumpTo(step);
          setStep(step);
          const calldata = await vmDebugger.debugger.traceManager.getCallDataAt(
            step
          );
          setDebugData({
            ...debugData,
            currentTrace: debugData.trace?.[step],
            calldata
          });
        }
      );
      breakpointManager.event.register('NoBreakpointHit', function () {
        if ((window as any).direction === -1) {
          vmDebugger.step_manager.jumpTo(0);
        }
        if ((window as any).direction === 1) {
          vmDebugger.step_manager.jumpTo(
            vmDebugger.step_manager.traceLength - 1
          );
        }
      });
    });

    vmDebugger.debug(tx.blockNumber, tx.hash, tx, () => {
      listenEvents(vmDebugger);
      setOpenedPanels([
        'function',
        'locals',
        'state',
        'stepDetail',
        'memory',
        'stack',
        'storage',
        'callstack',
        'calldata',
        'globalvariables',
        'returnValue',
        'storagechanges'
      ]);
    });

    vmDebugger.event.register('debuggerStatus', (isActive: boolean) => {
      setIsDebugging(isActive);
      setDebugData({
        trace: vmDebugger.step_manager.traceManager.trace,
        currentTrace:
          vmDebugger.step_manager.traceManager.trace?.[
            vmDebugger.step_manager.traceManager.currentStepIndex
          ]
      });
    });
  }

  function handleStopDebug() {
    setVMDebugger(null);
    setStep(0);
    vmDebugger.unload();
    setDebugData({
      trace: null,
      currentTrace: null,
      calldata: null
    });
  }
};

/**
 * 注意 locals和state的区别
 */
