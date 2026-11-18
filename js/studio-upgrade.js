/* NEXOLY11 Creator Studio: client-side photo adjustments and safe preview tools.
   AI generation and final video rendering require a secure server-side service. */
(()=>{
 const $=id=>document.getElementById(id); if(!$('proStudio')) return;
 document.querySelectorAll('[data-protab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-protab]').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('[data-pane]').forEach(x=>x.hidden=x.dataset.pane!==btn.dataset.protab);
 }));
 let rotation=0,flip=false;
 const adjustmentIds=['photoBrightness','photoContrast','photoSaturation'];
 const filterMap={'filter-normal':'none','filter-warm':'sepia(.25) saturate(1.25)','filter-cool':'hue-rotate(12deg) saturate(1.15)','filter-bw':'grayscale(1)','filter-vivid':'contrast(1.15) saturate(1.55)','filter-glow':'brightness(1.12) saturate(1.2)','filter-portrait':'saturate(1.15) contrast(1.04)','filter-cinema':'contrast(1.2) saturate(.85)','filter-vintage':'sepia(.35) contrast(1.1)'};
 const cssFilter=()=>`${filterMap[$('visualFilter')?.value]||'none'} brightness(${Number($('photoBrightness')?.value||100)/100}) contrast(${Number($('photoContrast')?.value||100)/100}) saturate(${Number($('photoSaturation')?.value||100)/100})`;
 function updatePreview(){const el=document.querySelector('#preview .preview-media');if(el)el.style.filter=cssFilter();}
 adjustmentIds.forEach(id=>$(id)?.addEventListener('input',updatePreview));$('visualFilter')?.addEventListener('change',updatePreview);
 function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
 $('rotateLeft').onclick=()=>{rotation=(rotation+270)%360;};$('flipImage').onclick=()=>{flip=!flip;};
 $('resetImage').onclick=()=>{rotation=0;flip=false;adjustmentIds.forEach(id=>$(id).value=100);$('visualFilter').value='filter-normal';updatePreview();};
 $('exportPhoto').onclick=async()=>{
  const file=$('media')?.files?.[0];if(!file||!file.type.startsWith('image/')){alert('Photo export ke liye pehle gallery ya camera se photo select karein.');return;}
  const source=new Image(),sourceUrl=URL.createObjectURL(file);source.src=sourceUrl;
  try{await new Promise((ok,bad)=>{source.onload=ok;source.onerror=bad;});
   const w=source.naturalWidth,h=source.naturalHeight,swap=rotation%180!==0,c=document.createElement('canvas');c.width=swap?h:w;c.height=swap?w:h;
   const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(rotation*Math.PI/180);ctx.scale(flip?-1:1,1);ctx.filter=cssFilter();ctx.drawImage(source,-w/2,-h/2,w,h);ctx.filter='none';
   const stage=document.querySelector('#preview .media-stage'),text=stage?.querySelector('.creator-text')?.textContent,sticker=stage?.querySelector('.creator-sticker')?.textContent;
   if(text){ctx.font=`bold ${Math.max(24,Math.round(c.width*.045))}px sans-serif`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.fillText(text,c.width/2,c.height*.52,c.width*.85);}
   if(sticker){ctx.font=`${Math.round(c.width*.09)}px sans-serif`;ctx.textAlign='right';ctx.fillText(sticker,c.width*.92,c.height*.16);}
   if($('exportWatermark').checked){ctx.font=`900 ${Math.max(18,Math.round(c.width*.025))}px sans-serif`;ctx.textAlign='right';ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.fillStyle='#fff';ctx.fillText('NEXOLY11 🇮🇳',c.width-24,c.height-28);}
   c.toBlob(blob=>blob?download(blob,'NEXOLY11-edited-photo.jpg'):alert('Photo export nahi ho paya.'),'image/jpeg',.94);
  }catch(e){alert('Photo load nahi ho payi. Dobara select karein.');}finally{URL.revokeObjectURL(sourceUrl);}
 };

 // Music Studio: four original royalty-free synthesized instrumental loops + user's own audio.
 const musicInput=$('music'),music=$('musicPreview');
 let musicObjectUrl=null,fadeTimer=null;
 const musicTrackNames={lofi:'Midnight Lo-fi',beat:'Creator Beat',calm:'Peaceful Vibes',cinema:'Cinematic Rise'};
 function musicStatus(message){const el=$('musicStatus');if(el)el.textContent=message;}
 function stopFade(){if(fadeTimer){clearInterval(fadeTimer);fadeTimer=null;}}
 function selectTrack(name,url,meta='Free original instrumental • Preview'){
  stopFade();if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);
  musicObjectUrl=url;music.src=url;music.load();
  $('musicSelected').hidden=false;$('musicFileName').textContent=name;$('musicFileMeta').textContent=meta;
  document.querySelectorAll('[data-free-track]').forEach(b=>b.classList.toggle('active',b.dataset.freeTrack===Object.keys(musicTrackNames).find(k=>musicTrackNames[k]===name)));
  music.volume=Number($('musicVolume')?.value||80)/100;
  musicStatus('Track ready. ▶ Play dabakar preview sunein.');
 }
 function wavBlob(buffer){
  const channels=buffer.numberOfChannels,length=buffer.length,rate=buffer.sampleRate,bytes=44+length*channels*2,ab=new ArrayBuffer(bytes),v=new DataView(ab);
  const write=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  write(0,'RIFF');v.setUint32(4,bytes-8,true);write(8,'WAVE');write(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,rate,true);v.setUint32(28,rate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);write(36,'data');v.setUint32(40,bytes-44,true);
  let offset=44;for(let i=0;i<length;i++)for(let c=0;c<channels;c++){let x=Math.max(-1,Math.min(1,buffer.getChannelData(c)[i]));v.setInt16(offset,x<0?x*32768:x*32767,true);offset+=2;}
  return new Blob([ab],{type:'audio/wav'});
 }
 async function makeFreeTrack(kind){
  const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)throw new Error('Audio generation is not supported in this browser.');
  const rate=22050,duration=12,ctx=new Offline(1,rate*duration,rate);
  const master=ctx.createGain();master.gain.value=.18;master.connect(ctx.destination);
  const patterns={lofi:[220,261.63,329.63,392],beat:[110,164.81,220,329.63],calm:[174.61,220,261.63,329.63],cinema:[130.81,196,261.63,392]};
  const notes=patterns[kind]||patterns.lofi;
  for(let t=0;t<duration;t+=.5){
   const idx=Math.floor(t/.5)%notes.length,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=kind==='beat'?'triangle':'sine';osc.frequency.value=notes[idx]*(kind==='cinema'&&t>6?2:1);
   gain.gain.setValueAtTime(0, t);gain.gain.linearRampToValueAtTime(kind==='beat'?.22:.14,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+.43);
   osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+.45);
   if(kind==='beat'&&Math.round(t*2)%2===0){const kick=ctx.createOscillator(),kg=ctx.createGain();kick.type='sine';kick.frequency.setValueAtTime(95,t);kick.frequency.exponentialRampToValueAtTime(42,t+.12);kg.gain.setValueAtTime(.32,t);kg.gain.exponentialRampToValueAtTime(.001,t+.14);kick.connect(kg);kg.connect(master);kick.start(t);kick.stop(t+.15);}
  }
  const rendered=await ctx.startRendering();return wavBlob(rendered);
 }
 document.querySelectorAll('[data-free-track]').forEach(btn=>btn.addEventListener('click',async()=>{
  const kind=btn.dataset.freeTrack;btn.disabled=true;musicStatus('Free music taiyar ho raha hai…');
  try{const blob=await makeFreeTrack(kind),url=URL.createObjectURL(blob);selectTrack(musicTrackNames[kind],url,'Original generated instrumental • Free to use');}
  catch(e){musicStatus('Track generate nahi hua: '+e.message);}finally{btn.disabled=false;}
 }));
 musicInput?.addEventListener('change',()=>{
  const file=musicInput.files?.[0];if(!file)return;
  if(!file.type.startsWith('audio/')){musicStatus('Valid audio file select karein.');musicInput.value='';return;}
  if(file.size>25*1024*1024){musicStatus('Music file 25 MB se chhoti honi chahiye.');musicInput.value='';return;}
  selectTrack(file.name,URL.createObjectURL(file),'Your uploaded audio • Local preview');
 });
 $('musicVolume')?.addEventListener('input',e=>{const v=Number(e.target.value);$('musicVolumeValue').textContent=v+'%';if(music)music.volume=v/100;});
 $('musicRemove')?.addEventListener('click',()=>{music.pause();music.removeAttribute('src');music.load();musicInput.value='';$('musicSelected').hidden=true;document.querySelectorAll('[data-free-track]').forEach(b=>b.classList.remove('active'));stopFade();if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);musicObjectUrl=null;musicStatus('Music removed. Koi doosra free track choose karein.');});
 music?.addEventListener('error',()=>musicStatus('Audio load nahi hua. Dusra track choose karein.'));
 const video=()=>document.querySelector('#preview video.preview-media');
 $('videoSpeed').onchange=e=>{const v=video();if(v)v.playbackRate=Number(e.target.value);};
 $('previewTrim').onclick=()=>{const v=video();if(!v){alert('Pehle video select karein.');return;}const start=Math.max(0,Number($('trimStart').value)||0),end=Number($('trimEnd').value)||v.duration;if(start>=v.duration||end<=start){alert('Start/end time sahi set karein.');return;}v.currentTime=start;v.playbackRate=Number($('videoSpeed').value)||1;v.play().catch(()=>{});const stop=()=>{if(v.currentTime>=Math.min(end,v.duration)){v.pause();v.removeEventListener('timeupdate',stop);}};v.addEventListener('timeupdate',stop);};
 $('media')?.addEventListener('change',()=>{const v=video();if(v){$('trimStart').value=0;$('trimEnd').value=Number.isFinite(v.duration)?v.duration.toFixed(1):0;v.onloadedmetadata=()=>{$('trimEnd').value=v.duration.toFixed(1);};}updatePreview();});
 $('aiGenerate').onclick=async()=>{const prompt=$('aiImagePrompt').value.trim(),status=$('aiStudioStatus'),btn=$('aiGenerate');if(!prompt){status.textContent='Pehle image ka prompt likhein.';return;}const endpoint=window.NEXOLY_AI_IMAGE_ENDPOINT;if(!endpoint){status.textContent='AI image service connect nahi hai. Secure server endpoint aur API key setup karni hogi; browser mein secret key mat daalein.';return;}btn.disabled=true;btn.textContent='Generating…';status.textContent='AI image ban rahi hai…';try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});if(!response.ok)throw new Error('Server error '+response.status);const data=await response.json(),url=data.imageUrl||data.url||data.image_url;if(!url)throw new Error('Server response mein image URL nahi mila.');const img=document.createElement('img');img.className='preview-media';img.alt='AI generated image';img.src=url;img.onload=()=>{const stage=document.createElement('div');stage.className='media-stage';stage.append(img);$('preview').replaceChildren(stage);$('editTools').style.display='block';status.textContent='AI image ready. Export karke save karein.';};img.onerror=()=>status.textContent='Generated image load nahi hui.';}catch(err){status.textContent='AI generation fail: '+err.message;}finally{btn.disabled=false;btn.textContent='✨ Generate AI image';}};
})();
