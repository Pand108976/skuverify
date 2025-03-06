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
        resultDiv.innerHTML = `
            <div class="alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Digite um SKU válido!</span>
            </div>`;
        return;
    }

    const cintosEncontrados = cintos.filter(cinto => cinto.sku === skuNumber);
    const oculosEncontrados = oculos.filter(oculo => oculo.sku === skuNumber);
    
    if (cintosEncontrados.length > 0 || oculosEncontrados.length > 0) {
        const item = cintosEncontrados.length > 0 ? cintosEncontrados[0] : oculosEncontrados[0];
        const tipo = cintosEncontrados.length > 0 ? "Cinto" : "Óculos";
        const caixas = (cintosEncontrados.length > 0 ? cintosEncontrados : oculosEncontrados)
            .map(i => i.caixa)
            .sort((a, b) => a - b)
            .join(", ");
        
        resultDiv.innerHTML = `

                   <div class="detail-row location-row">
                            <i class="fas fa-warehouse"></i>
                            <span class="detail-label">Localização:</span>
                            <div class="box-locations">
                                ${caixas.split(',').map(caixa => `
                                    <span class="box-badge">
                                        <i class="fas fa-box-open"></i>
                                        Caixa ${caixa.trim()}
                                    </span>
                                `).join('')}
                            </div>
                        </div>      
                        
            <div class="inventory-card">
                <div class="product-image-container">
                    <div class="product-image">
                        <img src="${item.imagem}" alt="${tipo}">
                    </div>
                </div>

                
                <div class="inventory-content">
                    <div class="product-details">
                        <div class="detail-row">
                            <i class="fas fa-tag"></i>
                            <span class="detail-label">SKU:</span>
                            <span class="detail-value">${item.sku}</span>
                        </div>


                        <div class="detail-row">
                            <i class="fas fa-box"></i>
                            <span class="detail-label">Categoria:</span>
                            <span class="detail-value">${tipo}</span>
                        </div>

                        

                       
                    </div>
                </div>

                <div class="inventory-footer">
                    <button 
                        onclick="window.open('${item.link}', '_blank')"
                        class="action-button ${!item.link ? 'disabled' : ''}"
                        ${!item.link ? 'disabled' : ''}>
                        <i class="fas fa-external-link-alt"></i>
                        Acessar Site
                    </button>
                </div>
            </div>`;
    } else {
        resultDiv.innerHTML = `
            <div class="alert-error">
                <i class="fas fa-box-open"></i>
                <span>SKU não encontrado no estoque.</span>
            </div>`;
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

const css = `
.detail-row.location-row {
    width: 100%;
    margin-bottom: 10px;
}
`;

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);