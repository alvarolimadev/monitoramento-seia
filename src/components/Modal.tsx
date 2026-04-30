import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { set } from "date-fns";

export const Modal = ({
  uploadModalOpen,
  setUploadModalOpen,
  uploadType,
  selectedFile,
  setSelectedFile,
  handleSelectFile,
  handleSendFile,
  uploading,
  uploadMessage,
  uploadMessageType,
  setUploadMessage
}) => {

  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setUploadMessage("");

    if (modalFileInputRef.current) {
      modalFileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {uploadType === "war"
              ? "Validar imagem WAR"
              : "Carregar pacote ZIP"}
          </DialogTitle>

          <DialogDescription>
            {`Selecione um arquivo ${uploadType === "war" ? ".war" : ".zip"} para enviar.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={modalFileInputRef}
            type="file"
            accept={uploadType === "war" ? ".war" : ".zip"}
            onChange={handleSelectFile}
          />

          {selectedFile && (
            <div className="inline-flex max-w-[200px] items-center gap-2 rounded-xl bg-file px-3 py-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRemoveSelectedFile}
                className="ml-3 text-muted-foreground hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          
          {uploadMessage && (
            <div
              className={`whitespace-pre-line text-sm text-center ${
                uploadMessageType === "success"
                  ? "text-green-700"
                  : uploadMessageType === "error"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {uploadMessage}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>

            <Button
              variant="outline"
              onClick={handleSendFile}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
