// app.js

// 🔵 Apply initial theme
Theme.applyGlobalStyles();

// 🔵 Update theme on mode change
Theme.onModeChange = () => {
  console.log("Theme switched to", Theme.mode);
};

let currentFields = [];
let currentRecords = [];
let flashRowIndex = null; // 🔥 Track recently edited row

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
  
        // Update in global records
        currentRecords[rowIndex] = updatedValues;
        flashRowIndex = rowIndex;  // ✅ Set the row to flash
  
        // Save to localStorage
        localStorage.setItem("savedGridData", JSON.stringify({
          fields: currentFields,
          records: currentRecords
        }));
  
        // Rebuild the grid
        buildGrid(currentFields, currentRecords);
  
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
  
  
// 🔵 Build Grid Function
function buildGrid(fields, records) {
    const gridContainer = document.getElementById("gridContainer");
    gridContainer.innerHTML = ""; // Clear previous grid
  
    if (!records || records.length === 0) {
      gridContainer.textContent = "No data loaded.";
      return;
    }
  
    // Save global copy
    currentFields = fields;
    currentRecords = records;
  
    const grid = createDataGrid({
      id: "spreadsheetView",
      fields,
      records
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
        buildGrid(fields, records);
        localStorage.setItem("savedGridData", JSON.stringify({ fields, records }));
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
        console.log("🧹 Grid and localStorage cleared!");
      },
      color: "danger"
    });
    container.appendChild(clearDataBtn);
  
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
      
          buildGrid(fields, records);
          localStorage.setItem("savedGridData", JSON.stringify({ fields, records }));
      
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
  
        buildGrid(fields, records);
        localStorage.setItem("savedGridData", JSON.stringify({ fields, records }));
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
    const { fields, records } = JSON.parse(savedData);  // ✅
    buildGrid(fields, records);                         // ✅
  }
  