// components.js

// ─────────────────────────
// 🧩 Button Component
// ─────────────────────────

function createButton({ id, text, onClick, color = "primary", style = {} }) {
    const button = document.createElement("button");
    button.id = id;
    button.textContent = text;
  
    const themedStyle = {
      backgroundColor: Theme.colors[color] || Theme.colors.primary,
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: Theme.spacing.padding,
      marginRight: Theme.spacing.margin,
      cursor: "pointer",
      fontFamily: Theme.fonts.base
    };
  
    Object.assign(button.style, themedStyle, style);
  
    if (onClick) button.addEventListener("click", onClick);
  
    return button;
  }
  
    // ─────────────────────────
  // 🪟 Modal Component
  // ─────────────────────────

  function createModal({ id, content = "", width = "400px", title = "", show = false }) {
    const modal = document.createElement("div");
    modal.id = id;
    
    Object.assign(modal.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: Theme.colors.background,
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      width,
      maxHeight: "90vh",
      overflowY: "auto",
      display: show ? "block" : "none",
      zIndex: 1000,
      fontFamily: Theme.fonts.base,
      color: Theme.colors.text,
      transition: "background-color 0.3s, color 0.3s"
    });
  
    // Optional Title
    if (title) {
      const titleElement = document.createElement("h2");
      titleElement.textContent = title;
      Object.assign(titleElement.style, {
        marginBottom: "16px",
        fontFamily: Theme.fonts.base,
        fontSize: "24px",
        textAlign: "center",
        transition: "color 0.3s",
        color: Theme.colors.text
      });
      modal.appendChild(titleElement);
    }
    
    // Content area
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = content;
    modal.appendChild(contentDiv);
  
    // Close button
    const closeBtn = createButton({
      id: `${id}-close`,
      text: "Close",
      onClick: () => {
        modal.style.display = "none";
      },
      color: "danger",
      style: { marginTop: "20px", display: "block", marginLeft: "auto", marginRight: "auto" }
    });
    
    
    modal.appendChild(closeBtn);
    
    return modal;
  }
  
   
  
 // ─────────────────────────
// 🧩 Reactive Button (with Store)
// ─────────────────────────
function createReactiveButton({ id, storeKey, store, onClick = () => {}, color = "primary", style = {} }) {
    const button = document.createElement('button');
    button.id = id;
  
    store.subscribe(storeKey, (value) => {
      button.textContent = `Count: ${value}`;
    });
  
    button.addEventListener('click', () => {
      store.set(storeKey, store.get(storeKey) + 1);
      onClick();
    });
  
    const themedStyle = {
      backgroundColor: Theme.colors[color] || Theme.colors.primary,
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: Theme.spacing.padding,
      margin: Theme.spacing.margin,
      cursor: "pointer",
      fontFamily: Theme.fonts.base
    };
  
    Object.assign(button.style, themedStyle, style);
  
    return button;
  }
  
  // ─────────────────────────
  // 📋 List Component
  // ─────────────────────────
  function createList({ id, items = [], style = {} }) {
    const ul = document.createElement('ul');
    ul.id = id;
  
    Object.assign(ul.style, {
      listStyleType: "disc",
      paddingLeft: "20px",
      fontFamily: Theme.fonts.base,
      color: Theme.colors.text,
      margin: Theme.spacing.margin
    }, style);
  
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      li.style.marginBottom = "6px";
      ul.appendChild(li);
    });
  
    return ul;
  }
  
  // ─────────────────────────
  // 📝 Form Component
  // ─────────────────────────
  function createForm({ id, fields = [], onSubmit, style = {} }) {
    const form = document.createElement('form');
    form.id = id;
  
    Object.assign(form.style, {
      fontFamily: Theme.fonts.base,
      backgroundColor: "#fff",
      padding: Theme.spacing.padding,
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.05)",
      maxWidth: "400px",
      color: Theme.colors.text,
      margin: Theme.spacing.margin
    }, style);
  
    fields.forEach(field => {
      const input = document.createElement('input');
      input.id = field.id;
      input.placeholder = field.placeholder || '';
      input.type = field.type || 'text';
      input.name = field.id;
  
      Object.assign(input.style, {
        width: "100%",
        padding: "8px",
        marginBottom: "12px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontFamily: Theme.fonts.base
      });
  
      form.appendChild(input);
      form.appendChild(document.createElement('br'));
    });
  
    const submitButton = createButton({
      id: `${id}-submit`,
      text: 'Submit',
      onClick: (e) => {
        e.preventDefault();
        if (typeof onSubmit === 'function') onSubmit();
      },
      color: "success",
      style: { marginTop: Theme.spacing.margin }
    });
  
    form.appendChild(submitButton);
    return form;
  }
  
  function createReactiveText({ id, storeKey, store = Store, prefix = "", suffix = "", style = {} }) {
    const span = document.createElement("span");
    span.id = id;
  
    function updateText(val) {
      span.textContent = `${prefix}${val}${suffix}`;
    }
  
    function applyTheme() {
      Object.assign(span.style, {
        fontFamily: Theme.fonts.base,
        color: Theme.colors.text
      }, style);
    }
  
    // Listen to state changes
    store.subscribe(storeKey, (val) => {
      updateText(val);
    });
  
    // Apply initial text
    updateText(store.get(storeKey));
  
    // Apply initial theme
    applyTheme();
  
    // Also update on theme mode change!
    if (!Theme._subscribers) Theme._subscribers = [];
    Theme._subscribers.push(applyTheme);
  
    return span;
  }
  
  // ─────────────────────────
