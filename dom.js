// dom.js
function el(id) {
    return document.getElementById(id);
  }
  
  function on(id, event, fn) {
    el(id).addEventListener(event, fn);
  }
  
  function setText(id, text) {
    el(id).textContent = text;
  }
  
  function setHTML(id, html) {
    el(id).innerHTML = html;
  }
  