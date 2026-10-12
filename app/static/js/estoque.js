const API_URL = "/produtos";

const form = document.querySelector("#product-form");
const formTitle = document.querySelector("#form-title");
const formMode = document.querySelector("#form-mode");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-edit");
const list = document.querySelector("#product-list");
const count = document.querySelector("#product-count");
const notice = document.querySelector("#notice");
const search = document.querySelector("#product-search");
const downloadButton = document.querySelector("#download-spreadsheet");
const fields = ["categoria", "nome", "quantidade"];

let products = [];
let editingId = null;
let noticeTimeout;

function showNotice(message, isError = false) {
    window.clearTimeout(noticeTimeout);
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
    notice.setAttribute("role", isError ? "alert" : "status");
    notice.setAttribute("aria-live", isError ? "assertive" : "polite");
    if (message) {
        noticeTimeout = window.setTimeout(() => { notice.textContent = ""; }, 5000);
    }
}

function formatErrors(errors) {
    if (!errors) return "";
    if (typeof errors === "string") return errors;
    if (Array.isArray(errors)) return errors.map(formatErrors).filter(Boolean).join("; ");
    if (typeof errors === "object") {
        return Object.entries(errors).map(([field, value]) => {
            const label = fields.includes(field) ? `${field[0].toUpperCase()}${field.slice(1)}` : field;
            return `${label}: ${formatErrors(value)}`;
        }).filter(Boolean).join("; ");
    }
    return String(errors);
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (response.status === 204) return null;

    let payload;
    try {
        payload = await response.json();
    } catch {
        throw new Error(response.ok ? "A resposta do servidor não pôde ser lida." : `Falha na solicitação (HTTP ${response.status}).`);
    }

    if (!response.ok || payload?.success !== true) {
        const details = formatErrors(payload?.errors);
        throw new Error([payload?.message, details].filter(Boolean).join(": ") || `Falha na solicitação (HTTP ${response.status}).`);
    }
    return payload;
}

function setListState(message, isError = false) {
    list.replaceChildren();
    const item = document.createElement("li");
    item.className = `list-state${isError ? " is-error" : ""}`;
    item.textContent = message;
    list.append(item);
}

function getVisibleProducts() {
    const query = search.value.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) =>
        `${product.nome} ${product.categoria}`.toLocaleLowerCase("pt-BR").includes(query)
    );
}

function groupProducts(items) {
    const groups = new Map();
    items.forEach((product) => {
        const category = product.categoria ?? "Sem categoria";
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(product);
    });
    return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right, "pt-BR"));
}

function renderProducts() {
    const groupedProducts = groupProducts(getVisibleProducts());
    count.textContent = String(products.length);
    list.setAttribute("aria-busy", "false");
    list.replaceChildren();

    if (products.length === 0) {
        setListState("Nenhum produto ativo. Cadastre o primeiro item ao lado.");
        return;
    }
    if (groupedProducts.length === 0) {
        setListState("Nenhum produto encontrado para essa busca.");
        return;
    }

    let rowIndex = 0;
    groupedProducts.forEach(([category, categoryProducts]) => {
            const heading = document.createElement("li");
            heading.className = "category-heading";
            const title = document.createElement("h3");
            title.textContent = category;
            heading.append(title);
            list.append(heading);

            categoryProducts.forEach((product) => {
                const item = document.createElement("li");
                item.className = "product-row";
                item.style.animationDelay = `${Math.min(rowIndex * 25, 150)}ms`;
                rowIndex += 1;

                const info = document.createElement("div");
                info.className = "product-info";
                const name = document.createElement("p");
                name.className = "product-name";
                name.textContent = product.nome;
                info.append(name);

                const quantity = document.createElement("span");
                quantity.className = "product-quantity";
                quantity.textContent = product.quantidade;
                quantity.setAttribute("aria-label", `Quantidade: ${product.quantidade}`);

                const actions = document.createElement("div");
                actions.className = "row-actions";
                const edit = document.createElement("button");
                edit.className = "text-action edit";
                edit.type = "button";
                edit.dataset.action = "edit";
                edit.dataset.id = product.id;
                edit.textContent = "Editar";
                edit.setAttribute("aria-label", `Editar ${product.nome}`);
                const deactivate = document.createElement("button");
                deactivate.className = "text-action delete";
                deactivate.type = "button";
                deactivate.dataset.action = "deactivate";
                deactivate.dataset.id = product.id;
                deactivate.textContent = "Excluir";
                deactivate.setAttribute("aria-label", `Excluir ${product.nome}`);
                actions.append(edit, deactivate);
                item.append(info, quantity, actions);
                list.append(item);
            });
        });
}

function escapeXml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;"
    })[character]);
}

