const DataStore = (() => {
  let _records = new Map();
  let _nextId = 1;

  return {
    add(data = {}) {
      const id = _nextId++;
      _records.set(id, { id, ...data });
      return id;
    },
    update(id, data) {
      if (_records.has(id)) _records.set(id, { ..._records.get(id), ...data });
    },
    remove(id) {
      _records.delete(id);
    },
    get(id) {
      return _records.get(id) || null;
    },
    getAll() {
      return Array.from(_records.values());
    },
    clear() {
      _records.clear();
      _nextId = 1;
    },
    export() {
      return JSON.stringify(this.getAll(), null, 2);
    },
    import(json) {
      const arr = Array.isArray(json) ? json : JSON.parse(json);
      _records.clear();
      arr.forEach(obj => {
        const id = obj.id || _nextId++;
        _records.set(id, { ...obj, id });
        if (id >= _nextId) _nextId = id + 1;
      });
    },
    insertAfter(afterId, data = {}) {
      const newId = _nextId++;
      const newRecords = new Map();
      for (const [id, value] of _records) {
        newRecords.set(id, value);
        if (id === afterId) {
          newRecords.set(newId, { id: newId, ...data });
        }
      }
      _records = newRecords;
      return newId;
    },
    setAll(arrayOfRecords) {
      _records.clear();
      arrayOfRecords.forEach(obj => {
        const id = obj.id || _nextId++;
        _records.set(id, { ...obj, id });
        if (id >= _nextId) _nextId = id + 1;
      });
    }        
  };
})();
