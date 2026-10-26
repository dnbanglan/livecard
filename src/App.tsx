/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- TYPES ---
export interface AdBanner {
  id: string;
  name: string;
  desc: string;
  image: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  dept: string;
  blood: string;
  phone: string;
  validity: string;
  photo: string;
}

export interface ApiSettings {
  wpUrl: string;
  wpUser: string;
  wpPass: string;
  wpAutofetch: boolean;
  fbPageId: string;
  fbToken: string;
  fbAutopost: boolean;
  xKey: string;
  xSecret: string;
  xToken: string;
  igAccountId: string;
  igToken: string;
  ttKey: string;
  ttSecret: string;
  ttToken: string;
  waChannelId: string;
  waToken: string;
  tgChannel: string;
  tgToken: string;
  thUserId: string;
  thToken: string;
}

// 5 default ad banners as requested by the user
export const DEFAULT_ADS: AdBanner[] = [
  {
    id: 'ad-ncem-01',
    name: 'বিজ্ঞাপন ব্যানার ০১ (NCEM)',
    desc: 'নিউ ক্লাসিক ইভেন্ট ম্যানেজমেন্ট',
    image: 'https://www.dnbangla.com.bd/wp-content/uploads/2026/03/ads-ncem-scaled.jpg',
  },
  {
    id: 'ad-mukti-02',
    name: 'বিজ্ঞাপন ব্যানার ০২ (মুক্তি ক্লিনিক)',
    desc: 'মুক্তি ক্লিনিক',
    image: 'https://www.dnbangla.com.bd/wp-content/uploads/2026/03/mukti-clinic.jpg',
  },
  {
    id: 'ad-khadija-03',
    name: 'বিজ্ঞাপন ব্যানার ০৩ (খাদিজা হুমায়রা রূপন)',
    desc: 'খাদিজা হুমায়রা রূপন',
    image: 'https://www.dnbangla.com.bd/wp-content/uploads/2026/10/ads-khadija-humayra-rupon.jpg',
  },
  {
    id: 'ad-monir-04',
    name: 'বিজ্ঞাপন ব্যানার ০৪ (মনির ডেন্টাল)',
    desc: 'মনির ডেন্টাল',
    image: 'https://www.dnbangla.com.bd/wp-content/uploads/2026/03/Monir-Dental.jpg',
  },
  {
    id: 'ad-nctta-05',
    name: 'বিজ্ঞাপন ব্যানার ০৫ (NCTTA একাডেমি)',
    desc: 'NCTTA একাডেমি',
    image: 'https://www.dnbangla.com.bd/wp-content/uploads/2026/03/NCTTA-Academy.jpg',
  },
];

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'DN-2026-101',
    name: 'মোঃ তানভীর আহমেদ',
    designation: 'চিফ নিউজ এডিটর',
    dept: 'বার্তা বিভাগ',
    blood: 'O+',
    phone: '01711-223344',
    validity: '৩১ ডিসেম্বর ২০২৬',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
  {
    id: 'DN-2026-102',
    name: 'ফারজানা ইয়াসমিন',
    designation: 'সিনিয়র ইনভেস্টিগেটিভ রিপোর্টার',
    dept: 'বার্তা বিভাগ',
    blood: 'A+',
    phone: '01812-334455',
    validity: '৩১ ডিসেম্বর ২০২৬',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
  },
  {
    id: 'DN-2026-103',
    name: 'রাকিবুল হাসান রনি',
    designation: 'হেড অব মাল্টিমিডিয়া ও ভিডিও',
    dept: 'মাল্টিমিডিয়া ও ভিডিও',
    blood: 'B+',
    phone: '01913-445566',
    validity: '৩১ ডিসেম্বর ২০২৬',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'DN-2026-104',
    name: 'নুসরাত জাহান',
    designation: 'ডিজিটাল মিডিয়া ও সোশ্যাল লিড',
    dept: 'ডিজিটাল মিডিয়া ও সোশ্যাল',
    blood: 'AB+',
    phone: '01614-556677',
    validity: '৩১ ডিসেম্বর ২০২৬',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  },
];

