/* NEXOLY11: seven distinct persistent themes */
(() => {
  'use strict';
  const KEY='nexoly11-theme-mode';
  const themes={
    white:{label:'White Pearl',bg:'#f7f7fb',surface:'#ffffff',surface2:'#f0f1f7',text:'#171827',muted:'#73758a',border:'#dedfeb',accent:'#7357e8',accentText:'#ffffff',nav:'#ffffff',input:'#f6f6fa'},
    neon:{label:'Neon Dark',bg:'#08040d',surface:'#130817',surface2:'#211027',text:'#fff5ff',muted:'#c7a9c7',border:'#53244d',accent:'#ff3ac8',accentText:'#180018',nav:'#08040d',input:'#1b1020'},
    sunset:{label:'Sunset',bg:'#281018',surface:'#3b1a27',surface2:'#572638',text:'#fff4ee',muted:'#e6b8ae',border:'#82404b',accent:'#ff956b',accentText:'#35100b',nav:'#210d17',input:'#4b2331'},
    ocean:{label:'Ocean Blue',bg:'#061b30',surface:'#0b2b49',surface2:'#124568',text:'#eafaff',muted:'#9ec9dd',border:'#236287',accent:'#24d5ed',accentText:'#032331',nav:'#041526',input:'#103653'},
    forest:{label:'Forest Green',bg:'#071a13',surface:'#10291d',surface2:'#1a3b29',text:'#effff3',muted:'#a8cbb2',border:'#315e40',accent:'#63e28b',accentText:'#092014',nav:'#06140e',input:'#173523'},
    galaxy:{label:'Galaxy',bg:'#100827',surface:'#1b1040',surface2:'#2b1a5c',text:'#f8f1ff',muted:'#c4b3e6',border:'#513b83',accent:'#c38aff',accentText:'#1b0b31',nav:'#0d061e',input:'#251748'},
    candy:{label:'Candy Pink',bg:'#fff0f7',surface:'#ffffff',surface2:'#ffe0ee',text:'#4a2036',muted:'#98677f',border:'#f2bfd7',accent:'#ed6da9',accentText:'#ffffff',nav:'#fff7fb',input:'#fff4f9'}
  };
  function apply(name){
    if(!themes[name]) name='white';
    const t=themes[name],r=document.documentElement;
    r.dataset.theme=name;
    Object.entries({bg:t.bg,surface:t.surface,surface2:t.surface2,text:t.text,muted:t.muted,border:t.border,accent:t.accent,accentText:t.accentText,nav:t.nav,input:t.input}).forEach(([k,v])=>r.style.setProperty('--n11-'+k,v));
    document.querySelectorAll('[data-set-theme]').forEach(b=>{
      const active=b.dataset.setTheme===name;
      b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));
    });
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.bg;
    try{localStorage.setItem(KEY,name)}catch(e){}
    const status=document.getElementById('themeStatus');if(status)status.textContent=themes[name].label+' selected.';
  }
  window.N11Theme={themes,apply};
  const init=()=>{let saved='white';try{saved=localStorage.getItem(KEY)||'white'}catch(e){} apply(saved);
    document.querySelectorAll('[data-set-theme]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.setTheme)));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();