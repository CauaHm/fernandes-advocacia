(function(){
  'use strict';

  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var navLinks = document.getElementById('nav-links');
  var menuToggle = document.getElementById('menu-toggle');
  if(menuToggle && navLinks){
    menuToggle.addEventListener('click', function(){
      var aberto = navLinks.classList.toggle('aberto');
      menuToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      menuToggle.textContent = aberto ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('aberto');
        menuToggle.setAttribute('aria-expanded','false');
        menuToggle.textContent = '☰';
      });
    });
  }

  /* ---------- Cabeçalho ganha fundo sólido ao rolar ---------- */
  var cabecalho = document.getElementById('cabecalho');

  /* ---------- Fio de prumo: progresso da leitura ---------- */
  var fio = document.getElementById('prumo-fio');
  var peso = document.getElementById('prumo-peso');

  function aoRolar(){
    if(cabecalho){
      cabecalho.classList.toggle('rolado', window.scrollY > 12);
    }
    if(fio){
      var altura = document.documentElement.scrollHeight - window.innerHeight;
      var pct = altura > 0 ? (window.scrollY / altura) * 100 : 0;
      pct = Math.max(0, Math.min(100, pct));
      fio.style.height = pct + '%';
      if(peso){ peso.style.top = pct + '%'; }
    }
  }
  window.addEventListener('scroll', aoRolar, { passive:true });
  window.addEventListener('resize', aoRolar, { passive:true });
  aoRolar();

  /* ---------- Luz que acompanha o ponteiro no hero ---------- */
  var hero = document.querySelector('.hero');
  if(hero && !reduzido && window.matchMedia('(pointer: fine)').matches){
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive:true });
  }

  /* ---------- Revelar ao rolar (repete ao entrar e sair) ---------- */
  var alvos = document.querySelectorAll('.revelar');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(entrada){
        entrada.target.classList.toggle('visivel', entrada.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    alvos.forEach(function(el){ io.observe(el); });
  } else {
    alvos.forEach(function(el){ el.classList.add('visivel'); });
  }

  /* ---------- Item de menu ativo conforme a seção visível ---------- */
  if(navLinks && 'IntersectionObserver' in window){
    var secoes = ['sobre','areas','confianca','duvidas','contato']
      .map(function(id){ return document.getElementById(id); })
      .filter(Boolean);
    var itens = navLinks.querySelectorAll('a[href^="#"]');
    if(secoes.length){
      var ioNav = new IntersectionObserver(function(entradas){
        entradas.forEach(function(entrada){
          if(entrada.isIntersecting){
            itens.forEach(function(a){
              a.classList.toggle('ativo', a.getAttribute('href') === '#' + entrada.target.id);
            });
          }
        });
      }, { threshold: 0.35 });
      secoes.forEach(function(s){ ioNav.observe(s); });
    }
  }

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if(ano){ ano.textContent = new Date().getFullYear(); }

  /* ---------- Formulário ----------
     O site é estático: não há servidor. O formulário monta a mensagem e a
     abre no WhatsApp do escritório — o envio final acontece no aplicativo.
     Nenhum dado é armazenado aqui.                                        */
  var form = document.getElementById('contato-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      // O form usa novalidate para que a validação ocorra aqui, sob controle.
      // reportValidity() mostra as mensagens nativas e barra o envio enquanto
      // nome, mensagem e o consentimento LGPD não estiverem preenchidos.
      if(!form.reportValidity()){ return; }

      var nome = document.getElementById('nome').value.trim();
      var email = document.getElementById('email').value.trim();
      var telefone = document.getElementById('telefone').value.trim();
      var area = document.getElementById('area').value;
      var mensagem = document.getElementById('mensagem').value.trim();

      var partes = ['Olá! Meu nome é ' + nome + '.'];
      if(area){ partes.push('Assunto: ' + area + '.'); }
      partes.push(mensagem);
      if(telefone){ partes.push('Telefone para retorno: ' + telefone + '.'); }
      if(email){ partes.push('E-mail: ' + email + '.'); }

      window.open('https://wa.me/5515991114217?text=' + encodeURIComponent(partes.join(' ')), '_blank');

      // Integração opcional: para receber também uma cópia por e-mail, dá para
      // plugar um serviço como Formspree, Resend ou EmailJS aqui — continua
      // sendo site estático, sem backend próprio. Exige conta e chave.
    });
  }
})();
