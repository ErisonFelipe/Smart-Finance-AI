/* ============================
STATE MANAGEMENT (Foco no MySQL)
============================ */
let registros = [];
let chartCategoriasInstance = null;
let chartBalancoInstance = null;

/* ELEMENTOS DO DOM */
const form = document.getElementById("financeForm");
const tabela = document.getElementById("financeTable");
const activityLog = document.getElementById("activityLog");
const fileInputRecebimento = document.getElementById("fileInputRecebimento");
const fileInputPagamento = document.getElementById("fileInputPagamento");

/* BOTOES KPI */
const kpiRecebimentos = document.getElementById("kpiRecebimentos");
const kpiDespesas = document.getElementById("kpiDespesas");
const kpiBoletos = document.getElementById("kpiBoletos");
const kpiSaldo = document.getElementById("kpiSaldo");

/* ============================
API: BUSCAR DADOS DO BACK-END
============================ */
async function carregarDadosDoServidor() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/lancamentos');
        if (!response.ok) throw new Error("Erro na requisição com o servidor Flask");
        
        registros = await response.json();
        
        // Dispara a atualização visual completa da tela
        renderTabela();
        renderKPIs();
        renderGraficos();
        renderActivity();
    } catch (error) {
        console.error("[NOC ERROR] Falha ao carregar dados do MySQL:", error);
    }
}

