const fs = require("fs");
const axios = require("axios");

const API_URL =
  "https://v5.chatpro.com.br/chatpro-smxayyeckl/api/v1/send_message";

const HEADERS = {
  "Content-Type": "application/json",
  //   'Authorization': 'Bearer SEU_TOKEN_AQUI'
};

const LIMITE_ENVIO = 15;
const CLIENTES_FILE = "./clientes.json";
const ENVIADOS_FILE = "./enviados.json";

// =========================
// UTILITÁRIOS
// =========================

function lerJSON(caminho) {
  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(caminho, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(caminho));
}

function salvarJSON(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

async function enviarMensagem(numero, mensagem) {
  try {
    const response = await axios.post(
      API_URL,
      {
        number: numero,
        message: mensagem,
      },
      { headers: HEADERS },
    );

    console.log(`✅ Enviado para ${numero}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Erro ao enviar para ${numero}`,
      error.response?.data || error.message,
    );
    return false;
  }
}

// =========================
// PROCESSAMENTO
// =========================

async function executar() {
  const clientes = lerJSON(CLIENTES_FILE);
  const enviados = lerJSON(ENVIADOS_FILE);

  if (clientes.length === 0) {
    console.log("🚫 Nenhum cliente restante.");
    return;
  }

  const lote = clientes.slice(0, LIMITE_ENVIO);

  console.log(`📤 Enviando ${lote.length} mensagens...`);

  const enviadosComSucesso = [];

  for (const cliente of lote) {
    const mensagem = `Olá ${cliente.nome}, Mensagem Teste William`;

    const sucesso = true;

    if (sucesso) {
      enviadosComSucesso.push(cliente);
    }

    // delay 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // remover enviados da lista original
  const restantes = clientes.filter(
    (c) => !enviadosComSucesso.some((e) => e.telefone === c.telefone),
  );

  // atualizar arquivos
  salvarJSON(CLIENTES_FILE, restantes);
  salvarJSON(ENVIADOS_FILE, [...enviados, ...enviadosComSucesso]);

  console.log(`🎯 Enviados agora: ${enviadosComSucesso.length}`);
  console.log(`📦 Restantes: ${restantes.length}`);
}

executar();
