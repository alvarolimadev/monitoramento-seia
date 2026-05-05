import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Monitor, RefreshCw, PackageCheck, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemoryCard from "@/components/MemoryCard";
import {
  getMonitoramentoJboss,
  getMonitoramentoBanco,
  postScriptsZip,
  postImagemWar
} from "@/services/dashboard.service";
import { Modal } from "@/components/Modal";

interface EnvData {
  environment: string;
  usedMB: number;
  totalMB: number;
}

interface DatabaseDump {
  environment: string;
  Data_Ultima_Tramitacao: string
  Dias_Desatualizado: number
  Status: string
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<EnvData[]>([]);
  const [dbDump, setDbDump] = useState<DatabaseDump[]>([]);

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loadingEnv, setLoadingEnv] = useState(true);
  const [loadingDb, setLoadingDb] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"zip" | "war" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadMessageType, setUploadMessageType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    const auth = sessionStorage.getItem("authenticated");
    if (!auth) navigate("/");
  }, [navigate]);

  // Simulate live updates
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setData((prev) =>
  //       prev.map((env) => ({
  //         ...env,
  //         usedMB: Math.max(
  //           1000,
  //           Math.min(env.totalMB, env.usedMB + Math.round((Math.random() - 0.45) * 200))
  //         ),
  //       }))
  //     );
  //     setLastUpdate(new Date());
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    navigate("/");
  };

  function converterDados(apiResponse: any): EnvData[] {
    return [
      {
        environment: "Desenvolvimento",
        usedMB: apiResponse.memoria_dsv.Usado_MB,
        totalMB: apiResponse.memoria_dsv.Max_MB,
      },
      {
        environment: "Homologação",
        usedMB: apiResponse.memoria_hml.Usado_MB,
        totalMB: apiResponse.memoria_hml.Max_MB,
      },
      {
        environment: "Treinamento",
        usedMB: apiResponse.memoria_treinamento.Usado_MB,
        totalMB: apiResponse.memoria_treinamento.Max_MB,
      },
    ];
  }

  function converterDump(apiResponse: any): DatabaseDump[] {
    const nomesAmbientes: Record<string, string> = {
      DSV: "Desenvolvimento",
      HML: "Homologação",
      TRT: "Treinamento",
    };

    return apiResponse.resultado.map((item: any) => {

      let status = "Banco atualizado";

      if (item.dias_desatualizado >= 1) {
         status = `Banco desatualizado há ${item.dias_desatualizado} ${item.dias_desatualizado === 1 ? "dia" : "dias"}`;
      }

      return {
        environment: nomesAmbientes[item.ambiente] ?? item.ambiente,
        Data_Ultima_Tramitacao: item.data_ultima_tramitacao,
        Dias_Desatualizado: item.dias_desatualizado,
        Status: status
      };

    });
  }

  async function fetchMonitoramento() {
    try {
      setLoadingEnv(true);

      const response = await getMonitoramentoJboss();

      const dadosConvertidos = converterDados(response.resultado);

      setData(dadosConvertidos);

      setLastUpdate(new Date());

    } catch (error) {
      console.error("Erro ao buscar monitoramento do JBoss:", error);
    } finally {
      setLoadingEnv(false);
    }
  }

  async function fetchMonitoramentoBanco() {
    try {
      setLoadingDb(true);

      const response = await getMonitoramentoBanco();

      const dadosConvertidos = converterDump(response);

      setDbDump(dadosConvertidos);

    } catch (error) {
      console.error("Erro ao buscar monitoramento do banco:", error);
    } finally {
      setLoadingDb(false);
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile || !uploadType) return;

    try {
      setUploading(true);
      setUploadMessage("");

      const response =
        uploadType === "zip"
          ? await postScriptsZip(selectedFile)
          : await postImagemWar(selectedFile);

      if (uploadType === "zip") {
        if (response.sucesso) {
          setUploadMessageType("success");
          setUploadMessage("Pacote ZIP enviado com sucesso!");
        } else {
          setUploadMessageType("error");
          setUploadMessage(
            `Erro no arquivo: ${response.arquivo_com_erro}\nMensagem de erro: ${response.erro_sql}`
          );
        }
      }

      if (uploadType === "war") {
        setUploadMessageType(response.valido ? "success" : "error");
        setUploadMessage(response.valido === false ?
          `${response.motivo}:
          ${response?.propriedades_invalidas?.map((prop: string) => `${prop}`).join(", ")}`
          : `${response.motivo}`
        );
      }

    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setUploadMessageType("error");
      setUploadMessage("Erro ao enviar arquivo. Entre em contato com o suporte.");
    } finally {
      setUploading(false);
    }
  };

  // carrega dados ao abrir a tela
  useEffect(() => {
    fetchMonitoramento();
    fetchMonitoramentoBanco();
  }, []);

  const handleRefresh = () => {
    fetchMonitoramento();
    fetchMonitoramentoBanco();
    setLastUpdate(new Date());
  };

  const openUploadModal = (type: "zip" | "war") => {
    setUploadType(type);
    setSelectedFile(null);
    setUploadMessage("");
    setUploadModalOpen(true);
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];

    if (!file) return;

    setUploadMessage("");

    if (uploadType === "zip" && !file.name.toLowerCase().endsWith(".zip")) {
      setSelectedFile(null);
      input.value = "";

      setUploadMessageType("error");
      setUploadMessage("Apenas arquivos .zip são permitidos");
      return;
    }

    if (uploadType === "war" && !file.name.toLowerCase().endsWith(".war")) {
      setSelectedFile(null);
      input.value = "";

      setUploadMessageType("error");
      setUploadMessage("Apenas arquivos .war são permitidos");
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full bg-background">
        <div className="mx-auto max-w-5xl">
          <img
            src={"../src/assets/bgtopo.png"}
            alt="Topo SEIA"
            className="w-full object-cover"
          />
        </div>
      </div>
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Monitor SEIA
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground hover:bg-primary">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Monitoramento de Memória do JBoss</h1>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openUploadModal("zip")}
              title="Enviar pacote de scripts (.zip)"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Enviar Pacote
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => openUploadModal("war")}
              title="Validar imagem do JBoss (.war)"
            >
              <ImageUp className="h-3.5 w-3.5" />
              Validar Imagem WAR
            </Button>

            <Button variant="outline"
              size="sm"
              onClick={handleRefresh}
              title="Atualizar dados do monitoramento"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-status-ok" />
            <span>&lt; 59%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-status-warning" />
            <span>59–69%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-status-critical" />
            <span>≥ 70%</span>
          </div>
        </div>

        {loadingEnv ? (
          <p className="text-sm text-muted-foreground">
            Carregando monitoramento...
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((env, index) => (
              <MemoryCard
                key={index}
                environment={env.environment}
                usedMB={env.usedMB}
                totalMB={env.totalMB}
              />
            ))}
          </div>
        )}

        <div className="mt-8 mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Monitoramento do Banco de Dados</h1>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-status-ok" />
            <span>Atualizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-status-critical" />
            <span>Desatualizado</span>
          </div>
        </div>
        
        {loadingDb ? (
          <p className="text-sm text-muted-foreground">
            Carregando monitoramento...
          </p>
        ) : (
          dbDump && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dbDump.map((data, index) => (
              <MemoryCard
                key={index}
                environment={data.environment}
                dumpInfo={data}
              />
            ))}
            </div>
        ))}
      </main>
      <Modal
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        uploadType={uploadType}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        handleSelectFile={handleSelectFile}
        handleSendFile={handleSendFile}
        uploading={uploading}
        uploadMessage={uploadMessage}
        uploadMessageType={uploadMessageType}
        setUploadMessage={setUploadMessage}
      />
    </div>
  );
};

export default Dashboard;
