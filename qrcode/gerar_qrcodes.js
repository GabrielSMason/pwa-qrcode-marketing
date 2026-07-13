import QRCode from "qrcode";
import { mkdir } from "fs/promises";
import path from "path";

const QUANTIDADE = 10;       
const DIGITOS_CODIGO = 4;    
const PASTA_SAIDA = "qrcodes_gerados";

function gerarCodigoAleatorio(digitos) {
    const minimo = 10 ** (digitos - 1);
    const maximo = (10 ** digitos) - 1;
    return String(Math.floor(Math.random() * (maximo - minimo + 1)) + minimo);
}

async function main() {
    await mkdir(PASTA_SAIDA, { recursive: true });

    const codigosUsados = new Set();
    const codigosGerados = [];

    while (codigosGerados.length < QUANTIDADE) {
        const codigo = gerarCodigoAleatorio(DIGITOS_CODIGO);
        if (codigosUsados.has(codigo)) continue; // evita duplicado nesse lote
        codigosUsados.add(codigo);
        codigosGerados.push(codigo);

        const caminho = path.join(PASTA_SAIDA, `qrcode_${codigo}.png`);
        await QRCode.toFile(caminho, codigo, {
            errorCorrectionLevel: "M",
            width: 400,
            margin: 4
        });
    }

    console.log(`${QUANTIDADE} QR-Codes gerados na pasta '${PASTA_SAIDA}':`);
    codigosGerados.forEach((codigo) => console.log(`  - ${codigo}`));
}

main().catch((err) => {
    console.error("Erro ao gerar QR-Codes:", err);
});
