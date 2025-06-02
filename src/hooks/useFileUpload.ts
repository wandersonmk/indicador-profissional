import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseFileUploadProps {
  bucketName: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useFileUpload({ bucketName, onSuccess, onError }: UseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, path: string) => {
    try {
      setIsUploading(true);
      setProgress(0);

      // Verifica o tipo do arquivo (apenas PDF e imagens)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.');
      }

      // Verifica o tamanho do arquivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      // Faz o upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Obtém a URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onSuccess?.(publicUrl);
      toast.success('Arquivo enviado com sucesso!');
      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) throw error;

      toast.success('Arquivo excluído com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir arquivo';
      toast.error(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress,
  };
} 