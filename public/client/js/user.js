// Generated by CoffeeScript 2.5.1
(function() {
  var hash, hashUpdate, qs, switchTab, tabs, tabsArr;

  qs = function(e) {
    return document.querySelectorAll(e);
  };

  tabs = qs('.tab');

  tabsArr = [];

  Array.from(tabs).forEach(function(e) {
    tabsArr.push(e.id);
  });

  hash = window.location.hash;

  hashUpdate = function() {
    hash = window.location.hash;
  };

  switchTab = function(p, n) {
    p = p.toString().replace(/\#/g, '');
    n = n.toString().replace(/\#/g, '');
    if (tabsArr.includes(n)) {
      qs(`\#${n}`)[0].style.opacity = '1';
      if (qs(`\#${n}`)[0].dataset.nav) {
        qs(`\#btn-nav-${n}`)[0].classList.add('selected');
      }
      tabs.forEach(function(e) {
        if (e.id !== n) {
          e.style.opacity = '0';
          if (e.dataset.nav) {
            qs(`#btn-nav-${e.id}`)[0].classList.remove('selected');
          }
        }
      });
      if (tabsArr.indexOf(n) > tabsArr.indexOf(p)) {
        qs(`\#${p}`)[0].style.transform = 'translate(-100vw,0)';
      } else if (tabsArr.indexOf(n) < tabsArr.indexOf(p)) {
        qs(`\#${p}`)[0].style.transform = 'translate(100vw,0)';
      }
      qs(`\#${n}`)[0].style.transform = 'translate(0,0)';
      tabs.forEach(function(e, i) {
        if (![n, p].includes(e.id)) {
          if (tabsArr.indexOf(e.id) > tabsArr.indexOf(n)) {
            e.style.transform = 'translate(100vw,0)';
          } else if (tabsArr.indexOf(e.id) < tabsArr.indexOf(n)) {
            e.style.transform = 'translate(-100vw,0)';
          }
        }
      });
      hashUpdate();
    }
  };

  window.onhashchange = function() {
    switchTab(hash, window.location.hash);
  };

  window.location.hash = '#to-dos';

  switchTab('#to-dos', window.location.hash);

  // xhr = new 

  // qs('#school-list')[0].

}).call(this);
