import webpush from "web-push";
import chaves from "./chaves.json" with { type: "json" };

const SUBJECT = "mailto:gutohsmiranda@gmail.com";
webpush.setVapidDetails(SUBJECT, chaves.publicKey, chaves.privateKey);

const codigo = process.argv[2];
const mensagem = process.argv[3];

if (!codigo || !mensagem) {
  console.log('Uso: node manda_msg.js <codigo_qrcode> "mensagem"');
  process.exit(1);
}

async function main() {
    console.log(`Buscando dono do QR-Code ${codigo}...`);

    const resposta = await fetch(`http://localhost:4000/admin/sortear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo })
    });

    if (resposta.status === 404) {
        console.log("QR-Code não encontrado.");
        return;
    }

    const data = await resposta.json();

    if (!data.subscription) {
        console.log("QR-Code marcado como sorteado, mas o dono não possui notificações ativadas.");
        console.log("Ele verá a mensagem de vitória ao entrar no app.");
        return;
    }

    const payload = JSON.stringify({
        title: "Promoção Biscoitos X",
        body: mensagem
    });

    try {
        await webpush.sendNotification(data.subscription, payload);
        console.log("Notificação enviada com sucesso ao dono do QR-Code", codigo);
    } catch (error) {
        console.error("Erro ao enviar notificação:", error.message);
    }
}

main().catch((err) => {
    console.error("Erro geral:", err);
});