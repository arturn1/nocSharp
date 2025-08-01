# LogsViewer Component

Um componente React avançado para visualização de logs e erros do sistema em tempo real, integrado com o estado global da aplicação.

## 🎯 Funcionalidades

### 📊 **Visualização Completa**
- **Logs em tempo real** com timestamps automáticos
- **Categorização** por tipo (logs, erros, sucessos, avisos)
- **Filtragem e busca** por texto
- **Contadores dinâmicos** por categoria
- **Interface responsiva** adaptável ao tema (claro/escuro)

### 🔧 **Recursos Avançados**
- **Auto-scroll** opcional para acompanhar novos logs
- **Exportação** de logs para arquivo texto
- **Cópia** de logs para área de transferência
- **Limite configurável** de itens exibidos
- **Timestamps** opcionais para melhor legibilidade
- **Ícones contextuais** baseados no conteúdo

### 🎨 **Interface Intuitiva**
- **Abas organizadas** (Todos, Logs, Erros)
- **Badges com contadores** em tempo real
- **Controles de interação** (limpar, filtrar, exportar)
- **Design consistente** com o sistema de design da aplicação

## 📋 Props do Componente

```typescript
interface LogsViewerProps {
  height?: string | number;    // Altura do componente (padrão: '400px')
  showHeader?: boolean;        // Exibir cabeçalho com controles (padrão: true)
  maxItems?: number;          // Máximo de itens a exibir (padrão: 1000)
  compact?: boolean;          // Modo compacto (padrão: false)
}
```

## 🚀 Como Usar

### Uso Básico
```typescript
import LogsViewer from '../components/LogsViewer';

function MyComponent() {
  return (
    <LogsViewer />
  );
}
```

### Uso Avançado
```typescript
import LogsViewer from '../components/LogsViewer';

function MyDashboard() {
  return (
    <div style={{ height: '100vh' }}>
      <LogsViewer 
        height="calc(100vh - 100px)"
        showHeader={true}
        maxItems={2000}
        compact={false}
      />
    </div>
  );
}
```

### Integração com Estado Global
```typescript
import { useAppContext } from '../contexts/AppContext';

function MyService() {
  const { dispatch } = useAppContext();
  
  // Adicionar log
  dispatch({ 
    type: 'ADD_LOG', 
    payload: 'Operação executada com sucesso ✅' 
  });
  
  // Adicionar erro
  dispatch({ 
    type: 'ADD_ERROR', 
    payload: 'Falha na conexão com o servidor' 
  });
  
  // Limpar logs
  dispatch({ type: 'CLEAR_LOGS' });
  
  // Limpar erros
  dispatch({ type: 'CLEAR_ERRORS' });
}
```

## 🎨 Categorização Automática

O componente categoriza automaticamente os logs baseado no conteúdo:

- **✅ Sucesso**: Mensagens contendo "✅", "sucesso", "concluído"
- **⚠️ Aviso**: Mensagens contendo "⚠️", "aviso", "warning"
- **❌ Erro**: Mensagens enviadas via 'ADD_ERROR' ou contendo "❌", "erro"
- **ℹ️ Info**: Demais mensagens de log

## 📊 Funcionalidades de Interação

### Busca e Filtragem
- **Campo de busca** para filtrar logs por texto
- **Abas** para visualizar todos, apenas logs ou apenas erros
- **Contadores** em tempo real por categoria

### Exportação e Compartilhamento
- **Copiar para clipboard**: Copia logs filtrados
- **Exportar arquivo**: Salva logs em arquivo `.txt`
- **Limpar seletivo**: Remove logs ou erros individualmente

### Controles de Visualização
- **Auto-scroll**: Acompanha automaticamente novos logs
- **Timestamps**: Mostra/oculta horários nas mensagens
- **Modo compacto**: Interface reduzida para espaços menores

## 🔄 Estado Global Integrado

O componente está totalmente integrado com o `AppContext`:

```typescript
// Estado automaticamente gerenciado
interface AppState {
  logs: string[];      // Array de logs com timestamps
  errors: string[];    // Array de erros com timestamps
  // ... outros estados
}

// Ações disponíveis
type AppAction = 
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_LOGS' }
  | { type: 'CLEAR_ERRORS' }
  // ... outras ações
```

## 🎯 Casos de Uso

### 1. Dashboard Principal
```typescript
<LogsViewer 
  height="400px"
  showHeader={true}
  maxItems={500}
/>
```

### 2. Modal ou Sidebar
```typescript
<LogsViewer 
  height="300px"
  showHeader={false}
  compact={true}
  maxItems={100}
/>
```

### 3. Página Dedicada
```typescript
<LogsViewer 
  height="calc(100vh - 120px)"
  showHeader={true}
  maxItems={2000}
/>
```

## 🎨 Personalização de Tema

O componente se adapta automaticamente ao tema da aplicação:

- **Modo Claro**: Cores suaves, boa legibilidade
- **Modo Escuro**: Cores contrastantes, confortável para uso prolongado
- **Consistência**: Segue o design system da aplicação

## 🔧 Exemplo Completo

```typescript
import React, { useEffect } from 'react';
import { Card, Button, Space } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import LogsViewer from '../components/LogsViewer';

const LogsDemo: React.FC = () => {
  const { dispatch } = useAppContext();

  const addSampleLog = () => {
    dispatch({ 
      type: 'ADD_LOG', 
      payload: \`Nova operação executada - \${new Date().toLocaleTimeString()}\` 
    });
  };

  const addSampleError = () => {
    dispatch({ 
      type: 'ADD_ERROR', 
      payload: \`Erro simulado - \${new Date().toLocaleTimeString()}\` 
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Sistema de Logs">
        <Space style={{ marginBottom: '16px' }}>
          <Button onClick={addSampleLog}>Adicionar Log</Button>
          <Button danger onClick={addSampleError}>Adicionar Erro</Button>
        </Space>
        
        <LogsViewer 
          height="500px"
          showHeader={true}
          maxItems={1000}
        />
      </Card>
    </div>
  );
};

export default LogsDemo;
```

## ✨ Benefícios

- **🔍 Debugging facilitado**: Logs visíveis em tempo real para usuários
- **📈 Monitoramento**: Acompanhamento de operações do sistema
- **🎯 Produtividade**: Interface intuitiva para desenvolvedores e usuários
- **⚡ Performance**: Otimizado para grandes volumes de logs
- **🎨 UX consistente**: Integrado perfeitamente com a aplicação
