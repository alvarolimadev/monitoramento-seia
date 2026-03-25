import { api } from "./api";

export const getMonitoramentoJboss = async () => {
  const { data } = await api.get("/monitoramentos/monitoramento-memoria-jboss");
  return data;
};

export const getMonitoramentoBanco = async () => {
  const { data } = await api.get("/monitoramentos/monitoramento-atualizacao-banco");
  return data;
};

export const postArquivo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/pacotes/executar-scripts-zip", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};