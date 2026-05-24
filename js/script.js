/* ============================
STATE MANAGEMENT
============================ */

let registros = JSON.parse(

    localStorage.getItem("smartFinance")

) || [];



/* ============================
DOM
============================ */

const form =
document.getElementById("financeForm");

const tabela =
document.getElementById("financeTable");

const activityLog =
document.getElementById("activityLog");

const fileInput =
document.getElementById("fileInput");


/* KPI */

const kpiRecebimentos =
document.getElementById("kpiRecebimentos");

const kpiDespesas =
document.getElementById("kpiDespesas");

const kpiBoletos =
document.getElementById("kpiBoletos");

const kpiSaldo =
document.getElementById("kpiSaldo");


/* ============================
BOOT
============================ */

renderTabela();

renderKPIs();

renderActivity();



/* ============================
FORM SUBMIT
============================ */

form.addEventListener(

    "submit",

    function(e){

        e.preventDefault();

        adicionarRegistro();

    }

);



/* ============================
UPLOAD OCR SIMULATION
============================ */

fileInput.addEventListener(

    "change",

    function(){

        if(!this.files.length) return;

        const arquivo =
        this.files[0];

        simularOCR(arquivo.name);

    }

);



/* ============================
ADICIONAR REGISTRO
============================ */

function adicionarRegistro(){

    const tipo =
    document.getElementById("tipo").value;

    const descricao =
    document.getElementById("descricao").value;

    const entrada =
    Number(
        document.getElementById("entrada").value
    ) || 0;

    const saida =
    Number(
        document.getElementById("saida").value
    ) || 0;


    if(!descricao){

        alert("Descrição obrigatória.");

        return;

    }


    const registro = {

        id:Date.now(),

        data:new Date(),

        tipo,

        descricao,

        entrada,

        saida

    };


    registros.push(registro);

    salvar();

    renderTabela();

    renderKPIs();

    renderActivity();

    form.reset();

}



/* ============================
OCR ENGINE SIMULATION
============================ */

function simularOCR(nomeArquivo){

    const simulacao = {

        id:Date.now(),

        data:new Date(),

        tipo:"Pagamento",

        descricao:`OCR: ${nomeArquivo}`,

        entrada:0,

        saida:Number(
            (Math.random()*500+30)
            .toFixed(2)
        )

    };

    registros.push(simulacao);

    salvar();

    renderTabela();

    renderKPIs();

    renderActivity();

}



/* ============================
RENDER TABLE
============================ */

function renderTabela() {
    tabela.innerHTML = "";

    // Evita erros se o array "registros" estiver vazio ou indefinido
    if (!registros || registros.length === 0) {
        tabela.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Nenhum lançamento encontrado.</td></tr>`;
        return;
    }

    // Ordena e renderiza
    registros
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .forEach(registro => {
            
            // Tratamento preventivo: Garante que se a propriedade não existir, ela vire 0
            const entrada = registro.entrada ? parseFloat(registro.entrada) : 0;
            const saida = registro.saida ? parseFloat(registro.saida) : 0;

            // Define qual valor exibir e a formatação do sinal
            let valorExibido = "";
            if (entrada > 0) {
                valorExibido = formatarMoeda(entrada);
            } else {
                valorExibido = "- " + formatarMoeda(saida);
            }

            tabela.innerHTML += `
            <tr>
                <td>
                    ${formatarData(registro.data)}
                </td>
                <td>
                    ${badge(registro.tipo)}
                </td>
                <td>
                    ${registro.descricao}
                </td>
                <td style="font-weight: 600; color: ${entrada > 0 ? 'var(--accent-positive)' : 'var(--text-main)'}">
                    ${valorExibido}
                </td>
                <td>
                    <button 
                        onclick="editar(${registro.id})" 
                        class="edit-btn"
                    >
                        Editar
                    </button>
                    <button 
                        onclick="deletar(${registro.id})" 
                        class="delete-btn"
                    >
                        Excluir
                    </button>
                </td>
            </tr>
            `;
        });
}



/* ============================
BADGES
============================ */

function badge(tipo){

    const cores = {

        Recebimento:"green",

        Pagamento:"red",

        Boleto:"purple",

        Cartão:"blue"

    };


    return `

    <span
        class="badge"
        style="background:${cores[tipo]};
        padding:8px 12px;
        border-radius:10px;
        color:white;"
    >

        ${tipo}

    </span>

    `;

}



/* ============================
KPIs
============================ */

function renderKPIs(){

    let recebimentos = 0;

    let pagamentos = 0;

    let boletos = 0;


    registros.forEach(r=>{

        recebimentos +=
        Number(r.entrada || 0);

        pagamentos +=
        Number(r.saida || 0);


        if(r.tipo==="Boleto"){

            boletos +=
            Number(r.saida || 0);

        }

    });


    const saldo =

        recebimentos
        -
        pagamentos;


    kpiRecebimentos.textContent =

        formatarMoeda(recebimentos);

    kpiDespesas.textContent =

        formatarMoeda(pagamentos);

    kpiBoletos.textContent =

        formatarMoeda(boletos);

    kpiSaldo.textContent =

        formatarMoeda(saldo);

}



/* ============================
ACTIVITY LOG
============================ */

function renderActivity(){

    activityLog.innerHTML="";


    registros

    .slice(-5)

    .reverse()

    .forEach(item=>{

        activityLog.innerHTML += `

        <p>

        ${formatarData(item.data)}

        •

        ${item.tipo}

        •

        ${item.descricao}

        •

        ${

item.entrada>0

?

formatarMoeda(item.entrada)

:

"- " +

formatarMoeda(item.saida)

}

        </p>

        `;

    });

}



/* ============================
DELETE
============================ */

function deletar(id){

    registros =

    registros.filter(

        item=>item.id!==id

    );

    salvar();

    renderTabela();

    renderKPIs();

    renderActivity();

}



/* ============================
LOCAL STORAGE
============================ */

function salvar(){

    localStorage.setItem(

        "smartFinance",

        JSON.stringify(registros)

    );

}



/* ============================
UTILS
============================ */

function formatarMoeda(valor){

    return valor.toLocaleString(

        "pt-BR",

        {

            style:"currency",

            currency:"BRL"

        }

    );

}



// Localize a função formatarMoeda (perto da linha 486) e substitua por esta:
function formatarMoeda(valor) {
    // Se o valor for undefined, null, vazio ou não for um número, assume 0
    if (valor === undefined || valor === null || isNaN(valor)) {
        valor = 0;
    }
    
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function editar(id){

    const registro =

    registros.find(

        item=>item.id===id

    );

    if(!registro) return;


    document.getElementById("tipo").value =
    registro.tipo;

    document.getElementById("descricao").value =
    registro.descricao;

    document.getElementById("entrada").value =
    registro.entrada || "";

    document.getElementById("saida").value =
    registro.saida || "";


    deletar(id);

}

localStorage.removeItem("smartFinance")