# Lista de Comandos CLI - NoCSharp

## Comandos de Inicialização

**Ação:** Criar um novo projeto Clean Architecture
**Comando:** `nc new <nomeProjet>`
**Exemplo:** `nc new MeuProjeto`

## Comandos de Geração (g)

**Ação:** Gerar uma entidade
**Comando:** `nc g entity <nomeEntidade> [campos...]`
**Exemplo:** `nc g entity User name:string email:string age:int`

**Ação:** Gerar um command
**Comando:** `nc g command <nomeCommand> --type <tipo>`
**Exemplo:** `nc g command CreateUser --type create`

**Ação:** Gerar um handler
**Comando:** `nc g handler <nomeHandler>`
**Exemplo:** `nc g handler UserHandler`

**Ação:** Gerar um repository
**Comando:** `nc g repository <nomeRepository>`
**Exemplo:** `nc g repository UserRepository`

**Ação:** Gerar um controller
**Comando:** `nc g controller <nomeController>`
**Exemplo:** `nc g controller UserController`

## Comando de Scaffold

**Ação:** Gerar todos os arquivos (Entity, Command, Handler, Repository, Controller)
**Comando:** `nc scaffold <nomeScaffold> [campos...]`
**Exemplo:** `nc scaffold User name:string email:string age:int`

**Ação:** Gerar scaffold com opções avançadas
**Comando:** `nc scaffold <nomeScaffold> [campos...] [opções]`
**Exemplo:** `nc scaffold User name:string --postgres usuarios:public --baseSkip`

## Comandos de Adição (add)

**Ação:** Adicionar funcionalidade de agendamento
**Comando:** `nc add schedule`
**Exemplo:** `nc add schedule`

**Ação:** Adicionar funcionalidade Azure
**Comando:** `nc add azure`
**Exemplo:** `nc add azure`

**Ação:** Adicionar funcionalidade de identidade
**Comando:** `nc add identity`
**Exemplo:** `nc add identity`

## Comandos de Limpeza

**Ação:** Remover arquivos de uma entidade específica
**Comando:** `nc clean <nomeEntidade>`
**Exemplo:** `nc clean User`

**Ação:** Remover todos os arquivos gerados
**Comando:** `nc clean --all`
**Exemplo:** `nc clean --all`

**Ação:** Listar arquivos que seriam removidos
**Comando:** `nc clean <nomeEntidade> --list`
**Exemplo:** `nc clean User --list`

**Ação:** Remover arquivos sem confirmação
**Comando:** `nc clean <nomeEntidade> -y`
**Exemplo:** `nc clean User -y`

**Ação:** Remover todos os arquivos sem confirmação
**Comando:** `nc clean --all --yes`
**Exemplo:** `nc clean --all --yes`

## Comandos de Configuração

**Ação:** Atualizar InjectorBootStrapper
**Comando:** `nc injector`
**Exemplo:** `nc injector`

## Aliases Disponíveis

- `nc s` = `nc scaffold`
- `nc remove` = `nc clean`

## Opções Globais

- `--help` - Exibe ajuda para qualquer comando
- `--version` - Exibe a versão do CLI
- `-y, --yes` - Confirma automaticamente as operações (disponível em comandos destrutivos)
- `-f, --force` - Força a execução sem confirmação
- `--list` - Lista arquivos sem executar a ação

## Tipos de Dados Suportados

- `string` - Texto
- `int` - Número inteiro
- `decimal` - Número decimal
- `bool` - Booleano
- `DateTime` - Data e hora
- `Guid` - Identificador único
- `List<T>` - Lista de tipos
- `Dictionary<K,V>` - Dicionário
- `HashSet<T>` - Conjunto único
- Entidades customizadas (ex: `User`, `Post`)

## Exemplos de Uso Avançado

**Ação:** Criar entidade com tipos complexos
**Comando:** `nc g entity Post title:string content:string author:User tags:List<string> metadata:Dictionary<string,string>`
**Exemplo:** `nc g entity Post title:string content:string author:User tags:List<string> metadata:Dictionary<string,string>`

**Ação:** Scaffold completo com PostgreSQL
**Comando:** `nc scaffold Product name:string price:decimal category:Category --postgres produtos:vendas`
**Exemplo:** `nc scaffold Product name:string price:decimal category:Category --postgres produtos:vendas`

**Ação:** Limpeza completa sem confirmação
**Comando:** `nc clean --all -y`
**Exemplo:** `nc clean --all -y`
