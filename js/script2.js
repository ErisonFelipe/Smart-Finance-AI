/* ============================
STATE MANAGEMENT
============================ */
let registros = JSON.parse(localStorage.getItem("smartFinance")) || [];
let chartCategoriasInstance = null;
let chartBalancoInstance = null;
/* ============================
DOM
============================ */
const form = document.getElementById("financeForm");
const tabela = document.getElementById("financeTable");
const activityLog = document.getElementById("activityLog");
const fileInputRecebimento = document.getElementById("fileInputRecebimento");
const fileInputPagamento = document.getElementById("fileInputPagamento");

/* KPI */
const kpiRecebimentos = document.getElementById("kpiRecebimentos");
const kpiDespesas = document.getElementById("kpiDespesas");
const kpiBoletos = document.getElementById("kpiBoletos");
const kpiSaldo = document.getElementById("kpiSaldo");

/* ============================
BOOT / INITIALIZATION
============================ */
try {
    renderTabela();
    renderKPIs();
    renderActivity();
    renderGraficos();
} catch (e) {
    console.error("Erro ao inicializar dados. Resetando cache...", e);
    localStorage.removeItem("smartFinance");
}

/* ============================
FORM SUBMIT (MANUAL)
============================ */
if (form) {
    form.addEventListener("submit", function(e){
        e.preventDefault();
        adicionarRegistro();
    });
}

/* ============================
UPLOAD REAL E INTEGRAÇÃO COM API
============================ */
if (fileInputRecebimento) {
    fileInputRecebimento.addEventListener("change", function() {
        if (!this.files.length) return;
        processarDocumentoReal(this.files[0], true); // true = Canal de Entrada
        this.value = ""; 
    });
}

if (fileInputPagamento) {
    fileInputPagamento.addEventListener("change", function() {
        if (!this.files.length) return;
        processarDocumentoReal(this.files[0], false); // false = Canal de Saída
        this.value = ""; 
    });
}

async function processarDocumentoReal(file, isEntrada) {
    const formData = new FormData();
    formData.append('file', file);

    console.log(`[NOC ALERT]: Enviando arquivo ${file.name} para a API de Inteligência Artificial...`);

    try {
        const resposta = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!resposta.ok) throw new Error("API retornou status de falha.");

        const dadosIA = await resposta.json();
        console.log("[NOC SUCESSO]: Dados recebidos da IA:", dadosIA);

        // Extrai o valor retornado e garante que seja tratado como número válido
        const valorExtraido = Number(dadosIA.valor) || 0;

        // Determina o tipo real. Se a IA detectou que é um Boleto (ex: Sabesp), mantém Boleto.
        // Se não, assume o canal baseado no botão clicado (Recebimento ou Pagamento)
        let tipoDefinitivo = dadosIA.tipo;
        if (!tipoDefinitivo || tipoDefinitivo === "Pagamento" && isEntrada) {
            tipoDefinitivo = isEntrada ? "Recebimento" : "Pagamento";
        }

        const novoRegistro = {
            id: Date.now(),
            data: new Date().toISOString(),
            tipo: tipoDefinitivo,
            descricao: dadosIA.descricao || `Processado: ${file.name}`,
            entrada: tipoDefinitivo === "Recebimento" ? valorExtraido : 0,
            saida: tipoDefinitivo !== "Recebimento" ? valorExtraido : 0,
            dataVencimento: dadosIA.data_vencimento || null
        };

        registros.push(novoRegistro);
        salvar();
        renderTabela();
        renderKPIs();
        renderActivity();
        renderGraficos();

    } catch (erro) {
        console.error("[CRITICAL ERROR]: Falha de comunicação com a API", erro);
        alert("Ocorreu um erro ao processar o comprovante usando a inteligência artificial. Verifique se o servidor Python está ativo.");
    }
}

