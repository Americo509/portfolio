// Scripts inline do <head>: rodam antes do primeiro paint. Ficam num módulo
// comum (não "use client") para o servidor receber as strings de verdade.

export const BOOT_SESSION_KEY = "gd:booted";
export const RESENHA_KEY = "gd:resenha";

/** Mostra o preloader só na primeira visita da sessão e sem reduced motion. */
export const bootScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${BOOT_SESSION_KEY}')){document.documentElement.dataset.boot='1'}}catch(e){}`;

/** Aplica o Modo Resenha salvo antes do primeiro paint. */
export const resenhaScript = `try{if(localStorage.getItem('${RESENHA_KEY}')==='1'){document.documentElement.classList.add('resenha')}}catch(e){}`;