// ✍️ Reactive Input Component
// ─────────────────────────
function createReactiveInput({ id, storeKey, store = Store, placeholder = "", type = "text", style = {} }) {
    const input = document.createElement("input");
    input.id = id;
    input.type = type;
    input.placeholder = placeholder;
  
    // Apply initial value from store
    input.value = store.get(storeKey) || "";
  
    // Style input
    Object.assign(input.style, {
      width: "100%",
      padding: "10px",
      marginBottom: Theme.spacing.margin,
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontFamily: Theme.fonts.base,
      color: Theme.colors.text,
      backgroundColor: Theme.colors.background,
      transition: "background-color 0.3s, color 0.3s"
    }, style);
  
    // Update store when user types
    input.addEventListener("input", (e) => {
      store.set(storeKey, e.target.value);
    });
  
    // Update input field if store changes externally
    store.subscribe(storeKey, (val) => {
      if (input.value !== val) {
        input.value = val;
      }
    });
  
    // Update theme if theme changes
    Theme.subscribe(() => {
      input.style.color = Theme.colors.text;
      input.style.backgroundColor = Theme.colors.background;
    });
  
    return input;
  }
  

  function createRow(children = [], style = {}) {
    const div = document.createElement("div");
    Object.assign(div.style, {
      display: "flex",
      gap: Theme.spacing.margin,
      alignItems: "center"
    }, style);
  
    children.forEach(child => div.appendChild(child));
    return div;
  }
  
  function createColumn(children = [], style = {}) {
    const div = document.createElement("div");
    Object.assign(div.style, {
      display: "flex",
      flexDirection: "column",
      gap: Theme.spacing.margin
    }, style);
  
    children.forEach(child => div.appendChild(child));
    return div;
  }
  
