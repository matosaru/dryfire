export function paintGuideFrame(canvas, frame) {
const ctx = canvas.getContext('2d');
const colors={green:'#71e4a0',amber:'#ffbc79',muted:'#a8bdca'};
function text(value,x,y,size=12,color='#ffffff',weight=400){ctx.fillStyle=color;ctx.font=weight+' '+size+'px system-ui,sans-serif';ctx.fillText(value,x,y)}
function fit(value,y,size=12,color='#b8cad8'){ctx.font=size+'px system-ui,sans-serif';while(ctx.measureText(value).width>310&&size>9){size-=.5;ctx.font=size+'px system-ui,sans-serif'}text(value,16,y,size,color)}

ctx.fillStyle='#101a22';ctx.fillRect(0,0,344,244);
text(frame.example,16,21,9,'#b8cad8',600);
ctx.fillStyle=colors[frame.micTone];ctx.beginPath();ctx.arc(21,43,4,0,Math.PI*2);ctx.fill();text(frame.mic,33,47,11,colors[frame.micTone],550);
text(frame.title,16,78,frame.title.length>30?14:16,frame.failed&&frame.phase==='result'?'#ffb095':'#fff',700);
text(frame.value,16,124,34,frame.beep?'#ffbc79':frame.phase==='countdown'?'#ffbc79':'#fff',800);
// A discrete icon represents the synthetic recognized event. No decorative
// waveform or fake live microphone-level meter is shown.
if(frame.pulse){ctx.strokeStyle=frame.failed?'#ffb095':'#66d6ff';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(295,106,9+i*8,-.9,.9);ctx.stroke()}}
fit(frame.detail,149);
ctx.strokeStyle='#334957';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(16,165);ctx.lineTo(328,165);ctx.stroke();
text(frame.counter,16,187,12,'#ffffff',650);fit(frame.last,209,11,frame.failed?'#ffbcad':'#b8cad8');
text('Synthetic detections · silent example · no live audio',16,232,9,'#a8bdca');
}
