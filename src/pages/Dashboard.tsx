import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Monitor, RefreshCw, Upload, Paperclip, X, HardDriveUploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemoryCard from "@/components/MemoryCard";
import { getMonitoramentoJboss, getMonitoramentoBanco, postArquivo } from "@/services/dashboard.service";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".zip")) {
      alert("Apenas arquivos .zip são permitidos");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      const response = await postArquivo(file);

      if(response?.sucesso === false) {
        alert(`Erro no arquivo: ${response.arquivo_com_erro}\nDetalhes: ${response.erro_sql}`);
      } else {
        alert("Arquivo enviado e scripts executados com sucesso!");

        // limpar após sucesso
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setUploading(false);
    }
  };

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
        status = "Banco desatualizado";
      }

      // if (item.dias_desatualizado > 1) {
      //   status = `Banco desatualizado há ${item.dias_desatualizado} dias`;
      // }

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

  // carrega dados ao abrir a tela
  useEffect(() => {
    fetchMonitoramento();
    fetchMonitoramentoBanco();
  }, []);

  const handleRefresh = (params) => {
    // setData(initialData.map((env) => ({
      //   ...env,
      //   usedMB: Math.round(Math.random() * env.totalMB * 0.5 + env.totalMB * 0.2),
      // })));
    fetchMonitoramento();
    setLastUpdate(new Date());
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <input
              type="file"
              accept=".zip"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Exibição do arquivo */}
            {file && (
              <div className="flex items-center gap-2 px-3 rounded-full bg-file rounded-xl text-xs max-w-[220px]">
                <Paperclip  className="h-3.5 w-3.5" />
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="ml-1 text-muted-foreground hover:text-red-500 hover:bg-transparent"
                  title="Excluir"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="hover:text-green-800 hover:bg-transparent"
                  title="Enviar"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleFileClick} title="Carregar versão do pacote">
              <HardDriveUploadIcon className="mr-2 h-3.5 w-3.5" />
              Carregar
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} title="Atualizar monitoramento do JBoss">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
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
    </div>
  );
};

export default Dashboard;
