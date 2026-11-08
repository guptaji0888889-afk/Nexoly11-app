/* NEXOLY11 profile UI: safe additive layer; does not alter existing accounts or posts. */
(()=>{'use strict';
 const db=window.N11; if(!db)return;
 const $=s=>document.querySelector(s); const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const say=(m,id='profileUiStatus')=>{const e=document.getElementById(id)||$('#status');if(e)e.textContent=m;};
 let me=null, posts=[];
 async function start(){
  const {data:{session}}=await db.auth.getSession(); me=session?.user; if(!me)return;
  const {data:p}=await db.from('profiles').select('username,full_name,avatar_url,bio').eq('id',me.id).maybeSingle();
  if(p){const name=p.full_name||p.username||'Nexoly11 Creator'; if($('#profileName'))$('#profileName').textContent='@'+(p.username||me.email?.split('@')[0]||'user'); if($('#profileBio'))$('#profileBio').textContent=p.bio||''; if($('#fullName'))$('#fullName').value=p.full_name||''; if($('#username'))$('#username').value=p.username||''; if($('#bio'))$('#bio').value=p.bio||''; if(p.avatar_url)renderAvatar(p.avatar_url,name);}
  await Promise.all([loadPosts(),loadHighlights()]);
  $('#addHighlight')?.addEventListener('click',addHighlight);
  document.querySelectorAll('[data-profile-tab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-profile-tab]').forEach(x=>x.classList.toggle('active',x===b));renderPosts(b.dataset.profileTab||'grid')}));
  $('#shareProfile')?.addEventListener('click',shareProfile);
  $('#openEdit')?.addEventListener('click',()=>{$('#fullName')?.scrollIntoView({behavior:'smooth',block:'center'});$('#fullName')?.focus()});
  $('#openSettings')?.addEventListener('click',()=>$('#appearanceSettings')?.scrollIntoView({behavior:'smooth'}));
 }
 function renderAvatar(url,alt){let img=$('#profileAvatar');if(!img){const head=$('.profile-header,.ig-profile-head,.panel');if(!head)return;img=document.createElement('img');img.id='profileAvatar';img.className='n11-profile-avatar';head.prepend(img)}img.src=url;img.alt=alt||'Profile photo';}
 async function loadPosts(){const box=$('#myPosts');if(!box)return;box.innerHTML='<p class="muted">Loading posts…</p>';const {data,error}=await db.from('posts').select('id,media_url,media_type,caption,created_at').eq('user_id',me.id).order('created_at',{ascending:false}).limit(90);if(error){box.innerHTML='<p class="muted">Posts load nahi hue: '+esc(error.message)+'</p>';return}posts=data||[];if($('#postCount'))$('#postCount').textContent=posts.length;renderPosts('grid');}
 function renderPosts(mode){const box=$('#myPosts');if(!box)return;const rows=mode==='reels'?posts.filter(p=>p.media_type==='video'):posts;if(!rows.length){box.innerHTML='<div class="n11-empty">'+(mode==='reels'?'Abhi koi reel nahi hai.':'Abhi koi post nahi hai.')+'</div>';return}box.innerHTML=rows.map(p=>`<a class="n11-post-tile" href="${p.media_type==='video'?'reels.html':'#'}" aria-label="Open post"><${p.media_type==='video'?'video':'img'} src="${esc(p.media_url)}" ${p.media_type==='video'?'muted playsinline':''} alt="${esc(p.caption||'Nexoly11 post')}" loading="lazy"></${p.media_type==='video'?'video':'img'}>${p.media_type==='video'?'<span class="n11-play">▶</span>':''}</a>`).join('');}
 async function loadHighlights(){const box=$('#highlightList');if(!box)return;const {data,error}=await db.from('story_highlights').select('id,title,media_url,media_type,created_at').eq('user_id',me.id).order('created_at',{ascending:false});if(error){box.innerHTML='<p class="muted">Highlights ke liye Supabase migration run karni hogi.</p>';return}if(!data?.length){box.innerHTML='<p class="muted">Abhi highlights nahi hain.</p>';return}box.innerHTML=data.map(h=>`<div class="n11-highlight"><div class="n11-highlight-ring"><img src="${esc(h.media_url)}" alt="${esc(h.title)}"></div><small>${esc(h.title)}</small></div>`).join('');}
 async function addHighlight(){if(!me)return;const {data,error}=await db.from('stories').select('id,media_url,media_type').eq('user_id',me.id).order('created_at',{ascending:false}).limit(1).maybeSingle();if(error||!data){say('Pehle ek story upload karein, phir highlight add karein.','highlightStatus');return}const title=prompt('Highlight ka naam likhein:','My Story');if(!title)return;const {error:e}=await db.from('story_highlights').insert({user_id:me.id,story_id:data.id,title:title.trim().slice(0,30)||'Highlights',media_url:data.media_url,media_type:data.media_type||'image'});if(e){say('Highlight save nahi hua: '+e.message,'highlightStatus');return}say('Highlight add ho gaya!','highlightStatus');await loadHighlights();}
 async function shareProfile(){const url=location.href;try{if(navigator.share)await navigator.share({title:'NEXOLY11 Profile',url});else{await navigator.clipboard.writeText(url);say('Profile link copy ho gaya.')}}catch(e){}}
 document.addEventListener('DOMContentLoaded',()=>start().catch(e=>{console.error('NEXOLY profile UI',e);say('Profile load error: '+e.message)}));
})();
