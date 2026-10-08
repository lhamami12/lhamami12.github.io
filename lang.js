(function(){var d=document.documentElement;d.classList.add('js');
var L='ar';try{L=localStorage.getItem('lang')||((navigator.language||'').slice(0,2)==='ar'?'ar':'en');}catch(e){L=((navigator.language||'').slice(0,2)==='ar')?'ar':'en';}
function set(l){L=l;d.classList.toggle('ar',l==='ar');d.lang=l;d.dir=l==='ar'?'rtl':'ltr';try{localStorage.setItem('lang',l);}catch(e){}
var b=document.getElementById('lb');if(b)b.textContent=l==='ar'?'English':'العربية';}
set(L);window.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('lb');set(L);b.onclick=function(){set(L==='ar'?'en':'ar');};});})();
