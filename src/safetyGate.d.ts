export function createSafetyGate(options:{
  dialog:HTMLDialogElement;checkbox:HTMLInputElement;confirmButton:HTMLButtonElement;cancelButton:HTMLButtonElement;
  isConfirmed:()=>boolean;confirmState:()=>void;identity:()=>string|null|undefined;onError:(error:unknown)=>void;
}):{ensure(action?:()=>unknown):boolean;cancel():void};
