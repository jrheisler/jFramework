// persist.js
const Persist = {
    load(key) {
      const val = localStorage.getItem(key);
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    },
  
    save(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    },
  
    sync(key) {
      // Watch the store and save when it updates
      Store.subscribe(key, (val) => {
        Persist.save(key, val);
      });
  
      // Initialize from saved state
      const existing = Persist.load(key);
      if (existing !== null) Store.set(key, existing);
    }
  };
  
  /*
  usage
  Persist.sync("count");  // Saves to localStorage and restores on reload
  */