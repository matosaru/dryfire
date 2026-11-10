export async function removeHistoryRecord(kind,id,gunId,{renderHistory,historyText,showError,message}){
 try{
  const {deleteEvent,deleteSession}=await import('../storage/historyDeletion.js');
  await (kind==='session'?deleteSession:deleteEvent)(id,gunId);
  await renderHistory();
  historyText(kind==='session'?'sessionsClearOutcome':'historyClearOutcome',message??(kind==='session'?'Session deleted.':'Recognition deleted.'));
 }catch(error){showError(error);}
}
