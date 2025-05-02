// app.js

// 🔵 Apply initial theme
Theme.applyGlobalStyles();

// 🔵 Update theme on mode change
Theme.onModeChange = () => {
  console.log("Theme switched to", Theme.mode);
};

let dataStore = DataStore;
let currentFields = [];
let flashRowIndex = null; // 🔥 Track recently edited row
let currentSortField = null;
let currentSortDirection = "asc"; // or "desc"
let currentSearchTerm = "";
let insertRowBtn;
let duplicateRowBtn;
let deleteRowBtn;
// 🧠 Track Selected Row Globally
let selectedRowIndex = null;

// Initialize DataStore with any existing data
if (localStorage.getItem("savedGridData")) {
  const savedData = JSON.parse(localStorage.getItem("savedGridData"));
  currentFields = savedData.fields;
  dataStore.setAll(savedData.records);
}

// 🔵 Create hidden JSON uploader
const jsonUploader = document.createElement("input");
jsonUploader.type = "file";
jsonUploader.accept = ".json";
jsonUploader.id = "jsonUploader";
jsonUploader.style.display = "none";
document.body.appendChild(jsonUploader);

const csvUploader = document.createElement("input");
csvUploader.type = "file";
csvUploader.accept = ".csv";
csvUploader.id = "csvUploader";
csvUploader.style.display = "none";
document.body.appendChild(csvUploader);

function parseCsvToJson(csvText) {
  const rows = csvText.trim().split("\n").map(r => r.split(","));
  const header = rows.shift();

  const json = rows.map(row => {
    const record = {};
    header.forEach((col, idx) => {
      record[col.trim()] = row[idx]?.trim() || "";
    });
    return record;
  });

  return json;
}

function openSlideoutEditor(record, rowIndex) {
  const panel = document.getElementById("slideoutPanel");
  panel.innerHTML = ""; // Clear old content

  const formSpec = Object.keys(record).map(key => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    type: "text",
    default: record[key]
  }));

  const form = createDynamicForm({
    formId: "editRecordForm",
    spec: formSpec,
    onSave: (updatedValues) => {
      console.log("✅ Updated Record:", updatedValues);

      // Update in DataStore
      dataStore.update(rowIndex + 1, updatedValues);
      flashRowIndex = rowIndex;  // ✅ Set the row to flash

      // Save to localStorage
      localStorage.setItem("savedGridData", JSON.stringify({
        fields: currentFields,
        records: dataStore.getAll()
      }));

      // Rebuild the grid
      buildGrid(currentFields, dataStore.getAll());

      // Close slideout
      closeSlideout();
    },
    onCancel: () => {
      closeSlideout();
    }
  });

  panel.appendChild(form);
  panel.style.transform = "translateX(0)"; // Slide in
}

function closeSlideout() {
  const panel = document.getElementById("slideoutPanel");
  panel.style.transform = "translateX(100%)"; // Slide out
}

// 🔵 Global filter text
let currentSearchText = "";

function filterRecords() {
  if (!currentSearchText) {
    return dataStore.getAll();
  }
  return dataStore.getAll().filter(record =>
    Object.values(record).some(value =>
      String(value).toLowerCase().includes(currentSearchText.toLowerCase())
    )
  );
}

function updateToolbarState() {
  console.log("120", selectedRowIndex);
  const hasSelection = selectedRowIndex !== null;
  console.log("122", hasSelection);
  insertRowBtn.disabled = !hasSelection;
  duplicateRowBtn.disabled = !hasSelection;
  deleteRowBtn.disabled = !hasSelection;
}