/* ============================
ADICIONAR REGISTRO MANUAL
============================ */
function adicionarRegistro(){
    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value;
    const entrada = Number(document.getElementById("entrada").value) || 0;
    const saida = Number(document.getElementById("saida").value) || 0;
    const dataVencimento = document.getElementById("dataVencimento") ? document.getElementById("dataVencimento").value : null;

    if(!descricao){
        alert("Por favor, preencha a descrição.");
        return;
    }

    const registro = {
        id: Date.now(),
        data: new Date().toISOString(),
        tipo,
        descricao,
        entrada,
        saida,
        dataVencimento: tipo === "Boleto" ? dataVencimento : null
    };

    registros.push(registro);
    salvar();
    renderTabela();
    renderKPIs();
    renderActivity();
    if (form) form.reset();
    
    const groupVencimento = document.getElementById("group-vencimento");
    if (groupVencimento) groupVencimento.style.display = "none";
}

/* ============================
RENDER LAYOUTS
============================ */
function renderTabela() {
    if (!tabela) return;
    tabela.innerHTML = "";

    if (!registros || registros.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">Nenhum lançamento encontrado.</td></tr>`;
        return;
    }

    [...registros]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .forEach(registro => {
            const entrada = Number(registro.entrada) || 0;
            const saida = Number(registro.saida) || 0;
            let valorExibido = entrada > 0 ? formatarMoeda(entrada) : "- " + formatarMoeda(saida);

            let statusTexto = "Efetivado";
            if (registro.tipo === "Boleto") {
                if (registro.dataVencimento) {
                    const hoje = new Date();
                    hoje.setHours(0,0,0,0);
                    const venc = new Date(registro.dataVencimento + "T00:00:00");
                    statusTexto = venc < hoje ? "⚠️ Vencido" : "⏳ A Vencer";
                } else {
                    statusTexto = "⏳ Pendente";
                }
            }

            let corStatus = "var(--text-muted)";
            if (statusTexto.includes("Vencido")) corStatus = "var(--red)";
            else if (statusTexto.includes("A Vencer")) corStatus = "var(--purple)";
            else if (registro.tipo === "Recebimento") corStatus = "var(--green)";

            tabela.innerHTML += `
            <tr>
                <td>${formatarData(registro.data)}</td>
                <td>${badge(registro.tipo)}</td>
                <td>
                    <strong>${registro.descricao}</strong>
                    ${registro.dataVencimento ? `<br><small style="color:var(--text-muted); font-size:11px;">Vence em: ${formatarData(registro.dataVencimento)}</small>` : ''}
                </td>
                <td style="font-weight: 600; color: ${entrada > 0 ? 'var(--green)' : 'var(--text)'}">
                    ${valorExibido}
                </td>
                <td style="font-weight: 600; color: ${corStatus}; font-size: 13px;">
                    ${statusTexto}
                </td>
                <td>
                    <button onclick="editar(${registro.id})" class="edit-btn" style="margin-right:8px; background:none; border:none; color:var(--blue); cursor:pointer; font-weight:600;">Editar</button>
                    <button onclick="deletar(${registro.id})" class="delete-btn" style="background:none; border:none; color:var(--red); cursor:pointer; font-weight:600;">Excluir</button>
                </td>
            </tr>
            `;
        });
}

function badge(tipo){
    const cores = {
        Recebimento: "var(--green)",
        Pagamento: "var(--red)",
        Boleto: "var(--purple)",
        Cartão: "var(--blue)"
    };
    const cor = cores[tipo] || "var(--bg-soft)";
    return `<span class="badge" style="background:${cor}; padding:4px 10px; border-radius:6px; color:white; font-size:11px; font-weight:700; text-transform:uppercase;">${tipo}</span>`;
}

