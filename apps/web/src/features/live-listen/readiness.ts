export type ListeningReadinessInput={gunAvailable:boolean;count:number;minimum:number;loading?:boolean;busy?:boolean;saving?:boolean;connecting?:boolean;unsaved?:boolean;timed?:boolean};
export type ListeningReason=''|'gun'|'loading'|'busy'|'saving'|'connecting'|'unsaved'|'session'|'training';
/** Navigation can show setup guidance before training. Permission/capture stays
 * separately gated; connecting/timed work uses the existing safe leave path. */
export function listeningReadiness({gunAvailable,count,minimum,loading=false,busy=false,saving=false,connecting=false,unsaved=false,timed=false}:ListeningReadinessInput):{reason:ListeningReason;entryDisabled:boolean}{
 const entryDisabled=!gunAvailable||loading||busy||saving||unsaved;
 const trained=Number.isFinite(count)&&Number.isFinite(minimum)&&minimum>0&&count>=minimum;
 const reason:ListeningReason=!gunAvailable?'gun':loading?'loading':busy?'busy':connecting?'connecting':saving?'saving':unsaved?'unsaved':timed?'session':trained?'':'training';
 return{reason,entryDisabled};
}
