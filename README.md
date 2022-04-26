ChainIDE Debugger displays the status of the contract after entering the transaction hash.

It can be used for transactions created on ChainIDE or by providing the address of the transaction. The latter presupposes that you have the source code of the contract, or that you have entered a verified contract address.

The following methods start a debugging session.

1. When a successful or failed transaction appears in the terminal, click the debug button. The debugger will be activated and given focus in the side panel.
2. Activate the debugger in the plugin manager and click on the error in the icon panel. To start a debugging session, enter the address of a deployed transaction -- while having source code in the editor, and click the Start Debugging button.

## Debugger Panel

### Function Stack

The function stack lists the functions that the transaction is interacting with.

### Solidity Locals

Solidity Locals are used to represent local variables within a function.

### Solidity State

These are the state variables of the smart contract

### Opcodes

This panel shows the step number and opcode the debugger is currently in.

### Step Details

Step Details shows more information about an opcode step.

### Stack

This panel shows the EVM stack

### Memory

Every new message call clears the memory. Memory is linear and can be addressed at the byte level. The read width is limited to 256 bits,

while the write width can be 8 bits or 256 bits. The memory panel consists of 3 columns. You may need to make the Remix side panels wider to get the formatting right. (Drag the border between the main panel and the side panel to the right).

Column 1 is the location in memory. The second column is the encoded value in hexadecimal. Column 3 is the decoded value. If there is nothing, then a question mark (?) will be displayed -- like this.

### Storage

The panel is persistently stored Call Stack All computations are performed on a data array called the call stack. It has a maximum size of 1024 elements and contains 256-bit words.

### Call Data

The call data contains function parameters.

### Return Value

Refers to the value that the function will return.

### Full Storage Changes

This shows the persistent storage at the end of the function.

### Debugger Breakpoint Function
