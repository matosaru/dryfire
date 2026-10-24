import type {FormEventHandler} from 'react';
export type StepAction='up'|'down'|'remove';
export type CustomDrillFieldsProps={title?:string;nameValue?:string;actionValue?:string;stepLabels?:string[];addDisabled?:boolean;saveDisabled?:boolean;onAdd?:()=>void;onCancel?:()=>void;onStep?:(index:number,action:StepAction)=>void};
/** Shared fields for prerender and a lifetime-stable native form host. */
export function CustomDrillFields({title='Create a drill',nameValue,actionValue,stepLabels=[],addDisabled=false,saveDisabled=false,onAdd,onCancel,onStep}:CustomDrillFieldsProps){return <>
 <h3 id="customDrillEditorTitle">{title}</h3>
 <label htmlFor="customDrillName">Drill name<input id="customDrillName" name="customDrillName" type="text" required minLength={1} maxLength={80} placeholder="Name your drill" autoComplete="off" defaultValue={nameValue}/></label>
 <p className="editor-label">Action sequence</p>
 <ol id="customDrillSteps" className="custom-drill-steps" aria-label="Custom drill action order">{stepLabels.map((label,index)=><li key={index} className="custom-step"><span className="custom-step-name">{`${index+1}. ${label}`}</span><span className="custom-step-controls">{([['up','↑',index===0],['down','↓',index===stepLabels.length-1],['remove','×',false]] as const).map(([action,text,disabled])=><button key={action} type="button" disabled={disabled} data-step-action={action} aria-label={`${action==='remove'?'Remove':'Move '+action} action ${index+1}`} onClick={()=>onStep?.(index,action)}>{text}</button>)}</span></li>)}</ol>
 <div className="custom-action-controls"><label htmlFor="customAction">Add a sound<select id="customAction" defaultValue={actionValue}><option value="draw">Draw from holster</option><option value="rack">Rack slide</option><option value="trigger">Trigger pull</option><option value="reload">Change magazine</option></select></label><button id="addCustomActionBtn" className="button secondary" type="button" disabled={addDisabled} onClick={onAdd}>+ Add Action</button></div>
 <p className="muted small">Use the arrow buttons to reorder. Sounds can repeat.</p>
 <div className="custom-editor-actions"><button id="saveCustomDrillBtn" className="button primary" type="submit" disabled={saveDisabled}>Save Drill</button><button id="cancelCustomDrillBtn" className="button secondary" type="button" onClick={onCancel}>Cancel</button></div>
 </>;}
export function CustomDrillEditor({hidden=true,onSubmit,...fields}:CustomDrillFieldsProps&{hidden?:boolean;onSubmit?:FormEventHandler<HTMLFormElement>}){return <form id="customDrillForm" className={hidden?'custom-drill-editor hidden':'custom-drill-editor'} aria-labelledby="customDrillEditorTitle" onSubmit={onSubmit}><CustomDrillFields {...fields}/></form>;}