downloadButton.addEventListener("click", () => {
    const groupedProducts = groupProducts(getVisibleProducts());
    if (groupedProducts.length === 0) {
        showNotice(products.length ? "Nenhum produto encontrado para exportar." : "Não há produtos para exportar.", true);
        return;
    }

    const rows = [];
    groupedProducts.forEach(([category, categoryProducts], index) => {
        if (index > 0) rows.push('<Row ss:Height="12"/>');
        rows.push(`<Row ss:Height="28"><Cell ss:StyleID="Category" ss:MergeAcross="1"><Data ss:Type="String">${escapeXml(category.toLocaleUpperCase("pt-BR"))}</Data></Cell></Row>`);
        rows.push('<Row ss:Height="9"/>');
        categoryProducts.forEach((product) => {
            rows.push(`<Row ss:Height="23"><Cell ss:StyleID="Product"><Data ss:Type="String">${escapeXml(product.nome)}</Data></Cell><Cell ss:StyleID="Quantity"><Data ss:Type="String">${escapeXml(product.quantidade)}</Data></Cell></Row>`);
        });
    });

    const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Styles>
        <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos" ss:Size="11" ss:Color="#20312B"/></Style>
        <Style ss:ID="Category"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D2E1D5"/></Borders><Font ss:FontName="Georgia" ss:Size="14" ss:Bold="1" ss:Color="#214F3C"/><Interior ss:Color="#EAF2EC" ss:Pattern="Solid"/></Style>
        <Style ss:ID="Product"><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E3EAE4"/></Borders><Font ss:FontName="Aptos" ss:Size="11" ss:Color="#20312B"/></Style>
        <Style ss:ID="Quantity"><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E3EAE4"/></Borders><Font ss:FontName="Aptos" ss:Size="11" ss:Bold="1" ss:Color="#214F3C"/></Style>
    </Styles>
    <Worksheet ss:Name="Estoque">
        <Table ss:ExpandedColumnCount="2" ss:ExpandedRowCount="${rows.length}" x:FullColumns="1" x:FullRows="1">
            <Column ss:Width="280"/><Column ss:Width="150"/>
            ${rows.join("\n            ")}
        </Table>
    </Worksheet>
</Workbook>`;
    const blobUrl = URL.createObjectURL(new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }));
    const link = document.createElement("a");
    const date = new Date();
    const dateLabel = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    link.href = blobUrl;
    link.download = `estoque-${dateLabel}.xls`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    showNotice("Planilha baixada com sucesso.");
});

async function loadProducts() {
    list.setAttribute("aria-busy", "true");
    count.textContent = "…";
    setListState("Carregando produtos...");
    try {
        const payload = await request(API_URL);
        if (!Array.isArray(payload?.data)) throw new Error("A lista de produtos recebida não é válida.");
        products = payload.data;
        renderProducts();
        return true;
    } catch (error) {
        count.textContent = "—";
        list.setAttribute("aria-busy", "false");
        setListState(error.message || "Não foi possível carregar os produtos.", true);
        showNotice(error.message || "Não foi possível carregar os produtos.", true);
        return false;
    }
}

function clearFieldErrors() {
    fields.forEach((field) => {
        document.querySelector(`#${field}-error`).textContent = "";
        document.querySelector(`#${field}`).removeAttribute("aria-invalid");
    });
}

function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Adicionar produto";
    formMode.textContent = "NOVO ITEM";
    submitButton.textContent = "Adicionar produto";
    cancelButton.hidden = true;
    clearFieldErrors();
}

function startEditing(product) {
    clearFieldErrors();
    editingId = product.id;
    fields.forEach((field) => { form.elements[field].value = product[field] ?? ""; });
    formTitle.textContent = "Editar produto";
    formMode.textContent = "ALTERAR ITEM";
    submitButton.textContent = "Salvar alterações";
    cancelButton.hidden = false;
    form.elements.nome.focus();
}

function validateForm(values) {
    clearFieldErrors();
    let firstInvalid = null;
    if (!values.categoria.trim()) {
        document.querySelector("#categoria-error").textContent = "Informe uma categoria.";
        firstInvalid = firstInvalid || form.elements.categoria;
    }
    if (values.nome.trim().length < 3) {
        document.querySelector("#nome-error").textContent = "O nome precisa ter ao menos 3 caracteres.";
        firstInvalid = firstInvalid || form.elements.nome;
    }
    if (!values.quantidade.trim()) {
        document.querySelector("#quantidade-error").textContent = "Informe a quantidade.";
        firstInvalid = firstInvalid || form.elements.quantidade;
    }
    if (firstInvalid) {
        fields.forEach((field) => {
            if (document.querySelector(`#${field}-error`).textContent) form.elements[field].setAttribute("aria-invalid", "true");
        });
        firstInvalid.focus();
        showNotice("Revise os campos destacados antes de continuar.", true);
        return false;
    }
    return true;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(fields.map((field) => [field, form.elements[field].value]));
    if (!validateForm(values)) return;

    submitButton.disabled = true;
    submitButton.textContent = editingId === null ? "Adicionando..." : "Salvando...";
    try {
        const wasEditing = editingId !== null;
        const url = wasEditing ? `${API_URL}/${encodeURIComponent(editingId)}` : API_URL;
        const payload = await request(url, {
            method: wasEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        });
        resetForm();
        const refreshed = await loadProducts();
        showNotice(refreshed ? (payload?.message || (wasEditing ? "Produto atualizado." : "Produto salvo.")) : "Alteração salva, mas não foi possível atualizar a lista. Tente recarregar.", !refreshed);
    } catch (error) {
        showNotice(error.message || "Não foi possível salvar o produto.", true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = editingId === null ? "Adicionar produto" : "Salvar alterações";
    }
});

cancelButton.addEventListener("click", resetForm);
search.addEventListener("input", renderProducts);

list.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const product = products.find((item) => String(item.id) === button.dataset.id);
    if (!product) return;

    if (button.dataset.action === "edit") {
        startEditing(product);
        return;
    }
    if (!window.confirm(`Excluir o produto “${product.nome}” do estoque?`)) return;

    button.disabled = true;
    try {
        await request(`${API_URL}/${encodeURIComponent(product.id)}`, { method: "DELETE" });
        products = products.filter((item) => item.id !== product.id);
        if (editingId === product.id) resetForm();
        renderProducts();
        showNotice("Produto excluído.");
    } catch (error) {
        showNotice(error.message || "Não foi possível desativar o produto.", true);
        button.disabled = false;
    }
});

loadProducts();