function exibirOculos() {
    const listaOculos = document.getElementById("oculosList");
    listaOculos.innerHTML = "";

    
    oculos.forEach(oculo => {
        listaOculos.innerHTML += `
            <div>
                <img src="${oculo.imagem}" alt="Óculos">
                <p>SKU: ${oculo.sku}</p>
                <p>Caixa: ${oculo.caixa}</p>
            </div>
        `;
    });
    
}

document.addEventListener("DOMContentLoaded", exibirOculos);


function pesquisarSKU() {
    const skuInput = document.getElementById("skuInput");
    const resultDiv = document.getElementById("result");
    const skuNumber = skuInput.value.trim();

    if (skuNumber === "") {
        resultDiv.innerHTML = "<span>Digite um SKU válido!</span>";
        return;
    }

    const cintosEncontrados = cintos.filter(cinto => cinto.sku === skuNumber);
    const oculosEncontrados = oculos.filter(oculo => oculo.sku === skuNumber);
    
    if (cintosEncontrados.length > 0) {
        const caixas = cintosEncontrados.map(c => c.caixa).join(", ");
        const link = cintosEncontrados[0].link;
        const buttonStyle = link && link.trim() !== "" 
            ? 'background-color: #007bff; cursor: pointer;' 
            : 'background-color: #cccccc; cursor: not-allowed;';
        
        resultDiv.innerHTML = `
            <div class="resultado-pesquisa">
                <p>O SKU <span>${skuNumber}</span> é de um cinto na caixa <span>${caixas}</span>.</p>
                <img src="${cintosEncontrados[0].imagem}" alt="Cinto" style="max-width: 200px;">
                <button 
                    onclick="window.open('${link}', '_blank')"
                    style="${buttonStyle}"
                    ${!link ? 'disabled' : ''}>
                    Visitar Site
                </button>
            </div>`;
    } else if (oculosEncontrados.length > 0) {
        const caixas = oculosEncontrados.map(o => o.caixa).join(", ");
        const link = oculosEncontrados[0].link;
        const buttonStyle = link && link.trim() !== "" 
            ? 'background-color: #007bff; cursor: pointer;' 
            : 'background-color: #cccccc; cursor: not-allowed;';
        
        resultDiv.innerHTML = `
            <div class="resultado-pesquisa">
                <p>O SKU <span>${skuNumber}</span> é de um óculos na caixa <span>${caixas}</span>.</p>
                <img src="${oculosEncontrados[0].imagem}" alt="Óculos">
                <button 
                    onclick="window.open('${link}', '_blank')"
                    style="${buttonStyle}"
                    ${!link ? 'disabled' : ''}>
                    Visitar Site
                </button>
            </div>`;
    } else {
        resultDiv.innerHTML = `<span>SKU não encontrado.</span>`;
    }

    setTimeout(() => {
        skuInput.value = "";
    }, 2000);
}

function showTab(tab) {
document.getElementById("pesquisa").classList.add("hidden");
document.getElementById("oculos").classList.add("hidden");
document.getElementById("cintos").classList.add("hidden");
document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));

document.getElementById(tab).classList.remove("hidden");
document.querySelector(`.tab[onclick="showTab('${tab}')"]`).classList.add("active");

if (tab === "oculos") {
    const oculosList = document.getElementById("oculosList");
    oculosList.innerHTML = "";
    
    
    const oculosAgrupados = oculos.reduce((acc, item) => {
        if (!acc[item.sku]) {
            acc[item.sku] = {
                sku: item.sku,
                imagem: item.imagem,
                caixas: new Set([item.caixa])
            };
        } else {
            acc[item.sku].caixas.add(item.caixa);
        }
        return acc;
    }, {});
    
    
    Object.values(oculosAgrupados).forEach(item => {
        oculosList.innerHTML += `
            <div class="oculostodos-container">
                <img class="oculos-item" src="${item.imagem}" 
                alt="Óculos" onclick="abrirModal('${item.sku}')">
            </div>
        `;
    });
} else if (tab === "cintos") {
    const cintosList = document.getElementById("cintosList");
    cintosList.innerHTML = "";
    
    
    const cintosAgrupados = cintos.reduce((acc, item) => {
        if (!acc[item.sku]) {
            acc[item.sku] = {
                sku: item.sku,
                imagem: item.imagem,
                caixas: new Set([item.caixa])
            };
        } else {
            acc[item.sku].caixas.add(item.caixa);
        }
        return acc;
    }, {});
    
    
    Object.values(cintosAgrupados).forEach(item => {
        cintosList.innerHTML += `
            <div class="oculostodos-container">
                <img class="oculos-item" src="${item.imagem}" 
                alt="Cinto" onclick="abrirModal('${item.sku}')">
            </div>
        `;
    });
}
}

function abrirModal(sku) {
const todosItens = [...oculos, ...cintos];
const itensEncontrados = todosItens.filter(item => item.sku === sku);

if (itensEncontrados.length > 0) {
    const caixasUnicas = [...new Set(itensEncontrados.map(item => item.caixa))].sort((a, b) => a - b);
    const todasCaixas = caixasUnicas.join(", ");
    const link = itensEncontrados[0].link;
    
    document.getElementById("modalSku").innerText = `SKU: ${sku}`;
    document.getElementById("modalCaixa").innerText = `Caixa: ${todasCaixas}`;
    document.getElementById("modalImagem").src = itensEncontrados[0].imagem;
    document.getElementById("modal").style.display = "flex";
    
    const visitarSiteBtn = document.getElementById("visitarSiteBtn");
    if (link && link.trim() !== "") {
        visitarSiteBtn.style.backgroundColor = "#007bff";
        visitarSiteBtn.style.cursor = "pointer";
        visitarSiteBtn.disabled = false;
    } else {
        visitarSiteBtn.style.backgroundColor = "#cccccc";
        visitarSiteBtn.style.cursor = "not-allowed";
        visitarSiteBtn.disabled = true;
    }
    
    document.getElementById("modal").setAttribute("data-link", link || "");
}
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}


document.getElementById("skuInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        pesquisarSKU();
    }
});

function fecharModalFora(event) {
if (event.target === document.getElementById('modal')) {
    fecharModal();
}
}

function visitarSite() {
const link = document.getElementById("modal").getAttribute("data-link");
if (link) {
    window.open(link, '_blank');
}
}