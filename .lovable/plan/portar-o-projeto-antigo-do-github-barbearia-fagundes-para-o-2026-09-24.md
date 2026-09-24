# Portar o projeto antigo do GitHub (Barbearia-Fagundes) para o site novo

## Contexto atual (verificado)

- O repositório `EnzoSpinoza/Barbearia-Fagundes` no GitHub é a versão antiga do site (HTML/JS), já conectada ao **mesmo banco Supabase** deste projeto.
- O site novo tem apenas a parte pública: serviços, planos com formulário de assinatura, galeria, horários + Pix e agendamento.
- O banco já tem **todas** as tabelas que o site antigo usa (`clients`, `package_subscriptions`, `financial_transactions`, `photos`, etc.), as funções `subscribe_to_package` / `cancel_package_subscription` e o bucket de fotos `barbearia-fotos`. **Nenhuma alteração de banco é necessária.**
- Decisões: trazer **tudo** do projeto antigo; **sem WhatsApp**.

## 1. Melhorias na página pública (`src/routes/index.tsx`)

- Fluxo de pacote como no site antigo: após assinar, mostrar se a assinatura do mês está paga; se não, exibir a chave Pix para pagamento. Se já paga, avisar "assinatura deste mês já está paga".
- Opção "Já é assinante? Cancelar assinatura" usando a função `cancel_package_subscription` (cancela no mês atual, sem apagar histórico).
- Galeria passa a usar as fotos do bucket `barbearia-fotos` (já é o comportamento — mantido).

## 2. Painel do barbeiro (nova área protegida)

- `src/routes/auth.tsx` — tela de login com e-mail e senha (Supabase Auth). A conta do barbeiro criada no site antigo continua funcionando, pois é o mesmo banco.
- `src/routes/_authenticated/route.tsx` + `src/routes/_authenticated/barbeiro.tsx` — painel protegido (redireciona para o login quando não autenticado).
- Abas do painel (mesmas do site antigo), no mesmo visual glass/editorial do site novo:
  - **Agenda** — agendamentos por dia (hoje por padrão, com atualização automática), mudança de status (Agendado / Confirmado / Concluído / Cancelado).
  - **Agenda de Pacotes** — agendamentos feitos por assinantes (separados da agenda comum).
  - **Assinaturas** — lista de assinantes do mês, marcar pagamento Pix como recebido, ver pedidos de cancelamento.
  - **Clientes** — lista, cadastro e edição de clientes.
  - **Serviços** — criar, editar, ativar/desativar serviços e preços.
  - **Horários** — editar horário de funcionamento de cada dia da semana.
  - **Fotos** — enviar e gerenciar fotos da galeria no bucket `barbearia-fotos`.
  - **Financeiro** — entradas/saídas por mês, cortes confirmados, saldo, gastos por categoria, novo lançamento, e "limpeza temporária" (apaga agendamentos e lançamentos com confirmação digitada).
  - **Minha conta** — trocar e-mail e senha do barbeiro.
- Painel com números do mês no topo (agendamentos, clientes, serviços, horários, cortes no mês, saldo do mês).

## 3. Técnico

- Todas as leituras/escritas do painel usam o cliente Supabase do navegador com as políticas RLS já existentes (só usuários autenticados acessam) — nenhuma chave secreta no navegador.
- Componentes shadcn existentes (dialog, tabs, table, form, input) estilizados com os tokens atuais.
- Sem novas tabelas, funções ou migrations.

## 4. Verificação

- Testar no navegador: página pública (assinatura → status Pix), login do barbeiro, cada aba do painel, upload de foto, lançamento financeiro e relatório do mês.
