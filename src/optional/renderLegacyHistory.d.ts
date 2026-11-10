export type LegacySavedSession={id:string;drillTitle:string;startedAt:number;kind?:string;shots?:number;completed:number;config:{repetitions:number};status:string};
export function renderSavedSessions(doc:Document,records:LegacySavedSession[],actions:{onOpen:(record:LegacySavedSession)=>void;onDelete?:(record:LegacySavedSession)=>void|Promise<void>;onError?:(error:unknown)=>void}):void;
