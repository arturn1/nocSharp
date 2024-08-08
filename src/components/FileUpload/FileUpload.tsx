import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

interface FileUploadProps {
  onFileUpload: (file: RcFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleFileUpload = (file: RcFile) => {
    onFileUpload(file);
    return false;
  };

  return (
    <Upload beforeUpload={handleFileUpload} showUploadList={false}>
      <Button icon={<UploadOutlined />}>Select File</Button>
    </Upload>
  );
};

export default FileUpload;
