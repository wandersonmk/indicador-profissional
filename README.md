# Indicador Profissional

Sistema de indicação e gerenciamento de profissionais da área da saúde.

## Funcionalidades

- Cadastro de profissionais
- Aprovação de perfis
- Visualização de detalhes do profissional
- Gerenciamento de consultórios
- Interface administrativa
- Sistema de busca e filtros

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase
- React Router
- React Query

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/wandersonmk/indicador-profissional.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Executa o linter
- `npm run migrate` - Executa as migrações do banco de dados

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── pages/         # Páginas da aplicação
  ├── lib/           # Configurações e utilitários
  ├── hooks/         # Custom hooks
  ├── types/         # Definições de tipos TypeScript
  └── styles/        # Estilos globais
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