function viewSummary() {
  if (!currentRecords || currentRecords.length === 0) {
    alert("No data loaded!");
    return;
  }

  // 1. Find numeric columns
  const numericKeys = currentFields.filter(field => 
    currentRecords.some(record => !isNaN(parseFloat(record[field.key])) && isFinite(record[field.key]))
  ).map(f => f.key);

  if (numericKeys.length === 0) {
    alert("No numeric fields found to summarize.");
    return;
  }

  // 2. Calculate totals and averages
  const summaryData = numericKeys.map(key => {
    const values = currentRecords.map(r => parseFloat(r[key])).filter(v => !isNaN(v));
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = values.length ? (total / values.length) : 0;
    return { key, total, average };
  });

  // 3. Build HTML summary
  const summaryHtml = `
    <div style="font-family: ${Theme.fonts.base}; color: ${Theme.colors.text};">
      <p><strong>Records:</strong> ${currentRecords.length}</p>
      <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 6px; border-bottom: 1px solid #ccc;">Field</th>
            <th style="text-align: right; padding: 6px; border-bottom: 1px solid #ccc;">Total</th>
            <th style="text-align: right; padding: 6px; border-bottom: 1px solid #ccc;">Average</th>
          </tr>
        </thead>
        <tbody>
          ${summaryData.map(d => `
            <tr>
              <td style="padding: 6px;">${d.key}</td>
              <td style="text-align: right; padding: 6px;">${d.total.toFixed(2)}</td>
              <td style="text-align: right; padding: 6px;">${d.average.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  // 4. Create and show modal
  const modal = createModal({
    id: "summaryModal",
    title: "📊 Data Summary",
    content: summaryHtml,
    width: "500px",
    show: true
  });

  document.body.appendChild(modal);
}

function viewChart() {
  if (!currentFields.length || !currentRecords.length) {
    alert("No data loaded!");
    return;
  }

  const modal = createModal({
    id: "chartModal",
    title: "📊 Quick Chart",
    width: "700px",
    show: true
  });
  document.body.appendChild(modal);

  const summary = currentFields.map(field => {
    const count = currentRecords.filter(r => (r[field.key] ?? "").trim() !== "").length;
    return { label: field.label, value: count };
  });

  const chartSvg = createSvgBarChart({ width: 650, height: 400, data: summary });
  modal.querySelector("div").appendChild(chartSvg);

  modal.style.display = "block";
}


// 🔵 Updated Build Grid (filtered if needed)
function buildGrid(fields, records) {
  const gridContainer = document.getElementById("gridContainer");
  gridContainer.innerHTML = ""; // Clear previous grid

  if (!records || records.length === 0) {
    gridContainer.textContent = "No data loaded.";
    return;
  }

  // 🧠 Save global copy
  currentFields = fields;
  currentRecords = records;

  const grid = createDataGrid({
    id: "spreadsheetView",
    fields,
    records,
    onRowSelect: (rowIndex) => {
      selectedRowIndex = rowIndex;
      updateToolbarState();
      if (rowIndex !== null) {
        openSlideoutEditor(currentRecords[rowIndex], rowIndex);
      } else {
        closeSlideout(); // If nothing selected, close
      }
    }
  });

  gridContainer.appendChild(grid);
  flashRowIndex = null;
}



    

// 🔵 Generate Fake Data Helper
function generateFakeGridSpec(count) {
  const firstNames = ["Alice", "Bob", "Charlie", "Dana", "Evan", "Fiona", "George", "Hannah", "Isaac", "Julia"];
  const lastNames = ["Johnson", "Smith", "Brown", "Williams", "Garcia", "Martinez", "Lee", "Taylor", "Thomas", "Anderson"];
  const domains = ["example.com", "testmail.com", "fakeemail.com"];

  const fields = [];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[i % domains.length]}`;
    const age = 20 + (i % 30);

    fields.push({ key: `firstName${i}`, label: "First Name", default: firstName });
    fields.push({ key: `lastName${i}`, label: "Last Name", default: lastName });
    fields.push({ key: `email${i}`, label: "Email", default: email });
    fields.push({ key: `age${i}`, label: "Age", default: age });
  }

  return [
    {
      section: "Auto-Generated Users",
      columns: 2,
      fields
    }
  ];
}

// 🔵 Main Layout Function
function layout() {
    const container = document.createElement("div");
  
    // 🗂 Upload Buttons
    const uploadJsonBtn = createButton({
      id: "uploadJsonBtn",
      text: "📂 Load JSON",
      onClick: () => {
        document.getElementById("jsonUploader").click();
      },
      color: "secondary"
    });
    container.appendChild(uploadJsonBtn);
  
    const uploadCsvBtn = createButton({
      id: "uploadCsvBtn",
      text: "📂 Load CSV",
      onClick: () => {
        document.getElementById("csvUploader").click();
      },
      color: "secondary"
    });
    container.appendChild(uploadCsvBtn);
  
    // 🛠 Generate Fake Data Button
    const generateBtn = createButton({
      id: "generateFakeBtn",
      text: "🛠 Generate Fake Data",
      onClick: () => {
        const gridSpec = generateFakeGridSpec(10);
        const { fields, records } = convertFormSpecToGridData(gridSpec);
        currentFields = fields;
        dataStore.setAll(records);
        buildGrid(fields, dataStore.getAll());
        localStorage.setItem("savedGridData", JSON.stringify({ fields: currentFields, records: dataStore.getAll() }));
      },
      color: "primary"
    });
    container.appendChild(generateBtn);
  
    // 📥 Download Button
    const downloadBtn = createButton({
      id: "downloadJsonBtn",
      text: "📥 Download JSON",
      onClick: () => {
        const saved = localStorage.getItem("savedGridData");
        if (!saved) {
          alert("No data to download!");
          return;
        }
        const blob = new Blob([saved], { type: "application/json" });
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = "grid-data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  
        URL.revokeObjectURL(url);
        console.log("📥 Download triggered!");
      },
      color: "success"
    });
    container.appendChild(downloadBtn);

    const downloadCsvBtn = createButton({
        id: "downloadCsvBtn",
        text: "📥 Download CSV",
        onClick: () => {
          downloadCsvFromGrid();
        },
        color: "success"
      });
      container.appendChild(downloadCsvBtn);
      
      
  
    // 🧹 Clear Button
    const clearDataBtn = createButton({
      id: "clearDataBtn",
      text: "🧹 Clear Grid",
      onClick: () => {
        localStorage.removeItem("savedGridData");
        const gridContainer = document.getElementById("gridContainer");
        if (gridContainer) {
          gridContainer.innerHTML = "No data loaded.";
        }
        currentSearchText = "";
        dataStore.clear();
        currentFields = [];
        console.log("🧹 Grid and localStorage cleared!");
      },
      color: "danger"
    });
    container.appendChild(clearDataBtn);
  
  


        // 🔎 Search Bar
    // 🛠 Search Box
    const searchContainer = document.createElement("div");
    Object.assign(searchContainer.style, {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      padding: "10px 0",
      width: "100%"
    });

    const searchInput = document.createElement("input");
    searchInput.id = "searchInput";
    searchInput.placeholder = "🔍 Search...";
    Object.assign(searchInput.style, {
      flex: "1",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontFamily: Theme.fonts.base,
      backgroundColor: Theme.colors.background,
      color: Theme.colors.text,
      transition: "background-color 0.3s, color 0.3s",
      fontSize: "16px"
    });

    let searchDebounceTimer;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        currentSearchTerm = e.target.value.trim().toLowerCase();
        if (currentFields.length && currentRecords.length) {
          buildGrid(currentFields, currentRecords);
        }
      }, 200);
    });

    searchContainer.appendChild(searchInput);
    container.appendChild(searchContainer);

    //Api builder, only works when hosted. so off now
    //const apiForm = createApiForm();
    //container.appendChild(apiForm);
  
  // 🧩 Create Toolbar
  const toolbar = document.createElement("div");
  Object.assign(toolbar.style, {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "10px"
  });

  // ➕ Add Row Button
  const addRowBtn = createButton({
    id: "addRowBtn",
    text: "➕ Add Row",
    color: "success",
    onClick: () => {
      const newId = dataStore.add({});
      buildGrid(currentFields, dataStore.getAll());
    }
  });
  toolbar.appendChild(addRowBtn);

  // 📄 Insert Row Button
  insertRowBtn = createButton({
    id: "insertRowBtn",
    text: "📄 Insert Below",
    color: "primary",
    onClick: () => {
      if (selectedRowIndex !== null) {
        const newId = dataStore.insertAfter(selectedRowIndex, {});
        buildGrid(currentFields, dataStore.getAll());
        updateToolbarState(); // Update toolbar state after modification
      }
    }
  });
  


  duplicateRowBtn = createButton({
    id: "duplicateRowBtn",
    text: "📄 Duplicate",
    color: "primary",
    onClick: () => {
      if (selectedRowIndex !== null) {
        const clone = { ...dataStore.get(selectedRowIndex) };
        const newId = dataStore.insertAfter(selectedRowIndex, clone);
        buildGrid(currentFields, dataStore.getAll());
        updateToolbarState(); // Update toolbar state after duplication
      }
    }
  });
  

  deleteRowBtn = createButton({
    id: "deleteRowBtn",
    text: "🗑️ Delete",
    color: "danger",
    onClick: async () => {
      if (selectedRowIndex !== null) {
        const confirmed = await confirmAction("Are you sure you want to delete this row?");
        if (confirmed) {
          dataStore.remove(selectedRowIndex);
          selectedRowIndex = null;
          buildGrid(currentFields, dataStore.getAll());
        }
      }
    }
  });

  const viewSummaryBtn = createButton({
    id: "viewSummaryBtn",
    text: "📊 View Summary",
    color: "info",
    onClick: () => {
      viewSummary();
    }
  });

  const viewChartBtn = createButton({
    id: "viewChartBtn",
    text: "📊 View Chart",
    color: "info",
    onClick: viewChart
  });
 
  toolbar.appendChild(insertRowBtn);
  toolbar.appendChild(duplicateRowBtn);
  toolbar.appendChild(deleteRowBtn);
  toolbar.appendChild(viewSummaryBtn);
  toolbar.appendChild(viewChartBtn);

  container.appendChild(toolbar);

    // 🔵 The Grid Container
    const gridContainer = document.createElement("div");
    gridContainer.id = "gridContainer";
    gridContainer.style.marginTop = "20px";
    container.appendChild(gridContainer);
  
    
    jsonUploader.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
      
        try {
          const text = await file.text();
          const data = JSON.parse(text);
      
          console.log("📂 JSON Uploaded:", data);
      
          let fields, records;
      
          if (Array.isArray(data)) {
            // Simple array format
            fields = Object.keys(data[0] || {}).map(key => ({
              key,
              label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            }));
            records = data;
          } else if (data.fields && data.records) {
            // Complex object format
            fields = data.fields;
            records = data.records;
          } else {
            throw new Error("Invalid JSON format!");
          }
      
          currentFields = fields;
          dataStore.setAll(records);
          buildGrid(fields, dataStore.getAll());
          localStorage.setItem("savedGridData", JSON.stringify({ fields: currentFields, records: dataStore.getAll() }));
      
        } catch (e) {
          alert("Failed to load JSON: " + e.message);
        }
      });
      
  
    
    csvUploader.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      try {
        const text = await file.text();
        const records = smartCsvParse(text);
  
        if (!records.length) {
          alert("No records parsed from CSV.");
          return;
        }
  
        const fields = Object.keys(records[0] || {}).map(key => ({
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        }));
  
        console.log("📂 CSV Parsed:", records);
  
        currentFields = fields;
        dataStore.setAll(records);
        buildGrid(fields, dataStore.getAll());
        localStorage.setItem("savedGridData", JSON.stringify({ fields: currentFields, records: dataStore.getAll() }));
      } catch (e) {
        alert("Failed to parse CSV: " + e.message);
      }
    });

    // 🔵 Add Slideout Panel
    const slideout = document.createElement("div");
    slideout.id = "slideoutPanel";
    Object.assign(slideout.style, {
        position: "fixed",
        top: "0",
        right: "0",
        width: "300px",
        height: "100%",
        backgroundColor: Theme.colors.background,
        boxShadow: "-2px 0 8px rgba(0,0,0,0.2)",
        overflowY: "auto",
        padding: "20px",
        transform: "translateX(100%)",  // Hidden initially
        transition: "transform 0.3s ease-in-out",
        zIndex: 1000
    });
    document.body.appendChild(slideout);

    return container;
  }
  

// 🔵 Boot the App
newApp({
    title: "My Micro Framework",
    mountId: "app",
    layout: layout
  });
  
  // 🔵 Auto-restore Grid if saved
  const savedData = localStorage.getItem("savedGridData");
  if (savedData) {
    const { fields, records } = JSON.parse(savedData);
    currentFields = fields;
    dataStore.setAll(records);
    buildGrid(fields, dataStore.getAll());
  }