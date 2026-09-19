# Template Hello World para Cloudflare Pages

Este é um template básico para iniciar uma aplicação "Hello World" no Cloudflare Pages.

## Estrutura

- `public/index.html`: O arquivo principal contendo a mensagem de "Hello World".
- `wrangler.toml`: Configuração básica do projeto para o Cloudflare (opcional, mas recomendado).
- `.gitignore`: Arquivos a serem ignorados pelo git.

## Como implantar no Cloudflare Pages

Para implantar este site a partir da sua conta do Cloudflare:

1. Faça o push deste repositório para o seu GitHub ou GitLab.
2. Acesse o [Dashboard do Cloudflare](https://dash.cloudflare.com/) e vá em **Workers & Pages**.
3. Clique em **Create application** e depois selecione a aba **Pages**.
4. Siga os passos conforme a interface:
    - **Passo 1:** Conecte à sua conta do GitHub/GitLab e selecione este repositório.
    - **Passo 2:** Configure as opções de compilação:
        - **Nome do projeto:** Escolha um nome para o seu projeto.
        - **Branch de produção:** `main` ou `master`.
        - **Framework predefinido:** `None`.
        - **Diretório de saída da compilação:** `public`.
    - **Passo 3:** Clique em **Save and Deploy**.

O Cloudflare irá criar o build e implantar as suas mudanças automaticamente sempre que você fizer um novo commit na branch principal!

## Desenvolvimento Local (Opcional)

Se você quiser testar localmente usando o [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm install -g wrangler
wrangler pages dev public
```
