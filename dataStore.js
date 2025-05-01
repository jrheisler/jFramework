export const DataStore = (() => {
    const _store = new Map(); // Keyed by unique id (string or number)
  
    function generateId() {
      return `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
  
    return {
      add(record) {
        const id = record.id || generateId();
        _store.set(id, { ...record, id });
        return id;
      },
  
      update(id, updates) {
        if (!_store.has(id)) return false;
        _store.set(id, { ..._store.get(id), ...updates });
        return true;
      },
  
      remove(id) {
        return _store.delete(id);
      },
  
      get(id) {
        return _store.get(id) || null;
      },
  
      getAll() {
        return Array.from(_store.values());
      },
  
      filter(fn) {
        return Array.from(_store.values()).filter(fn);
      },
  
      sort(key, direction = "asc") {
        const sorted = Array.from(_store.values()).sort((a, b) => {
          const aVal = a[key] ?? "";
          const bVal = b[key] ?? "";
          return direction === "asc"
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
        });
        return sorted;
      },
  
      clear() {
        _store.clear();
      },
  
      export() {
        return JSON.stringify(this.getAll(), null, 2);
      },
  
      import(jsonText) {
        try {
          const records = JSON.parse(jsonText);
          records.forEach(record => this.add(record));
          return true;
        } catch (e) {
          console.error("Import failed:", e);
          return false;
        }
      }
    };
  })();

  
/*
    DataStore.add({ name: "Alice", role: "Manager", age: 34 });
    DataStore.add({ name: "Bob", role: "Dev", age: 28 });

    const all = DataStore.getAll();
    const managers = DataStore.filter(r => r.role === "Manager");
    const sortedByAge = DataStore.sort("age");
*/