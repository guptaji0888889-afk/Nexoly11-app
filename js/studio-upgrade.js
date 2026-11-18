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

 // Music Studio: original royalty-free Web Audio loops + user's own local tracks.
 const musicInput=$('music'),music=$('musicPreview');
 const musicLibrary=$('musicLibrary'),musicSearch=$('musicSearch');
 let musicObjectUrl=null, audioCtx=null, loopTimer=null, activeTrack=null, activeTab='for-you', activeNodes=[];
 const tracks=[
  {id:'midnight',name:'Midnight Lo-fi',mood:'Chill',category:'chill',icon:'🌙',bpm:78,style:'lofi'},
  {id:'creator',name:'Creator Beat',mood:'Upbeat',category:'beats',icon:'⚡',bpm:110,style:'beat'},
  {id:'peaceful',name:'Peaceful Vibes',mood:'Ambient',category:'chill',icon:'🌿',bpm:68,style:'ambient'},
  {id:'cinematic',name:'Cinematic Rise',mood:'Cinematic',category:'trending',icon:'🎬',bpm:92,style:'cinema'},
  {id:'desi',name:'Desi Dhol Pulse',mood:'Festive',category:'beats',icon:'🥁',bpm:104,style:'desi'},
  {id:'motivation',name:'Motivation Drive',mood:'Energetic',category:'trending',icon:'🔥',bpm:120,style:'beat'}
 ];
 const status=msg=>{const el=$('musicStatus');if(el)el.textContent=msg;};
 function ensureAudio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('Is browser mein Web Audio support nahi hai.');if(!audioCtx)audioCtx=new AC();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
 function tone(freq,when,duration,type='sine',gain=.08){const c=ensureAudio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(gain,when+.015);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g);g.connect(c.destination);o.start(when);o.stop(when+duration+.03);activeNodes.push(o);}
 function noise(when,duration,gain=.025){const c=ensureAudio(),len=Math.ceil(c.sampleRate*duration),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=c.createBufferSource(),g=c.createGain();src.buffer=buf;g.gain.setValueAtTime(gain,when);g.gain.exponentialRampToValueAtTime(.0001,when+duration);src.connect(g);g.connect(c.destination);src.start(when);activeNodes.push(src);}
 function stopMusic(){if(loopTimer){clearInterval(loopTimer);loopTimer=null;}activeNodes.forEach(n=>{try{n.stop();}catch(e){}});activeNodes=[];if(music){music.pause();}const b=document.querySelector('[data-music-play="'+activeTrack+'"]');if(b)b.textContent='▶';}
 function scheduleLoop(track){const c=ensureAudio(),beat=60/track.bpm;let step=0;const playStep=()=>{const t=c.currentTime+.02,bar=step%16;if(track.style==='ambient'){if(bar%4===0){[220,261.63,329.63].forEach((f,i)=>tone(f,t,1.4,'sine',.035));}}else{if(bar%4===0)tone(track.style==='desi'?95:58,t,.18,'sine',.16);if(bar%4===2)noise(t,.12,.045);if(bar%2===1)noise(t,.035,.012);if(track.style==='lofi'&&bar%4===0)tone([130.81,164.81,196][Math.floor(bar/4)%3],t+.05,.32,'triangle',.035);if(track.style==='cinema'&&bar%4===0)tone(110+bar*5,t,.65,'sawtooth',.025);}step++;};playStep();loopTimer=setInterval(playStep,beat*250);}
 function renderTracks(){if(!musicLibrary)return;const q=(musicSearch?.value||'').trim().toLowerCase();const list=tracks.filter(t=>(activeTab==='for-you'||activeTab==='trending'&&t.category==='trending'||activeTab==='beats'&&t.category==='beats'||activeTab==='chill'&&t.category==='chill')&&(!q||`${t.name} ${t.mood} ${t.category}`.toLowerCase().includes(q)));musicLibrary.innerHTML=list.length?list.map(t=>`<article class="n11-track-card ${activeTrack===t.id?'selected':''}"><span class="n11-track-icon">${t.icon}</span><span class="n11-track-info"><b>${t.name}</b><small>${t.mood} · ${t.bpm} BPM · Original free loop</small></span><button type="button" class="n11-track-play" data-music-play="${t.id}" aria-label="Preview ${t.name}">${activeTrack===t.id?'Ⅱ':'▶'}</button></article>`).join(''):'<div class="n11-library-note">Is search mein track nahi mila. Dusra keyword try karein ya My Music se apna track add karein.</div>';musicLibrary.querySelectorAll('[data-music-play]').forEach(btn=>btn.addEventListener('click',()=>{const t=tracks.find(x=>x.id===btn.dataset.musicPlay);if(activeTrack===t.id){stopMusic();activeTrack=null;renderTracks();status('Preview stopped.');return;}stopMusic();activeTrack=t.id;try{scheduleLoop(t);renderTracks();status(t.name+' preview chal raha hai. Ye Nexoly11 ka original generated loop hai.');}catch(e){status(e.message);}}));}
 document.querySelectorAll('[data-music-tab]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-music-tab]').forEach(x=>x.classList.toggle('active',x===btn));activeTab=btn.dataset.musicTab;renderTracks();}));
 musicSearch?.addEventListener('input',renderTracks);renderTracks();
 musicInput?.addEventListener('change',()=>{const file=musicInput.files?.[0];if(!file)return;if(!file.type.startsWith('audio/')){status('Please choose a valid audio file.');musicInput.value='';return;}if(file.size>15*1024*1024){status('Music file 15 MB se chhoti honi chahiye.');musicInput.value='';return;}stopMusic();activeTrack='my-music';if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);musicObjectUrl=URL.createObjectURL(file);music.src=musicObjectUrl;music.volume=Number($('musicVolume')?.value||80)/100;music.hidden=false;music.style.display='block';$('musicSelected').hidden=false;$('musicFileName').textContent=file.name;$('musicFileMeta').textContent='Your device · Local preview';music.load();status('Aapka track select ho gaya. Preview player se play karein.');});
 $('musicRemove')?.addEventListener('click',()=>{music.pause();music.removeAttribute('src');music.load();musicInput.value='';music.hidden=true;music.style.display='none';$('musicSelected').hidden=true;if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);musicObjectUrl=null;activeTrack=null;status('My Music track removed.');});
 $('musicVolume')?.addEventListener('input',e=>{const v=Number(e.target.value);$('musicVolumeValue').textContent=v+'%';if(music)music.volume=v/100;});
 window.addEventListener('pagehide',()=>{stopMusic();if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);});

 const video=()=>document.querySelector('#preview video.preview-media');
 $('videoSpeed').onchange=e=>{const v=video();if(v)v.playbackRate=Number(e.target.value);};
 $('previewTrim').onclick=()=>{const v=video();if(!v){alert('Pehle video select karein.');return;}const start=Math.max(0,Number($('trimStart').value)||0),end=Number($('trimEnd').value)||v.duration;if(start>=v.duration||end<=start){alert('Start/end time sahi set karein.');return;}v.currentTime=start;v.playbackRate=Number($('videoSpeed').value)||1;v.play().catch(()=>{});const stop=()=>{if(v.currentTime>=Math.min(end,v.duration)){v.pause();v.removeEventListener('timeupdate',stop);}};v.addEventListener('timeupdate',stop);};
 $('media')?.addEventListener('change',()=>{const v=video();if(v){$('trimStart').value=0;$('trimEnd').value=Number.isFinite(v.duration)?v.duration.toFixed(1):0;v.onloadedmetadata=()=>{$('trimEnd').value=v.duration.toFixed(1);};}updatePreview();});
 $('aiGenerate').onclick=async()=>{const prompt=$('aiImagePrompt').value.trim(),status=$('aiStudioStatus'),btn=$('aiGenerate');if(!prompt){status.textContent='Pehle image ka prompt likhein.';return;}const endpoint=window.NEXOLY_AI_IMAGE_ENDPOINT;if(!endpoint){status.textContent='AI image service connect nahi hai. Secure server endpoint aur API key setup karni hogi; browser mein secret key mat daalein.';return;}btn.disabled=true;btn.textContent='Generating…';status.textContent='AI image ban rahi hai…';try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});if(!response.ok)throw new Error('Server error '+response.status);const data=await response.json(),url=data.imageUrl||data.url||data.image_url;if(!url)throw new Error('Server response mein image URL nahi mila.');const img=document.createElement('img');img.className='preview-media';img.alt='AI generated image';img.src=url;img.onload=()=>{const stage=document.createElement('div');stage.className='media-stage';stage.append(img);$('preview').replaceChildren(stage);$('editTools').style.display='block';status.textContent='AI image ready. Export karke save karein.';};img.onerror=()=>status.textContent='Generated image load nahi hui.';}catch(err){status.textContent='AI generation fail: '+err.message;}finally{btn.disabled=false;btn.textContent='✨ Generate AI image';}};
})();
