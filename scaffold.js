// scaffold.js

function newApp({ title = "App", mountId = "app", layout = null }) {
    document.title = title;
  
    const root = document.getElementById(mountId);
    if (!root) {
      throw new Error(`Mount element #${mountId} not found.`);
    }
  
    root.innerHTML = "";
    if (typeof layout === "function") {
      root.appendChild(layout());
    }
  }
  
  // Optional registry
  const ComponentRegistry = {};
  
  function registerComponent(name, fn) {
    ComponentRegistry[name] = fn;
  }
  
  function renderComponent(name, props = {}) {
    const fn = ComponentRegistry[name];
    if (!fn) throw new Error(`Component ${name} not registered`);
    return fn(props);
  }
  