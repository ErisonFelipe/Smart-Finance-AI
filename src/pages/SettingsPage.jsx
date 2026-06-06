import { useState, useRef } from "react";
import {
  UserIcon,
  BellIcon,
  TagIcon,
  DownloadIcon,
  SaveIcon,
  CheckCircleIcon,
  CameraIcon,
  LoaderIcon,
} from "lucide-react";
import userService from "@/api/userService";
import { useAuthStore } from "@/store/authStore";

const sections = [
  { id: "perfil", label: "Perfil", icon: UserIcon },
  { id: "notificacoes", label: "Notificações", icon: BellIcon },
  { id: "categorias", label: "Categorias", icon: TagIcon },
  { id: "dados", label: "Dados", icon: DownloadIcon },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("perfil");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { user, setUser } = useAuthStore();

  const [settings, setSettings] = useState({
    nome: user?.name || "",
    email: user?.email || "",
    rendaMensal: user?.monthlyIncome || 0,
    payDay: user?.payDay || 1,
    photoUrl: user?.photoUrl || null,
    photoFile: null,
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

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB");
      return;
    }

    // Verificar tipo
    if (!file.type.startsWith("image/")) {
      alert("O arquivo deve ser uma imagem");
      return;
    }

    setSettings({ ...settings, photoFile: file });

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaved(false);

      const formData = new FormData();
      formData.append("name", settings.nome.trim());
      formData.append("monthlyIncome", String(settings.rendaMensal));
      formData.append("payDay", String(settings.payDay));
      if (settings.photoFile) {
        formData.append("photo", settings.photoFile);
      }

      const updatedUser = await userService.updateProfile(formData);

      const currentUser = { ...user, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);

      setSettings((prev) => ({
        ...prev,
        nome: updatedUser.name || prev.nome,
        rendaMensal: updatedUser.monthlyIncome ?? prev.rendaMensal,
        photoUrl: updatedUser.photoUrl || prev.photoUrl,
        photoFile: null,
      }));
      setPreviewUrl(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoria = (index) => {
    setSettings((prev) => {
      const novasCategorias = [...prev.categorias];
      novasCategorias[index] = {
        ...novasCategorias[index],
        ativa: !novasCategorias[index].ativa,
      };
      return { ...prev, categorias: novasCategorias };
    });
  };

  const getPhotoUrl = () => {
    if (previewUrl) return previewUrl;
    if (settings.photoUrl) {
      return settings.photoUrl.startsWith("http")
        ? settings.photoUrl
        : `${window.location.protocol}//${window.location.hostname}:3001${settings.photoUrl}`;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Personalize sua experiência</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {loading ? "Salvando..." : saved ? "Salvo!" : "Salvar Alterações"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 lg:w-48 lg:shrink-0">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 rounded-xl border bg-card p-6 shadow-sm">
          {/* PERFIL */}
          {activeSection === "perfil" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3 className="text-lg font-semibold">Dados do Perfil</h3>

              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer flex-shrink-0" onClick={handlePhotoClick}>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden border-2 border-border transition-colors group-hover:border-primary">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Foto" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <div>
                  <p className="text-sm font-medium">Foto de Perfil</p>
                  <p className="text-xs text-muted-foreground">Clique na foto para alterar</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF (máx. 2MB)</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={settings.nome}
                  onChange={(e) => setSettings({ ...settings, nome: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Renda Mensal (R$)</label>
                  <input
                    type="number"
                    value={settings.rendaMensal}
                    onChange={(e) => setSettings({ ...settings, rendaMensal: Number(e.target.value) })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                    placeholder="0,00"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Dia do recebimento</label>
                  <select
                    value={settings.payDay}
                    onChange={(e) => setSettings({ ...settings, payDay: Number(e.target.value) })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-shadow"
                  >
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Dia {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICAÇÕES */}
          {activeSection === "notificacoes" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
              {[
                { key: "vencimentos", label: "Lembretes de vencimento", desc: "Avise 1 dia antes do vencimento" },
                { key: "boletos", label: "Boletos pendentes", desc: "Notifique sobre boletos a vencer" },
                { key: "resumoMensal", label: "Resumo mensal", desc: "Envie um resumo no início de cada mês" },
                { key: "dicas", label: "Dicas financeiras", desc: "Receba sugestões de economia" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
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

          {/* CATEGORIAS */}
          {activeSection === "categorias" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categorias Personalizadas</h3>
                <button className="text-sm text-primary hover:underline">+ Nova Categoria</button>
              </div>
              <div className="flex flex-col gap-2">
                {settings.categorias.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        cat.tipo === "renda" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}>
                        {cat.tipo === "renda" ? "Renda" : "Despesa"}
                      </span>
                      <span className="text-sm font-medium">{cat.nome}</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" checked={cat.ativa} onChange={() => toggleCategoria(index)} className="peer sr-only" />
                      <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DADOS */}
          {activeSection === "dados" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="text-lg font-semibold">Exportação de Dados</h3>
              <div className="flex flex-col gap-3">
                {[
                  { title: "Exportar Transações", desc: "Baixe todas as transações em CSV" },
                  { title: "Relatório Mensal", desc: "Relatório detalhado em PDF" },
                  { title: "Backup Completo", desc: "Todos os dados em formato JSON" },
                ].map((item, i) => (
                  <button key={i} className="flex items-center justify-between rounded-lg border p-4 text-left hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <DownloadIcon className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="font-medium text-destructive">Zona de Perigo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Excluir todos os dados permanentemente. Esta ação não pode ser desfeita.
                </p>
                <button className="mt-3 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">
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