/* ============================
RENDER TABELA
============================ */
function renderTabela() {
    if (!tabela) return;
    tabela.innerHTML = "";

    if (!registros || registros.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Nenhum lançamento encontrado.</td></tr>`;
        return;
    }

    registros.forEach(r => {
        const tr = document.createElement("tr");

        // Captura o valor correto baseado nas colunas do MySQL
        const valorReal = Number(r.entrada) > 0 ? Number(r.entrada) : Number(r.saida);
        const valorFormatado = valorReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Formata a data vinda do banco
        const dataFormatada = r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '---';

        let badgeClass = "badge-pagamento";
        if (r.tipo === "Recebimento") badgeClass = "badge-recebimento";
        if (r.tipo === "Boleto") badgeClass = "badge-boleto";

        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td><span class="badge ${badgeClass}">${r.tipo}</span></td>
            <td><strong>${r.descricao || 'Sem descrição'}</strong></td>
            <td>${valorFormatado}</td>
            <td><span class="status-pago"><i class="fa-solid fa-circle-check"></i> Processado</span></td>
            <td>
                <button class="btn-action btn-delete" onclick="deletarRegistro(${r.id})" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

/* ============================
RENDER KPIs
============================ */
function renderKPIs() {
    let recebimentos = 0;
    let despesas = 0;
    let boletos = 0;

    registros.forEach(r => {
        const ent = Number(r.entrada) || 0;
        const sai = Number(r.saida) || 0;

        if (r.tipo === "Recebimento") {
            recebimentos += ent;
        } else if (r.tipo === "Boleto") {
            boletos += sai;
            despesas += sai;
        } else {
            despesas += sai;
        }
    });

    const saldo = recebimentos - despesas;

    if (kpiRecebimentos) kpiRecebimentos.innerText = recebimentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (kpiDespesas) kpiDespesas.innerText = despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (kpiBoletos) kpiBoletos.innerText = boletos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (kpiSaldo) {
        kpiSaldo.innerText = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        kpiSaldo.className = saldo >= 0 ? "text-green" : "text-red";
    }
}

/* ============================
RENDER GRÁFICOS (Engine Visual)
============================ */
function renderGraficos() {
    const ctxCategorias = document.getElementById('chartCategorias');
    const ctxBalanco = document.getElementById('chartBalanco');
    
    if (!ctxCategorias || !ctxBalanco) return;

    let recebimentos = 0;
    let totalPagamentos = 0;
    let totalBoletos = 0;
    let totalCartao = 0;

    registros.forEach(r => {
        const ent = Number(r.entrada) || 0;
        const sai = Number(r.saida) || 0;

        if (r.tipo === "Recebimento") {
            recebimentos += ent;
        } else if (r.tipo === "Boleto") {
            totalBoletos += sai;
        } else if (r.tipo === "Pagamento") {
            totalPagamentos += sai;
        } else if (r.tipo === "Cartão") {
            totalCartao += sai;
        }
    });

    if (chartCategoriasInstance) chartCategoriasInstance.destroy();
    chartCategoriasInstance = new Chart(ctxCategorias, {
        type: 'doughnut',
        data: {
            labels: ['Recebimentos', 'Pagamentos', 'Boletos', 'Cartão'],
            datasets: [{
                data: [recebimentos, totalPagamentos, totalBoletos, totalCartao],
                backgroundColor: ['#10b981', '#f43f5e', '#8b5cf6', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    if (chartBalancoInstance) chartBalancoInstance.destroy();
    const despesasTotais = totalPagamentos + totalBoletos + totalCartao;
    chartBalancoInstance = new Chart(ctxBalanco, {
        type: 'bar',
        data: {
            labels: ['Entradas', 'Saídas Totais'],
            datasets: [{
                label: 'Volume Financeiro',
                data: [recebimentos, despesasTotais],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

/* ============================
RENDER ACTIVITY LOG
============================ */
function renderActivity() {
    if (!activityLog) return;
    activityLog.innerHTML = "";
    
    const ultimos = registros.slice(0, 3);
    ultimos.forEach(r => {
        const div = document.createElement("div");
        div.className = "activity-item";
        const v = Number(r.entrada) > 0 ? r.entrada : r.saida;
        div.innerHTML = `
            <p><i class="fa-solid fa-circle-info text-blue"></i> Módulo OCR processou <strong>${r.descricao}</strong> no valor de R$ ${Number(v).toFixed(2)}</p>
        `;
        activityLog.appendChild(div);
    });
}

/* ============================
AÇÃO: EXCLUIR REGISTRO (No MySQL e na Tela)
============================ */
async function deletarRegistro(id) {
    if (!confirm("Deseja realmente excluir este lançamento permanentemente do banco de dados?")) return;

    try {
        // Envia o pedido de DELETE diretamente para a API do Flask
        const response = await fetch(`http://127.0.0.1:5000/api/lancamentos/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // Se o servidor deletou com sucesso, recarrega a lista atualizada do banco
            await carregarDadosDoServidor();
            alert("Lançamento excluído com sucesso do banco de dados!");
        } else {
            const erro = await response.json();
            alert(`Erro ao deletar: ${erro.error || 'Falha no servidor'}`);
        }
    } catch (error) {
        console.error("[NOC ERROR] Falha na comunicação de deleção:", error);
        alert("Não foi possível conectar ao servidor Python para deletar.");
    }
}

/* ============================
UPLOAD AUTOMATIZADO DE COMPROVANTES
============================ */
async function enviarArquivo(file) {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);

    // Exibe indicador visual de processamento
    if (tabela) tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#3b82f6;"><i class="fa-solid fa-spinner fa-spin"></i> Inteligência artificial do Gemini analisando documento...</td></tr>`;

    try {
        const response = await fetch("http://127.0.0.1:5000/api/upload", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            // Recarrega a lista direto do banco de dados atualizada
            await carregarDadosDoServidor();
        } else {
            alert("Erro ao processar o documento no servidor.");
            await carregarDadosDoServidor();
        }
    } catch (error) {
        console.error("Erro no upload:", error);
        alert("Servidor Python offline ou inacessível.");
        await carregarDadosDoServidor();
    }
}

/* LISTENERS DE UPLOAD */
if (fileInputRecebimento) fileInputRecebimento.addEventListener("change", (e) => enviarArquivo(e.target.files[0]));
if (fileInputPagamento) fileInputPagamento.addEventListener("change", (e) => enviarArquivo(e.target.files[0]));

// INICIALIZAÇÃO AUTOMÁTICA AO CARREGAR A PÁGINA
window.addEventListener("DOMContentLoaded", carregarDadosDoServidor);