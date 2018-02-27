(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function scrollIntoView(eleID) {
    var e = document.getElementById(eleID);
    if (!!e && e.scrollIntoView) {
      e.scrollIntoView();
      return;
    }
    return;
  }
  
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  function remark(positions) {
    if (positions.length) {
      var npos = positions.map(x => x.position);
      var home = document.getElementById('gsr');
      var div = document.createElement("div");
      div.id = 'googlefy-float-box';
      div.classList = 'googlefy-float-box';
      div.innerHTML = 
        `<div class="googlefy-float-box_inner">
          <div class="googlefy-first">
            <b class="googlefy-333">N° coincidencias: <span class="googlefy-000 googlefy-f20">${positions.length}</span></b><br>
            <b class="googlefy-333">Posicion(es) de los resultados: <span class="googlefy-bluec googlefy-f20">${npos.join(',')}</span></b>
          </div>
          <div class="googlefy-second">
            <button class="googlefy-btn" id="__prev" type="button"> << </button>
            <button class="googlefy-btn" id="__next" type="button"> >> </button>
          </div>
        </div>`;
      home.prepend(div);
      scrollIntoView(positions[0].id);
      document.getElementById('inner_'+positions[0].id).classList = 'googlefy-orange';

      var prev = document.getElementById('__prev');
      var next = document.getElementById('__next');

      var i = 0;
      prev.addEventListener('click', function() {
        document.getElementById('inner_'+positions[i].id).classList = 'googlefy-yellow';
        i--;
        if (i == -1) i = positions.length - 1;
        scrollIntoView(positions[i].id);
        document.getElementById('inner_'+positions[i].id).classList = 'googlefy-orange';
      });

      next.addEventListener('click', function() {
        document.getElementById('inner_'+positions[i].id).classList = 'googlefy-yellow';
        i++;
        if (i == positions.length) i = 0;
        scrollIntoView(positions[i].id);
        document.getElementById('inner_'+positions[i].id).classList = 'googlefy-orange';
      });
    } else {
      var home = document.getElementById('gsr');
      var div = document.createElement("div");
      div.classList = 'googlefy-float-box';
      div.innerHTML = `<div class="googlefy-nts">No se han hallado coincidencias.</div>`;
      home.prepend(div);
    }
  }

  function googlefy(url) {
    let self = this;
    let cont = 0;
    let positions = new Array;
    var h3 = document.querySelectorAll(".g");
    if (h3.length) {
      Array.from(h3).forEach(function(element, index) {
        if (element.innerHTML.indexOf(url) != -1) {
          element.id = 'locate_'+Math.random();
          element.classList = 'g googlefy-result';
          var inn = element.innerHTML;
          var start =(getQueryVariable('start') !== false)?parseFloat(getQueryVariable('start')):0;
          var position = start + index + 1;
          var nn = '<b class="googlefy-position" id="b_inner_'+element.id+'">'+position+'</b><div id="inner_'+element.id+'" class="googlefy-yellow">'+inn+'</div>';
          element.innerHTML = nn;
          positions.push({id: element.id, position: position});
        }
      });      
      var a = document.getElementById('googlefy-float-box');
      var promG = new Promise(
        function(resolve, reject) {
          a.parentNode.removeChild(a);
        }
      );
      promG.then(remark(positions));      
      return;
    }
  }

  function removeExistingResults() {
    var h3 = document.querySelectorAll(".googlefy-result");
    if (h3.length) {
      Array.from(h3).forEach(function(element, index) {
        let b = document.getElementById('b_inner_'+element.id);
        let d = document.getElementById('inner_'+element.id);
        element.id = '';
        let content = d.innerHTML;
        b.parentNode.removeChild(b);
        d.parentNode.innerHTML = content;
        element.classList = 'g';
      });
    }
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "googlefy") {
      var p1 = new Promise(
        function(resolve, reject) {
          removeExistingResults();
        }
      );
      p1.then(googlefy(message.URL));
    }
  });
})();