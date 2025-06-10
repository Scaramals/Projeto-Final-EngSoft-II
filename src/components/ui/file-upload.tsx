
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // em bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  onRemove,
  className,
  placeholder = "Clique para selecionar uma imagem",
  accept = "image/*",
  maxSize = 5242880, // 5MB default
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Criar preview local
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload para Supabase (simulado - você pode adaptar para sua implementação)
      const formData = new FormData();
      formData.append('file', file);

      // Aqui você faria o upload real para o Supabase
      // Por enquanto, vamos simular com uma URL
      const uploadedUrl = previewUrl; // Substitua pela lógica real de upload
      
      onChange(uploadedUrl);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (preview) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemove}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remover
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <div
        onClick={handleClick}
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center justify-center p-6">
          <div className="flex items-center justify-center w-10 h-10 mb-3 bg-muted rounded-full">
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <p className="mb-1 text-sm text-muted-foreground font-medium">
            {isUploading ? "Enviando..." : placeholder}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP até {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>
    </div>
  );
};