function renderKPIs(){
    let recebimentos = 0;
    let despesasRealizadas = 0; 
    let boletosTotal = 0;       

    registros.forEach(r => {
        const ent = Number(r.entrada) || 0;
        const sai = Number(r.saida) || 0;

        if (r.tipo === "Recebimento") {
            recebimentos += ent;
        } else if (r.tipo === "Boleto") {
            boletosTotal += sai;
        } else {
            despesasRealizadas += sai;
        }
    });

    const saldoAtualEmConta = recebimentos - despesasRealizadas;
    const sobraLiquidaReal = saldoAtualEmConta - boletosTotal;

    if(kpiRecebimentos) kpiRecebimentos.textContent = formatarMoeda(recebimentos);
    if(kpiDespesas) kpiDespesas.textContent = formatarMoeda(despesasRealizadas);
    if(kpiBoletos) kpiBoletos.textContent = formatarMoeda(boletosTotal);
    if(kpiSaldo) {
        kpiSaldo.textContent = formatarMoeda(sobraLiquidaReal);
        kpiSaldo.parentElement.style.borderLeft = sobraLiquidaReal < 0 ? "5px solid var(--red)" : "5px solid var(--purple)";
    }
}

function renderActivity(){
    if (!activityLog) return;
    activityLog.innerHTML = "";

    if (registros.length === 0) {
        activityLog.innerHTML = "<p>Nenhuma atividade recente detectada.</p>";
        return;
    }

    [...registros]
        .slice(-4)
        .reverse()
        .forEach(item => {
            const ent = Number(item.entrada) || 0;
            const sai = Number(item.saida) || 0;
            const valor = ent > 0 ? formatarMoeda(ent) : "- " + formatarMoeda(sai);

            activityLog.innerHTML += `
            <p style="font-size: 13px; margin-bottom: 5px; border-left: 3px solid ${ent > 0 ? 'var(--green)':'var(--red)'}; padding-left: 8px;">
                <strong>${formatarData(item.data)}</strong> • ${item.tipo} • <span>${item.descricao}</span> • <strong>${valor}</strong>
            </p>
            `;
        });
}

function deletar(id){
    registros = registros.filter(item => item.id !== id);
    salvar();
    renderTabela();
    renderKPIs();
    renderActivity();
}

function editar(id){
    const registro = registros.find(item => item.id === id);
    if(!registro) return;

    document.getElementById("tipo").value = registro.tipo;
    document.getElementById("descricao").value = registro.descricao;
    document.getElementById("entrada").value = registro.entrada || "";
    document.getElementById("saida").value = registro.saida || "";
    
    const groupVencimento = document.getElementById("group-vencimento");
    if (groupVencimento) {
        groupVencimento.style.display = registro.tipo === "Boleto" ? "block" : "none";
        if(registro.tipo === "Boleto") {
            document.getElementById("dataVencimento").value = registro.dataVencimento || "";
        }
    }
    deletar(id);
}

function salvar(){
    localStorage.setItem("smartFinance", JSON.stringify(registros));
}

function formatarMoeda(valor) {
    if (valor === undefined || valor === null || isNaN(valor)) valor = 0;
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataString) {
    if (!dataString) return "--/--/----";
    const d = new Date(dataString);
    if (isNaN(d.getTime())) {
        const partes = dataString.split('-');
        if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
        return "--/--/----";
    }
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

const tipoSelect = document.getElementById("tipo");
if (tipoSelect) {
    tipoSelect.addEventListener("change", function() {
        const groupVencimento = document.getElementById("group-vencimento");
        if (groupVencimento) {
            groupVencimento.style.display = this.value === "Boleto" ? "block" : "none";
        }
    });
}

/* ============================
RENDER CHARTS (Engine Visual)
============================ */
function renderGraficos() {
    const ctxCategorias = document.getElementById('chartCategorias');
    const ctxBalanco = document.getElementById('chartBalanco');
    
    if (!ctxCategorias || !ctxBalanco) return;

    // 1. Inicialização correta de todas as variáveis de soma
    let recebimentos = 0;
    let totalPagamentos = 0;
    let totalBoletos = 0;
    let totalCartao = 0;

    // Garante que o array existe antes de rodar o loop
    if (registros && registros.length > 0) {
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
    }

    // --- GRÁFICO 1: DISTRIBUIÇÃO POR TIPO (Doughnut) ---
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right', 
                    labels: { color: '#94a3b8', font: { size: 11 } } 
                }
            }
        }
    });

    // --- GRÁFICO 2: BALANÇO MENSAL (Bar) ---
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}