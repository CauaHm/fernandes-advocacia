(function(){
  'use strict';

  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var navLinks = document.getElementById('nav-links');
  var menuToggle = document.getElementById('menu-toggle');
  if(menuToggle && navLinks){
    // O menu virou tela cheia: com ele aberto, o corpo não rola atrás.
    function estadoMenu(aberto){
      navLinks.classList.toggle('aberto', aberto);
      document.body.classList.toggle('menu-aberto', aberto);
      menuToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      menuToggle.textContent = aberto ? '✕' : '☰';
    }
    menuToggle.addEventListener('click', function(){
      estadoMenu(!navLinks.classList.contains('aberto'));
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ estadoMenu(false); });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && navLinks.classList.contains('aberto')){
        estadoMenu(false); menuToggle.focus();
      }
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

  /* ---------- Luz do hero ----------
     No desktop ela segue o ponteiro. No toque não há ponteiro: a luz caminha
     sozinha pelo hero (animação no CSS) até o dedo encostar — daí ela passa a
     seguir o dedo e a caminhada para.                                       */
  var hero = document.querySelector('.hero');
  var pontoFino = window.matchMedia('(pointer: fine)').matches;
  if(hero && !reduzido){
    function luzEm(x, y){
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((x - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((y - r.top) / r.height * 100) + '%');
    }
    if(pontoFino){
      hero.addEventListener('mousemove', function(e){ luzEm(e.clientX, e.clientY); }, { passive:true });
    } else {
      function doDedo(e){
        var d = e.touches && e.touches[0];
        if(!d) return;
        hero.classList.add('tocado');
        luzEm(d.clientX, d.clientY);
      }
      hero.addEventListener('touchstart', doDedo, { passive:true });
      hero.addEventListener('touchmove', doDedo, { passive:true });
    }
  }

  /* ---------- A balança rebate ao toque ----------
     Ela é decorativa (aria-hidden) e já se assenta sozinha ao carregar. No
     celular, encostar nela faz o gesto acontecer de novo.                   */
  var balanca = document.querySelector('.hero .balanca');
  if(balanca && !reduzido && !pontoFino){
    balanca.addEventListener('touchstart', function(){
      if(balanca.classList.contains('batendo')) return;
      balanca.classList.add('batendo');
      setTimeout(function(){ balanca.classList.remove('batendo'); }, 2450);
    }, { passive:true });
  }

  /* ---------- Áreas: o filete de ouro segue a leitura ----------
     No desktop o hover acende a linha. No celular quem acende é a rolagem:
     fica gravada a área que estiver cruzando o meio da tela.                */
  if(!pontoFino && 'IntersectionObserver' in window){
    var areas = Array.prototype.slice.call(document.querySelectorAll('.area'));
    if(areas.length){
      var naFaixa = [];
      var ioArea = new IntersectionObserver(function(entradas){
        entradas.forEach(function(e){
          var i = naFaixa.indexOf(e.target);
          if(e.isIntersecting){ if(i < 0){ naFaixa.push(e.target); } }
          else if(i >= 0){ naFaixa.splice(i, 1); }
        });
        // Cada área tem 119px e a faixa tem ~110: na fronteira entre duas, as
        // duas cruzam a faixa ao mesmo tempo. Fica gravada só a que estiver
        // mais perto do meio da tela — uma de cada vez, sempre.
        var meio = window.innerHeight / 2, lider = null, menor = Infinity;
        naFaixa.forEach(function(el){
          var r = el.getBoundingClientRect();
          var d = Math.abs(r.top + r.height / 2 - meio);
          if(d < menor){ menor = d; lider = el; }
        });
        areas.forEach(function(el){ el.classList.toggle('ativa', el === lider); });
      }, { rootMargin:'-42% 0px -42% 0px', threshold:0 });
      areas.forEach(function(a){ ioArea.observe(a); });
    }
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
