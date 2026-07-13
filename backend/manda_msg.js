const codigo = process.argv[2];
const mensagem = process.argv[3];

if (!codigo || !mensagem) {
  console.log('Uso: node manda_msg.js <codigo_qrcode> "mensagem"');
  process.exit(1);
}

async function main() {
  console.log(`Autenticando como admin...`);

  const loginResp = await fetch("http://localhost:4000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || "admin@admin.com",
      password: process.env.ADMIN_PASSWORD || "123456",
    }),
  });

  if (!loginResp.ok) {
    console.error("Falha ao autenticar como admin.");
    return;
  }
  const { token } = await loginResp.json();

  console.log(`Buscando dono do QR-Code ${codigo}...`);

  const resposta = await fetch(`http://localhost:4000/admin/notificar/${encodeURIComponent(codigo)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mensagem }),
  });

  if (resposta.status === 404) {
    console.log("QR-Code não encontrado.");
    return;
  }

  const data = await resposta.json();

  if (!data.notificado) {
    console.log("QR-Code marcado como sorteado, mas o dono não possui notificações ativadas.");
    console.log("Ele verá a tela de vitória ao entrar no app.");
    return;
  }

  console.log("Notificação enviada com sucesso ao dono do QR-Code", codigo);
}

main().catch((err) => {
  console.error("Erro geral:", err);
});
