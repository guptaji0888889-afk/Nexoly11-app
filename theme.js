/* NEXOLY11: seven genuinely distinct persistent palettes */
(() => {
  'use strict';
  const KEY='nexoly11-theme-mode';
  const themes={
    dark:{label:'Classic Dark',bg:'#080b12',surface:'#121a29',surface2:'#1a2638',text:'#f4f7ff',muted:'#a8b3c7',border:'#2a3a52',accent:'#ff3d72',accentText:'#ffffff',nav:'#0b1220',input:'#172236'},
    light:{label:'Clean Light',bg:'#f4f6fb',surface:'#ffffff',surface2:'#e9edf5',text:'#182033',muted:'#68738a',border:'#d6dce8',accent:'#e73570',accentText:'#ffffff',nav:'#ffffff',input:'#f7f8fc'},
    ocean:{label:'Ocean Blue',bg:'#061b2b',surface:'#0b2b42',surface2:'#12415e',text:'#e8f8ff',muted:'#9cc8dc',border:'#1d5874',accent:'#00c2e8',accentText:'#002333',nav:'#041522',input:'#10364f'},
    forest:{label:'Forest Green',bg:'#0c1c14',surface:'#142b1d',surface2:'#203d2a',text:'#effff2',muted:'#a9c8af',border:'#31583b',accent:'#54d17a',accentText:'#092012',nav:'#08140d',input:'#1a3523'},
    sunset:{label:'Sunset',bg:'#24101c',surface:'#38182a',surface2:'#51223a',text:'#fff2ed',muted:'#e0b4b4',border:'#71364e',accent:'#ff9865',accentText:'#32100a',nav:'#1c0b15',input:'#462035'},
    amoled:{label:'AMOLED Black',bg:'#000000',surface:'#080808',surface2:'#141414',text:'#ffffff',muted:'#a0a0a0',border:'#292929',accent:'#b78cff',accentText:'#12051f',nav:'#000000',input:'#101010'},
    royal:{label:'Royal Purple',bg:'#140d29',surface:'#211640',surface2:'#30205a',text:'#f6efff',muted:'#c0b0df',border:'#493477',accent:'#c18aff',accentText:'#210d35',nav:'#0e081e',input:'#291b49'}
  };
  function apply(name){
    if(!themes[name]) name='dark';
    const t=themes[name],r=document.documentElement;
    r.dataset.theme=name;
    Object.entries({bg:t.bg,surface:t.surface,surface2:t.surface2,text:t.text,muted:t.muted,border:t.border,accent:t.accent,accentText:t.accentText,nav:t.nav,input:t.input}).forEach(([k,v])=>r.style.setProperty('--n11-'+k,v));
    document.querySelectorAll('[data-set-theme]').forEach(b=>{
      const active=b.dataset.setTheme===name;
      b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));
    });
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.bg;
    localStorage.setItem(KEY,name);
    const status=document.getElementById('themeStatus');if(status)status.textContent=themes[name].label+' selected.';
  }
  window.N11Theme={themes,apply};
  const init=()=>{let saved=localStorage.getItem(KEY)||'dark';if(saved==='auto')saved='dark';apply(saved);
    document.querySelectorAll('[data-set-theme]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.setTheme)));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();