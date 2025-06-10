
import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  value,
  onChange,
  onRemove
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-product-image', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      onChange(data.url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (url: string) => {
    // Se a URL é um blob (preview local), precisamos fazer o upload
    if (url.startsWith('blob:')) {
      // Buscar o arquivo do input para fazer upload
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (file) {
        await handleUpload(file);
      }
    } else {
      onChange(url);
    }
  };

  return (
    <FileUpload
      value={value}
      onChange={handleFileChange}
      onRemove={onRemove}
      placeholder="Clique para selecionar uma imagem do produto"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      maxSize={5242880} // 5MB
    />
  );
};
