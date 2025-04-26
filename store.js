// store.js
const Store = (() => {
    const _state = {};
    const _listeners = {};
  
    return {
      get(key) {
        return _state[key];
      },
  
      set(key, value) {
        _state[key] = value;
        (_listeners[key] || []).forEach((fn) => fn(value));
      },
  
      subscribe(key, fn) {
        if (!_listeners[key]) _listeners[key] = [];
        _listeners[key].push(fn);
        fn(_state[key]); // call immediately with current value
      },
  
      all() {
        return { ..._state };
      },
  
      init(obj) {
        for (const key in obj) {
          _state[key] = obj[key];
        }
      }
    };
  })();
  

  /*
  usage:
    Store.init({ count: 0 });

    Store.subscribe("count", (val) => {
    setText("counter", val);
    });

    on("incBtn", "click", () => {
    Store.set("count", Store.get("count") + 1);
    });

  */