export const SUPPORTED_LOCALES = ['en', 'es', 'zh', 'de', 'fr', 'pt', 'it', 'ja', 'ko', 'ru']

export const LOCALE_LABELS = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
}

const sharedKeywords =
  'chromatic harmonica, harmonica note detector, harmonica tuner, real time pitch detection, chromatic harmonica notes, 48 reed harmonica, 64 reed harmonica, CromaNota'

export const I18N = {
  en: {
    seo: {
      title: 'CromaNota | Real-time chromatic harmonica note detector',
      description:
        'A simple real-time chromatic harmonica note detector. Use your microphone to see the exact note, hole and slide position while you play.',
      keywords: sharedKeywords,
      locale: 'en_US',
    },
    project: 'Project',
    key: 'Key',
    major: 'major',
    mic: 'Mic',
    defaultMic: 'Default microphone',
    activeMic: 'Active microphone',
    noDevice: 'No device',
    listen: 'Listen',
    stop: 'Stop',
    permission: 'Permission...',
    light: 'Light',
    dark: 'Dark',
    enableLight: 'Enable light mode',
    enableDark: 'Enable dark mode',
    introKicker: 'Live chromatic detector',
    introTitle: 'CromaNota listens to your harmonica',
    introDescription: 'See the exact cell, slide movement and scale alterations while you play.',
    developedBy: 'Developed by Emil Gonzalez',
    rotateTitle: 'Rotate your screen',
    rotateDescription: 'Use landscape mode to see the full harmonica.',
    listening: 'Listening',
    requesting: 'Requesting permission',
    idle: 'Microphone off',
    error: 'Error',
    tuned: 'in tune',
    cents: 'cents',
    draw: 'Draw',
    blow: 'Blow',
    hole: 'Hole',
    holes: 'holes',
    voices: 'voices',
    noMicAccess: 'Could not access the microphone.',
    unsupportedMic: 'This browser does not expose getUserMedia for the microphone.',
    fallbackMic: 'Fallback to the default microphone after error:',
    liveRegionLabel: 'Detected harmonica note',
    mainControls: 'Main controls',
    harmonicaType: 'Harmonica type',
  },
  es: {
    seo: {
      title: 'CromaNota | Detector de notas para armónica cromática en tiempo real',
      description:
        'Una app simple para detectar notas de armónica cromática en tiempo real. Usa el micrófono para ver la nota exacta, celda y posición de palanca mientras tocás.',
      keywords:
        'armónica cromática, detector de notas de armónica, afinador de armónica, notas en tiempo real, armónica cromática 48 voces, armónica cromática 64 voces, CromaNota',
      locale: 'es_ES',
    },
    project: 'Proyecto',
    key: 'Tonalidad',
    major: 'mayor',
    mic: 'Mic',
    defaultMic: 'Micrófono por defecto',
    activeMic: 'Micrófono activo',
    noDevice: 'Sin dispositivo',
    listen: 'Escuchar',
    stop: 'Detener',
    permission: 'Permiso...',
    light: 'Claro',
    dark: 'Dark',
    enableLight: 'Activar modo claro',
    enableDark: 'Activar modo oscuro',
    introKicker: 'Detector cromático en vivo',
    introTitle: 'CromaNota escucha tu armonica',
    introDescription: 'Visualiza la celda exacta, el uso de palanca y las alteraciones segun la tonalidad.',
    developedBy: 'Desarrollado por Emil Gonzalez',
    rotateTitle: 'Gira la pantalla',
    rotateDescription: 'Usala horizontal para ver la armonica completa.',
    listening: 'Escuchando',
    requesting: 'Pidiendo permiso',
    idle: 'Microfono apagado',
    error: 'Error',
    tuned: 'afinada',
    cents: 'cents',
    draw: 'Aspirada',
    blow: 'Soplada',
    hole: 'Agujero',
    holes: 'agujeros',
    voices: 'voces',
    noMicAccess: 'No se pudo acceder al micrófono.',
    unsupportedMic: 'Este navegador no expone getUserMedia para el microfono.',
    fallbackMic: 'Fallback al micrófono por defecto tras error:',
    liveRegionLabel: 'Nota detectada de la armonica',
    mainControls: 'Controles principales',
    harmonicaType: 'Tipo de armonica',
  },
  zh: {
    seo: {
      title: 'CromaNota | 实时半音阶口琴音符检测器',
      description: '一款简单的实时半音阶口琴音符检测应用。用麦克风查看正在演奏的音符、孔位和滑键位置。',
      keywords: `${sharedKeywords}, 半音阶口琴, 口琴音符检测器, 口琴调音器`,
      locale: 'zh_CN',
    },
    project: '项目',
    key: '调性',
    major: '大调',
    mic: '麦克风',
    defaultMic: '默认麦克风',
    activeMic: '正在使用的麦克风',
    noDevice: '无设备',
    listen: '开始',
    stop: '停止',
    permission: '请求权限...',
    light: '浅色',
    dark: '深色',
    enableLight: '启用浅色模式',
    enableDark: '启用深色模式',
    introKicker: '实时半音检测',
    introTitle: 'CromaNota 聆听你的口琴',
    introDescription: '演奏时查看准确音格、滑键动作和调式变化。',
    developedBy: 'Emil Gonzalez 开发',
    rotateTitle: '旋转屏幕',
    rotateDescription: '横屏可查看完整口琴。',
    listening: '监听中',
    requesting: '请求权限',
    idle: '麦克风关闭',
    error: '错误',
    tuned: '音准正确',
    cents: '音分',
    draw: '吸气',
    blow: '吹气',
    hole: '孔',
    holes: '孔',
    voices: '音簧',
    noMicAccess: '无法访问麦克风。',
    unsupportedMic: '此浏览器不支持麦克风 getUserMedia。',
    fallbackMic: '出错后切换到默认麦克风：',
    liveRegionLabel: '检测到的口琴音符',
    mainControls: '主要控制',
    harmonicaType: '口琴类型',
  },
  de: {
    seo: {
      title: 'CromaNota | Echtzeit-Notenerkennung für chromatische Mundharmonika',
      description:
        'Eine einfache App zur Echtzeit-Erkennung von Noten auf der chromatischen Mundharmonika. Mikrofon einschalten und Note, Loch und Schieberposition sehen.',
      keywords: `${sharedKeywords}, chromatische Mundharmonika, Mundharmonika Notenerkennung, Mundharmonika Stimmgerät`,
      locale: 'de_DE',
    },
    project: 'Projekt',
    key: 'Tonart',
    major: 'Dur',
    mic: 'Mikrofon',
    defaultMic: 'Standardmikrofon',
    activeMic: 'Aktives Mikrofon',
    noDevice: 'Kein Gerät',
    listen: 'Hören',
    stop: 'Stoppen',
    permission: 'Berechtigung...',
    light: 'Hell',
    dark: 'Dunkel',
    enableLight: 'Hellen Modus aktivieren',
    enableDark: 'Dunklen Modus aktivieren',
    introKicker: 'Live chromatischer Detektor',
    introTitle: 'CromaNota hört deine Mundharmonika',
    introDescription: 'Sieh Zelle, Schieber und Skalenabweichungen während du spielst.',
    developedBy: 'Entwickelt von Emil Gonzalez',
    rotateTitle: 'Bildschirm drehen',
    rotateDescription: 'Querformat zeigt die ganze Mundharmonika.',
    listening: 'Hört zu',
    requesting: 'Berechtigung anfragen',
    idle: 'Mikrofon aus',
    error: 'Fehler',
    tuned: 'gestimmt',
    cents: 'Cent',
    draw: 'Ziehen',
    blow: 'Blasen',
    hole: 'Loch',
    holes: 'Löcher',
    voices: 'Stimmen',
    noMicAccess: 'Kein Zugriff auf das Mikrofon.',
    unsupportedMic: 'Dieser Browser stellt getUserMedia für das Mikrofon nicht bereit.',
    fallbackMic: 'Fallback auf das Standardmikrofon nach Fehler:',
    liveRegionLabel: 'Erkannte Mundharmonika-Note',
    mainControls: 'Hauptsteuerung',
    harmonicaType: 'Mundharmonika-Typ',
  },
  fr: {
    seo: {
      title: 'CromaNota | Détecteur de notes pour harmonica chromatique en temps réel',
      description:
        'Une application simple pour détecter les notes de votre harmonica chromatique en temps réel. Utilisez le micro pour voir la note, le trou et la tirette.',
      keywords: `${sharedKeywords}, harmonica chromatique, détecteur de notes harmonica, accordeur harmonica`,
      locale: 'fr_FR',
    },
    project: 'Projet',
    key: 'Tonalité',
    major: 'majeur',
    mic: 'Micro',
    defaultMic: 'Micro par défaut',
    activeMic: 'Micro actif',
    noDevice: 'Aucun appareil',
    listen: 'Écouter',
    stop: 'Arrêter',
    permission: 'Permission...',
    light: 'Clair',
    dark: 'Sombre',
    enableLight: 'Activer le mode clair',
    enableDark: 'Activer le mode sombre',
    introKicker: 'Détecteur chromatique en direct',
    introTitle: 'CromaNota écoute votre harmonica',
    introDescription: 'Voyez la cellule exacte, la tirette et les altérations pendant que vous jouez.',
    developedBy: 'Développé par Emil Gonzalez',
    rotateTitle: 'Tournez l’écran',
    rotateDescription: 'Utilisez le mode paysage pour voir tout l’harmonica.',
    listening: 'Écoute',
    requesting: 'Demande d’autorisation',
    idle: 'Micro éteint',
    error: 'Erreur',
    tuned: 'juste',
    cents: 'cents',
    draw: 'Aspiré',
    blow: 'Soufflé',
    hole: 'Trou',
    holes: 'trous',
    voices: 'voix',
    noMicAccess: 'Impossible d’accéder au microphone.',
    unsupportedMic: 'Ce navigateur n’expose pas getUserMedia pour le micro.',
    fallbackMic: 'Retour au micro par défaut après erreur :',
    liveRegionLabel: 'Note détectée de l’harmonica',
    mainControls: 'Commandes principales',
    harmonicaType: 'Type d’harmonica',
  },
  pt: {
    seo: {
      title: 'CromaNota | Detector de notas para harmônica cromática em tempo real',
      description:
        'Um app simples para detectar notas de harmônica cromática em tempo real. Use o microfone para ver nota, furo e posição da chave.',
      keywords: `${sharedKeywords}, harmônica cromática, detector de notas de harmônica, afinador de harmônica`,
      locale: 'pt_BR',
    },
    project: 'Projeto',
    key: 'Tonalidade',
    major: 'maior',
    mic: 'Mic',
    defaultMic: 'Microfone padrão',
    activeMic: 'Microfone ativo',
    noDevice: 'Sem dispositivo',
    listen: 'Ouvir',
    stop: 'Parar',
    permission: 'Permissão...',
    light: 'Claro',
    dark: 'Escuro',
    enableLight: 'Ativar modo claro',
    enableDark: 'Ativar modo escuro',
    introKicker: 'Detector cromático ao vivo',
    introTitle: 'CromaNota escuta sua harmônica',
    introDescription: 'Veja a célula exata, a chave e as alterações enquanto toca.',
    developedBy: 'Desenvolvido por Emil Gonzalez',
    rotateTitle: 'Gire a tela',
    rotateDescription: 'Use na horizontal para ver a harmônica completa.',
    listening: 'Ouvindo',
    requesting: 'Pedindo permissão',
    idle: 'Microfone desligado',
    error: 'Erro',
    tuned: 'afinada',
    cents: 'cents',
    draw: 'Aspirada',
    blow: 'Soprada',
    hole: 'Furo',
    holes: 'furos',
    voices: 'vozes',
    noMicAccess: 'Não foi possível acessar o microfone.',
    unsupportedMic: 'Este navegador não expõe getUserMedia para o microfone.',
    fallbackMic: 'Fallback para o microfone padrão após erro:',
    liveRegionLabel: 'Nota detectada da harmônica',
    mainControls: 'Controles principais',
    harmonicaType: 'Tipo de harmônica',
  },
  it: {
    seo: {
      title: 'CromaNota | Rilevatore note per armonica cromatica in tempo reale',
      description:
        'Una semplice app per rilevare le note dell’armonica cromatica in tempo reale. Usa il microfono per vedere nota, foro e registro.',
      keywords: `${sharedKeywords}, armonica cromatica, rilevatore note armonica, accordatore armonica`,
      locale: 'it_IT',
    },
    project: 'Progetto',
    key: 'Tonalità',
    major: 'maggiore',
    mic: 'Mic',
    defaultMic: 'Microfono predefinito',
    activeMic: 'Microfono attivo',
    noDevice: 'Nessun dispositivo',
    listen: 'Ascolta',
    stop: 'Ferma',
    permission: 'Permesso...',
    light: 'Chiaro',
    dark: 'Scuro',
    enableLight: 'Attiva modalità chiara',
    enableDark: 'Attiva modalità scura',
    introKicker: 'Rilevatore cromatico live',
    introTitle: 'CromaNota ascolta la tua armonica',
    introDescription: 'Vedi cella, registro e alterazioni mentre suoni.',
    developedBy: 'Sviluppato da Emil Gonzalez',
    rotateTitle: 'Ruota lo schermo',
    rotateDescription: 'Usa il telefono in orizzontale per vedere tutta l’armonica.',
    listening: 'In ascolto',
    requesting: 'Richiesta permesso',
    idle: 'Microfono spento',
    error: 'Errore',
    tuned: 'intonata',
    cents: 'cent',
    draw: 'Aspirata',
    blow: 'Soffiata',
    hole: 'Foro',
    holes: 'fori',
    voices: 'voci',
    noMicAccess: 'Impossibile accedere al microfono.',
    unsupportedMic: 'Questo browser non espone getUserMedia per il microfono.',
    fallbackMic: 'Fallback al microfono predefinito dopo errore:',
    liveRegionLabel: 'Nota rilevata dell’armonica',
    mainControls: 'Controlli principali',
    harmonicaType: 'Tipo di armonica',
  },
  ja: {
    seo: {
      title: 'CromaNota | クロマチックハーモニカ音名検出アプリ',
      description:
        'クロマチックハーモニカの音をリアルタイムで検出するシンプルなアプリ。マイクで音名、穴番号、スライド位置を表示します。',
      keywords: `${sharedKeywords}, クロマチックハーモニカ, ハーモニカ音名検出, ハーモニカチューナー`,
      locale: 'ja_JP',
    },
    project: 'プロジェクト',
    key: 'キー',
    major: 'メジャー',
    mic: 'マイク',
    defaultMic: 'デフォルトマイク',
    activeMic: '使用中のマイク',
    noDevice: 'デバイスなし',
    listen: '聴く',
    stop: '停止',
    permission: '許可中...',
    light: 'ライト',
    dark: 'ダーク',
    enableLight: 'ライトモードにする',
    enableDark: 'ダークモードにする',
    introKicker: 'リアルタイム検出',
    introTitle: 'CromaNota がハーモニカを聴き取ります',
    introDescription: '演奏中の音、穴、スライド位置を確認できます。',
    developedBy: '開発 Emil Gonzalez',
    rotateTitle: '画面を回転',
    rotateDescription: '横向きで全体を表示できます。',
    listening: '聴取中',
    requesting: '許可を要求中',
    idle: 'マイクオフ',
    error: 'エラー',
    tuned: '正確',
    cents: 'セント',
    draw: '吸音',
    blow: '吹音',
    hole: '穴',
    holes: '穴',
    voices: 'リード',
    noMicAccess: 'マイクにアクセスできません。',
    unsupportedMic: 'このブラウザはマイク用 getUserMedia に対応していません。',
    fallbackMic: 'エラー後にデフォルトマイクへ切り替え:',
    liveRegionLabel: '検出されたハーモニカ音',
    mainControls: 'メイン操作',
    harmonicaType: 'ハーモニカの種類',
  },
  ko: {
    seo: {
      title: 'CromaNota | 실시간 크로매틱 하모니카 음 감지기',
      description: '마이크로 연주 중인 크로매틱 하모니카의 음, 홀, 슬라이드 위치를 실시간으로 확인하는 간단한 앱입니다.',
      keywords: `${sharedKeywords}, 크로매틱 하모니카, 하모니카 음 감지기, 하모니카 튜너`,
      locale: 'ko_KR',
    },
    project: '프로젝트',
    key: '키',
    major: '장조',
    mic: '마이크',
    defaultMic: '기본 마이크',
    activeMic: '활성 마이크',
    noDevice: '장치 없음',
    listen: '듣기',
    stop: '정지',
    permission: '권한 요청...',
    light: '라이트',
    dark: '다크',
    enableLight: '라이트 모드 켜기',
    enableDark: '다크 모드 켜기',
    introKicker: '실시간 크로매틱 감지',
    introTitle: 'CromaNota가 하모니카를 듣습니다',
    introDescription: '연주 중 정확한 음, 홀, 슬라이드 위치를 확인하세요.',
    developedBy: 'Emil Gonzalez 개발',
    rotateTitle: '화면을 돌리세요',
    rotateDescription: '가로 모드에서 전체 하모니카를 볼 수 있습니다.',
    listening: '듣는 중',
    requesting: '권한 요청 중',
    idle: '마이크 꺼짐',
    error: '오류',
    tuned: '정확함',
    cents: '센트',
    draw: '들이마심',
    blow: '내쉼',
    hole: '홀',
    holes: '홀',
    voices: '리드',
    noMicAccess: '마이크에 접근할 수 없습니다.',
    unsupportedMic: '이 브라우저는 마이크 getUserMedia를 지원하지 않습니다.',
    fallbackMic: '오류 후 기본 마이크로 전환:',
    liveRegionLabel: '감지된 하모니카 음',
    mainControls: '주요 컨트롤',
    harmonicaType: '하모니카 유형',
  },
  ru: {
    seo: {
      title: 'CromaNota | Детектор нот хроматической губной гармоники',
      description:
        'Простое приложение для определения нот хроматической губной гармоники в реальном времени. Включите микрофон и смотрите ноту, отверстие и слайдер.',
      keywords: `${sharedKeywords}, хроматическая губная гармоника, детектор нот гармоники, тюнер гармоники`,
      locale: 'ru_RU',
    },
    project: 'Проект',
    key: 'Тональность',
    major: 'мажор',
    mic: 'Микрофон',
    defaultMic: 'Микрофон по умолчанию',
    activeMic: 'Активный микрофон',
    noDevice: 'Нет устройства',
    listen: 'Слушать',
    stop: 'Стоп',
    permission: 'Разрешение...',
    light: 'Светлая',
    dark: 'Темная',
    enableLight: 'Включить светлую тему',
    enableDark: 'Включить темную тему',
    introKicker: 'Живой хроматический детектор',
    introTitle: 'CromaNota слушает вашу гармонику',
    introDescription: 'Видите точную ячейку, слайдер и альтерации во время игры.',
    developedBy: 'Разработано Emil Gonzalez',
    rotateTitle: 'Поверните экран',
    rotateDescription: 'В альбомном режиме видна вся гармоника.',
    listening: 'Слушаю',
    requesting: 'Запрос разрешения',
    idle: 'Микрофон выключен',
    error: 'Ошибка',
    tuned: 'точно',
    cents: 'центов',
    draw: 'Вдох',
    blow: 'Выдох',
    hole: 'Отверстие',
    holes: 'отверстий',
    voices: 'голосов',
    noMicAccess: 'Не удалось получить доступ к микрофону.',
    unsupportedMic: 'Этот браузер не предоставляет getUserMedia для микрофона.',
    fallbackMic: 'Переход к микрофону по умолчанию после ошибки:',
    liveRegionLabel: 'Определенная нота гармоники',
    mainControls: 'Основные элементы управления',
    harmonicaType: 'Тип гармоники',
  },
}

