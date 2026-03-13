import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import users from "../data/users.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    const usuarioCadastrado = users.filter((usuario) => {
      return usuario.email === email && usuario.password === password;
    });
    e.preventDefault();
    // Simple client-side login for now
    if (usuarioCadastrado.length > 0) {
      sessionStorage.setItem("authenticated", "true");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Monitor className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Monitor SEIA
          </h1>
          <p className="text-sm text-muted-foreground">Monitoramento dos ambientes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            required
          />
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
