import React, { useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import LogsViewer from '../LogsViewer';

/**
 * Componente de demonstração para o LogsViewer
 * Este componente adiciona alguns logs de exemplo e exibe o LogsViewer
 */
const LogsViewerDemo: React.FC = () => {
  const { dispatch } = useAppContext();

  useEffect(() => {
    // Adicionar logs de demonstração
    const demoLogs = [
      'Sistema iniciado com sucesso ✅',
      'Conectando ao banco de dados...',
      'Conexão estabelecida com sucesso ✅',
      'Carregando configurações do projeto',
      'Configurações carregadas ✅',
      'Iniciando análise de entidades...',
      'Encontradas 15 entidades no projeto',
      'Análise de entidades concluída ✅',
      'Verificando dependências do projeto...',
      'Todas as dependências estão atualizadas ✅'
    ];

    const demoErrors = [
      'Falha na conexão com servidor externo',
      'Timeout na requisição para API',
      'Arquivo de configuração não encontrado',
      'Erro de validação nos dados de entrada'
    ];

    // Adicionar logs gradualmente para simular atividade real
    demoLogs.forEach((log, index) => {
      setTimeout(() => {
        dispatch({ type: 'ADD_LOG', payload: log });
      }, index * 800);
    });

    // Adicionar alguns erros intercalados
    demoErrors.forEach((error, index) => {
      setTimeout(() => {
        dispatch({ type: 'ADD_ERROR', payload: error });
      }, (index + 2) * 1500);
    });
  }, [dispatch]);

  return (
    <div style={{ height: '500px', padding: '16px' }}>
      <LogsViewer 
        height="100%" 
        showHeader={true}
        compact={false}
        maxItems={100}
      />
    </div>
  );
};

export default LogsViewerDemo;
