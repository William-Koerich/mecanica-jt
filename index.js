const fs = require("fs");
const axios = require("axios");

const API_URL =
  "https://v5.chatpro.com.br/chatpro-smxayyeckl/api/v1/send_message";

const HEADERS = {
  "Content-Type": "application/json",
    'Authorization': '84b9990927d7886fe790a1e61207c951'
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
        number: String(numero),
        message: mensagem,
      },
      { headers: HEADERS },
    );

    console.log(`✅ Enviado para ${numero}`);
    console.log("Resposta:", response.data);
    return true;
  } catch (error) {
    console.error(
      `❌ Erro ao enviar para ${numero}`,
      error,
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
    const mensagem = `🚗🔧 Olá! ${cliente.nome}. Passando para te lembrar que manter a revisão do seu carro em dia evita dor de cabeça e gastos maiores.

Fique atento principalmente à troca de óleo (geralmente a cada 5 a 10 mil km) e à correia dentada (normalmente entre 40 e 60 mil km), que são itens essenciais para o bom funcionamento do motor.

Se já está perto da revisão, chama a gente aqui e agendamos rapidinho. Será um prazer cuidar do seu carro! 👍`;

    const sucesso = await enviarMensagem(cliente.telefone, mensagem);

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

executar()