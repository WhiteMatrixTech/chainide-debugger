ChainIDE Debugger displays the status of the contract after entering the transaction hash.

It can be used for transactions created on ChainIDE or by providing the address of the transaction. The latter presupposes that you have the source code of the contract, or that you have entered a verified contract address.

The following methods start a debugging session.

1. When a successful or failed transaction appears in the terminal, click the debug button. The debugger will be activated and given focus in the side panel.
2. Activate the debugger in the plugin manager and click on the error in the icon panel. To start a debugging session, enter the address of a deployed transaction -- while having source code in the editor, and click the Start Debugging button.

## Debugger Panel

### Function Stack

The function stack lists the functions that the transaction is interacting with.

![image](https://user-images.githubusercontent.com/8351437/165237727-551d1145-5fbc-4e96-b21b-abe01931610d.png)


### Solidity Locals

Solidity Locals are used to represent local variables within a function.

![image](https://user-images.githubusercontent.com/8351437/165237757-ec676afd-ca18-48f7-9b72-031ef0072498.png)


### Solidity State

These are the state variables of the smart contract

![image](https://user-images.githubusercontent.com/8351437/165237781-46ac9289-5a0c-4400-80cd-f34ab768b66f.png)


### Opcodes

This panel shows the step number and opcode the debugger is currently in.

![image](https://user-images.githubusercontent.com/8351437/165237805-5d69d304-f0ce-473b-8124-0cca02261577.png)


### Step Details

Step Details shows more information about an opcode step.

![image](https://user-images.githubusercontent.com/8351437/165237839-71ecd355-68b7-41dc-bedd-02cbf725a7ca.png)


### Stack

This panel shows the EVM stack

![image](https://user-images.githubusercontent.com/8351437/165237865-8c937d27-df46-4505-869a-b0a7b2061e07.png)


### Memory

Every new message call clears the memory. Memory is linear and can be addressed at the byte level. The read width is limited to 256 bits,

while the write width can be 8 bits or 256 bits. The memory panel consists of 3 columns. You may need to make the Remix side panels wider to get the formatting right. (Drag the border between the main panel and the side panel to the right).

Column 1 is the location in memory. The second column is the encoded value in hexadecimal. Column 3 is the decoded value. If there is nothing, then a question mark (?) will be displayed -- like this.

![image](https://user-images.githubusercontent.com/8351437/165237892-1ce3e652-4b36-4e99-9d4d-f3f1f3f158d7.png)


### Storage

The panel is persistently stored Call Stack All computations are performed on a data array called the call stack. It has a maximum size of 1024 elements and contains 256-bit words.

### Call Data

The call data contains function parameters.

![image](https://user-images.githubusercontent.com/8351437/165237908-59a3d924-9e31-4b5d-bc31-58f58a76a1d0.png)


### Return Value

Refers to the value that the function will return.

![image](https://user-images.githubusercontent.com/8351437/165237941-7691b5e8-b441-4891-b4c1-94310f264187.png)

Refers to the value that the function will return.

### Full Storage Changes

This shows the persistent storage at the end of the function.

![image](https://user-images.githubusercontent.com/8351437/165237961-93d8af08-c16f-4dda-90f6-4dd9b022181d.png)


### Debugger Breakpoint Function

![image](https://user-images.githubusercontent.com/8351437/165237981-0f6b426b-95e4-4c61-8893-a0f527873163.png)
