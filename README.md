# Campanha de Marketing PWA - Cadastro de QR-Code

Terceiro trabalho da disciplina de Programação para WEB (UFSC - Campus Araranguá). O projeto consiste no desenvolvimento de um aplicativo PWA (Progressive Web App) para uma campanha de marketing de uma fábrica de biscoitos (marca X).

## Objetivo

Solidificar os conhecimentos sobre programação PWA em conjunto com outros conteúdos estudados em aula: notificações push, MongoDB e leitura de QR-Code.

## Descrição do problema

Uma empresa fabricante de biscoitos vende seu produto em supermercados e deseja lançar uma campanha promocional: cada embalagem traz um QR-Code único, e o cliente pode cadastrar no app quantos códigos quiser, além de consultar a qualquer momento quais e quantos códigos já cadastrou.

Ao final da promoção, alguns QR-Codes cadastrados serão sorteados. Os clientes detentores dos códigos sorteados devem ser notificados diretamente pelo app, informando que ganharam um prêmio.

## Requisitos de implementação

- **App PWA**: aplicativo instalável, com leitura de QR-Code via [html5-qrcode](https://github.com/mebjas/html5-qrcode).
- **Push notifications**: uso de [web-push](https://github.com/web-push-libs/web-push) para notificar o cliente quando seu código for sorteado.
- **Backend**:
  - Recebe os códigos de QR-Code lidos pelo app e os armazena na conta do cliente usando **MongoDB**.
  - Armazena junto à conta do cliente o código de notificação push, necessário para o envio de notificações.
  - Disponibiliza uma **ferramenta de linha de comando** para notificar o cliente dono de um QR-Code sorteado:

    ```bash
    nodejs manda_msg 123 "Parabéns, você foi sorteado na promoção dos produtos X, entre em contato para receber seu prêmio"
    ```

    Onde:
    - `manda_msg` é o nome do aplicativo de linha de comando no backend.
    - `123` é o código do QR-Code sorteado ao final da promoção.

## Documentação

O enunciado completo do trabalho está disponível em [`docs/marketing.pdf`](docs/marketing.pdf).

## Data de entrega

Apresentação até **14/07**, agendada com o professor e realizada pessoalmente pela equipe no laboratório ou na sala do professor.
