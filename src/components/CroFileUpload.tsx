import { useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CroFileUploadProps {
  onFileUploaded: (url: string) => void;
  currentFileUrl?: string;
}

export function CroFileUpload({ onFileUploaded, currentFileUrl }: CroFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, deleteFile, isUploading, progress } = useFileUpload({
    bucketName: 'cro-files',
    onSuccess: (url) => {
      onFileUploaded(url);
      setSelectedFile(null);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast.error('Usuário não autenticado');
      return;
    }

    const filePath = `${userId}/${selectedFile.name}`;
    await uploadFile(selectedFile, filePath);
  };

  const handleDelete = async () => {
    if (!currentFileUrl) return;

    const path = currentFileUrl.split('/').pop();
    if (!path) return;

    const success = await deleteFile(path);
    if (success) {
      onFileUploaded('');
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cro-file">Arquivo do CRO</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cro-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 5MB
          </p>
        </div>

        {selectedFile && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileIcon className="h-4 w-4" />
              <span>{selectedFile.name}</span>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Enviar arquivo
                </>
              )}
            </Button>
            {isUploading && <Progress value={progress} />}
          </div>
        )}

        {currentFileUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileIcon className="h-4 w-4" />
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Ver arquivo atual
                </a>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 