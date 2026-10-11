import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Calendar,
  Settings,
  History,
  Download,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Coffee,
  LogIn,
  LogOut,
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Info,
  Save,
  X,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

// Chaves de armazenamento
const STORAGE_KEY_RECORDS = 'pontofacil_records_v1';
const STORAGE_KEY_SETTINGS = 'pontofacil_settings_v1';
const STORAGE_KEY_THEME = 'pontofacil_theme_v1';

// Configurações padrão
const DEFAULT_SETTINGS = {
  dailyWorkHours: '08:00', // ou '08:48'
  lunchDuration: '01:00',
  toleranceMinutes: 10,
  workDays: [1, 2, 3, 4, 5], // Seg a Sex
  employeeName: 'Colaborador',
  companyName: 'Minha Empresa',
  soundEnabled: true,
};

// Funções utilitárias de tempo e formatação
const pad = (num) => String(num).padStart(2, '0');

const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

const minutesToTime = (min) => {
  if (min === null || min === undefined || isNaN(min)) return '--:--';
  const sign = min < 0 ? '-' : '';
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${pad(h)}:${pad(m)}`;
};

const formatDateBr = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const getTodayDateStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const getNowTimeStr = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

// Síntese de áudio leve via Web Audio API (sem arquivos externos)
const playBeep = (type = 'success') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Silencia se houver restrições de permissão do browser
  }
};

export default function App() {
  // Estado de tema e visualização de abas
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState('registro'); // 'registro' | 'historico' | 'configuracoes'

  // Relógio em tempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  // Configurações
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Registros de ponto: objeto com chaves "YYYY-MM-DD"
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);

      // Exemplo inicial de boas-vindas se estiver vazio
      const today = getTodayDateStr();
      return {
        [today]: {
          date: today,
          entrada: '08:00',
          almocoSaida: '12:00',
          almocoRetorno: '13:00',
          saida: '',
          observacao: 'Dia de trabalho normal'
        }
      };
    } catch {
      return {};
    }
  });

  // Sistema de Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (settings.soundEnabled) playBeep(type);
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Modal de edição / adição de dia
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mês e Ano selecionados no histórico
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  });

  // Atualizador de relógio (a cada segundo)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Salvar registros no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Falha ao salvar registros', e);
    }
  }, [records]);

  // Salvar configurações
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Falha ao salvar configurações', e);
    }
  }, [settings]);

  // Salvar tema
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calcula tempos de um registro específico
  const calculateDayMetrics = (record, currentRealTime = null) => {
    if (!record) {
      return {
        workedMinutes: 0,
        lunchMinutes: 0,
        expectedExit: '--:--',
        balanceMinutes: 0,
        status: 'Vazio',
        isWorkingNow: false
      };
    }

    const e = timeToMinutes(record.entrada);
    const as = timeToMinutes(record.almocoSaida);
    const ar = timeToMinutes(record.almocoRetorno);
    const s = timeToMinutes(record.saida);

    // Tempo atual em minutos para contagem de turno em andamento
    const nowMinutes = currentRealTime ? currentRealTime.getHours() * 60 + currentRealTime.getMinutes() : null;
    const isToday = record.date === getTodayDateStr();

    let workedMinutes = 0;
    let lunchMinutes = 0;
    let isWorkingNow = false;

    // Intervalo de almoço
    if (as && ar && ar >= as) {
      lunchMinutes = ar - as;
    } else if (as && !ar && isToday && nowMinutes && nowMinutes > as) {
      lunchMinutes = nowMinutes - as;
    }

    // Turno 1 (Entrada até Saída p/ Almoço ou Saída Final ou Agora)
    if (e) {
      if (as) {
        workedMinutes += Math.max(0, as - e);
      } else if (s) {
        workedMinutes += Math.max(0, s - e);
      } else if (isToday && nowMinutes && nowMinutes > e) {
        workedMinutes += Math.max(0, nowMinutes - e);
        isWorkingNow = true;
      }
    }

    // Turno 2 (Retorno do Almoço até Saída Final ou Agora)
    if (ar) {
      if (s) {
        workedMinutes += Math.max(0, s - ar);
      } else if (isToday && nowMinutes && nowMinutes > ar) {
        workedMinutes += Math.max(0, nowMinutes - ar);
        isWorkingNow = true;
      }
    }

    // Previsão de horário de saída ideal baseada na jornada contratual
    const contractMinutes = timeToMinutes(settings.dailyWorkHours) || 480;
    let expectedExit = '--:--';

    if (e) {
      const defaultLunchMin = timeToMinutes(settings.lunchDuration) || 60;
      let effectiveLunch = defaultLunchMin;

      if (as && ar && ar >= as) {
        effectiveLunch = ar - as;
      } else if (as && !ar) {
        effectiveLunch = defaultLunchMin;
      }

      const predictedMin = e + contractMinutes + effectiveLunch;
      if (predictedMin > 0 && predictedMin < 1440) {
        expectedExit = minutesToTime(predictedMin);
      }
    }

    // Saldo de horas (considera tolerância se finalizado)
    const tolerance = Number(settings.toleranceMinutes) || 0;
    let balanceMinutes = workedMinutes - contractMinutes;

    // Se estiver dentro da margem de tolerância da CLT diária (ex: +/- 10 min) e o dia já tiver saída final
    if (s && Math.abs(balanceMinutes) <= tolerance) {
      balanceMinutes = 0;
    }

    return {
      workedMinutes,
      lunchMinutes,
      expectedExit,
      balanceMinutes,
      isWorkingNow,
      isComplete: Boolean(record.entrada && record.almocoSaida && record.almocoRetorno && record.saida)
    };
  };

  const todayStr = getTodayDateStr();
  const todayRecord = records[todayStr] || {
    date: todayStr,
    entrada: '',
    almocoSaida: '',
    almocoRetorno: '',
    saida: '',
    observacao: ''
  };

  const todayMetrics = calculateDayMetrics(todayRecord, currentTime);

  // Determinar o próximo passo para o botão de ação inteligente
  const getNextAction = () => {
    if (!todayRecord.entrada) {
      return {
        label: 'Bater Entrada',
        sub: 'Iniciar expediente de hoje',
        field: 'entrada',
        icon: LogIn,
        color: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
        badge: 'Pronto para iniciar'
      };
    }
    if (!todayRecord.almocoSaida) {
      return {
        label: 'Pausa para Almoço',
        sub: 'Registrar início do intervalo',
        field: 'almocoSaida',
        icon: Coffee,
        color: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
        badge: 'Trabalhando (1º turno)'
      };
    }
    if (!todayRecord.almocoRetorno) {
      return {
        label: 'Retorno do Almoço',
        sub: 'Voltar ao expediente',
        field: 'almocoRetorno',
        icon: LogIn,
        color: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
        badge: 'Em intervalo de almoço'
      };
    }
    if (!todayRecord.saida) {
      return {
        label: 'Bater Saída',
        sub: 'Encerrar jornada de hoje',
        field: 'saida',
        icon: LogOut,
        color: 'from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700',
        badge: 'Trabalhando (2º turno)'
      };
    }
    return {
      label: 'Jornada Finalizada',
      sub: 'Todos os 4 pontos foram batidos hoje',
      field: null,
      icon: CheckCircle2,
      color: 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
      badge: 'Expediente concluído'
    };
  };

  const nextAction = getNextAction();

  // Executar registro via botão inteligente
  const handleSmartRegister = () => {
    if (!nextAction.field) {
      showToast('O expediente de hoje já foi totalmente registrado!', 'info');
      return;
    }
    const nowTime = getNowTimeStr();
    const updated = {
      ...todayRecord,
      [nextAction.field]: nowTime
    };

    setRecords((prev) => ({
      ...prev,
      [todayStr]: updated
    }));

    showToast(`${nextAction.label} registrada com sucesso às ${nowTime}!`);
  };

  // Atualizar campo específico do dia de hoje (edição rápida manual)
  const handleUpdateTodayField = (field, value) => {
    const updated = {
      ...todayRecord,
      [field]: value
    };
    setRecords((prev) => ({
      ...prev,
      [todayStr]: updated
    }));
    showToast('Horário atualizado!');
  };

  const handleOpenEditModal = (recordOrDate) => {
    if (typeof recordOrDate === 'string') {
      const existing = records[recordOrDate] || {
        date: recordOrDate,
        entrada: '',
        almocoSaida: '',
        almocoRetorno: '',
        saida: '',
        observacao: ''
      };
      setEditingRecord({ ...existing });
    } else if (recordOrDate) {
      setEditingRecord({ ...recordOrDate });
    } else {
      // Novo registro avulso
      setEditingRecord({
        date: getTodayDateStr(),
        entrada: '',
        almocoSaida: '',
        almocoRetorno: '',
        saida: '',
        observacao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModalRecord = (e) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.date) return;

    setRecords((prev) => ({
      ...prev,
      [editingRecord.date]: { ...editingRecord }
    }));
    setIsModalOpen(false);
    showToast(`Registro do dia ${formatDateBr(editingRecord.date)} salvo com sucesso!`);
  };

  const handleDeleteRecord = (dateKey) => {
    if (window.confirm(`Tem certeza que deseja excluir o registro do dia ${formatDateBr(dateKey)}?`)) {
      setRecords((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      showToast('Registro excluído!');
    }
  };

  const monthRecords = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const list = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${pad(month)}-${pad(day)}`;
      const dayDate = new Date(Number(year), Number(month) - 1, day);
      const dayOfWeek = dayDate.getDay(); // 0 Dom, 6 Sab
      const isWorkDay = settings.workDays.includes(dayOfWeek);

      const record = records[dateKey] || {
        date: dateKey,
        entrada: '',
        almocoSaida: '',
        almocoRetorno: '',
        saida: '',
        observacao: ''
      };

      const metrics = calculateDayMetrics(record);

      list.push({
        date: dateKey,
        day,
        dayOfWeek,
        isWorkDay,
        record,
        metrics
      });
    }

    return list;
  }, [records, selectedMonth, settings]);

  // Totais consolidados do mês
  const monthTotals = useMemo(() => {
    let totalWorkedMin = 0;
    let totalExpectedMin = 0;
    let completeDays = 0;
    const contractMin = timeToMinutes(settings.dailyWorkHours) || 480;

    monthRecords.forEach((item) => {
      if (item.metrics.workedMinutes > 0) {
        totalWorkedMin += item.metrics.workedMinutes;
      }
      if (item.isWorkDay) {
        totalExpectedMin += contractMin;
      }
      if (item.metrics.isComplete) {
        completeDays++;
      }
    });

    const netBalanceMin = totalWorkedMin - totalExpectedMin;

    return {
      totalWorkedMin,
      totalExpectedMin,
      netBalanceMin,
      completeDays
    };
  }, [monthRecords, settings]);

  const handleExportCSV = () => {
    const headers = ['Data', 'Dia da Semana', 'Entrada', 'Saída Almoço', 'Retorno Almoço', 'Saída', 'Total Trabalhado', 'Saldo', 'Observações'];
    const daysNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const rows = monthRecords.map((item) => {
      const r = item.record;
      return [
        formatDateBr(item.date),
        daysNames[item.dayOfWeek],
        r.entrada || '-',
        r.almocoSaida || '-',
        r.almocoRetorno || '-',
        r.saida || '-',
        minutesToTime(item.metrics.workedMinutes),
        minutesToTime(item.metrics.balanceMinutes),
        `"${(r.observacao || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `espelho_ponto_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha CSV gerada com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportBackupJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ records, settings }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_ponto_${getTodayDateStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exportado!');
  };

  const handleImportBackupJSON = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.records) setRecords(parsed.records);
          if (parsed.settings) setSettings(parsed.settings);
          showToast('Dados restaurados com sucesso!');
        } catch {
          showToast('Erro ao ler arquivo de backup.', 'error');
        }
      };
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-bounce">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Superior */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                PontoFácil
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-semibold">
                  CLT Smart
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Controle Pessoal de Jornada</p>
            </div>
          </div>

          {/* Abas e Controles de Topo */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('registro')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === 'registro'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Hoje</span>
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === 'historico'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
              </button>

              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === 'configuracoes'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Ajustes</span>
              </button>
            </nav>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Alternar Tema Claro/Escuro"
              aria-label="Alternar Tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {}
        {activeTab === 'registro' && (
          <div className="space-y-6">
            {/* Relógio Principal & Card de Ação */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Relógio em Tempo Real e Botão Principal */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {nextAction.badge}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Jornada: {settings.dailyWorkHours}h
                    </span>
                  </div>

                  <div className="text-center my-4">
                    <div className="text-5xl md:text-7xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                      {pad(currentTime.getHours())}:{pad(currentTime.getMinutes())}
                      <span className="text-2xl md:text-3xl font-light text-slate-400">:{pad(currentTime.getSeconds())}</span>
                    </div>
                    <p className="mt-2 text-sm md:text-base capitalize text-slate-500 dark:text-slate-400 font-medium">
                      {currentTime.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Botão Principal com Efeito Gradiente */}
                <div className="mt-6">
                  <button
                    onClick={handleSmartRegister}
                    className={`w-full group py-4 px-6 rounded-2xl bg-gradient-to-r ${nextAction.color} text-white font-semibold shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg md:text-xl`}
                  >
                    <nextAction.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                    <span>{nextAction.label}</span>
                  </button>
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {nextAction.sub}
                  </p>
                </div>
              </div>

              {/* Métricas do Dia (Tempo Trabalhado, Previsão, Saldo) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-medium uppercase tracking-wider">Trabalhado Hoje</span>
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="my-3">
                    <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                      {minutesToTime(todayMetrics.workedMinutes)}
                    </div>
                    {todayMetrics.isWorkingNow && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Contando em tempo real
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Meta: {settings.dailyWorkHours}h
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-medium uppercase tracking-wider">Intervalo</span>
                    <Coffee className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="my-3">
                    <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                      {minutesToTime(todayMetrics.lunchMinutes)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Padrão: {settings.lunchDuration}h
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {todayRecord.almocoSaida && !todayRecord.almocoRetorno ? 'Almoçando...' : 'Tempo computado'}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-medium uppercase tracking-wider">Saída Prevista</span>
                    <Sparkles className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="my-3">
                    <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                      {todayMetrics.expectedExit}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Cumprir {settings.dailyWorkHours}h
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Baseado na entrada
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-medium uppercase tracking-wider">Saldo do Dia</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="my-3">
                    <div
                      className={`text-3xl font-bold font-mono ${
                        todayMetrics.balanceMinutes >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {todayMetrics.balanceMinutes >= 0 ? '+' : ''}
                      {minutesToTime(todayMetrics.balanceMinutes)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Tolerância CLT: ±{settings.toleranceMinutes}m
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {todayMetrics.balanceMinutes >= 0 ? 'Horas extras' : 'Horas pendentes'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quatro Slots Manuais de Ponto (Entrada, Almoço Saída/Retorno, Saída) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Marcações de Hoje</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Você pode alterar ou preencher manualmente qualquer horário abaixo
                  </p>
                </div>
                <button
                  onClick={() => handleOpenEditModal(todayStr)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Completo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Entrada */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                      1. Entrada
                    </span>
                    {todayRecord.entrada && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <input
                    type="time"
                    value={todayRecord.entrada || ''}
                    onChange={(e) => handleUpdateTodayField('entrada', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleUpdateTodayField('entrada', getNowTimeStr())}
                    className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline block text-right w-full"
                  >
                    Agora ({getNowTimeStr()})
                  </button>
                </div>

                {/* 2. Saída p/ Almoço */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      2. Início Almoço
                    </span>
                    {todayRecord.almocoSaida && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <input
                    type="time"
                    value={todayRecord.almocoSaida || ''}
                    onChange={(e) => handleUpdateTodayField('almocoSaida', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleUpdateTodayField('almocoSaida', getNowTimeStr())}
                    className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline block text-right w-full"
                  >
                    Agora ({getNowTimeStr()})
                  </button>
                </div>

                {/* 3. Retorno do Almoço */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <LogIn className="w-3.5 h-3.5 text-blue-500" />
                      3. Fim Almoço
                    </span>
                    {todayRecord.almocoRetorno && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <input
                    type="time"
                    value={todayRecord.almocoRetorno || ''}
                    onChange={(e) => handleUpdateTodayField('almocoRetorno', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleUpdateTodayField('almocoRetorno', getNowTimeStr())}
                    className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline block text-right w-full"
                  >
                    Agora ({getNowTimeStr()})
                  </button>
                </div>

                {/* 4. Saída Final */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      4. Saída Final
                    </span>
                    {todayRecord.saida && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <input
                    type="time"
                    value={todayRecord.saida || ''}
                    onChange={(e) => handleUpdateTodayField('saida', e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleUpdateTodayField('saida', getNowTimeStr())}
                    className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline block text-right w-full"
                  >
                    Agora ({getNowTimeStr()})
                  </button>
                </div>
              </div>

              {/* Observação rápida do dia */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Observações do dia (Home office, Atestado, Consulta Médica, Reunião Externa):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Trabalho remoto da parte da tarde; visita a cliente"
                  value={todayRecord.observacao || ''}
                  onChange={(e) => handleUpdateTodayField('observacao', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'historico' && (
          <div className="space-y-6">
            {/* Barra de Filtro e Exportação */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Espelho de Ponto</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Selecione o mês para visualizar e exportar</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <button
                  onClick={() => handleOpenEditModal(null)}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Registrar dia retroativo"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Dia</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Exportar CSV para Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Imprimir Folha de Ponto"
                >
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Cards de Resumo Consolidado do Mês */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Horas Trabalhadas</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {minutesToTime(monthTotals.totalWorkedMin)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">no mês selecionado</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Jornada Esperada</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {minutesToTime(monthTotals.totalExpectedMin)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">dias úteis de trabalho</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Saldo do Mês</span>
                <div
                  className={`text-2xl font-bold font-mono mt-1 ${
                    monthTotals.netBalanceMin >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {monthTotals.netBalanceMin >= 0 ? '+' : ''}
                  {minutesToTime(monthTotals.netBalanceMin)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  {monthTotals.netBalanceMin >= 0 ? 'Banco de horas positivo' : 'Horas em débito'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 font-medium">Dias Completos</span>
                <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  {monthTotals.completeDays}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">com 4 marcações</span>
              </div>
            </div>

            {/* Tabela do Histórico Mensal */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-3">Dia</th>
                      <th className="py-3 px-3">Entrada</th>
                      <th className="py-3 px-3">Início Almoço</th>
                      <th className="py-3 px-3">Fim Almoço</th>
                      <th className="py-3 px-3">Saída</th>
                      <th className="py-3 px-3">Trabalhado</th>
                      <th className="py-3 px-3">Saldo</th>
                      <th className="py-3 px-4">Obs.</th>
                      <th className="py-3 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {monthRecords.map((item) => {
                      const daysNamesShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
                      const hasMarks = Boolean(item.record.entrada || item.record.almocoSaida || item.record.almocoRetorno || item.record.saida);
                      const isToday = item.date === todayStr;

                      return (
                        <tr
                          key={item.date}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                            isToday
                              ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-medium'
                              : isWeekend
                              ? 'bg-slate-50/40 dark:bg-slate-900/30 text-slate-400'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono text-xs">{formatDateBr(item.date)}</span>
                            {isToday && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                Hoje
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            {daysNamesShort[item.dayOfWeek]}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {item.record.entrada || '-'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {item.record.almocoSaida || '-'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {item.record.almocoRetorno || '-'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-slate-800 dark:text-slate-200">
                            {item.record.saida || '-'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                            {item.metrics.workedMinutes > 0 ? minutesToTime(item.metrics.workedMinutes) : '-'}
                          </td>
                          <td className="py-3 px-3 font-mono text-xs">
                            {hasMarks ? (
                              <span
                                className={`font-semibold ${
                                  item.metrics.balanceMinutes >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {item.metrics.balanceMinutes >= 0 ? '+' : ''}
                                {minutesToTime(item.metrics.balanceMinutes)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate" title={item.record.observacao}>
                            {item.record.observacao || '-'}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(item.record)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                                title="Editar dia"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {hasMarks && (
                                <button
                                  onClick={() => handleDeleteRecord(item.date)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                                  title="Limpar dia"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'configuracoes' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Configurações de Jornada</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Personalize horários contratuais e preferências de som</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Jornada Diária */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Carga Horária Diária Contratual
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Geralmente 08:00 (40h semanais) ou 08:48 (44h semanais de Seg a Sex).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={settings.dailyWorkHours}
                      onChange={(e) => setSettings({ ...settings, dailyWorkHours: e.target.value })}
                      className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, dailyWorkHours: '08:00' })}
                      className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Padrão 8h
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, dailyWorkHours: '08:48' })}
                      className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      CLT 8h48m
                    </button>
                  </div>
                </div>

                {/* Tempo de Intervalo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Duração Prevista de Intervalo / Almoço
                  </label>
                  <input
                    type="time"
                    value={settings.lunchDuration}
                    onChange={(e) => setSettings({ ...settings, lunchDuration: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Tolerância CLT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tolerância Diária (Minutos - Artigo 58 CLT)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.toleranceMinutes}
                      onChange={(e) => setSettings({ ...settings, toleranceMinutes: Number(e.target.value) })}
                      className="w-24 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Variações de até {settings.toleranceMinutes} min não descontam nem pagam extras.
                    </span>
                  </div>
                </div>

                {/* Nome do Colaborador e Empresa para Impressão */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      value={settings.employeeName}
                      onChange={(e) => setSettings({ ...settings, employeeName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Efeitos Sonoros */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Feedback Sonoro</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Emitir bip suave ao bater ponto</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`p-2.5 rounded-xl border ${
                      settings.soundEnabled
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300'
                        : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Gerenciamento de Dados e Backups */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Segurança e Backup de Dados</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seus dados ficam armazenados exclusivamente no seu navegador via LocalStorage. Exporte regularmente para não perder suas horas.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleExportBackupJSON}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Backup JSON</span>
                </button>

                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition">
                  <Save className="w-4 h-4" />
                  <span>Restaurar Backup</span>
                  <input type="file" accept=".json" onChange={handleImportBackupJSON} className="hidden" />
                </label>

                <button
                  onClick={() => {
                    if (window.confirm('Atenção: Isso apagará TODOS os registros de ponto permanentemente. Tem certeza?')) {
                      setRecords({});
                      localStorage.removeItem(STORAGE_KEY_RECORDS);
                      showToast('Todos os registros foram apagados!');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2 transition ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todos os Dados</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {}
      {isModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Ajustar Ponto do Dia
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={editingRecord.date || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">1. Entrada</label>
                  <input
                    type="time"
                    value={editingRecord.entrada || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, entrada: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">2. Saída Almoço</label>
                  <input
                    type="time"
                    value={editingRecord.almocoSaida || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, almocoSaida: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">3. Volta Almoço</label>
                  <input
                    type="time"
                    value={editingRecord.almocoRetorno || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, almocoRetorno: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">4. Saída Final</label>
                  <input
                    type="time"
                    value={editingRecord.saida || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, saida: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Observação / Justificativa</label>
                <input
                  type="text"
                  placeholder="Ex: Esquecimento de bater ponto na saída"
                  value={editingRecord.observacao || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, observacao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-serif z-[9999]">
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider">{settings.companyName}</h1>
          <h2 className="text-base font-semibold">Folha de Ponto Individual de Trabalho</h2>
          <div className="flex justify-between text-xs mt-3">
            <span><strong>Colaborador:</strong> {settings.employeeName}</span>
            <span><strong>Mês/Ano:</strong> {selectedMonth}</span>
            <span><strong>Jornada Padrão:</strong> {settings.dailyWorkHours}h/dia</span>
          </div>
        </div>

        <table className="w-full text-xs border border-collapse border-black">
          <thead>
            <tr className="bg-slate-100 border-b border-black">
              <th className="border border-black p-1">Data</th>
              <th className="border border-black p-1">Dia</th>
              <th className="border border-black p-1">Entrada</th>
              <th className="border border-black p-1">Almoço Saída</th>
              <th className="border border-black p-1">Almoço Retorno</th>
              <th className="border border-black p-1">Saída</th>
              <th className="border border-black p-1">Horas Trabalhadas</th>
              <th className="border border-black p-1">Saldo Diário</th>
              <th className="border border-black p-1">Assinatura / Obs</th>
            </tr>
          </thead>
          <tbody>
            {monthRecords.map((item) => {
              const daysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
              return (
                <tr key={item.date} className="border-b border-black text-center">
                  <td className="border border-black p-1">{formatDateBr(item.date)}</td>
                  <td className="border border-black p-1">{daysShort[item.dayOfWeek]}</td>
                  <td className="border border-black p-1">{item.record.entrada || ''}</td>
                  <td className="border border-black p-1">{item.record.almocoSaida || ''}</td>
                  <td className="border border-black p-1">{item.record.almocoRetorno || ''}</td>
                  <td className="border border-black p-1">{item.record.saida || ''}</td>
                  <td className="border border-black p-1">{item.metrics.workedMinutes > 0 ? minutesToTime(item.metrics.workedMinutes) : ''}</td>
                  <td className="border border-black p-1">{item.metrics.workedMinutes > 0 ? minutesToTime(item.metrics.balanceMinutes) : ''}</td>
                  <td className="border border-black p-1 text-left">{item.record.observacao || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between text-xs border-t pt-4">
          <div>
            <p><strong>Total Horas Trabalhadas:</strong> {minutesToTime(monthTotals.totalWorkedMin)}</p>
            <p><strong>Total Horas Esperadas:</strong> {minutesToTime(monthTotals.totalExpectedMin)}</p>
            <p><strong>Saldo Final do Mês:</strong> {minutesToTime(monthTotals.netBalanceMin)}</p>
          </div>
          <div className="text-center w-64 pt-8 border-t border-black">
            Assinatura do Colaborador
          </div>
        </div>
      </div>
    </div>
  );
}