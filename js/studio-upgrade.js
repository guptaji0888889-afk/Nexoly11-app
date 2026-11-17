/* Nexoly11 Studio upgrade: real photo export + safe video preview controls. */
(()=>{
 const $=id=>document.getElementById(id); if(!$('proStudio')) return;
 document.querySelectorAll('[data-protab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-protab]').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('[data-pane]').forEach(x=>x.hidden=x.dataset.pane!==btn.dataset.protab);
 }));
 let rotation=0,flip=false;
 $('rotateLeft').onclick=()=>{rotation=(rotation+270)%360;};
 $('flipImage').onclick=()=>{flip=!flip;};
 $('resetImage').onclick=()=>{rotation=0;flip=false;const f=$('visualFilter');if(f){f.value='filter-normal';f.dispatchEvent(new Event('change'));}};
 function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
 $('exportPhoto').onclick=async()=>{
  const file=$('media')?.files?.[0],img=document.querySelector('#preview img.preview-media');
  if(!file||!img||!file.type.startsWith('image/')){alert('Photo export ke liye pehle gallery ya camera se photo select karein.');return;}
  const source=new Image();source.src=URL.createObjectURL(file);await new Promise((ok,bad)=>{source.onload=ok;source.onerror=bad;});
  const w=source.naturalWidth,h=source.naturalHeight,swap=rotation%180!==0,c=document.createElement('canvas');c.width=swap?h:w;c.height=swap?w:h;
  const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(rotation*Math.PI/180);ctx.scale(flip?-1:1,1);
  const filterMap={'filter-normal':'none','filter-warm':'sepia(.25) saturate(1.25)','filter-cool':'hue-rotate(12deg) saturate(1.15)','filter-bw':'grayscale(1)','filter-vivid':'contrast(1.15) saturate(1.55)','filter-glow':'brightness(1.12) saturate(1.2)','filter-portrait':'saturate(1.15) contrast(1.04)','filter-cinema':'contrast(1.2) saturate(.85)','filter-vintage':'sepia(.35) contrast(1.1)'};
  ctx.filter=filterMap[$('visualFilter')?.value]||'none';ctx.drawImage(source,-w/2,-h/2,w,h);ctx.filter='none';
  const stage=document.querySelector('#preview .media-stage');if(stage){const text=stage.querySelector('.creator-text')?.textContent,sticker=stage.querySelector('.creator-sticker')?.textContent;if(text){ctx.font=`bold ${Math.max(24,Math.round(c.width*.045))}px sans-serif`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.fillText(text,c.width/2,c.height*.52, c.width*.85);}if(sticker){ctx.font=`${Math.round(c.width*.09)}px sans-serif`;ctx.textAlign='right';ctx.fillText(sticker,c.width*.92,c.height*.16);}}
  if($('exportWatermark').checked){const size=Math.max(18,Math.round(c.width*.025));ctx.font=`900 ${size}px sans-serif`;ctx.textAlign='right';ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.fillStyle='#fff';ctx.fillText('NEXOLY11 🇮🇳',c.width-24,c.height-28);}
  c.toBlob(blob=>{if(blob)download(blob,'NEXOLY11-edited-photo.jpg');else alert('Photo export nahi ho paya.');},'image/jpeg',.94);URL.revokeObjectURL(source.src);
 };
 const video=()=>document.querySelector('#preview video.preview-media');
 $('videoSpeed').onchange=e=>{const v=video();if(v)v.playbackRate=Number(e.target.value);};
 $('previewTrim').onclick=()=>{const v=video();if(!v){alert('Pehle video select karein.');return;}const start=Math.max(0,Number($('trimStart').value)||0),end=Number($('trimEnd').value)||v.duration;if(start>=v.duration||end<=start){alert('Start/end time sahi set karein.');return;}v.currentTime=start;v.playbackRate=Number($('videoSpeed').value)||1;v.play().catch(()=>{});const stop=()=>{if(v.currentTime>=Math.min(end,v.duration)){v.pause();v.removeEventListener('timeupdate',stop);}};v.addEventListener('timeupdate',stop);};
 const media=$('media');media?.addEventListener('change',()=>{const v=video();if(v){$('trimStart').value=0;$('trimEnd').value=Number.isFinite(v.duration)?v.duration.toFixed(1):0;v.onloadedmetadata=()=>{$('trimEnd').value=v.duration.toFixed(1);};}});
 $('aiGenerate').onclick=()=>{const p=$('aiImagePrompt').value.trim();$('aiStudioStatus').textContent=p?'AI image generation server/API is not configured. Connect a secure image-generation endpoint to enable this feature.':'Pehle image ka prompt likhein.';};
})();
