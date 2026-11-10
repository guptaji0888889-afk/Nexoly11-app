/* NEXOLY11 notifications: authenticated list + mark as read */
(()=>{'use strict';
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function init(){
  const box=$('#notificationList'),db=window.N11;if(!box)return;
  if(!db){box.innerHTML='<p class="empty">App connection load nahi hua. Page refresh karein.</p>';return}
  const {data:{session},error:se}=await db.auth.getSession();
  if(se||!session?.user){box.innerHTML='<p class="empty">Notifications dekhne ke liye <a href="login.html">Login</a karein.</p>';return}
  const {data:rows,error}=await db.from('notifications').select('id,actor_id,type,entity_id,body,is_read,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(100);
  if(error){box.innerHTML='<p class="empty">Notifications load nahi hui. Backend migration check karein.</p>';console.warn(error.message);return}
  if(!rows?.length){box.innerHTML='<p class="empty">Abhi koi notification nahi hai.</p>';return}
  const actorIds=[...new Set(rows.map(x=>x.actor_id).filter(Boolean))];let actors={};
  if(actorIds.length){const {data}=await db.from('profiles').select('id,username,full_name,avatar_url').in('id',actorIds);actors=Object.fromEntries((data||[]).map(x=>[x.id,x]))}
  box.innerHTML=rows.map(n=>{const a=actors[n.actor_id]||{};const who=a.username||a.full_name||'Nexoly11 user';const msg=n.body||({like:'liked your post',comment:'commented on your post',follow:'started following you',follow_request:'sent you a follow request',message:'sent you a message',story_view:'viewed your story',story_reply:'replied to your story',mention:'mentioned you'}[n.type]||'interacted with you');return `<article class="panel n11-notification ${n.is_read?'':'unread'}" data-notification="${esc(n.id)}"><div class="n11-notification-row"><div class="avatar">${esc(who.slice(0,1).toUpperCase())}</div><div class="n11-notification-copy"><b>${esc(who)}</b> ${esc(msg)}<small class="muted">${new Date(n.created_at).toLocaleString()}</small></div>${n.is_read?'':'<span class="n11-unread-dot" aria-label="Unread"></span>'}</div><button class="btn secondary n11-mark-read" type="button" ${n.is_read?'hidden':''}>Mark read</button></article>`}).join('');
  box.addEventListener('click',async e=>{const b=e.target.closest('.n11-mark-read');if(!b)return;const card=b.closest('[data-notification]');if(!card)return;b.disabled=true;const {error}=await db.from('notifications').update({is_read:true}).eq('id',card.dataset.notification).eq('user_id',session.user.id);if(error){b.disabled=false;alert('Update nahi hua: '+error.message);return}b.hidden=true;card.classList.remove('unread');card.querySelector('.n11-unread-dot')?.remove()});
 }
 document.addEventListener('DOMContentLoaded',()=>init().catch(e=>{console.error(e);const box=$('#notificationList');if(box)box.innerHTML='<p class="empty">Notifications load nahi hui.</p>'}));
})();
