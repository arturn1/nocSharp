import React, { useState } from 'react';
import { Card, Select, Button, Space, Typography, Alert, Row, Col, Radio, Input, List, Divider } from 'antd';
import { DownloadOutlined, CopyOutlined, PlayCircleOutlined, CodeOutlined } from '@ant-design/icons';
import { useAppContext } from '../../contexts/AppContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface ScriptConfig {
  format: 'bash' | 'powershell' | 'batch';
  includeComments: boolean;
  customCommands: string[];
}

const ScriptGenerator: React.FC = () => {
  const { state } = useAppContext();
  const { entities } = state;
  
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
    format: 'bash',
    includeComments: true,
    customCommands: []
  });
  
  const [newCommand, setNewCommand] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');

  const addCustomCommand = () => {
    if (newCommand.trim()) {
      setScriptConfig(prev => ({
        ...prev,
        customCommands: [...prev.customCommands, newCommand.trim()]
      }));
      setNewCommand('');
    }
  };

  const removeCustomCommand = (index: number) => {
    setScriptConfig(prev => ({
      ...prev,
      customCommands: prev.customCommands.filter((_, i) => i !== index)
    }));
  };

  const generateEntityCommands = () => {
    return entities.map(entity => {
      const fieldsStr = entity.properties
        .map(prop => {
          let typeStr = prop.type;
          if (prop.collectionType && prop.collectionType !== 'none' && prop.collectionType !== '') {
            typeStr = `${prop.collectionType}<${prop.type}>`;
          }
          return `${prop.name}:${typeStr}`;
        })
        .join(' ');
      
      const baseSkipParam = entity.baseSkip ? ' --baseSkip' : '';
      return `nocsharp s "${entity.name}" ${fieldsStr}${baseSkipParam}`;
    });
  };

  const generateScript = () => {
    const entityCommands = generateEntityCommands();
    const allCommands = [...entityCommands, ...scriptConfig.customCommands];
    
    let script = '';
    
    switch (scriptConfig.format) {
      case 'bash':
        script = generateBashScript(allCommands);
        break;
      case 'powershell':
        script = generatePowerShellScript(allCommands);
        break;
      case 'batch':
        script = generateBatchScript(allCommands);
        break;
    }
    
    setGeneratedScript(script);
  };

  const generateBashScript = (commands: string[]) => {
    let script = '#!/bin/bash\n\n';
    
    if (scriptConfig.includeComments) {
      script += '# nocSharp Project Generation Script\n';
      script += '# Generated automatically from nocSharp frontend\n';
      script += `# Total entities: ${entities.length}\n`;
      script += `# Custom commands: ${scriptConfig.customCommands.length}\n\n`;
    }
    
    script += 'set -e  # Exit on error\n\n';
    
    if (scriptConfig.includeComments) {
      script += '# Check if nocsharp CLI is installed\n';
    }
    script += 'if ! command -v nocsharp &> /dev/null; then\n';
    script += '    echo "nocsharp CLI not found. Please install it first."\n';
    script += '    exit 1\n';
    script += 'fi\n\n';
    
    if (commands.length > 0) {
      if (scriptConfig.includeComments) {
        script += '# Execute commands\n';
      }
      
      commands.forEach((command, index) => {
        if (scriptConfig.includeComments) {
          script += `# Command ${index + 1}\n`;
        }
        script += `echo "Executing: ${command}"\n`;
        script += `${command}\n`;
        script += 'if [ $? -eq 0 ]; then\n';
        script += '    echo "✓ Success"\n';
        script += 'else\n';
        script += '    echo "✗ Failed"\n';
        script += '    exit 1\n';
        script += 'fi\n\n';
      });
    }
    
    script += 'echo "All commands executed successfully!"\n';
    return script;
  };

  const generatePowerShellScript = (commands: string[]) => {
    let script = '# nocSharp Project Generation Script\n';
    script += '# PowerShell version\n\n';
    
    if (scriptConfig.includeComments) {
      script += '# Generated automatically from nocSharp frontend\n';
      script += `# Total entities: ${entities.length}\n`;
      script += `# Custom commands: ${scriptConfig.customCommands.length}\n\n`;
    }
    
    script += '$ErrorActionPreference = "Stop"\n\n';
    
    if (scriptConfig.includeComments) {
      script += '# Check if nocsharp CLI is installed\n';
    }
    script += 'try {\n';
    script += '    Get-Command nocsharp -ErrorAction Stop | Out-Null\n';
    script += '} catch {\n';
    script += '    Write-Error "nocsharp CLI not found. Please install it first."\n';
    script += '    exit 1\n';
    script += '}\n\n';
    
    if (commands.length > 0) {
      if (scriptConfig.includeComments) {
        script += '# Execute commands\n';
      }
      
      commands.forEach((command, index) => {
        if (scriptConfig.includeComments) {
          script += `# Command ${index + 1}\n`;
        }
        script += `Write-Host "Executing: ${command}" -ForegroundColor Yellow\n`;
        script += 'try {\n';
        script += `    & ${command.split(' ').map(part => part.includes(' ') ? `"${part}"` : part).join(' ')}\n`;
        script += '    Write-Host "✓ Success" -ForegroundColor Green\n';
        script += '} catch {\n';
        script += '    Write-Host "✗ Failed: $_" -ForegroundColor Red\n';
        script += '    exit 1\n';
        script += '}\n\n';
      });
    }
    
    script += 'Write-Host "All commands executed successfully!" -ForegroundColor Green\n';
    return script;
  };

  const generateBatchScript = (commands: string[]) => {
    let script = '@echo off\n';
    
    if (scriptConfig.includeComments) {
      script += 'REM nocSharp Project Generation Script\n';
      script += 'REM Batch version\n';
      script += `REM Total entities: ${entities.length}\n`;
      script += `REM Custom commands: ${scriptConfig.customCommands.length}\n\n`;
    }
    
    script += 'setlocal enabledelayedexpansion\n\n';
    
    if (scriptConfig.includeComments) {
      script += 'REM Check if nocsharp CLI is installed\n';
    }
    script += 'nocsharp --version >nul 2>&1\n';
    script += 'if errorlevel 1 (\n';
    script += '    echo nocsharp CLI not found. Please install it first.\n';
    script += '    exit /b 1\n';
    script += ')\n\n';
    
    if (commands.length > 0) {
      if (scriptConfig.includeComments) {
        script += 'REM Execute commands\n';
      }
      
      commands.forEach((command, index) => {
        if (scriptConfig.includeComments) {
          script += `REM Command ${index + 1}\n`;
        }
        script += `echo Executing: ${command}\n`;
        script += `${command}\n`;
        script += 'if errorlevel 1 (\n';
        script += '    echo X Failed\n';
        script += '    exit /b 1\n';
        script += ') else (\n';
        script += '    echo √ Success\n';
        script += ')\n\n';
      });
    }
    
    script += 'echo All commands executed successfully!\n';
    script += 'pause\n';
    return script;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  const downloadScript = () => {
    const extensions = {
      bash: '.sh',
      powershell: '.ps1',
      batch: '.bat'
    };
    
    const filename = `nocsharp-script${extensions[scriptConfig.format]}`;
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getScriptInfo = () => {
    const entityCommands = generateEntityCommands();
    const totalCommands = entityCommands.length + scriptConfig.customCommands.length;
    
    return {
      totalCommands,
      entityCommands: entityCommands.length,
      customCommands: scriptConfig.customCommands.length
    };
  };

  const scriptInfo = getScriptInfo();

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card title="📜 Script Generator" size="small">
        <Alert
          message="Gerador de Scripts Multi-plataforma"
          description="Converte suas entidades e comandos em scripts executáveis para Bash, PowerShell ou Batch."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="⚙️ Configurações do Script" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Formato do Script:</Text>
                  <Radio.Group
                    value={scriptConfig.format}
                    onChange={(e) => setScriptConfig(prev => ({ ...prev, format: e.target.value }))}
                    style={{ marginTop: '8px', width: '100%' }}
                  >
                    <Radio.Button value="bash">Bash (.sh)</Radio.Button>
                    <Radio.Button value="powershell">PowerShell (.ps1)</Radio.Button>
                    <Radio.Button value="batch">Batch (.bat)</Radio.Button>
                  </Radio.Group>
                </div>

                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={scriptConfig.includeComments}
                      onChange={(e) => setScriptConfig(prev => ({ ...prev, includeComments: e.target.checked }))}
                      style={{ marginRight: '8px' }}
                    />
                    Incluir comentários no script
                  </label>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="📊 Estatísticas do Script" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text><strong>Comandos totais:</strong> {scriptInfo.totalCommands}</Text>
                <Text><strong>Entidades:</strong> {scriptInfo.entityCommands}</Text>
                <Text><strong>Comandos customizados:</strong> {scriptInfo.customCommands}</Text>
                <Text><strong>Formato:</strong> {scriptConfig.format.toUpperCase()}</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="➕ Comandos Customizados" size="small">
        <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
          <Input
            placeholder="Adicionar comando personalizado (ex: nocsharp add identity)"
            value={newCommand}
            onChange={(e) => setNewCommand(e.target.value)}
            onPressEnter={addCustomCommand}
          />
          <Button type="primary" onClick={addCustomCommand} disabled={!newCommand.trim()}>
            Adicionar
          </Button>
        </Space.Compact>

        {scriptConfig.customCommands.length > 0 && (
          <List
            size="small"
            dataSource={scriptConfig.customCommands}
            renderItem={(command, index) => (
              <List.Item
                actions={[
                  <Button size="small" danger onClick={() => removeCustomCommand(index)}>
                    Remover
                  </Button>
                ]}
              >
                <Text code>{command}</Text>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card title="🚀 Gerar Script" size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Button
              type="primary"
              icon={<CodeOutlined />}
              onClick={generateScript}
              style={{ width: '100%' }}
              size="large"
            >
              Gerar Script
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button
              icon={<CopyOutlined />}
              onClick={copyToClipboard}
              disabled={!generatedScript}
              style={{ width: '100%' }}
              size="large"
            >
              Copiar
            </Button>
          </Col>
          <Col xs={24} md={8}>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadScript}
              disabled={!generatedScript}
              style={{ width: '100%' }}
              size="large"
            >
              Download
            </Button>
          </Col>
        </Row>

        {generatedScript && (
          <div style={{ marginTop: '16px' }}>
            <Divider />
            <Title level={5}>Script Gerado:</Title>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '400px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {generatedScript}
            </div>
          </div>
        )}
      </Card>
    </Space>
  );
};

export default ScriptGenerator;
