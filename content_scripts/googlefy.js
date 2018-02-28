(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Sanitizer = factory();
  }
}(this, function () {
  'use strict';

  var Sanitizer = {
    _entity: /[&<>"'/]/g,

    _entities: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&apos;',
      '/': '&#x2F;'
    },

    getEntity: function (s) {
      return Sanitizer._entities[s];
    },

    /**
     * Escapes HTML for all values in a tagged template string.
     */
    escapeHTML: function (strings, ...values) {
      var result = '';

      for (var i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) {
          result += String(values[i]).replace(Sanitizer._entity,
            Sanitizer.getEntity);
        }
      }

      return result;
    },
    /**
     * Escapes HTML and returns a wrapped object to be used during DOM insertion
     */
    createSafeHTML: function (strings, ...values) {
      var escaped = Sanitizer.escapeHTML(strings, ...values);
      return {
        __html: escaped,
        toString: function () {
          return '[object WrappedHTMLObject]';
        },
        info: 'This is a wrapped HTML object. See https://developer.mozilla.or'+
          'g/en-US/Firefox_OS/Security/Security_Automation for more.'
      };
    },
    /**
     * Unwrap safe HTML created by createSafeHTML or a custom replacement that
     * underwent security review.
     */
    unwrapSafeHTML: function (...htmlObjects) {
      var markupList = htmlObjects.map(function(obj) {
        return obj.__html;
      });
      return markupList.join('');
    }
  };

  return Sanitizer;

}));

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
      var template = Sanitizer.createSafeHTML`<div class="googlefy-float-box_inner">
          <div class="googlefy-first">
            <b class="googlefy-333">N° coincidencias: <span class="googlefy-000 googlefy-f20">${positions.length}</span></b><br>
            <b class="googlefy-333">Posicion(es) de los resultados: <span class="googlefy-bluec googlefy-f20">${npos.join(',')}</span></b>
          </div>
          <div class="googlefy-second">
            <button class="googlefy-btn" id="__prev" type="button"> << Ant </button>
            <button class="googlefy-btn" id="__next" type="button"> Sig >> </button>
          </div>
        </div>`;
      div.innerHTML = Sanitizer.unwrapSafeHTML(template);
      home.prepend(div);
      
      scrollIntoView(positions[0].id);
      document.getElementById(positions[0].id).classList.replace('googlefy-yellow', 'googlefy-orange');      

      var prev = document.getElementById('__prev');
      var next = document.getElementById('__next');
      var i = 0;
      prev.addEventListener('click', function() {
        document.getElementById(positions[i].id).classList.replace('googlefy-orange', 'googlefy-yellow')
        i--;
        if (i == -1) i = positions.length - 1;
        scrollIntoView(positions[i].id);
        document.getElementById(positions[i].id).classList.replace('googlefy-yellow', 'googlefy-orange')
      });

      next.addEventListener('click', function() {
        document.getElementById(positions[i].id).classList.replace('googlefy-orange', 'googlefy-yellow')
        i++;
        if (i == positions.length) i = 0;
        scrollIntoView(positions[i].id);
        document.getElementById(positions[i].id).classList.replace('googlefy-yellow', 'googlefy-orange')
      });
    } else {
      var home = document.getElementById('gsr');
      var div = document.createElement("div");
      div.id = 'googlefy-float-box';
      div.classList = 'googlefy-float-box';
      div.innerHTML = Sanitizer.escapeHTML`<div class="googlefy-nts">No se han hallado coincidencias.</div>`;
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
          element.classList = 'g googlefy-result googlefy-yellow';
          var start =(getQueryVariable('start') !== false)?parseFloat(getQueryVariable('start')):0;
          var position = start + index + 1;
          
          var inn = Sanitizer.createSafeHTML(element.innerHTML);
          element.innerHTML = Sanitizer.unwrapSafeHTML(inn);
          let b = document.createElement("b");
          b.id = `b_inner_${element.id}`;
          b.classList = 'googlefy-position';
          b.innerHTML = Sanitizer.escapeHTML`${position}`;
          element.prepend(b);
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
        b.parentNode.removeChild(b);
        element.id = '';
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