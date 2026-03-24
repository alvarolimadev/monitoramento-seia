import { api } from "./api";

export const getMonitoramentoJboss = async () => {
  const { data } = await api.get("/monitoramentos/monitoramento-memoria-jboss");
  return data;
};

export const getMonitoramentoBanco = async () => {
  const { data } = await api.get("/monitoramentos/monitoramento-atualizacao-banco");
  return data;
};