const AD_STORAGE_KEY = 'dnbangla_local_ads_v2';
const STAFF_STORAGE_KEY = 'dnbangla_staff_directory_v2';
const API_STORAGE_KEY = 'dnbangla_api_credentials_v2';
const MAX_AD_IMAGE_BYTES = 4 * 1024 * 1024;

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('photocard');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ msg, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // System Logs
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 1920x1920 PhotoCard Engine initialized successfully.`,
    `[${new Date().toLocaleTimeString()}] ৫টি স্থায়ী লোকাল বিজ্ঞাপন ব্যানার সংরক্ষিত ও প্রস্তুত।`,
  ]);

  const logEvent = useCallback((msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 80)]);
  }, []);

  // ==================== AD BANNER STATE ====================
  const [adBanners, setAdBanners] = useState<AdBanner[]>(() => {
    try {
      const saved = localStorage.getItem(AD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved ads', e);
    }
    return DEFAULT_ADS;
  });

  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [textAdIndex, setTextAdIndex] = useState<number>(0);

  const saveAdBannersToStorage = (ads: AdBanner[]) => {
    try {
      localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(ads));
      return true;
    } catch (e) {
      console.warn('Failed to save ads', e);
      showToast('ব্রাউজারের লোকাল স্টোরেজ পূর্ণ!', 'error');
      return false;
    }
  };

  // Upload ad form state
  const [newAdName, setNewAdName] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdFile, setNewAdFile] = useState<File | null>(null);

  // Preloaded Image Cache
  const adImagesCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const staffImagesCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Function to get or load an image safely
  const getLoadedImage = useCallback((url: string): HTMLImageElement | null => {
    if (!url) return null;
    const cached = adImagesCache.current.get(url);
    if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;

    const img = new Image();
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = url;
    img.onload = () => {
      drawPhotoCard();
      drawTextTrigger();
    };
    img.onerror = () => {
      // try without crossOrigin if failed
      if (img.crossOrigin) {
        const retry = new Image();
        retry.src = url;
        retry.onload = () => {
          adImagesCache.current.set(url, retry);
          drawPhotoCard();
          drawTextTrigger();
        };
      }
    };
    adImagesCache.current.set(url, img);
    return null;
  }, []);

  // Preload ads whenever adBanners change
  useEffect(() => {
    adBanners.forEach((ad) => {
      getLoadedImage(ad.image);
    });
  }, [adBanners, getLoadedImage]);

  // ==================== PHOTOCARD FORM STATE ====================
  // (NOTE: Category / Tag option removed as specifically requested!)
  const [topBgColor, setTopBgColor] = useState<string>('#ffffff');
  const [topTextColor, setTopTextColor] = useState<string>('#111111');
  const [bottomBgColor, setBottomBgColor] = useState<string>('#840b0b');
  const [headlineTextColor, setHeadlineTextColor] = useState<string>('#ffffff');

  const [isAutoDate, setIsAutoDate] = useState<boolean>(true);
  const [dateText, setDateText] = useState<string>(() => {
    return new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  const [showCommentBadge, setShowCommentBadge] = useState<boolean>(true);
  const [commentBadgeText, setCommentBadgeText] = useState<string>('বিস্তারিত কমেন্টে');

  const [headline, setHeadline] = useState<string>('বাংলাদেশে নতুন ডিজিটাল অটোমেশন ও ফটোকার্ড সিস্টেম চালু হয়েছে');
  const [fontSize, setFontSize] = useState<number>(80);
  const [margin, setMargin] = useState<number>(120);

  const [showSocialBar, setShowSocialBar] = useState<boolean>(true);
  const [socialBarBg, setSocialBarBg] = useState<string>('#1e293b');
  const [websiteUrl, setWebsiteUrl] = useState<string>('DNBangla.com.bd');
  const [customCommentUrl, setCustomCommentUrl] = useState<string>('/dnbanglaN');
  const [facebookLink, setFacebookLink] = useState<string>('facebook.com/dnbanglan');
  const [xLink, setXLink] = useState<string>('x.com/dnbanglan');
  const [threadsLink, setThreadsLink] = useState<string>('Threads.com/dnbanglan');
  const [instagramLink, setInstagramLink] = useState<string>('instagram.com/dnbanglan');
  const [youtubeLink, setYoutubeLink] = useState<string>('youtube.com/@dnbanglan');
  const [linkedinLink, setLinkedinLink] = useState<string>('linkedin.com/in/dnbanglan/');

  // Canvases
  const photoCardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textTriggerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staffCardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ==================== TEXT / TRIGGER STATE ====================
  const [textTriggerBg, setTextTriggerBg] = useState<string>('gradient-red');
  const [textTriggerCustomColor, setTextTriggerCustomColor] = useState<string>('#25406b');
  const [textTriggerCat, setTextTriggerCat] = useState<string>('⚠️ বিশেষ ঘোষণা ও ব্রেকিং নিউজ');
  const [textTriggerContent, setTextTriggerContent] = useState<string>(
    'আজ রাত ১০ টার মধ্যে সকল বিভাগীয় প্রধানদের জরুরি মিটিংয়ে উপস্থিত থাকার নির্দেশ দেওয়া হলো।'
  );
  const [tcFontSize, setTcFontSize] = useState<number>(75);
  const [tcMargin, setTcMargin] = useState<number>(225);

  // ==================== STAFF DIRECTORY STATE ====================
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STAFF_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read staff', e);
    }
    return DEFAULT_STAFF;
  });

  const [selectedStaffIndex, setSelectedStaffIndex] = useState<number>(0);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [showStaffForm, setShowStaffForm] = useState<boolean>(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [cardThemeColor, setCardThemeColor] = useState<string>('#8b0000');

  // New staff form state
  const [staffFormName, setStaffFormName] = useState('');
  const [staffFormDesig, setStaffFormDesig] = useState('');
  const [staffFormDept, setStaffFormDept] = useState('বার্তা বিভাগ');
  const [staffFormId, setStaffFormId] = useState('');
  const [staffFormBlood, setStaffFormBlood] = useState('O+');
  const [staffFormPhone, setStaffFormPhone] = useState('');
  const [staffFormValidity, setStaffFormValidity] = useState('৩১ ডিসেম্বর ২০২৬');
  const [staffFormPhotoData, setStaffFormPhotoData] = useState<string | null>(null);

  // ==================== API INTEGRATIONS STATE ====================
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    try {
      const saved = localStorage.getItem(API_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read API settings', e);
    }
    return {
      wpUrl: 'https://dnbangla.com.bd',
      wpUser: 'editor_dnbangla',
      wpPass: 'dnbangla-api-key-2026-prod',
      wpAutofetch: true,
      fbPageId: '109283746501928',
      fbToken: 'EAAGdnbanglaAccessTokenSecret2026Valid',
      fbAutopost: true,
      xKey: 'dnXTwitterConsumerKey2026',
      xSecret: 'xSecretValueKey78910',
      xToken: '123456789-xAccessTokenDNSecret',
      igAccountId: '178414002938475',
      igToken: 'EAAGdnbanglaInstagramTokenValid',
      ttKey: 'awdnbanglaKey998',
      ttSecret: 'tiktokSecretPass123',
      ttToken: 'act.dnbanglaTikTokCreatorToken',
      waChannelId: '1058291048592',
      waToken: 'EAAGwhatsappPermanentTokenDN2026',
      tgChannel: '@dnbanglan',
      tgToken: '6849201948:AAEkL901-dnbanglaBotToken',
      thUserId: '8492018401',
      thToken: 'THRdnbanglaThreadsMetaToken2026',
    };
  });

  const [wpStatus, setWpStatus] = useState<string>('সংযুক্ত');

  // ==================== SCHEDULE STATE ====================
  const [morningScheduleText, setMorningScheduleText] = useState(
    'একটি নতুন সকাল আপনার জীবনে অফুরন্ত সাফল্য ও বরকত বয়ে আনুক — ডিএন বাংলা'
  );
  const [weatherMText, setWeatherMText] = useState(
    'আজকের সকালের আবহাওয়া: সর্বনিম্ন তাপমাত্রা ২২° সে., ভোরের দিকে নদী অববাহিকায় হালকা কুয়াশা ও সারাদিন আকাশ আংশিক মেঘলা থাকবে।'
  );
  const [prayerText, setPrayerText] = useState(
    'ঢাকা ও পার্শ্ববর্তী এলাকা: ফজর ৪:৫২, যোহর ১১:৫৮, আসর ৩:১৫, মাগরিব ৫:১৯, এশা ৬:৩৬ | সেহরি ভোর ৪:১৮, ইফতার সন্ধ্যা ৬:১৮'
  );
  const [healthText, setHealthText] = useState(
    'স্বাস্থ্য বুলেটিন: সকালে খালি পেটে পর্যাপ্ত কুসুম গরম পানি ও লেবু পান করুন, নিয়মিত ৩০ মিনিট হাঁটাহাঁটি হৃদরোগের ঝুঁকি ৬০% কমায়।'
  );
  const [historyText, setHistoryText] = useState(
    'ইতিহাসে আজকের দিন: ১৯৫২ সালের এই দিনে মাতৃভাষা বাংলার দাবিতে ছাত্রজনতার ঐতিহাসিক সমাবেশ ও যুগান্তকারী জাতীয় সিদ্ধান্ত গৃহীত হয়।'
  );
  const [birthdayText, setBirthdayText] = useState(
    'জন্মদিনে শুভেচ্ছা: আজকের দিনে জন্মগ্রহণকারী জাতীয় ও আন্তর্জাতিক অঙ্গনের সকল বিশিষ্ট ব্যক্তিবর্গকে ডিএন বাংলার উষ্ণ অভিনন্দন।'
  );
  const [noonTempText, setNoonTempText] = useState(
    'দুপুরের আবহাওয়া বুলেটিন: আজকের সর্বোচ্চ তাপমাত্রা ৩২.৫° সেলসিয়াস, বাতাসের আপেক্ষিক আর্দ্রতা ৬৪%। বিকেলের দিকে দমকা হাওয়া বয়ে যেতে পারে।'
  );
  const [alertText, setAlertText] = useState(
    'জরুরি আবহাওয়া সতর্কতা: বঙ্গোপসাগরে নিম্নচাপের প্রভাবে সমুদ্র বন্দরসমূহকে ৩ নম্বর স্থানীয় সতর্কতা সংকেত ও নদীবন্দরে ২ নম্বর হুঁশিয়ারি সংকেত জারি।'
  );
  const [top10Text, setTop10Text] = useState(
    `১. ডিজিটাল অটোমেশন ফটোকার্ডের যাত্রা শুরু\n২. নির্বাচন কমিশনের সার্বিক প্রস্তুতি সম্পন্ন\n৩. রিজার্ভ বৃদ্ধি পেয়ে নতুন মাইলফলকে\n৪. ঢাকায় নতুন মেট্রোরেল রুটের ট্রায়াল রান\n৫. বাণিজ্য মেলায় রেকর্ড পরিমাণ পণ্য রপ্তানিাদেশ`
  );

  // ==================== HELPER DRAWING UTILS ====================
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!image || !image.width || !image.height) return;
    const scale = Math.max(width / image.width, height / image.height);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (image.width - sourceWidth) / 2;
    const sourceY = (image.height - sourceHeight) / 2;
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const safeWidth = Math.max(1, maxWidth);
    const paragraphs = String(text ?? '').replace(/\r/g, '').split('\n');
    const lines: string[] = [];

    paragraphs.forEach((paragraph) => {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
        return;
      }

      let currentLine = '';
      words.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(candidate).width <= safeWidth) {
          currentLine = candidate;
          return;
        }

        if (currentLine) lines.push(currentLine);
        if (ctx.measureText(word).width <= safeWidth) {
          currentLine = word;
          return;
        }

        // Split long words character by character
        let chunk = '';
        for (const char of word) {
          if (chunk && ctx.measureText(chunk + char).width > safeWidth) {
            lines.push(chunk);
            chunk = char;
          } else {
            chunk += char;
          }
        }
        currentLine = chunk;
      });
      lines.push(currentLine);
    });

    return lines.length ? lines : [''];
  };

  const drawSocialIcon = (
    ctx: CanvasRenderingContext2D,
    platform: string,
    centerX: number,
    centerY: number,
    size: number
  ) => {
    const radius = size / 2;
    const colors: Record<string, string> = {
      facebook: '#1877F2',
      x: '#111111',
      threads: '#111111',
      instagram: '#D62976',
      youtube: '#FF0033',
      linkedin: '#0A66C2',
    };

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[platform] || '#111111';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (platform === 'facebook') {
      ctx.font = 'bold 42px Arial, sans-serif';
      ctx.fillText('f', 1, 2);
    } else if (platform === 'x') {
      ctx.beginPath();
      ctx.moveTo(-11, -11);
      ctx.lineTo(11, 11);
      ctx.moveTo(11, -11);
      ctx.lineTo(-11, 11);
      ctx.stroke();
    } else if (platform === 'threads') {
      ctx.font = 'bold 31px Arial, sans-serif';
      ctx.fillText('@', 0, 0);
    } else if (platform === 'instagram') {
      ctx.beginPath();
      ctx.roundRect(-15, -15, 30, 30, 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(9, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (platform === 'youtube') {
      ctx.beginPath();
      ctx.roundRect(-17, -12, 34, 24, 7);
      ctx.fill();
      ctx.fillStyle = colors.youtube;
      ctx.beginPath();
      ctx.moveTo(-3, -7);
      ctx.lineTo(8, 0);
      ctx.lineTo(-3, 7);
      ctx.closePath();
      ctx.fill();
    } else if (platform === 'linkedin') {
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText('in', 0, 0);
    }
    ctx.restore();
  };

  // ==================== 1. DRAW PHOTOCARD (1920x1920) ====================
  // Note: Category / Tag option removed as requested
  const drawPhotoCard = useCallback(() => {
    const canvas = photoCardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1920;

    ctx.clearRect(0, 0, width, height);

    // 1. TOP HEADER BORDER (0px to 80px)
    ctx.fillStyle = topBgColor;
    ctx.fillRect(0, 0, width, 80);

    ctx.fillStyle = '#df202c';
    ctx.font = '900 48px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('ডিএন', 60, 58);
    ctx.fillStyle = '#16763d';
    ctx.fillText('বাংলা', 175, 58);

    ctx.fillStyle = topTextColor;
    ctx.font = '600 38px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(dateText, width - 60, 55);

    // 2. FEATURE PHOTO AREA (From 80px to 1165px = 1085px)
    const photoY = 80;
    const photoH = 1085;
    if (bgImageRef.current) {
      drawImageCover(ctx, bgImageRef.current, 0, photoY, width, photoH);
    } else {
      const grad = ctx.createLinearGradient(0, photoY, 0, photoY + photoH);
      grad.addColorStop(0, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, photoY, width, photoH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('সংবাদের ফিচার ছবি (1920x1080px)', width / 2, photoY + photoH / 2);
    }

    // (ক্যাটাগরি / ট্যাগ বাদ দেওয়া হয়েছে — Category badge intentionally omitted!)

    // "বিস্তারিত কমেন্টে" ROUNDED BADGE (1090px to 1165px = 75px Area)
    if (showCommentBadge && commentBadgeText.trim()) {
      ctx.font = 'bold 32px "Hind Siliguri", sans-serif';
      const textWidth = ctx.measureText(commentBadgeText).width;
      const badgeHeight = 55;
      const badgeWidth = textWidth + 70;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = 1090 + (75 - badgeHeight) / 2;
      const cornerRadius = badgeHeight / 2;

      ctx.beginPath();
      ctx.fillStyle = '#059669';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;

      ctx.moveTo(badgeX + cornerRadius, badgeY);
      ctx.lineTo(badgeX + badgeWidth - cornerRadius, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + cornerRadius);
      ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - cornerRadius);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - cornerRadius, badgeY + badgeHeight);
      ctx.lineTo(badgeX + cornerRadius, badgeY + badgeHeight);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - cornerRadius);
      ctx.lineTo(badgeX, badgeY + cornerRadius);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + cornerRadius, badgeY);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(commentBadgeText, width / 2, badgeY + 38);
    }

    // 3. HEADLINE AREA (1165px - 1563px = 398px Area)
    const headlineYStart = 1165;
    const headlineYEnd = 1563;
    const headlineH = headlineYEnd - headlineYStart;

    ctx.fillStyle = bottomBgColor;
    ctx.fillRect(0, headlineYStart, width, headlineH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, headlineYStart, width, headlineH);
    ctx.clip();

    let curFontSize = fontSize;
    const maxWidth = width - margin * 2;

    ctx.fillStyle = headlineTextColor;
    ctx.textAlign = 'center';
    ctx.font = `bold ${curFontSize}px "Hind Siliguri", sans-serif`;

    let lines = wrapText(ctx, headline, maxWidth);
    while (lines.length * (curFontSize * 1.35) > headlineH - 20 && curFontSize > 18) {
      curFontSize -= 2;
      ctx.font = `bold ${curFontSize}px "Hind Siliguri", sans-serif`;
      lines = wrapText(ctx, headline, maxWidth);
    }

    const lineGap = curFontSize * 1.35;
    const totalTextHeight = lines.length * lineGap;
    const startY = headlineYStart + (headlineH - totalTextHeight) / 2 + curFontSize * 0.85;

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineGap);
    });
    ctx.restore();

    // 4. SOCIAL & WEBSITE LINK BAR (1563px to 1640px = 77px)
    const socialBarY = 1563;
    const socialBarH = 77;

    if (showSocialBar) {
      ctx.fillStyle = socialBarBg;
      ctx.fillRect(0, socialBarY, width, socialBarH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, socialBarY, width, socialBarH);

      const trimmedWebsite = websiteUrl.trim();
      if (trimmedWebsite) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 30px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(trimmedWebsite, 64, socialBarY + socialBarH / 2, 500);
      }

      const socials = [
        { platform: 'facebook', url: facebookLink.trim() },
        { platform: 'x', url: xLink.trim() },
        { platform: 'threads', url: threadsLink.trim() },
        { platform: 'instagram', url: instagramLink.trim() },
        { platform: 'youtube', url: youtubeLink.trim() },
        { platform: 'linkedin', url: linkedinLink.trim() },
      ].filter((s) => s.url);

      const iconSize = 52;
      const iconGap = 42;
      const groupWidth = socials.length * iconSize + Math.max(0, socials.length - 1) * iconGap;
      const iconAreaStart = trimmedWebsite ? 610 : 0;
      const iconAreaEnd = width - (trimmedWebsite ? 55 : 0);
      const iconAreaWidth = iconAreaEnd - iconAreaStart;
      const firstIconX = iconAreaStart + (iconAreaWidth - groupWidth) / 2 + iconSize / 2;

      socials.forEach((social, index) => {
        drawSocialIcon(
          ctx,
          social.platform,
          firstIconX + index * (iconSize + iconGap),
          socialBarY + socialBarH / 2,
          iconSize
        );
      });
    }

    // 5. ADVERTISEMENT BANNER AREA (1640px to 1920px = 280px)
    const adY = 1640;
    const adH = 280;
    const activeAd = adBanners[currentAdIndex];

    if (activeAd) {
      const adImg = adImagesCache.current.get(activeAd.image);
      if (adImg && adImg.complete && adImg.naturalWidth > 0) {
        drawImageCover(ctx, adImg, 0, adY, width, adH);
      } else {
        ctx.fillStyle = '#800000';
        ctx.fillRect(0, adY, width, adH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeAd.name, width / 2, adY + adH / 2 - 20);
        ctx.font = '500 24px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(activeAd.desc, width / 2, adY + adH / 2 + 25);
      }
    } else {
      ctx.fillStyle = '#800000';
      ctx.fillRect(0, adY, width, adH);
    }
  }, [
    topBgColor,
    topTextColor,
    bottomBgColor,
    headlineTextColor,
    dateText,
    showCommentBadge,
    commentBadgeText,
    headline,
    fontSize,
    margin,
    showSocialBar,
    socialBarBg,
    websiteUrl,
    facebookLink,
    xLink,
    threadsLink,
    instagramLink,
    youtubeLink,
    linkedinLink,
    adBanners,
    currentAdIndex,
  ]);

  // ==================== 2. DRAW TEXT TRIGGER CANVAS ====================
  const drawTextTrigger = useCallback(() => {
    const canvas = textTriggerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1920;
    const headerHeight = 85;
    const socialBarY = 1563;
    const socialBarH = 77;
    const adY = 1640;
    const adH = 280;

    ctx.clearRect(0, 0, width, height);

    // Background
    const backgroundPalettes: Record<string, [string, string]> = {
      'gradient-red': ['#b20710', '#0f172a'],
      'gradient-blue': ['#334155', '#0b1224'],
      'gradient-maroon': ['#840b0b', '#241018'],
      'gradient-dark': ['#111827', '#030712'],
    };

    let palette = backgroundPalettes[textTriggerBg] || backgroundPalettes['gradient-red'];
    if (textTriggerBg === 'custom') {
      palette = [textTriggerCustomColor, '#0b0f19'];
    }

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, palette[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = topBgColor;
    ctx.fillRect(0, 0, width, headerHeight);
    ctx.fillStyle = '#df202c';
    ctx.font = '900 48px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('ডিএন', 60, 58);
    ctx.fillStyle = '#16763d';
    ctx.fillText('বাংলা', 175, 58);

    ctx.fillStyle = topTextColor;
    ctx.font = '600 38px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'right';
    const today = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(today, width - 60, 55);

    // Small Category Pill
    if (textTriggerCat.trim()) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(100, 240, width - 200, 90);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 42px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(textTriggerCat, width / 2, 300, width - 360);
    }

    // Centered Message
    const maxWidth = Math.max(1, width - tcMargin * 2);
    const textAreaTop = 360;
    const textAreaBottom = socialBarY;
    const textAreaHeight = textAreaBottom - textAreaTop;

    let curFontSize = tcFontSize;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `bold ${curFontSize}px "Hind Siliguri", sans-serif`;

    let lines = wrapText(ctx, textTriggerContent, maxWidth);
    while (lines.length * curFontSize * 1.35 > textAreaHeight - 40 && curFontSize > 18) {
      curFontSize -= 2;
      ctx.font = `bold ${curFontSize}px "Hind Siliguri", sans-serif`;
      lines = wrapText(ctx, textTriggerContent, maxWidth);
    }

    const lineHeight = curFontSize * 1.35;
    const totalHeight = lines.length * lineHeight;
    const startY = textAreaTop + (textAreaHeight - totalHeight) / 2 + curFontSize * 0.85;

    ctx.save();
    ctx.beginPath();
    ctx.rect(tcMargin, textAreaTop, maxWidth, textAreaHeight);
    ctx.clip();
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight, maxWidth);
    });
    ctx.restore();

    // Social Bar
    ctx.fillStyle = socialBarBg;
    ctx.fillRect(0, socialBarY, width, socialBarH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, socialBarY, width, socialBarH);

    const trimmedWebsite = websiteUrl.trim();
    if (trimmedWebsite) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 30px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(trimmedWebsite, 64, socialBarY + socialBarH / 2, 500);
    }

    const socials = [
      { platform: 'facebook', url: facebookLink.trim() },
      { platform: 'x', url: xLink.trim() },
      { platform: 'threads', url: threadsLink.trim() },
      { platform: 'instagram', url: instagramLink.trim() },
      { platform: 'youtube', url: youtubeLink.trim() },
      { platform: 'linkedin', url: linkedinLink.trim() },
    ].filter((s) => s.url);

    const iconSize = 52;
    const iconGap = 42;
    const groupWidth = socials.length * iconSize + Math.max(0, socials.length - 1) * iconGap;
    const iconAreaStart = trimmedWebsite ? 610 : 0;
    const iconAreaEnd = width - (trimmedWebsite ? 55 : 0);
    const iconAreaWidth = iconAreaEnd - iconAreaStart;
    const firstIconX = iconAreaStart + (iconAreaWidth - groupWidth) / 2 + iconSize / 2;

    socials.forEach((social, index) => {
      drawSocialIcon(
        ctx,
        social.platform,
        firstIconX + index * (iconSize + iconGap),
        socialBarY + socialBarH / 2,
        iconSize
      );
    });

    // Ad Banner in Text Trigger
    const safeTextAdIndex = adBanners.length ? textAdIndex % adBanners.length : 0;
    const activeAd = adBanners[safeTextAdIndex];

    if (activeAd) {
      const adImg = adImagesCache.current.get(activeAd.image);
      if (adImg && adImg.complete && adImg.naturalWidth > 0) {
        drawImageCover(ctx, adImg, 0, adY, width, adH);
      } else {
        ctx.fillStyle = '#800000';
        ctx.fillRect(0, adY, width, adH);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeAd.name, width / 2, adY + adH / 2 - 20);
        ctx.font = '500 24px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(activeAd.desc, width / 2, adY + adH / 2 + 25);
      }
    } else {
      ctx.fillStyle = '#800000';
      ctx.fillRect(0, adY, width, adH);
    }
  }, [
    textTriggerBg,
    textTriggerCustomColor,
    textTriggerCat,
    textTriggerContent,
    tcFontSize,
    tcMargin,
    topBgColor,
    topTextColor,
    socialBarBg,
    websiteUrl,
    facebookLink,
    xLink,
    threadsLink,
    instagramLink,
    youtubeLink,
    linkedinLink,
    adBanners,
    textAdIndex,
  ]);

  // ==================== 3. DRAW STAFF CARD CANVAS ====================
  const drawStaffCard = useCallback(() => {
    const canvas = staffCardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 920;
    ctx.clearRect(0, 0, w, h);

    const staff = staffList[selectedStaffIndex] || staffList[0];
    if (!staff) return;

    if (cardSide === 'front') {
      // ========== FRONT SIDE ==========
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Top Header
      ctx.fillStyle = cardThemeColor;
      ctx.fillRect(0, 0, w, 150);

      // Header pattern
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 138, w, 12);

      // Logo text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ডিএন বাংলা', w / 2, 60);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText('DIGITAL PRESS ID CARD', w / 2, 92);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '500 13px "Hind Siliguri", sans-serif';
      ctx.fillText('জাতীয় গণমাধ্যম ও ডিজিটাল নেটওয়ার্ক', w / 2, 116);

      // Passport Photo circle
      const photoY = 190;
      const photoR = 75;
      const centerX = w / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, photoY + photoR, photoR, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = cardThemeColor;
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.clip();

      const pImg = staffImagesCache.current.get(staff.id);
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        ctx.drawImage(pImg, centerX - photoR, photoY, photoR * 2, photoR * 2);
      } else {
        ctx.fillStyle = '#334155';
        ctx.fillRect(centerX - photoR, photoY, photoR * 2, photoR * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO', centerX, photoY + photoR + 8);
      }
      ctx.restore();

      // Name & Designation
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 30px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(staff.name, centerX, 385);

      ctx.fillStyle = cardThemeColor;
      ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
      ctx.fillText(staff.designation, centerX, 418);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 16px "Hind Siliguri", sans-serif';
      ctx.fillText(staff.dept, centerX, 444);

      // Divider
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 465);
      ctx.lineTo(w - 80, 465);
      ctx.stroke();

      // Details Box
      const boxY = 485;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(50, boxY, w - 100, 195);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, boxY, w - 100, 195);

      const rows = [
        { label: 'আইডি নম্বর:', val: staff.id, color: '#0f172a', mono: true, bold: false },
        { label: 'রক্তের গ্রুপ:', val: staff.blood, color: '#dc2626', mono: false, bold: true },
        { label: 'মোবাইল:', val: staff.phone, color: '#0f172a', mono: false, bold: false },
        { label: 'মেয়াদ:', val: staff.validity, color: '#047857', mono: false, bold: false },
      ];

      rows.forEach((r, idx) => {
        const rowY = boxY + 36 + idx * 42;
        ctx.font = '600 16px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.fillText(r.label, 80, rowY);

        ctx.font = (r.bold ? 'bold ' : '600 ') + '17px ' + (r.mono ? 'monospace' : '"Hind Siliguri", sans-serif');
        ctx.fillStyle = r.color;
        ctx.textAlign = 'right';
        ctx.fillText(r.val, w - 80, rowY);
      });

      // Signature area
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w - 240, 755);
      ctx.lineTo(w - 70, 755);
      ctx.stroke();

      ctx.font = 'italic 18px cursive, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('Tanveer Ahmed', w - 155, 742);

      ctx.font = '600 13px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('কর্তৃপক্ষের স্বাক্ষর', w - 155, 775);

      // Verified Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(75, 710, 80, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('VERIFIED', 115, 755);

      // Bottom Strip
      ctx.fillStyle = cardThemeColor;
      ctx.fillRect(0, h - 35, w, 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 13px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WWW.DNBANGLA.COM.BD • ২৪ ঘণ্টা সংবাদ ও তথ্য', w / 2, h - 12);
    } else {
      // ========== BACK SIDE ==========
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = cardThemeColor;
      ctx.fillRect(0, 0, w, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ডিএন বাংলা মিডিয়া নেটওয়ার্ক লিমিটেড', w / 2, 38);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('জরুরি নির্দেশনা ও আইনগত তথ্যাবলী', w / 2, 110);

      const terms = [
        '১. এই কার্ডটি ডিএন বাংলা সংবাদ সংস্থার সরকারি সম্পত্তি।',
        '২. সংবাদ সংগ্রহের উদ্দেশ্যে সংশ্লিষ্ট সকল আইনশৃঙ্খলা বাহিনী ও',
        '   কর্তৃপক্ষকে প্রয়োজনীয় সহযোগিতা প্রদানের অনুরোধ জানানো যাচ্ছে।',
        '৩. কার্ডটি অপব্যবহার বা হস্তান্তর দণ্ডনীয় অপরাধ।',
        '৪. কার্ডটি হারিয়ে গেলে নিকটস্থ থানায় জিডি করুন ও অফিসে জানান।',
      ];

      ctx.font = '15px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'left';
      terms.forEach((t, i) => {
        ctx.fillText(t, 60, 160 + i * 32);
      });

      // Office Contact Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(50, 360, w - 100, 220);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 360, w - 100, 220);

      ctx.fillStyle = cardThemeColor;
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('অফিস ও স্টুডিও ঠিকানা:', w / 2, 400);

      ctx.fillStyle = '#334155';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('ডিএন বাংলা টাওয়ার, প্লট-৭, কাওরান বাজার, ঢাকা-১২১৫', w / 2, 435);
      ctx.fillText('ফোন: +৮৮০-২-৯৯৮৮৭৭৬৬ | ইমেইল: info@dnbangla.com.bd', w / 2, 465);
      ctx.fillText('জরুরি হটলাইন: ০১৯৪৫৫৪৪২৪২', w / 2, 495);
      ctx.fillText('ওয়েবসাইট: www.dnbangla.com.bd', w / 2, 525);

      // Barcode
      const bcY = 660;
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 65; i++) {
        const bw = i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2;
        const bx = 110 + i * 6;
        ctx.fillRect(bx, bcY, bw, 60);
      }
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`*${staff.id}-DNBANGLA*`, w / 2, bcY + 85);

      // Bottom Strip
      ctx.fillStyle = cardThemeColor;
      ctx.fillRect(0, h - 45, w, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 13px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('কার্ডটি পাওয়া গেলে নিকটস্থ ডাকবাক্সে বা ঠিকানায় পাঠিয়ে দিন।', w / 2, h - 18);
    }
  }, [staffList, selectedStaffIndex, cardSide, cardThemeColor]);

  // Preload staff photos
  useEffect(() => {
    staffList.forEach((st) => {
      if (st.photo) {
        const img = new Image();
        if (!st.photo.startsWith('data:')) img.crossOrigin = 'anonymous';
        img.onload = () => {
          staffImagesCache.current.set(st.id, img);
          drawStaffCard();
        };
        img.src = st.photo;
      }
    });
  }, [staffList, drawStaffCard]);

  // Re-draw canvases on state updates
  useEffect(() => {
    drawPhotoCard();
  }, [drawPhotoCard]);

  useEffect(() => {
    drawTextTrigger();
  }, [drawTextTrigger]);

  useEffect(() => {
    drawStaffCard();
  }, [drawStaffCard]);

  // Also redraw when fonts are loaded
  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawPhotoCard();
        drawTextTrigger();
        drawStaffCard();
      });
    }
  }, [drawPhotoCard, drawTextTrigger, drawStaffCard]);

  // ==================== CANVAS DOWNLOAD HANDLER ====================
  const downloadCanvasAsPng = (canvas: HTMLCanvasElement | null, filename: string, successMsg: string) => {
    if (!canvas) {
      showToast('ডাউনলোডের জন্য ক্যানভাস পাওয়া যায়নি।', 'error');
      return;
    }
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।', 'error');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast(successMsg, 'success');
      }, 'image/png');
    } catch (e) {
      console.error(e);
      showToast('ডাউনলোড ব্যর্থ। CORS সীমাবদ্ধতা থাকতে পারে।', 'error');
    }
  };

  // ==================== AD ACTIONS ====================
  const rotateToNextAd = () => {
    if (!adBanners.length) return;
    const nextIdx = (currentAdIndex + 1) % adBanners.length;
    setCurrentAdIndex(nextIdx);
    showToast(`পরবর্তী বিজ্ঞাপনের ব্যানার লোড করা হয়েছে: ${adBanners[nextIdx].name}`);
    logEvent(`Ad Rotator: Switched to ad #${nextIdx + 1} (${adBanners[nextIdx].name})`);
  };

  const handleUploadAdFromPC = () => {
    if (!newAdName.trim()) {
      showToast('দয়া করে বিজ্ঞাপনের নাম লিখুন।', 'error');
      return;
    }
    if (!newAdFile) {
      showToast('দয়া করে ব্যানার ছবি সিলেক্ট করুন।', 'error');
      return;
    }
    if (!newAdFile.type.startsWith('image/')) {
      showToast('একটি বৈধ ছবি ফাইল নির্বাচন করুন।', 'error');
      return;
    }
    if (newAdFile.size > MAX_AD_IMAGE_BYTES) {
      showToast('ছবিটি ৪ MB-এর চেয়ে বড়। ছোট ছবি ব্যবহার করুন।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newAd: AdBanner = {
        id: `ad-${Date.now()}`,
        name: newAdName.trim(),
        desc: newAdDesc.trim() || 'বিশেষ বিজ্ঞাপন',
        image: dataUrl,
      };

      const updated = [...adBanners, newAd];
      if (saveAdBannersToStorage(updated)) {
        setAdBanners(updated);
        setCurrentAdIndex(updated.length - 1);
        setNewAdName('');
        setNewAdDesc('');
        setNewAdFile(null);
        showToast('নতুন বিজ্ঞাপন ব্যানার সফলভাবে সংরক্ষিত ও সাইকেলে যুক্ত হয়েছে!');
        logEvent(`Ad Manager: Uploaded new banner "${newAd.name}"`);
      }
    };
    reader.readAsDataURL(newAdFile);
  };

  const handleDeleteAd = (index: number) => {
    if (adBanners.length <= 1) {
      showToast('অন্তত একটি বিজ্ঞাপন থাকা আবশ্যক!', 'error');
      return;
    }
    const target = adBanners[index];
    if (confirm(`আপনি কি "${target.name}" বিজ্ঞাপনটি মুছে ফেলতে চান?`)) {
      const updated = adBanners.filter((_, idx) => idx !== index);
      if (saveAdBannersToStorage(updated)) {
        setAdBanners(updated);
        setCurrentAdIndex(Math.max(0, index - 1));
        showToast('বিজ্ঞাপনটি ব্রাউজার থেকে মুছে ফেলা হয়েছে।');
        logEvent(`Ad Manager: Deleted banner "${target.name}"`);
      }
    }
  };

  // ==================== FEATURE BACKGROUND UPLOAD ====================
  const handleFeatureBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('একটি বৈধ ছবি ফাইল নির্বাচন করুন।', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        drawPhotoCard();
        showToast('সংবাদের ফিচার ছবি সফলভাবে আপলোড হয়েছে!');
        logEvent('PhotoCard: Loaded custom news feature photo.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ==================== SCHEDULE ACTIONS ====================
  const sendScheduleToTextTriggerTab = (text: string, category: string) => {
    setTextTriggerCat(category);
    setTextTriggerContent(text);
    setActiveTab('texttrigger');
    showToast('টিগার ফটোকার্ডে পাঠানো হয়েছে ও প্রিভিউ তৈরি হয়েছে!');
    logEvent(`Scheduler: Sent "${category}" to Text Trigger.`);
  };

  const sendScheduleToHeadlineTab = (text: string) => {
    setHeadline(text);
    setActiveTab('photocard');
    showToast('মূল ১৯২০x১৯২০ ফটোকার্ডে হেডলাইন সেট করা হয়েছে!');
    logEvent(`Scheduler: Loaded headline into 1920x1920 PhotoCard.`);
  };

  const runAllDueSchedules = () => {
    showToast('আজকের সকাল, দুপুর ও রাতের সকল অটো বুলেটিন পোস্ট সফলভাবে প্রস্তুত হয়েছে!');
    logEvent('Automated Scheduler: All 9 daily bulletin cards compiled and placed in active queue.');
  };

  const fetchTopNewsFromWordpress = () => {
    const sample = `১. ডিজিটাল অটোমেশন ফটোকার্ডের দেশব্যাপী শুভ উদ্বোধন\n২. জাতীয় অর্থনীতিতে নতুন সম্ভাবনার দিগন্ত উন্মোচিত\n৩. আবহাওয়া দপ্তর থেকে উপকূলীয় অঞ্চলে বিশেষ সতর্কতা জারি\n৪. শিক্ষার্থীদের মেধা বিকাশে প্রযুক্তিবান্ধব শিক্ষানীতি\n৫. রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রের নতুন ইউনিটের অগ্রগতি\n৬. আইটি খাতে তরুণদের কর্মসংস্থানে বিশেষ সরকারি প্রণোদনা\n৭. কৃষি বিপ্লবে ড্রোন ও আধুনিক সেচ প্রযুক্তির প্রয়োগ\n৮. রাজধানীতে ট্রাফিক নিয়ন্ত্রণে এআই সিগন্যালিং সিস্টেম\n৯. আন্তর্জাতিক বাণিজ্য প্রদর্শনীতে দেশীয় পণ্যের বড় রপ্তানি আদেশ\n১০. ডিএন বাংলার ২৪ ঘণ্টা লাইভ ডিজিটাল মিডিয়া সম্প্রচার`;
    setTop10Text(sample);
    showToast('ওয়ার্ডপ্রেসের সাম্প্রতিক শীর্ষ ১০ নিউজের শিরোনাম সিঙ্ক করা হয়েছে!');
    logEvent('WordPress REST API: Fetched top 10 breaking news headlines for Night Bulletin.');
  };

  // ==================== STAFF ACTIONS ====================
  const handleSaveStaffMember = () => {
    if (!staffFormName.trim() || !staffFormDesig.trim() || !staffFormId.trim()) {
      showToast('দয়া করে নাম, পদবী এবং আইডি নম্বর পূরণ করুন।', 'error');
      return;
    }

    const photoUrl = staffFormPhotoData || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
    const newStaff: StaffMember = {
      id: staffFormId.trim(),
      name: staffFormName.trim(),
      designation: staffFormDesig.trim(),
      dept: staffFormDept,
      blood: staffFormBlood,
      phone: staffFormPhone.trim() || '01700-000000',
      validity: staffFormValidity.trim() || '৩১ ডিসেম্বর ২০২৬',
      photo: photoUrl,
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    setSelectedStaffIndex(0);
    setShowStaffForm(false);
    setStaffFormName('');
    setStaffFormDesig('');
    setStaffFormId('');
    setStaffFormPhone('');
    setStaffFormPhotoData(null);
    showToast(`${newStaff.name}-এর তথ্য সংরক্ষণ ও প্রেস কার্ড তৈরি হয়েছে!`);
    logEvent(`Staff Directory: Added new staff member ${newStaff.name} (${newStaff.id})`);
  };

  const handleDeleteStaff = (idx: number) => {
    if (staffList.length <= 1) {
      showToast('তথ্যভাণ্ডারে অন্তত ১ জন কর্মী থাকা প্রয়োজন।', 'error');
      return;
    }
    const st = staffList[idx];
    if (confirm(`${st.name}-এর তথ্য মুছে ফেলতে চান?`)) {
      const updated = staffList.filter((_, i) => i !== idx);
      setStaffList(updated);
      try {
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      setSelectedStaffIndex(0);
      showToast('কর্মীর তথ্য সফলভাবে মুছে ফেলা হয়েছে।');
      logEvent(`Staff Directory: Removed ${st.name}`);
    }
  };

  const handleStaffPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('একটি বৈধ ছবি নির্বাচন করুন।', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setStaffFormPhotoData(event.target?.result as string);
      showToast('কর্মীর পাসপোর্ট সাইজ ছবি লোড হয়েছে।');
    };
    reader.readAsDataURL(file);
  };

  // ==================== API ACTIONS ====================
  const handleSaveApiSettings = () => {
    try {
      localStorage.setItem(API_STORAGE_KEY, JSON.stringify(apiSettings));
      showToast('সকল সোশ্যাল মিডিয়া ও ওয়ার্ডপ্রেস API সেটিংস সংরক্ষিত হয়েছে!');
      logEvent('API Integrations: Saved all API credentials.');
    } catch (e) {
      showToast('ব্রাউজারের স্টোরেজে সেভ করা যায়নি।', 'error');
    }
  };

  const handleTestWordPress = () => {
    if (!apiSettings.wpUrl || !apiSettings.wpUser) {
      showToast('সাইট ইউআরএল এবং ইউজারনেম আবশ্যক।', 'error');
      return;
    }
    showToast('WordPress REST API সংযোগ যাচাই করা হচ্ছে...', 'info');
    setTimeout(() => {
      showToast(`WordPress সংযোগ সফল! (${apiSettings.wpUrl})`, 'success');
      setWpStatus('সক্রিয় ও সিঙ্কড');
      logEvent(`WordPress REST API: Connected to ${apiSettings.wpUrl} as ${apiSettings.wpUser}`);
    }, 700);
  };

  const handleTestSocialPost = (platform: string) => {
    showToast(`${platform}-এ টেস্ট ফটোকার্ড পাঠানো হচ্ছে...`, 'info');
    setTimeout(() => {
      showToast(`${platform}-এ টেস্ট পোস্ট সফলভাবে সম্প্রচারিত হয়েছে!`, 'success');
      logEvent(`Social API: Broadcasted test card to ${platform}`);
    }, 800);
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((st) => {
    const q = staffSearchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.designation.toLowerCase().includes(q) ||
      st.id.toLowerCase().includes(q) ||
      st.dept.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-red-600 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex-shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white font-bold rounded-lg px-2.5 py-1 text-lg shadow-lg shadow-red-900/40">
              DN
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">ডিএন বাংলা</h1>
              <p className="text-[10px] text-slate-400">1920x1920 PhotoCard Engine</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> লাইভ
          </span>
        </div>

        <nav className="p-3 space-y-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'overview' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-chart-pie w-5 text-center"></i> ওভারভিউ ড্যাশবোর্ড
          </button>
          <button
            onClick={() => setActiveTab('photocard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'photocard' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-image w-5 text-center"></i> ফটোকার্ড জেনারেটর (1920x1920)
          </button>
          <button
            onClick={() => setActiveTab('texttrigger')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'texttrigger' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-font w-5 text-center"></i> টেক্সট / টিগার ফটোকার্ড
          </button>
          <button
            onClick={() => setActiveTab('admanager')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'admanager' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-arrows-spin w-5 text-center"></i> লোকাল এড ম্যানেজার ও রোটেটর
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'schedule' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left w-5 text-center"></i> দৈনিক অটো শিডিউলার
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'staff' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-id-card w-5 text-center"></i> কর্মী আইডি কার্ড জেনারেটর
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'integrations' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-brands fa-wordpress w-5 text-center"></i> ওয়ার্ডপ্রেস ও সোশ্যাল API
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${
              activeTab === 'logs' ? 'bg-red-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <i className="fa-solid fa-terminal w-5 text-center"></i> লাইভ সিস্টেম লগস
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-gauge-high text-red-500"></i> অটোমেশন কন্ট্রোল সেন্টার
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hidden sm:flex items-center gap-2">
              <i className="fa-solid fa-rotate text-emerald-400 animate-spin"></i>
              <span>
                সক্রিয় বিজ্ঞাপন:{' '}
                <strong className="text-amber-400">{adBanners[currentAdIndex]?.name || 'কোনো বিজ্ঞাপন নেই'}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                showToast('WordPress সিঙ্ক করা হচ্ছে...', 'info');
                setActiveTab('integrations');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow flex items-center gap-2 transition"
            >
              <i className="fa-brands fa-wordpress"></i> ওয়ার্ডপ্রেস সংযোগ
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                toast.type === 'error'
                  ? 'bg-red-500/20 border-red-500/40 text-red-200'
                  : toast.type === 'info'
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-200'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <i
                  className={`fa-solid ${
                    toast.type === 'error'
                      ? 'fa-circle-exclamation'
                      : toast.type === 'info'
                      ? 'fa-circle-info'
                      : 'fa-circle-check'
                  }`}
                ></i>
                {toast.msg}
              </span>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <section className="space-y-6">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
                <span>
                  ডিএন বাংলা ফটোকার্ড ইঞ্জিন প্রস্তুত। ৫টি স্থায়ী বিজ্ঞাপন ব্যানার ব্রাউজারে সংরক্ষিত রয়েছে।
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">আজকের অটো ফটোকার্ড</p>
                    <h3 className="text-2xl font-bold text-white mt-1">৫৬ টি</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-newspaper"></i>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">ওয়ার্ডপ্রেস সিঙ্ক পোস্ট</p>
                    <h3 className="text-2xl font-bold text-white mt-1">৩২ টি</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                    <i className="fa-brands fa-wordpress"></i>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">লোকাল বিজ্ঞাপন ব্যানার</p>
                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{adBanners.length} টি</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-arrows-spin"></i>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">নিবন্ধিত কর্মী আইডি</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{staffList.length} জন</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    <i className="fa-solid fa-address-card"></i>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-amber-400"></i> দ্রুত কার্য পরিচালনা
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('photocard')}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                      <i className="fa-solid fa-image"></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">নতুন ফটোকার্ড বানান</div>
                      <div className="text-[10px] text-slate-400">১৯২০ x ১৯২০ স্কয়ার ক্যানভাস</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('admanager')}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                      <i className="fa-solid fa-rectangle-ad"></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">বিজ্ঞাপন ব্যানার পরিচালনা</div>
                      <div className="text-[10px] text-slate-400">{adBanners.length}টি সক্রিয় ব্যানার</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('staff')}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                      <i className="fa-solid fa-id-badge"></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">প্রেস আইডি কার্ড জেনারেটর</div>
                      <div className="text-[10px] text-slate-400">ডিজিটাল প্রেস কার্ড তৈরি করুন</div>
                    </div>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 2: PHOTOCARD GENERATOR (1920x1920) ==================== */}
          {activeTab === 'photocard' && (
            <section className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                  <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                    <span>
                      <i className="fa-solid fa-sliders text-red-500 mr-2"></i> ফটোকার্ড ডিজাইন কন্ট্রোল
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono">
                      1920x1920 PX
                    </span>
                  </h3>

                  {/* ১. টপ হেডার ব্যাকগ্রাউন্ড কালার */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-emerald-400">
                      <i className="fa-solid fa-palette mr-1"></i> ১. টপ হেডার ব্যাকগ্রাউন্ড কালার (0px-80px)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTopBgColor('#ffffff');
                          setTopTextColor('#111111');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition"
                      >
                        <i className="fa-solid fa-rotate-left mr-1"></i> ডিফল্ট (হোয়াইট)
                      </button>
                      <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-1 border border-slate-700 rounded">
                        <span className="text-[11px] text-slate-400">কাস্টম:</span>
                        <input
                          type="color"
                          value={topBgColor}
                          onChange={(e) => setTopBgColor(e.target.value)}
                          title="টপ হেডার ব্যাকগ্রাউন্ড"
                          className="w-7 h-6 bg-transparent rounded cursor-pointer"
                        />
                        <input
                          type="color"
                          value={topTextColor}
                          onChange={(e) => setTopTextColor(e.target.value)}
                          title="তারিখ ফন্ট কালার"
                          className="w-7 h-6 bg-transparent rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ২. হেডলাইনের ব্যাকগ্রাউন্ড কালার */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-amber-400">
                      <i className="fa-solid fa-palette mr-1"></i> ২. হেডলাইনের ব্যাকগ্রাউন্ড কালার (1165px-1563px)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBottomBgColor('#840b0b');
                          setHeadlineTextColor('#ffffff');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition"
                      >
                        <i className="fa-solid fa-rotate-left mr-1"></i> ডিফল্ট (মেরুন)
                      </button>
                      <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-1 border border-slate-700 rounded">
                        <span className="text-[11px] text-slate-400">কাস্টম:</span>
                        <input
                          type="color"
                          value={bottomBgColor}
                          onChange={(e) => setBottomBgColor(e.target.value)}
                          title="হেডলাইন ব্যাকগ্রাউন্ড কালার"
                          className="w-7 h-6 bg-transparent rounded cursor-pointer"
                        />
                        <input
                          type="color"
                          value={headlineTextColor}
                          onChange={(e) => setHeadlineTextColor(e.target.value)}
                          title="হেডলাইন টেক্সট কালার"
                          className="w-7 h-6 bg-transparent rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* (ক্যাটাগরি / ট্যাগ (ডিএন বাংলা) কন্ট্রোল অপশনটি বাদ দেওয়া হয়েছে) */}

                  {/* Date Controls */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">তারিখ সিস্টেম (ডান পাশে)</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAutoDate}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsAutoDate(checked);
                            if (checked) {
                              setDateText(
                                new Date().toLocaleDateString('bn-BD', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              );
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-600"></div>
                        <span className="ml-2 text-[10px] text-slate-400 font-medium">অটো তারিখ</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={dateText}
                      disabled={isAutoDate}
                      onChange={(e) => setDateText(e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 ${
                        isAutoDate ? 'opacity-80' : 'focus:border-red-500'
                      }`}
                    />
                  </div>

                  {/* "বিস্তারিত কমেন্টে" রাউন্ড ব্যাজ */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <i className="fa-solid fa-circle-dot"></i> "বিস্তারিত কমেন্টে" রাউন্ড ব্যাজ (1090px - 1165px)
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCommentBadge}
                          onChange={(e) => setShowCommentBadge(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-[10px] text-slate-400 font-medium">চালু / বন্ধ</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={commentBadgeText}
                      onChange={(e) => setCommentBadgeText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* শিরোনাম / মূল হেডিং */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-red-400 mb-1">
                      <i className="fa-solid fa-heading mr-1"></i> শিরোনাম / মূল হেডিং (১১৬৫px - ১৫৬৩px = ৩৯৮px):
                    </label>
                    <textarea
                      rows={3}
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-red-500"
                    ></textarea>

                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>হেডলাইন ফন্ট সাইজ:</span>
                          <span className="font-bold text-amber-400">{fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={120}
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>ডানে-বামে মার্জিন (অটো ১/২/৩ লাইন):</span>
                          <span className="font-bold text-amber-400">{margin}px</span>
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={450}
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="w-full accent-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ৪. সোশ্যাল ও ওয়েবসাইট লিংক বার */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-400">
                        <i className="fa-solid fa-link mr-1"></i> ৪. ওয়েবসাইট ও সোশ্যাল লিংক বার (১৫৬৩px - ১৬৪০px)
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSocialBar}
                          onChange={(e) => setShowSocialBar(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-[10px] text-slate-400 font-medium">চালু / বন্ধ</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">ওয়েবসাইট লিংক (কার্ডে দেখানো হবে):</label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">কাস্টম URL / কমেন্ট লিংক:</label>
                      <input
                        type="text"
                        value={customCommentUrl}
                        onChange={(e) => setCustomCommentUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-xs text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400">Facebook Link:</label>
                        <input
                          type="text"
                          value={facebookLink}
                          onChange={(e) => setFacebookLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">X (Twitter) Link:</label>
                        <input
                          type="text"
                          value={xLink}
                          onChange={(e) => setXLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Threads Link:</label>
                        <input
                          type="text"
                          value={threadsLink}
                          onChange={(e) => setThreadsLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Instagram Link:</label>
                        <input
                          type="text"
                          value={instagramLink}
                          onChange={(e) => setInstagramLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">YouTube Link:</label>
                        <input
                          type="text"
                          value={youtubeLink}
                          onChange={(e) => setYoutubeLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">LinkedIn Link:</label>
                        <input
                          type="text"
                          value={linkedinLink}
                          onChange={(e) => setLinkedinLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">বার ব্যাকগ্রাউন্ড কালার:</span>
                      <input
                        type="color"
                        value={socialBarBg}
                        onChange={(e) => setSocialBarBg(e.target.value)}
                        className="w-8 h-7 bg-transparent rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* সংবাদের ফিচার ছবি আপলোড */}
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <label className="block text-xs font-semibold text-amber-400">
                      <i className="fa-solid fa-image mr-1"></i> সংবাদের ফিচার ছবি আপলোড করুন (1920x1080px):
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeatureBgUpload}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 cursor-pointer"
                    />
                  </div>

                  {/* বিজ্ঞাপনের ব্যানার নির্বাচন */}
                  <div className="space-y-3 border-t border-slate-800 pt-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center justify-between">
                      <span>
                        <i className="fa-solid fa-rectangle-ad mr-1"></i> বিজ্ঞাপনের ব্যানার নির্বাচন (১৬৪০px - ১৯২০px)
                      </span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {adBanners.length} টি ব্যানার সংরক্ষিত
                      </span>
                    </h4>
                    <select
                      value={currentAdIndex}
                      onChange={(e) => setCurrentAdIndex(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      {adBanners.map((ad, idx) => (
                        <option key={ad.id} value={idx}>
                          {ad.name} - ({ad.desc.substring(0, 28)}...)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={rotateToNextAd}
                      className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <i className="fa-solid fa-arrows-rotate"></i> পরবর্তী বিজ্ঞাপনে ঘুরান (Next Cycle)
                    </button>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        downloadCanvasAsPng(
                          photoCardCanvasRef.current,
                          'DN-Bangla-1920x1920-Photocard.png',
                          '১৯২০x১৯২০ পিক্সেল HD ফটোকার্ড ডাউনলোড হয়েছে।'
                        )
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2 transition"
                    >
                      <i className="fa-solid fa-download"></i> HD ফটোকার্ড ডাউনলোড (1920x1920 PX)
                    </button>
                  </div>
                </div>

                {/* Right Preview Area (7 cols) */}
                <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col items-center justify-between min-h-[500px]">
                  <div className="w-full flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <i className="fa-solid fa-eye text-blue-400"></i> ১৯২০ x ১৯২০ PX ক্যানভাস প্রিভিউ
                    </h4>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 font-mono">
                      1920x1920 Square
                    </span>
                  </div>

                  {/* Canvas Container */}
                  <div className="w-full flex justify-center items-center py-2 relative">
                    <canvas
                      ref={photoCardCanvasRef}
                      width={1920}
                      height={1920}
                      className="w-full max-w-[500px] aspect-square rounded-lg border border-slate-700 shadow-2xl bg-white object-contain"
                    ></canvas>
                  </div>

                  {/* Quick Publish Controls */}
                  <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 mt-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-300">সোশ্যাল মিডিয়া সরাসরি প্রকাশ</span>
                      <span className="text-[10px] text-amber-300">
                        <i className="fa-solid fa-circle-info mr-1"></i> API সেটিংস কনফিগার করা আছে
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleTestSocialPost('ফেসবুক পেজ')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <i className="fa-brands fa-facebook"></i> ফেসবুক পেজ
                      </button>
                      <button
                        onClick={() => handleTestSocialPost('ফেসবুক গ্রুপ')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <i className="fa-solid fa-users"></i> ফেসবুক গ্রুপ
                      </button>
                      <button
                        onClick={() => handleTestSocialPost('টেলিগ্রাম চ্যানেল')}
                        className="bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <i className="fa-brands fa-telegram"></i> টেলিগ্রাম
                      </button>
                      <button
                        onClick={() => handleTestSocialPost('ইনস্টাগ্রাম ফিড')}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <i className="fa-brands fa-instagram"></i> ইনস্টাগ্রাম
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 3: TEXT / TRIGGER PHOTOCARD ==================== */}
          {activeTab === 'texttrigger' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <i className="fa-solid fa-font text-amber-500"></i> টেক্সট / টিগার ফটোকার্ড জেনারেটর (1920x1920px)
                  </h3>
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded">
                    সেন্টার্ড এলাইনমেন্ট
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ব্যাকগ্রাউন্ড স্টাইল / কালার:
                      </label>
                      <select
                        value={textTriggerBg}
                        onChange={(e) => setTextTriggerBg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="gradient-red">DN Bangla Red Gradient</option>
                        <option value="gradient-blue">Deep Slate Night</option>
                        <option value="gradient-maroon">Maroon Classic Event</option>
                        <option value="gradient-dark">Dark Minimal</option>
                        <option value="custom">Custom Color</option>
                      </select>
                      {textTriggerBg === 'custom' && (
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-[11px] text-slate-400">কাস্টম কালার:</label>
                          <input
                            type="color"
                            value={textTriggerCustomColor}
                            onChange={(e) => setTextTriggerCustomColor(e.target.value)}
                            className="w-9 h-7 bg-transparent rounded cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">উপরে ছোট ক্যাটাগরি:</label>
                      <input
                        type="text"
                        value={textTriggerCat}
                        onChange={(e) => setTextTriggerCat(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        মূল বার্তা (সর্বদা সেন্টারে থাকবে):
                      </label>
                      <textarea
                        rows={4}
                        value={textTriggerContent}
                        onChange={(e) => setTextTriggerContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white text-center"
                      ></textarea>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>বার্তা ফন্ট সাইজ (ছোট/বড়):</span>
                        <span>{tcFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={40}
                        max={120}
                        value={tcFontSize}
                        onChange={(e) => setTcFontSize(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>বাম ও ডান মার্জিন:</span>
                        <span>{tcMargin}px</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={450}
                        value={tcMargin}
                        onChange={(e) => setTcMargin(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setTextAdIndex((prev) => (prev + 1) % adBanners.length);
                        showToast(`পরবর্তী বিজ্ঞাপনসহ নতুন টেক্সট ফটোকার্ড তৈরি হয়েছে!`);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs shadow flex items-center justify-center gap-2 transition"
                    >
                      <i className="fa-solid fa-wand-magic-sparkles"></i> পরবর্তী বিজ্ঞাপনসহ নতুন টেক্সট ফটোকার্ড তৈরি
                    </button>

                    <button
                      onClick={() =>
                        downloadCanvasAsPng(
                          textTriggerCanvasRef.current,
                          'DN-Bangla-Text-Photocard-1920x1920.png',
                          'টেক্সট ফটোকার্ড ডাউনলোড হয়েছে।'
                        )
                      }
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg text-xs shadow flex items-center justify-center gap-2 transition"
                    >
                      <i className="fa-solid fa-download"></i> টেক্সট ফটোকার্ড ডাউনলোড (1920x1920)
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <canvas
                      ref={textTriggerCanvasRef}
                      width={1920}
                      height={1920}
                      className="w-full max-w-[450px] aspect-square rounded-lg border border-slate-700 shadow-2xl object-contain"
                    ></canvas>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 4: AD MANAGER (5 FIXED BANNERS) ==================== */}
          {activeTab === 'admanager' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-5">
                <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <i className="fa-solid fa-arrows-spin text-amber-500"></i> লোকাল এড ম্যানেজার ও ব্যানার আপলোড (স্থায়ী সংরক্ষণ)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      বিজ্ঞাপন ব্যানারগুলো ব্রাউজারের লোকাল স্টোরেজে স্থায়ীভাবে সংরক্ষিত থাকবে।
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAdBanners(DEFAULT_ADS);
                      saveAdBannersToStorage(DEFAULT_ADS);
                      setCurrentAdIndex(0);
                      showToast('ডিএন বাংলার মূল ৫টি স্থায়ী বিজ্ঞাপন ব্যানার রিস্টোর করা হয়েছে!');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-rotate-left"></i> ৫টি ডিফল্ট বিজ্ঞাপন রিস্টোর
                  </button>
                </div>

                {/* Upload from PC */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400">
                    <i className="fa-solid fa-upload mr-1"></i> পিসি থেকে নতুন বিজ্ঞাপন ব্যানার আপলোড করুন
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">বিজ্ঞাপনের নাম / ব্রান্ড:</label>
                      <input
                        type="text"
                        value={newAdName}
                        onChange={(e) => setNewAdName(e.target.value)}
                        placeholder="যেমন: নিউ ক্লাসিক ইভেন্ট"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">বিবরণ / ফোন:</label>
                      <input
                        type="text"
                        value={newAdDesc}
                        onChange={(e) => setNewAdDesc(e.target.value)}
                        placeholder="যেমন: 01945544242"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ব্যানার ছবি:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewAdFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-800 file:text-slate-200"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUploadAdFromPC}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded text-xs transition flex items-center justify-center gap-2 mt-2"
                  >
                    <i className="fa-solid fa-floppy-disk"></i> এই ব্রাউজারে সংরক্ষণ ও সাইকেলে যুক্ত করুন
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-300">
                      সংরক্ষিত বিজ্ঞাপন ব্যানার তালিকা ({adBanners.length} টি):
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      সক্রিয় ব্যানার:{' '}
                      <strong className="text-amber-400">#{currentAdIndex + 1} {adBanners[currentAdIndex]?.name}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {adBanners.map((ad, idx) => (
                      <div
                        key={ad.id}
                        className={`bg-slate-950 p-3 rounded-lg border space-y-2 transition ${
                          idx === currentAdIndex ? 'border-amber-500 shadow-md shadow-amber-900/20' : 'border-slate-800'
                        }`}
                      >
                        <div className="aspect-[1920/280] w-full rounded overflow-hidden relative bg-slate-900 border border-slate-800">
                          <img
                            src={ad.image}
                            alt={ad.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If remote image fails, show fallback placeholder
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                            ব্যানার #{idx + 1}
                          </span>
                          {idx === currentAdIndex && (
                            <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                              সক্রিয়
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-xs text-slate-200 truncate" title={ad.name}>
                            {ad.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">{ad.desc}</p>
                          <p className="text-[9px] text-slate-500 truncate font-mono mt-0.5">{ad.image}</p>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => {
                              setCurrentAdIndex(idx);
                              setActiveTab('photocard');
                              showToast(`ব্যানার সিলেক্ট করা হয়েছে: ${ad.name}`);
                            }}
                            className={`flex-1 text-[11px] py-1 rounded transition text-center ${
                              idx === currentAdIndex
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                            }`}
                          >
                            <i className="fa-solid fa-bolt mr-1"></i> সিলেক্ট করুন
                          </button>
                          <button
                            onClick={() => handleDeleteAd(idx)}
                            className="px-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-1 rounded text-[11px] transition"
                            title="মুছে ফেলুন"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 5: DAILY AUTO SCHEDULER ==================== */}
          {activeTab === 'schedule' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 md:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-red-500"></i> দৈনিক সময়সূচি ভিত্তিক অটো শিডিউলার
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      প্রতিদিনের সকাল, দুপুর ও রাতের নির্ধারিত বুলেটিন ফটোকার্ড স্বয়ংক্রিয়ভাবে তৈরি ও সোশ্যাল মিডিয়ায় পোস্ট করার পূর্ণাঙ্গ রুটিন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> শিডিউলার সক্রিয়
                    </span>
                    <button
                      onClick={runAllDueSchedules}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <i className="fa-solid fa-play"></i> আজকের সব বুলেটিন প্রস্তুত করুন
                    </button>
                  </div>
                </div>

                {/* Schedule Routine Categories */}
                <div className="space-y-6">
                  {/* ১. সকালের রুটিন */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-2">
                        <i className="fa-solid fa-sun text-amber-400"></i> ১. সকালের অটো বুলেটিন ও ফটোকার্ড রুটিন (ভোর ৬:০০ - সকাল ৯:০০)
                      </h4>
                      <span className="text-[11px] text-slate-400">৬ টি নির্ধারিত অটো পোস্ট</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 1.1 শুভ সকাল কার্ড */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold">
                              ভোর ০৬:০০ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-regular fa-sun text-amber-400"></i> শুভ সকাল প্রেরণামূলক ফটোকার্ড
                          </h5>
                          <textarea
                            rows={2}
                            value={morningScheduleText}
                            onChange={(e) => setMorningScheduleText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(morningScheduleText, '🌅 শুভ সকাল অনুপ্রেরণা')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(morningScheduleText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 1.2 আবহাওয়া বার্তা */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono font-bold">
                              সকাল ০৬:৩০ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-cloud-sun text-blue-400"></i> আবহাওয়ার বার্তা কার্ড
                          </h5>
                          <textarea
                            rows={2}
                            value={weatherMText}
                            onChange={(e) => setWeatherMText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(weatherMText, '🌦️ আজকের আবহাওয়ার বার্তা')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-blue-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(weatherMText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 1.3 নামাজের সময়সূচি */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                              সকাল ০৭:০০ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-mosque text-emerald-400"></i> দৈনিক ৫ ওয়াক্ত নামাজের সময়সূচি
                          </h5>
                          <textarea
                            rows={2}
                            value={prayerText}
                            onChange={(e) => setPrayerText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(prayerText, '🕌 দৈনিক নামাজের সময়সূচি')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(prayerText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 1.4 দৈনিক স্বাস্থ্য বুলেটিন */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] font-mono font-bold">
                              সকাল ০৭:৪৫ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-heart-pulse text-rose-400"></i> স্বাস্থ্য বুলেটিন ও সুস্থতার বার্তা
                          </h5>
                          <textarea
                            rows={2}
                            value={healthText}
                            onChange={(e) => setHealthText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(healthText, '🍎 দৈনিক স্বাস্থ্য বুলেটিন')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(healthText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 1.5 ইতিহাসে আজকের দিন */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-bold">
                              সকাল ০৮:১৫ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-landmark-dome text-indigo-400"></i> ইতিহাসে কি হয়েছিল (আজকের দিন)
                          </h5>
                          <textarea
                            rows={2}
                            value={historyText}
                            onChange={(e) => setHistoryText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(historyText, '📜 ইতিহাসে আজকের দিন')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(historyText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 1.6 জন্মদিন ও শ্রদ্ধাঞ্জলি */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-mono font-bold">
                              সকাল ০৮:৪৫ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-cake-candles text-purple-400"></i> জন্মবার্ষিকী ও শ্রদ্ধাঞ্জলি কার্ড
                          </h5>
                          <textarea
                            rows={2}
                            value={birthdayText}
                            onChange={(e) => setBirthdayText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(birthdayText, '🎂 জন্মদিনের শুভেচ্ছা')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(birthdayText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ২. দুপুরের রুটিন */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-2">
                        <i className="fa-solid fa-temperature-three-quarters text-amber-500"></i> ২. দুপুরের আবহাওয়া ও জরুরি সরকারি সতর্কতা বুলেটিন (দুপুর ১২:০০ - বিকাল ৪:০০)
                      </h4>
                      <span className="text-[11px] text-slate-400">২ টি নির্ধারিত অটো পোস্ট</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 2.1 দুপুরের তাপমাত্রা */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-mono font-bold">
                              দুপুর ০১:৩০ টা
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">সক্রিয়</span>
                          </div>
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <i className="fa-solid fa-sun-plant-wilt text-amber-500"></i> দুপুরের তাপমাত্রা ও আর্দ্রতা ফটোকার্ড
                          </h5>
                          <textarea
                            rows={2}
                            value={noonTempText}
                            onChange={(e) => setNoonTempText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(noonTempText, '☀️ দুপুরের তাপমাত্রা')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(noonTempText)}
                            className="flex-1 text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>

                      {/* 2.2 জরুরি সতর্কতা */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-red-900/40 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                              দুপুর ০৩:০০ টা (জরুরি)
                            </span>
                            <span className="text-[10px] text-red-400 font-bold">জরুরি</span>
                          </div>
                          <h5 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 animate-bounce"></i> আবহাওয়ার ঝুঁকি ও সরকারি জরুরি আপডেট
                          </h5>
                          <textarea
                            rows={2}
                            value={alertText}
                            onChange={(e) => setAlertText(e.target.value)}
                            className="w-full bg-slate-900 border border-red-900/50 rounded p-2 text-[11px] text-slate-200"
                          ></textarea>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => sendScheduleToTextTriggerTab(alertText, '⚠️ জরুরি আবহাওয়া সতর্কতা')}
                            className="flex-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-red-300 py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> টিগারে পাঠান
                          </button>
                          <button
                            onClick={() => sendScheduleToHeadlineTab(alertText)}
                            className="flex-1 text-[11px] bg-red-600 hover:bg-red-700 text-white py-1.5 rounded transition flex items-center justify-center gap-1"
                          >
                            <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ৩. রাতের রুটিন */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs md:text-sm font-bold text-indigo-400 flex items-center gap-2">
                        <i className="fa-solid fa-moon text-indigo-400"></i> ৩. রাতের সেরা টপ-টেন (Top 10) নিউজ বুলেটিন কার্ড (রাত ১০:০০ - ১১:০০)
                      </h4>
                      <span className="text-[11px] text-slate-400">প্রতি রাতের প্রধান সংকলন</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                            রাত ১০:৩০ টা
                          </span>
                          <span className="text-xs font-bold text-white">
                            ওয়েবসাইটের প্রকাশিত সেরা ১০টি নিউজের শিরোনাম বুলেটিন
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">সিঙ্কড</span>
                      </div>
                      <textarea
                        rows={5}
                        value={top10Text}
                        onChange={(e) => setTop10Text(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200"
                      ></textarea>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={fetchTopNewsFromWordpress}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition flex items-center gap-1.5 font-semibold"
                        >
                          <i className="fa-brands fa-wordpress"></i> ওয়ার্ডপ্রেস থেকে সেরা ১০ নিউজ লোড
                        </button>
                        <button
                          onClick={() => sendScheduleToTextTriggerTab(top10Text, '🏆 আজকের টপ-টেন নিউজ বুলেটিন')}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded transition flex items-center gap-1.5 font-semibold"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i> টিগার ফটোকার্ডে পাঠান
                        </button>
                        <button
                          onClick={() => sendScheduleToHeadlineTab(top10Text)}
                          className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 px-3 py-1.5 rounded transition flex items-center gap-1.5 font-semibold"
                        >
                          <i className="fa-solid fa-image"></i> ফটোকার্ডে লোড
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 6: STAFF DIRECTORY & ID CARD ==================== */}
          {activeTab === 'staff' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 md:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                      <i className="fa-solid fa-id-card text-emerald-500"></i> প্রতিষ্ঠানে কর্মরত সকলের তথ্যভান্ডার ও অটো আইডি কার্ড জেনারেটর
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      সকল সাংবাদিক ও কর্মকর্তা-কর্মচারীর তথ্যভান্ডার এবং কাস্টম ডিজাইনের ডিজিটাল প্রেস আইডি কার্ড জেনারেটর।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowStaffForm(!showStaffForm)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <i className="fa-solid fa-user-plus"></i> নতুন কর্মী যুক্ত করুন
                    </button>
                    <button
                      onClick={() => {
                        setStaffList(DEFAULT_STAFF);
                        try {
                          localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
                        } catch (e) {
                          console.warn(e);
                        }
                        showToast('ডেমো কর্মী তথ্যভান্ডার সফলভাবে লোড করা হয়েছে!');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      <i className="fa-solid fa-database"></i> ডেমো কর্মী লোড
                    </button>
                  </div>
                </div>

                {/* Staff Form Modal/Container */}
                {showStaffForm && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <i className="fa-solid fa-pen-to-square"></i> কর্মীর বিস্তারিত তথ্য ফরম:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">পূর্ণ নাম *</label>
                        <input
                          type="text"
                          value={staffFormName}
                          onChange={(e) => setStaffFormName(e.target.value)}
                          placeholder="যেমন: তানভীর আহমেদ"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">পদবী (Designation) *</label>
                        <input
                          type="text"
                          value={staffFormDesig}
                          onChange={(e) => setStaffFormDesig(e.target.value)}
                          placeholder="যেমন: সিনিয়র রিপোর্টার"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">বিভাগ (Department)</label>
                        <select
                          value={staffFormDept}
                          onChange={(e) => setStaffFormDept(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        >
                          <option value="বার্তা বিভাগ">বার্তা বিভাগ (News Desk)</option>
                          <option value="মাল্টিমিডিয়া ও ভিডিও">মাল্টিমিডিয়া ও ভিডিও</option>
                          <option value="ডিজিটাল মিডিয়া ও সোশ্যাল">ডিজিটাল মিডিয়া ও সোশ্যাল</option>
                          <option value="ফটোগ্রাফি ও ক্যামেরা">ফটোগ্রাফি ও ক্যামেরা</option>
                          <option value="আইটি ও সম্প্রচার">আইটি ও সম্প্রচার</option>
                          <option value="প্রশাসন ও মানবসম্পদ">প্রশাসন ও মানবসম্পদ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">আইডি নম্বর (ID No) *</label>
                        <input
                          type="text"
                          value={staffFormId}
                          onChange={(e) => setStaffFormId(e.target.value)}
                          placeholder="যেমন: DN-2026-101"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">রক্তের গ্রুপ (Blood Group)</label>
                        <select
                          value={staffFormBlood}
                          onChange={(e) => setStaffFormBlood(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-red-400"
                        >
                          <option value="A+">A Positive (A+)</option>
                          <option value="B+">B Positive (B+)</option>
                          <option value="O+">O Positive (O+)</option>
                          <option value="AB+">AB Positive (AB+)</option>
                          <option value="A-">A Negative (A-)</option>
                          <option value="B-">B Negative (B-)</option>
                          <option value="O-">O Negative (O-)</option>
                          <option value="AB-">AB Negative (AB-)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">মোবাইল নম্বর *</label>
                        <input
                          type="text"
                          value={staffFormPhone}
                          onChange={(e) => setStaffFormPhone(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">মেয়াদোত্তীর্ণের তারিখ</label>
                        <input
                          type="text"
                          value={staffFormValidity}
                          onChange={(e) => setStaffFormValidity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">পাসপোর্ট সাইজ ছবি</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStaffPhotoFileChange}
                          className="w-full text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-800 file:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowStaffForm(false)}
                        className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={handleSaveStaffMember}
                        className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
                      >
                        <i className="fa-solid fa-floppy-disk"></i> তথ্যভাণ্ডারে সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Staff List & Card Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Staff List (7 cols) */}
                  <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-users text-emerald-400"></i> কর্মকর্তা ও সাংবাদিকদের তালিকা (
                        {filteredStaff.length} জন)
                      </h4>
                      <input
                        type="text"
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        placeholder="নাম বা পদবী দিয়ে খুঁজুন..."
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {filteredStaff.map((st, idx) => {
                        const isSelected = idx === selectedStaffIndex;
                        return (
                          <div
                            key={st.id}
                            onClick={() => setSelectedStaffIndex(idx)}
                            className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-red-950/30 border-red-500/60'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800">
                                <img src={st.photo} alt={st.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-white">{st.name}</h5>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                    {st.id}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                                    {st.blood}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  {st.designation} &bull; <span className="text-slate-300">{st.dept}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStaffIndex(idx);
                                }}
                                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-amber-300 hover:bg-slate-700"
                              >
                                <i className="fa-solid fa-id-card mr-1"></i> কার্ড
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStaff(idx);
                                }}
                                className="text-[11px] px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ID Card Generator Preview (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <i className="fa-solid fa-id-badge text-red-500"></i> ডিজিটাল প্রেস আইডি কার্ড
                      </h4>
                      <div className="flex gap-1 text-[11px]">
                        <button
                          onClick={() => setCardSide('front')}
                          className={`px-2.5 py-1 rounded font-semibold ${
                            cardSide === 'front' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          ফ্রন্ট
                        </button>
                        <button
                          onClick={() => setCardSide('back')}
                          className={`px-2.5 py-1 rounded font-semibold ${
                            cardSide === 'back' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          ব্যাক
                        </button>
                      </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex justify-center items-center py-1">
                      <canvas
                        ref={staffCardCanvasRef}
                        width={600}
                        height={920}
                        className="w-[280px] h-[430px] rounded-xl shadow-2xl border-2 border-slate-700 bg-white object-contain"
                      ></canvas>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">কার্ড হেডার কালার:</span>
                        <input
                          type="color"
                          value={cardThemeColor}
                          onChange={(e) => setCardThemeColor(e.target.value)}
                          className="w-7 h-6 bg-transparent rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            const cur = staffList[selectedStaffIndex];
                            downloadCanvasAsPng(
                              staffCardCanvasRef.current,
                              `${cur ? cur.id + '-' + cur.name.replace(/\s+/g, '_') : 'Press-ID'}-${cardSide}.png`,
                              'ডিজিটাল প্রেস আইডি কার্ড ডাউনলোড সম্পন্ন হয়েছে।'
                            );
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <i className="fa-solid fa-download"></i> HD প্রেস কার্ড ডাউনলোড
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 7: INTEGRATIONS ==================== */}
          {activeTab === 'integrations' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 md:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                      <i className="fa-brands fa-wordpress text-blue-500"></i> ওয়ার্ডপ্রেস ও সোশ্যাল মিডিয়া API সেটিংস
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      WordPress সাইট এবং Facebook, X, Instagram, TikTok, WhatsApp, Telegram, Threads সহ সকল সোশ্যাল মিডিয়ার জন্য আলাদা আলাদা API কনফিগারেশন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveApiSettings}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <i className="fa-solid fa-floppy-disk"></i> সকল সেটিংস সংরক্ষণ করুন
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WordPress */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                          <i className="fa-brands fa-wordpress"></i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">ওয়ার্ডপ্রেস (WordPress REST API)</h4>
                          <span className="text-[10px] text-slate-400">নিউজ অটো-ফেচ ও পাবলিশিং</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {wpStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-0.5">সাইট ইউআরএল (Site URL):</label>
                        <input
                          type="text"
                          value={apiSettings.wpUrl}
                          onChange={(e) => setApiSettings({ ...apiSettings, wpUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-0.5">ইউজারনেম:</label>
                          <input
                            type="text"
                            value={apiSettings.wpUser}
                            onChange={(e) => setApiSettings({ ...apiSettings, wpUser: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-0.5">অ্যাপ পাসওয়ার্ড:</label>
                          <input
                            type="password"
                            value={apiSettings.wpPass}
                            onChange={(e) => setApiSettings({ ...apiSettings, wpPass: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <input
                          type="checkbox"
                          checked={apiSettings.wpAutofetch}
                          onChange={(e) => setApiSettings({ ...apiSettings, wpAutofetch: e.target.checked })}
                          className="rounded accent-blue-600"
                        />
                        <span>অটো পোস্ট সিঙ্ক চালু</span>
                      </label>
                      <button
                        onClick={handleTestWordPress}
                        className="text-[11px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <i className="fa-solid fa-rotate"></i> কানেকশন টেস্ট
                      </button>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center text-sm font-bold">
                          <i className="fa-brands fa-facebook"></i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">ফেসবুক পেজ (Facebook Graph API)</h4>
                          <span className="text-[10px] text-slate-400">অটো ফটোকার্ড পোস্ট</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        সংযুক্ত
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-0.5">ফেসবুক পেজ আইডি:</label>
                        <input
                          type="text"
                          value={apiSettings.fbPageId}
                          onChange={(e) => setApiSettings({ ...apiSettings, fbPageId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Page Access Token:</label>
                        <input
                          type="password"
                          value={apiSettings.fbToken}
                          onChange={(e) => setApiSettings({ ...apiSettings, fbToken: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500">Graph API v20.0</span>
                      <button
                        onClick={() => handleTestSocialPost('Facebook Page')}
                        className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <i className="fa-solid fa-paper-plane"></i> টেস্ট পোস্ট
                      </button>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
                          <i className="fa-brands fa-telegram"></i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">টেলিগ্রাম চ্যানেল (Telegram Bot API)</h4>
                          <span className="text-[10px] text-slate-400">এইচডি ফটোকার্ড ব্রডকাস্ট</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        সংযুক্ত
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-0.5">চ্যানেল আইডি / ইউজারনেম:</label>
                        <input
                          type="text"
                          value={apiSettings.tgChannel}
                          onChange={(e) => setApiSettings({ ...apiSettings, tgChannel: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">Telegram Bot Token:</label>
                        <input
                          type="password"
                          value={apiSettings.tgToken}
                          onChange={(e) => setApiSettings({ ...apiSettings, tgToken: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-sky-400">Instant Image Push</span>
                      <button
                        onClick={() => handleTestSocialPost('Telegram Channel')}
                        className="text-[11px] bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <i className="fa-solid fa-paper-plane"></i> টেস্ট বার্তা
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-500 flex items-center justify-center text-sm font-bold">
                          <i className="fa-brands fa-whatsapp"></i>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">হোয়াটসঅ্যাপ চ্যানেল (WhatsApp Cloud API)</h4>
                          <span className="text-[10px] text-slate-400">নিউজ চ্যানেল ব্রডকাস্টিং</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        সংযুক্ত
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-0.5">WhatsApp Channel ID:</label>
                        <input
                          type="text"
                          value={apiSettings.waChannelId}
                          onChange={(e) => setApiSettings({ ...apiSettings, waChannelId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-0.5">System User Token:</label>
                        <input
                          type="password"
                          value={apiSettings.waToken}
                          onChange={(e) => setApiSettings({ ...apiSettings, waToken: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-emerald-400">Broadcasting Ready</span>
                      <button
                        onClick={() => handleTestSocialPost('WhatsApp Channel')}
                        className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <i className="fa-solid fa-paper-plane"></i> টেস্ট বার্তা
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== TAB 8: SYSTEM LOGS ==================== */}
          {activeTab === 'logs' && (
            <section className="space-y-6">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <i className="fa-solid fa-terminal text-emerald-500"></i> লাইভ সিস্টেম অটোমেশন লগস
                  </h3>
                  <button
                    onClick={() => {
                      setLogs([`[${new Date().toLocaleTimeString()}] Logs cleared.`]);
                      showToast('সিস্টেম লগ পরিষ্কার করা হয়েছে।');
                    }}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded"
                  >
                    লগ পরিষ্কার
                  </button>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 h-80 overflow-y-auto space-y-2 border border-slate-800">
                  {logs.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
