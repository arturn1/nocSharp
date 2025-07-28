# nocSharp Project Generator

Uma aplicação Electron para gerar projetos C# usando a ferramenta nocsharp de forma visual e intuitiva.

## ✨ Funcionalidades

### 🎯 Funcionalidades Principais
- **Criação de Projetos**: Criação de novos projetos C# ou adição de entidades a projetos existentes
- **Interface Visual**: Interface intuitiva com React + TypeScript + Ant Design
- **Gestão de Entidades**: Criação e edição visual de entidades com propriedades tipadas
- **Upload de Configuração**: Importação de configurações via arquivos JSON
- **Validação**: Validação automática de nomes de entidades e propriedades

### 🆕 Novas Funcionalidades (Refatoração)

#### 🏗️ Arquitetura Melhorada
- **Context API**: Gerenciamento global de estado com React Context + useReducer
- **Hooks Customizados**: Lógica de negócio separada em hooks reutilizáveis
- **Separação de Responsabilidades**: Cada funcionalidade em seu próprio hook/service

#### 📋 Templates de Entidades
- **Templates Pré-definidos**: E-commerce, Blog System, etc.
- **Aplicação Rápida**: Um clique para aplicar conjunto completo de entidades
- **Customização**: Possibilidade de criar e salvar seus próprios templates

#### 📜 Gerador de Scripts
- **Multi-plataforma**: Suporte para Bash, PowerShell e Batch
- **Preview**: Visualização do script antes da execução
- **Download**: Baixar scripts para execução posterior
- **Copy to Clipboard**: Copiar comandos facilmente

#### ⚙️ Configurações Avançadas
- **Auto Save**: Salvamento automático de configurações
- **Validação Customizada**: Ativar/desativar validações
- **Logging Configurável**: Diferentes níveis de log
- **Backup**: Sistema de backup automático
- **Templates de Projeto**: Diferentes tipos de projeto (minimal, full, API only)

#### 📁 Gerenciamento de Arquivos
- **Histórico de Diretórios**: Lista de diretórios recentes
- **Importação/Exportação**: Salvar e carregar configurações completas
- **Validação de Arquivos**: Verificação de tipos e estrutura

#### 🔧 Funcionalidades de Produtividade
- **Modo Dry Run**: Gerar comandos sem executar
- **Duplicação de Entidades**: Clonar entidades existentes
- **Validação em Tempo Real**: Feedback imediato sobre erros
- **Interface Responsiva**: Componentes adaptáveis

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/          # Componentes React reutilizáveis
│   ├── EntityForm/       # Formulário de entidades
│   ├── EntityTemplates/  # Templates pré-definidos
│   ├── FileUpload/       # Upload de arquivos
│   ├── ProjectForm/      # Formulário de projeto
│   └── ScriptGenerator/  # Gerador de scripts
├── contexts/            # Context providers
│   └── AppContext.tsx   # Context global da aplicação
├── hooks/               # Custom hooks
│   ├── useEntityManagement.ts    # Gestão de entidades
│   ├── useFileManagement.ts      # Gestão de arquivos
│   └── useProjectCreation.ts     # Criação de projetos
├── models/              # Interfaces TypeScript
├── pages/               # Páginas da aplicação
├── services/            # Serviços/APIs
└── utils/               # Utilitários
```

### Fluxo de Estado
1. **AppContext**: Estado global da aplicação
2. **Custom Hooks**: Lógica específica de cada funcionalidade
3. **Components**: Interface do usuário
4. **Services**: Comunicação com APIs/Electron

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- nocsharp CLI instalado globalmente

### Comandos
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run start

# Construir a aplicação
npm run make

# Construir para produção
npm run package
```

## 📖 Como Usar

### 1. Configuração Inicial
- Ative/desative componentes conforme necessário
- Configure opções avançadas se desejar

### 2. Definir Projeto
- Digite o nome do projeto
- Ou importe uma configuração existente

### 3. Adicionar Entidades
- Use templates pré-definidos para rapidez
- Ou crie entidades customizadas manualmente
- Defina propriedades com tipos apropriados

### 4. Seleção de Diretório
- Escolha diretório para novo projeto
- Ou selecione projeto existente para adicionar entidades

### 5. Execução
- **Modo Normal**: Executa comandos automaticamente
- **Modo Dry Run**: Apenas gera comandos para revisão
- **Script Download**: Baixa script para execução posterior

## 🔧 Configurações Avançadas

### Templates de Projeto
- **Default**: Configuração padrão do nocsharp
- **Minimal**: Projeto básico sem extras
- **Full**: Projeto completo com todas as funcionalidades
- **API**: Focado apenas em APIs

### Validações
- **Nomes de Entidades**: Verificação de nomenclatura C#
- **Propriedades**: Validação de tipos e nomes
- **Estrutura de Projeto**: Verificação de integridade

### Logging
- **Níveis**: Debug, Info, Warn, Error
- **Destinos**: Console, arquivo, ambos
- **Filtragem**: Por categoria ou componente

## 🤝 Contribuição

### Estrutura para Novos Componentes
1. Criar pasta em `src/components/`
2. Implementar componente principal
3. Criar arquivo `index.ts` para export
4. Adicionar tipos se necessário
5. Integrar no `home.tsx`

### Novos Hooks
1. Criar em `src/hooks/`
2. Seguir padrão `useFeatureName.ts`
3. Integrar com AppContext se necessário
4. Documentar funcionalidades

### Novos Services
1. Adicionar em `src/services/`
2. Implementar interface clara
3. Tratar erros apropriadamente
4. Adicionar validações

## 📝 Próximos Passos

### Funcionalidades Planejadas
- [ ] **Editor Visual de Relacionamentos**: Definir relacionamentos entre entidades graficamente
- [ ] **Integração com Git**: Commit automático após geração
- [ ] **Temas Customizados**: Dark mode e temas personalizados
- [ ] **Plugin System**: Sistema de plugins para extensibilidade
- [ ] **Cloud Sync**: Sincronização de configurações na nuvem
- [ ] **Collaborative Editing**: Edição colaborativa de projetos
- [ ] **Database Integration**: Integração com diferentes bancos de dados
- [ ] **API Documentation**: Geração automática de documentação
- [ ] **Testing Templates**: Templates para testes automatizados
- [ ] **Deployment Scripts**: Scripts de deployment automático

### Melhorias Técnicas
- [ ] **Performance**: Lazy loading de componentes
- [ ] **Testes**: Cobertura completa de testes
- [ ] **Documentação**: JSDoc em todos os componentes
- [ ] **Acessibilidade**: Melhorar suporte a screen readers
- [ ] **Internacionalização**: Suporte multi-idioma

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **nocsharp**: Ferramenta CLI que torna possível esta aplicação
- **Electron**: Framework para aplicações desktop
- **React**: Biblioteca para interface do usuário
- **Ant Design**: Sistema de design e componentes