export function detectLocale(languages = []) {
  const candidates = languages.length > 0 ? languages : ['en']

  for (const language of candidates) {
    const normalized = language.toLowerCase()
    const base = normalized.split('-')[0]

    if (normalized.startsWith('zh')) {
      return 'zh'
    }

    if (SUPPORTED_LOCALES.includes(base)) {
      return base
    }
  }

  return 'en'
}

export function getTranslator(locale) {
  const dictionary = I18N[locale] ?? I18N.en

  return (key) => dictionary[key] ?? I18N.en[key] ?? key
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value)
  })
}

export function applyLocalizedSeo(locale) {
  const current = I18N[locale] ?? I18N.en
  const canonicalUrl = window.location.origin + window.location.pathname

  document.documentElement.lang = locale
  document.title = current.seo.title

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: current.seo.description,
  })
  upsertMeta('meta[name="keywords"]', {
    name: 'keywords',
    content: current.seo.keywords,
  })
  upsertMeta('meta[name="application-name"]', {
    name: 'application-name',
    content: 'CromaNota',
  })
  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: current.seo.title,
  })
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: current.seo.description,
  })
  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: 'website',
  })
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: current.seo.locale,
  })
  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  })
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary',
  })
  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: current.seo.title,
  })
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: current.seo.description,
  })

  let canonical = document.head.querySelector('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', canonicalUrl)
}

export function buildSoftwareSchema(locale) {
  const current = I18N[locale] ?? I18N.en
  const appUrl = window.location.origin + window.location.pathname

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CromaNota',
    applicationCategory: 'MusicApplication',
    operatingSystem: 'Web browser',
    url: appUrl,
    inLanguage: SUPPORTED_LOCALES,
    description: current.seo.description,
    creator: {
      '@type': 'Person',
      name: 'Emil Gonzalez',
      email: 'emilrichardo@gmail.com',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}
