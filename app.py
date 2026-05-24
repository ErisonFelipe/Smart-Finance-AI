import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv
import mysql.connector # <-- O nosso conector instalado via pip
from datetime import datetime

# Carrega as variáveis do .env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = Flask(__name__)
CORS(app)

# Inicializa o cliente da IA
if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
else:
    print("⚠️ Alerta: GOOGLE_API_KEY não encontrada no arquivo .env!")
    client = None

# Função auxiliar para conectar ao MySQL Local
def obter_conexao_banco():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "smart_finance")
    )

PROMPT_IA = """
Você é um especialista em auditoria financeira e OCR avançado para o mercado brasileiro.
Sua tarefa é analisar o documento (imagem ou PDF) e extrair os dados estruturados em JSON estável.

Aplique as seguintes regras de negócio contextuais:

1. CLASSIFICAÇÃO DE TIPO:
   - "Recebimento": Pix recebidos, transferências de entrada, salários, resgates de investimentos ou relatórios de dividendos/proventos de corretoras (Ex: Rico, Santander, Toro).
   - "Boleto": Contas de consumo geradas com código de barras/Pix Copia e Cola que possuem vencimento futuro ou pendente. Exemplos clássicos: Faturas de água (Sabesp), boletos de instituições de ensino (UniBTA / Principia Pay), condomínio ou energia.
   - "Pagamento": Comprovantes de transações JÁ EXECUTADAS e debitadas (Ex: "Comprovante de Pix Enviado", "Autenticação Bancária", recibos de compras na Amazon, Mercado Livre, Shopee ou gastos imediatos em alimentação/restaurantes).

2. PADRONIZAÇÃO DE DESCRIÇÃO (Clean Name):
   - Simplifique o nome do estabelecimento. Remova razões sociais complexas, LTDA, ou dados bancários.
   - Exemplos: Se encontrar 'COMPANHIA DE SANEAMENTO BASICO DO ESTADO DE SAO PAULO', mude para 'Sabesp'. Se encontrar 'Principia Instituição/UniBTA', mude para 'UniBTA'. Se for e-commerce, use 'Amazon', 'Mercado Livre' ou 'Shopee'.

3. EXTRAÇÃO DE VALORES:
   - Retorne o valor líquido total da operação em formato float puro (Ex: 150.32). Nunca inclua strings como 'R$'.

4. DATA DE VENCIMENTO:
   - Obrigatório para o tipo "Boleto" no formato 'YYYY-MM-DD'. Para os demais tipos ("Pagamento" ou "Recebimento"), retorne estritamente null.

Retorne APENAS o objeto JSON puro abaixo, sem blocos de código markdown (```json) e sem qualquer texto explicativo:
{
    "tipo": "Tipo_Identificado",
    "descricao": "Nome_Simplificado",
    "valor": 0.00,
    "data_vencimento": "YYYY-MM-DD_ou_null"
}
"""

@app.route('/api/upload', methods=['POST'])
def processar_comprovante():
    if not client:
        return jsonify({"error": "Configuração da IA ausente no servidor"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nome de arquivo inválido"}), 400

    try:
        file_bytes = file.read()
        mime_type = file.content_type
        
        # Envio de bytes corrigido e otimizado para o novo SDK
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                {
                    "mime_type": mime_type,
                    "data": file_bytes
                },
                PROMPT_IA
            ]
        )
        
        texto_resposta = response.text.strip()
        if texto_resposta.startswith("```"):
            texto_resposta = texto_resposta.replace("```json", "").replace("```", "").strip()
            
        # Converte a resposta da IA em um dicionário Python para salvar no Banco
        import json
        dados = json.loads(texto_resposta)
        
        # Mapeia valores para as colunas da tabela SQL
        id_unico = int(datetime.now().timestamp() * 1000) # Simula o Date.now() do JS
        data_atual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        valor = float(dados.get("valor", 0.0))
        
        entrada = valor if dados.get("tipo") == "Recebimento" else 0.0
        saida = valor if dados.get("tipo") != "Recebimento" else 0.0
        vencimento = dados.get("data_vencimento")
        
        # Query de Inserção no MySQL
        conn = obter_conexao_banco()
        cursor = conn.cursor()
        query = """
            INSERT INTO lancamentos (id, data_cadastro, tipo, descricao, entrada, saida, data_vencimento)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (id_unico, data_atual, dados.get("tipo"), dados.get("descricao"), entrada, saida, vencimento))
        conn.commit()
        
        print(f"[NOC SUCESSO]: Lançamento {id_unico} persistido no MySQL local!")
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Persistido com sucesso"}), 200

    except Exception as e:
        print(f"[NOC ERROR]: Falha na esteira de processamento: {str(e)}")
        return jsonify({"error": f"Erro interno ao processar documento: {str(e)}"}), 500


@app.route('/api/lancamentos', methods=['GET'])
def listar_lancamentos():
    """Rota para o front-end carregar o histórico vindo direto do banco de dados"""
    try:
        conn = obter_conexao_banco()
        cursor = conn.cursor(dictionary=True) # Retorna os dados mapeados como dicionários/JSON
        
        cursor.execute("SELECT * FROM lancamentos ORDER BY data_cadastro DESC")
        linhas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Converte formatos de data para string legível no Front-End
        for linha in linhas:
            linha['data'] = linha['data_cadastro'].isoformat()
            if linha['data_vencimento']:
                linha['dataVencimento'] = linha['data_vencimento'].strftime('%Y-%m-%d')
            else:
                linha['dataVencimento'] = None
                
        return jsonify(linhas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)