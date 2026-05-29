import { useState } from "react";
import { 
  UserIcon, 
  BellIcon, 
  PaletteIcon, 
  TagIcon, 
  DownloadIcon, 
  SaveIcon,
  CheckCircleIcon 
} from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("perfil");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    nome: "João Silva",
    email: "joao@email.com",
    rendaMensal: 8000,
    tema: "claro",
    notificacoes: {
      vencimentos: true,
      boletos: true,
      resumoMensal: true,
      dicas: false,
    },
    categorias: [
      { nome: "Alimentação", tipo: "despesa", ativa: true },
      { nome: "Transporte", tipo: "despesa", ativa: true },
      { nome: "Moradia", tipo: "despesa", ativa: true },
      { nome: "Saúde", tipo: "despesa", ativa: true },
      { nome: "Lazer", tipo: "despesa", ativa: true },
      { nome: "Salário", tipo: "renda", ativa: true },
      { nome: "Freelance", tipo: "renda", ativa: true },
    ],
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleCategoria = (index) => {
    const novasCategorias = [...settings.categorias];
    novasCategorias[index].ativa = !novasCategorias[index].ativa;
    setSettings({ ...settings, categorias: novasCategorias });
  };

  const sections = [
    { id: "perfil", label: "Perfil", icon: UserIcon },
    { id: "notificacoes", label: "Notificações", icon: BellIcon },
    { id: "categorias", label: "Categorias", icon: TagIcon },
    { id: "dados", label: "Dados", icon: DownloadIcon },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Personalize sua experiência</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {saved ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              Salvo!
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de seções */}
        <div className="hidden w-48 flex-col gap-1 sm:flex">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da seção */}
        <div className="flex-1 rounded-lg border bg-card p-6 shadow-sm">
          {/* Perfil */}
          {activeSection === "perfil" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Dados do Perfil</h3>
              
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <button className="text-sm text-primary hover:underline">
                    Alterar foto
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={settings.nome}
                  onChange={(e) => setSettings({ ...settings, nome: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Renda Mensal (R$)</label>
                <input
                  type="number"
                  value={settings.rendaMensal}
                  onChange={(e) => setSettings({ ...settings, rendaMensal: Number(e.target.value) })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Notificações */}
          {activeSection === "notificacoes" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
              
              {[
                { key: "vencimentos", label: "Lembretes de vencimento", desc: "Avise 1 dia antes do vencimento" },
                { key: "boletos", label: "Boletos pendentes", desc: "Notifique sobre boletos a vencer" },
                { key: "resumoMensal", label: "Resumo mensal", desc: "Envie um resumo no início de cada mês" },
                { key: "dicas", label: "Dicas financeiras", desc: "Receba sugestões de economia" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificacoes[item.key]}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          notificacoes: {
                            ...settings.notificacoes,
                            [item.key]: !settings.notificacoes[item.key],
                          },
                        })
                      }
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Categorias */}
          {activeSection === "categorias" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categorias Personalizadas</h3>
                <button className="text-sm text-primary hover:underline">
                  + Nova Categoria
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {settings.categorias.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        cat.tipo === "renda"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {cat.tipo === "renda" ? "Renda" : "Despesa"}
                      </span>
                      <span className="text-sm font-medium">{cat.nome}</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={cat.ativa}
                        onChange={() => toggleCategoria(index)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dados */}
          {activeSection === "dados" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Exportação de Dados</h3>
              
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-between rounded-md border p-4 text-left hover:bg-muted">
                  <div>
                    <p className="font-medium">Exportar Transações</p>
                    <p className="text-sm text-muted-foreground">Baixe todas as transações em CSV</p>
                  </div>
                  <DownloadIcon className="h-5 w-5 text-muted-foreground" />
                </button>

                <button className="flex items-center justify-between rounded-md border p-4 text-left hover:bg-muted">
                  <div>
                    <p className="font-medium">Relatório Mensal</p>
                    <p className="text-sm text-muted-foreground">Relatório detalhado em PDF</p>
                  </div>
                  <DownloadIcon className="h-5 w-5 text-muted-foreground" />
                </button>

                <button className="flex items-center justify-between rounded-md border p-4 text-left hover:bg-muted">
                  <div>
                    <p className="font-medium">Backup Completo</p>
                    <p className="text-sm text-muted-foreground">Todos os dados em formato JSON</p>
                  </div>
                  <DownloadIcon className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="font-medium text-destructive">Zona de Perigo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Excluir todos os dados permanentemente
                </p>
                <button className="mt-3 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                  Excluir Todos os Dados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}