// microDataEngine.js

const microDB = (() => {
    let data = new Map();
    let idCounter = 1;
  
    return {
      // Create a new record
      create(record = {}) {
        const id = (idCounter++).toString();
        data.set(id, { ...record, _id: id });
        return id;
      },
  
      // Read a record
      read(id) {
        return data.get(id) || null;
      },
  
      // Update a record
      update(id, updates = {}) {
        if (!data.has(id)) return false;
        data.set(id, { ...data.get(id), ...updates });
        return true;
      },
  
      // Delete a record
      delete(id) {
        return data.delete(id);
      },
  
      // Query records by condition
      find(filterFn = () => true) {
        return Array.from(data.values()).filter(filterFn);
      },
  
      // List all records
      all() {
        return Array.from(data.values());
      },
  
      // Clear all data
      clear() {
        data.clear();
        idCounter = 1;
      },
  
      // Export to JSON
      export() {
        return JSON.stringify(this.all(), null, 2);
      },
  
      // Import from JSON
      import(jsonString) {
        try {
          const records = JSON.parse(jsonString);
          this.clear();
          records.forEach(record => {
            const id = record._id || (idCounter++).toString();
            data.set(id, { ...record, _id: id });
          });
          return true;
        } catch (e) {
          console.error("Import failed:", e);
          return false;
        }
      }
    };
  })();
  
  // Example usage
  // const id = microDB.create({ name: "Alice", age: 30 });
  // console.log(microDB.read(id));
  // microDB.update(id, { age: 31 });
  // console.log(microDB.all());
  // microDB.delete(id);
  