// ─────────────────────────
// 📝 Dynamic Form Generator (with theme reactive labels)
// ─────────────────────────
function createDynamicForm({ formId, spec, onSave, onCancel }) {
    const form = document.createElement('form');
    form.id = formId;
  
    Object.assign(form.style, {
      fontFamily: Theme.fonts.base,
      backgroundColor: Theme.colors.background,
      padding: Theme.spacing.padding,
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.05)",
      maxWidth: "800px",
      margin: Theme.spacing.margin,
      display: "flex",
      flexDirection: "column",
      gap: Theme.spacing.margin
    });
  
    const localStore = {};
    const elements = [];
    const titles = [];
  
    const processField = (field, targetContainer) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      Object.assign(label.style, {
        marginBottom: "4px",
        fontFamily: Theme.fonts.base,
        display: "block",
        width: "100%",
        transition: "color 0.3s",
        color: Theme.colors.text
      });
  
      let input;
      const inputWrapper = document.createElement('div');
      inputWrapper.style.display = "flex";
      inputWrapper.style.flexDirection = "column";
  
      if (field.type === "checkbox") {
        input = document.createElement('input');
        input.type = "checkbox";
        input.checked = !!field.default;
        localStore[field.key] = input.checked;
  
        input.addEventListener('change', (e) => {
          localStore[field.key] = e.target.checked;
        });
  
        const checkboxRow = document.createElement('div');
        checkboxRow.style.display = "flex";
        checkboxRow.style.alignItems = "center";
        checkboxRow.style.gap = "10px";
  
        checkboxRow.appendChild(input);
        checkboxRow.appendChild(label);
        inputWrapper.appendChild(checkboxRow);
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        input.placeholder = field.placeholder || '';
        Object.assign(input.style, {
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontFamily: Theme.fonts.base,
          transition: "background-color 0.3s, color 0.3s",
          color: Theme.colors.text,
          backgroundColor: Theme.colors.background,
          width: "100%"
        });
  
        localStore[field.key] = field.default || "";
        input.value = field.default || "";
  
        input.addEventListener('input', (e) => {
          localStore[field.key] = e.target.value;
        });
  
        inputWrapper.appendChild(label);
        inputWrapper.appendChild(input);
      }
  
      // Hint (optional)
      let hint;
      if (field.hint) {
        hint = document.createElement('small');
        hint.textContent = field.hint;
        Object.assign(hint.style, {
          fontSize: "12px",
          color: Theme.colors.muted,
          marginTop: "4px",
          transition: "color 0.3s"
        });
        inputWrapper.appendChild(hint);
      }
  
      // Ensure spacing and layout
      Object.assign(inputWrapper.style, {
        flex: "1",
        minWidth: "0"
      });
  
      targetContainer.appendChild(inputWrapper);
      elements.push({ label, input, hint, required: !!field.required });
    };
  
    // Loop through spec (grouped or flat)
    spec.forEach(entry => {
      const section = entry.section && Array.isArray(entry.fields) ? entry : { fields: [entry] };
      const titleText = entry.section;
  
      if (titleText) {
        const title = document.createElement('h3');
        title.textContent = titleText;
        Object.assign(title.style, {
          marginBottom: "8px",
          marginTop: "20px",
          fontFamily: Theme.fonts.base,
          color: Theme.colors.text,
          transition: "color 0.3s"
        });
        titles.push(title);
        form.appendChild(title);
      }
  
      const columns = entry.columns && entry.columns > 1 ? entry.columns : 1;
      let row;
  
      section.fields.forEach((field, index) => {
        if (columns > 1) {
          if (index % columns === 0) {
            row = document.createElement('div');
            row.style.display = "flex";
            row.style.gap = Theme.spacing.margin;
            form.appendChild(row);
          }
          processField(field, row);
        } else {
          processField(field, form);
        }
      });
    });
  
    const saveBtn = createButton({
      id: `${formId}-save`,
      text: "Save",
      color: "success",
      onClick: (e) => {
        e.preventDefault();
        const missingFields = elements.filter(({ input, required }) => {
          if (!required) return false;
          if (input.type === "checkbox") return false;
          return !input.value.trim();
        });
        if (missingFields.length > 0) {
          alert("Please fill all required fields.");
          return;
        }
        if (typeof onSave === "function") onSave(localStore);
      }
    });
  
    const cancelBtn = createButton({
      id: `${formId}-cancel`,
      text: "Cancel",
      color: "danger",
      onClick: (e) => {
        e.preventDefault();
        if (typeof onCancel === "function") onCancel();
      }
    });
  
    const buttonRow = createRow([saveBtn, cancelBtn]);
    form.appendChild(buttonRow);
  
    form.refreshTheme = () => {
      form.style.backgroundColor = Theme.colors.background;
      titles.forEach(title => title.style.color = Theme.colors.text);
      elements.forEach(({ label, input, hint }) => {
        label.style.color = Theme.colors.text;
        input.style.color = Theme.colors.text;
        input.style.backgroundColor = Theme.colors.background;
        if (hint) hint.style.color = Theme.colors.muted;
      });
    };
  
    form.refreshTheme();
    return form;
  }
  
  function createDynamicGrid({ id, spec }) {
    const grid = document.createElement("div");
    grid.id = id;
  
    Object.assign(grid.style, {
      display: "flex",
      flexDirection: "column",
      gap: Theme.spacing.margin,
      maxHeight: "500px",
      overflowY: "auto",
      padding: Theme.spacing.padding,
      backgroundColor: Theme.colors.background,
      color: Theme.colors.text,
      borderRadius: "8px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      transition: "background-color 0.3s, color 0.3s"
    });
  
    const titles = [];
  
    const processField = (field, targetRow) => {
      const cell = document.createElement("div");
      Object.assign(cell.style, {
        flex: "1",
        minWidth: "0",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontFamily: Theme.fonts.base,
        color: Theme.colors.text,
        backgroundColor: Theme.colors.background,
        transition: "background-color 0.3s, color 0.3s",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      });
  
      // 🧠 NEW: Use default value if available
      const label = field.label || "Unnamed";
      const value = field.default !== undefined ? field.default : "";
  
      if (value !== "") {
        cell.textContent = `${label}: ${value}`;
      } else {
        cell.textContent = `${label}`;
      }
  
      targetRow.appendChild(cell);
    };
  
    spec.forEach(entry => {
      const section = entry.section && Array.isArray(entry.fields) ? entry : { fields: [entry] };
      const titleText = entry.section;
  
      if (titleText) {
        const title = document.createElement('h3');
        title.textContent = titleText;
        Object.assign(title.style, {
          marginBottom: "8px",
          marginTop: "20px",
          fontFamily: Theme.fonts.base,
          color: Theme.colors.text,
          transition: "color 0.3s"
        });
        titles.push(title);
        grid.appendChild(title);
      }
  
      const columns = entry.columns && entry.columns > 1 ? entry.columns : 1;
      let row;
  
      section.fields.forEach((field, index) => {
        if (columns > 1) {
          if (index % columns === 0) {
            row = document.createElement('div');
            row.style.display = "flex";
            row.style.gap = Theme.spacing.margin;
            grid.appendChild(row);
          }
          processField(field, row);
        } else {
          const singleRow = document.createElement('div');
          singleRow.style.display = "flex";
          singleRow.style.gap = Theme.spacing.margin;
          processField(field, singleRow);
          grid.appendChild(singleRow);
        }
      });
    });
  
    // Theme refresh helper
    grid.refreshTheme = () => {
      grid.style.backgroundColor = Theme.colors.background;
      grid.style.color = Theme.colors.text;
      titles.forEach(title => title.style.color = Theme.colors.text);
      Array.from(grid.querySelectorAll('div')).forEach(cell => {
        cell.style.backgroundColor = Theme.colors.background;
        cell.style.color = Theme.colors.text;
      });
    };
  
    Theme.subscribe(() => grid.refreshTheme());
  
    grid.refreshTheme();
    return grid;
  }
  

  function createDataGrid({ id, fields, records, onRowSelect }) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      overflowX: "auto",
      width: "100%",
      marginTop: "20px",
      borderRadius: "8px",
      backgroundColor: Theme.colors.background,
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      transition: "background-color 0.3s, color 0.3s"
    });
  
    const table = document.createElement("div");
    table.id = id;
    Object.assign(table.style, {
      display: "table",
      width: "max-content",
      fontFamily: Theme.fonts.base,
      borderSpacing: "0",
      borderCollapse: "collapse"
    });
  
    function estimateColumnWidths(fields, records) {
      return fields.map(field => {
        let maxLen = field.label.length;
        records.forEach(record => {
          const val = record[field.key];
          if (val && val.toString().length > maxLen) {
            maxLen = val.toString().length;
          }
        });
        return Math.min(300, maxLen * 8 + 40);
      });
    }
  
    const columnWidths = estimateColumnWidths(fields, records);
  
    const headerRow = document.createElement("div");
    Object.assign(headerRow.style, {
      display: "table-row",
      backgroundColor: Theme.colors.primary,
      color: "#fff",
      fontWeight: "bold",
      minHeight: "48px"
    });
  
    fields.forEach((field, idx) => {
      const cell = document.createElement("div");
      Object.assign(cell.style, {
        display: "table-cell",
        width: `${columnWidths[idx]}px`,
        padding: "12px 8px",
        textAlign: "center",
        borderRight: "1px solid #bbb",
        borderBottom: "2px solid #ccc",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      });
      cell.textContent = field.label;
      headerRow.appendChild(cell);
    });
  
    table.appendChild(headerRow);
  
    let selectedRow = null;
  
    records.forEach((record, rowIndex) => {
      const dataRow = document.createElement("div");
      Object.assign(dataRow.style, {
        display: "table-row",
        minHeight: "48px",
        cursor: "pointer",
        transition: "background-color 0.3s, color 0.3s"
      });
  
      if (flashRowIndex === rowIndex) {
        dataRow.style.backgroundColor = "#b0f2b6";
        dataRow.style.transition = "background-color 0.8s ease, color 0.5s ease";
  
        setTimeout(() => {
          dataRow.style.backgroundColor = Theme.colors.background;
          dataRow.style.color = Theme.colors.text;
        }, 50);
      }
  
      dataRow.addEventListener("mouseover", () => {
        if (dataRow !== selectedRow) {
          dataRow.style.backgroundColor = Theme.colors.accent;
          dataRow.style.color = "#222";
        }
      });
      dataRow.addEventListener("mouseout", () => {
        if (dataRow !== selectedRow) {
          dataRow.style.backgroundColor = Theme.colors.background;
          dataRow.style.color = Theme.colors.text;
        }
      });
  
      // 🧠 Correct click-to-select
      dataRow.addEventListener("click", () => {
        if (selectedRow && selectedRow !== dataRow) {
          selectedRow.style.backgroundColor = Theme.colors.background;
          selectedRow.style.color = Theme.colors.text;
        }
        if (selectedRow === dataRow) {
          selectedRow.style.backgroundColor = Theme.colors.background;
          selectedRow.style.color = Theme.colors.text;
          selectedRow = null;
          if (typeof onRowSelect === "function") onRowSelect(null);
        } else {
          selectedRow = dataRow;
          dataRow.style.backgroundColor = Theme.colors.primary;
          dataRow.style.color = "#fff";
          if (typeof onRowSelect === "function") onRowSelect(rowIndex);
        }
      });
      
  
      fields.forEach((field, idx) => {
        const dataCell = document.createElement("div");
        Object.assign(dataCell.style, {
          display: "table-cell",
          width: `${columnWidths[idx]}px`,
          padding: "12px 8px",
          textAlign: "center",
          borderRight: "1px solid #eee",
          borderBottom: "1px solid #eee",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        });
        dataCell.textContent = record[field.key] !== undefined ? record[field.key] : "-";
        dataRow.appendChild(dataCell);
      });
  
      table.appendChild(dataRow);
    });
  
    table.refreshTheme = () => {
      wrapper.style.backgroundColor = Theme.colors.background;
      table.style.color = Theme.colors.text;
    };
  
    Theme.subscribe(() => table.refreshTheme());
    table.refreshTheme();
  
    wrapper.appendChild(table);
    return wrapper;
  }
  
  
  

  function showConfirmDialog({ message, onConfirm, onCancel }) {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      opacity: "0",
      transition: "opacity 0.3s"
    });
  
    const dialog = document.createElement("div");
    Object.assign(dialog.style, {
      backgroundColor: Theme.colors.background,
      color: Theme.colors.text,
      padding: "24px 20px 20px 20px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
      fontFamily: Theme.fonts.base,
      textAlign: "center",
      width: "320px",
      maxWidth: "90%",
      transform: "scale(0.9)",
      transition: "transform 0.3s ease, box-shadow 0.5s ease, background-color 0.3s, color 0.3s, border-color 0.3s",
      overflow: "hidden",
      position: "relative"
    });
  
    // 🌟 Add elegant top bar
    const topBar = document.createElement("div");
    Object.assign(topBar.style, {
      height: "8px",
      width: "100%",
      background: "linear-gradient(to right, #6a11cb, #2575fc)", // purple-blue gradient
      position: "absolute",
      top: "0",
      left: "0",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px"
    });



    dialog.appendChild(topBar);
  
    const messageElem = document.createElement("div");
    messageElem.textContent = message;
    Object.assign(messageElem.style, {
      marginTop: "16px",
      marginBottom: "20px",
      fontSize: "18px"
    });
  
    const buttonRow = document.createElement("div");
    Object.assign(buttonRow.style, {
      display: "flex",
      justifyContent: "space-around",
      gap: "12px"
    });
  
    const confirmBtn = createButton({
      id: "confirmYesBtn",
      text: "✅ Yes",
      color: "success",
      onClick: () => {
        document.body.removeChild(overlay);
        if (typeof onConfirm === "function") onConfirm();
      }
    });
  
    const cancelBtn = createButton({
      id: "confirmNoBtn",
      text: "❌ No",
      color: "danger",
      onClick: () => {
        document.body.removeChild(overlay);
        if (typeof onCancel === "function") onCancel();
      }
    });
  
    buttonRow.appendChild(confirmBtn);
    buttonRow.appendChild(cancelBtn);
  
    dialog.appendChild(messageElem);
    dialog.appendChild(buttonRow);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  
    // 🚀 Fade, pop, and pulse-glow
    setTimeout(() => {
      overlay.style.opacity = "1";
      dialog.style.transform = "scale(1.0)";
      dialog.style.boxShadow = "0 0 30px rgba(255,255,255,0.1), 0 4px 30px rgba(0,0,0,0.2)";
    }, 10);
  }
  
  function createSvgBarChart({ width = 600, height = 400, data = [], theme = Theme }) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.backgroundColor = theme.colors.background;
    svg.style.borderRadius = "8px";
  
    const padding = 40;
    const barWidth = (width - padding * 2) / data.length;
    const maxValue = Math.max(...data.map(d => d.value), 1);
  
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * (height - padding * 2);
  
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", padding + index * barWidth);
      rect.setAttribute("y", height - padding);
      rect.setAttribute("width", barWidth * 0.6);
      rect.setAttribute("height", 0);
      rect.setAttribute("fill", theme.colors.primary);
      rect.classList.add("bar");
  
      svg.appendChild(rect);
  
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", padding + index * barWidth + (barWidth * 0.3));
      label.setAttribute("y", height - padding + 12);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "10");
      label.setAttribute("fill", theme.colors.text);
      label.textContent = item.label.length > 5 ? item.label.slice(0, 5) + "…" : item.label;
  
      svg.appendChild(label);
  
      // Animate the bar height
      let currentHeight = 0;
      function animateBar() {
        if (currentHeight < barHeight) {
          currentHeight += 2; // Adjust the increment for speed
          rect.setAttribute("height", currentHeight);
          rect.setAttribute("y", height - padding - currentHeight);
          requestAnimationFrame(animateBar);
        }
      }
      requestAnimationFrame(animateBar);
    });
  
    return svg;
  }
  

  function createApiForm() {
    const form = document.createElement('form');
    form.id = "apiForm";
    
    // Endpoint input
    const endpointInput = document.createElement('input');
    endpointInput.placeholder = "Enter API Endpoint";
    endpointInput.style.marginBottom = "8px";
    endpointInput.style.marginRight = "8px";

    // API Key input (optional)
    const keyInput = document.createElement('input');
    keyInput.placeholder = "Enter API Key (if required)";
    keyInput.style.marginBottom = "8px";
    keyInput.style.marginRight = "8px";
    
    // Fetch Button
    const fetchBtn = createButton({
      id: "fetchApiBtn",
      text: "Fetch Data",
      color: "success",
      onClick: () => {
        const endpoint = endpointInput.value.trim();
        const apiKey = keyInput.value.trim();
        fetchApiData(endpoint, apiKey);
      }
    });
  
    // Append to form
    form.appendChild(endpointInput);
    form.appendChild(keyInput);
    form.appendChild(fetchBtn);
  
    return form;
  }

  function handleApiResponse(data) {
    // This function can update your UI or grid with the response data
    const gridContainer = document.getElementById("gridContainer");
  
    // Clear previous data
    gridContainer.innerHTML = "";
  
    // Display the data in some way
    const grid = createDataGrid({
      id: "apiDataGrid",
      fields: Object.keys(data[0]).map(key => ({ key, label: key })),
      records: data
    });
  
    gridContainer.appendChild(grid);
  }
  