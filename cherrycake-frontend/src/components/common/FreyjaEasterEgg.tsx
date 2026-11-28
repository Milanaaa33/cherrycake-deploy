import React, { useState, useEffect, useRef, useMemo } from "react";
import useTranslation from "../../i18n/useTranslation";
import "./FreyjaEasterEgg.css";

import artFebruaryPisces from "../../assets/quest/art-february-pisces.jpg";
import artTwoUmbrellas from "../../assets/quest/art-two-umbrellas.jpg";
import artAriesCat from "../../assets/quest/art-aries-cat.jpg";
import artCelestialGrid from "../../assets/quest/art-celestial-grid.jpg";
import artCaucasusPines from "../../assets/quest/art-caucasus-pines.jpg";
import artCodePeaks from "../../assets/quest/art-code-peaks.jpg";

interface Chapter {
  id: number;
  tag: string;
  location: string;
  heading: string;
  art: string;
  hudLeft: string;
  hudRight: string;
  narrative: string;
  poemTitle: string;
  poemText: string;
  choices: { text: string; nextChapter: number }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    tag: "ГЛАВА I // ПРОЛОГ",
    location: "ПОЛУНОЧНЫЙ БАР • ФЕВРАЛЬСКИЙ ДОЖДЬ",
    heading: "Февральские Рыбы в глубинной тишине",
    art: artFebruaryPisces,
    hudLeft: "📍 02:00 AM // RAIN RESONANCE 84%",
    hudRight: "PISCES CONVERGENCE",
    narrative:
      "Февральский дождь бьёт по запотевшим стеклам бара на перепутье миров. Внутри тепло, пахнет кофе и мокрым асфальтом.\n\nЗа стойкой сидят двое. Молчат, как киты в океанской глубине. В их взглядах — не печаль, а то тихое знание, которое приходит, когда душу переполняет невысказанное чувство.",
    poemTitle: "ФЕВРАЛЬСКИЕ РЫБЫ",
    poemText:
`В бар зашли февральские Рыбы —
С глазами: "Видел тебя я во сне".
Сидят у стойки. Молчат, как киты бы
молчали в глубинной своей тишине.

— Вам по бокалу?
— Нет, нам бы по смыслу…
Немного любви и побольше тепла.
Бармен вздыхает: "Философы, блин,
Опять на водичке… и без бабла".

Они улыбаются тонко, прощающе,
Грустью, что в мире враждебен уют.
Смотрят в стакан, как в бездну сияющую —
А вдруг там ответы их уже ждут?

— Ну как вам февраль?
— Он туманен и тонок,
Как память о жизни, которой и нет…
— А планы?
— Мы ж Рыбы. Какие нам планы?
Мы плывём, где теченье сгибает рассвет.

Потом говорят что-то мудрое, вкратце,
О смысле, свободе и бренности сна…
А утром ушли. Счастливые в танце.
Оставив лишь каплю… в бокале вина.`,
    choices: [
      { text: "Вспомнить тот самый вечер под дождём...", nextChapter: 2 },
      { text: "Прислушаться к тишине за окном и сделать шаг в память...", nextChapter: 2 },
    ],
  },
  {
    id: 2,
    tag: "ГЛАВА II // ВОСПОМИНАНИЕ",
    location: "МОСТ НАД БЫСТРОЙ РЕКОЙ // ЭЛЕГИЯ",
    heading: "Когда дождь говорит за нас",
    art: artTwoUmbrellas,
    hudLeft: "📍 RIVER BRIDGE // ECHOES IN MIST",
    hudRight: "TWO PATHS DIVERGING",
    narrative:
      "Они шли рядом по скользким гранитным плитам набережной. Одно ночное небо над головой, один холодный ветер, касающийся лиц — но два разных зонта.\n\nКазалось: вот бы внезапный порыв ветра сорвал эти зонты и унёс в реку, чтобы в темноте остался лишь смех и тепло двух ладоней. Но правила этого мира непреклонны. Жёлтое такси мигнуло фарами, разрезая водяную пелену, и увезло её. А он остался один на террасе — слушать, как капли отбивают ритм неслучившейся судьбы.",
    poemTitle: "КОГДА ДОЖДЬ ГОВОРИТ ЗА НАС",
    poemText:
`Двое под одним небом,
Но под разными зонтами.
Шли по улице дождливой,
Герои нашей элегии.

… А вдруг!? Зонты, внезапно бы, слетели с рук героев!
И унеслись бы ветром, прямиком, к Верийскому мосту,
Где в середине, закружив в красивом танце,
Герои наши повстречали бы судьбу.

Хоть зонты и улетели бы, порывом, прямо в реку Куру,
Герои, улыбкою своею, согрели бы друг друга.
Да под дождём, смеясь, держась за руки,
Вернулись бы обратно в свой отель.

Но смысла нет в его надеждах…
Ведь не суждено им быть вдвоём…
А быть может…? Нет! Не может!
Не она его! И не он её!

Она вернётся в номер свой
И забудет навсегда его…
А он выйдет на террасу под дождём,
И всё будет думать о своём…

…

И как-то раз, дождливой ночью
Промок до нитки, наш герой.
И хоть прошло уже полгода,
Всё вспоминает он… её.`,
    choices: [
      { text: "Остаться в тишине и прислушаться к шёпоту ночи...", nextChapter: 3 },
      { text: "Вспомнить аккорды дождя и свечу в темноте...", nextChapter: 3 },
    ],
  },
  {
    id: 3,
    tag: "ГЛАВА III // ТИШИНА",
    location: "ТЁПЛАЯ КОМНАТА // СВЕЧА И ДОЖДЬ",
    heading: "Разговор с Тишиной",
    art: artFebruaryPisces,
    hudLeft: "📍 02:20 AM // WHISPERS OF AUTUMN",
    hudRight: "A QUIET FLAME",
    narrative:
      "Осенний дождь играет свои аккорды за тёмным окном. В неверном свете свечи рождаются мысли, сотканные из снов, из неба, из заветного мотива, который так сильно любило сердце.",
    poemTitle: "РАЗГОВОР С ТИШИНОЙ",
    poemText:
`Сижу у окна, и шепчет листва,
Осень играет аккорды дождя.
Тонкие нити небесного зова,
Тянутся в сердце из мира иного.

Свеча обжигает дыханием мрак,
Тень на страницах, как пламя огня.
И слова, как яркие звезды,
Манят сквозь сумрак и шепчут: "не поздно".

И мир тот невидим, но полон чудес,
Он соткан из мыслей, из снов, из небес.
Там слышен забытый, заветный мотив,
Который мой голос так сильно любил.

И в нем есть мечта, что сияет веками,
И мысли, что дышат живыми лучами.
Я встречусь с далёкой, иной тишиной,
И стану опять, наконец, я собой.

* * *

Our taxi fades in the stream of rain,
And glass is trembling like a faint refrain…
The wind it plays upon the empty air,
pulling echoes from the bridges there…
I hear the river, I hear the wind,
I feel the world as if it begins again…
That night became a song I could not tame,
but in its flow, I found a quiet flame.`,
    choices: [
      { text: "Почувствовать её тепло под созвездием Овна...", nextChapter: 4 },
      { text: "Вспомнить её улыбку и аромат роз...", nextChapter: 4 },
    ],
  },
  {
    id: 4,
    tag: "ГЛАВА IV // СОЗВЕЗДИЕ",
    location: "ТЁПЛАЯ КОМНАТА // ЛУННЫЙ СВЕТ",
    heading: "Под созвездием Овна и мурчанием кота",
    art: artAriesCat,
    hudLeft: "📍 ARIES TRANSIT // CANDLE AT 02:45 AM",
    hudRight: "ROSE ESSENCE & WHISPERS",
    narrative:
      "Бывают мгновения, которые остаются в душе навсегда. Её пылкий, упрямый и трогательный характер истинного Овна — маленькая конфетка, обидевшаяся из-за сущего пустяка.\n\nЗа окном плывёт луна, на подоконнике тихо мурлычет кот, а комната наполняется ароматом роз. В такие секунды понимаешь: время бессильно. Сколько бы веков ни прошло, сколько бы жизней ни сменилось — эта связь уже вплетена в ткань Вселенной.",
    poemTitle: "ПОД ЛУНОЙ",
    poemText:
`Под созвездием Овна
И мурчанием нашего кота,
Смотрю на тебя, дорогая моя.
В лучах лунного света и роз аромат,
Любуюсь тобою я словно впервые,
Конфетка, обидевшаяся из-за пустяка на меня.

Я вспомню строчки Мухаммада Руми,
подойду, обниму и тебе прошепчу…
"И в этой, и в прошлой, и в будущей жизнях
Мы были и будем с тобою всегда!
И пусть исчезают эпохи и люди,
Моя ты навеки!
Моя ты жена…"`,
    choices: [
      { text: "Подняться к ледяным вершинам Северных Врат...", nextChapter: 5 },
      { text: "Искать свет сквозь древнюю бездну...", nextChapter: 5 },
    ],
  },
  {
    id: 5,
    tag: "ГЛАВА V // ИСПЫТАНИЕ",
    location: "СЕВЕРНЫЕ ВРАТА // ЛЕДЯНАЯ БЕЗДНА",
    heading: "Ледяной мост над бездной вековой",
    art: artCelestialGrid,
    hudLeft: "📍 NORTHERN GATES // ELEV 2,740M",
    hudRight: "COORDINATE TELEMETRY: 318° NW",
    narrative:
      "Перед ним встают великие Северные Врата — неприступные горные пики, окутанные космической тишиной и звёздными координатными сетками. Лёд сковал перевалы, как реальность сковала их пути: у неё своя жизнь, другой человек, нерушимые границы.\n\nНо тот, кто по-настоящему любит, не требует и не штурмует крепость. Он хранит в груди огонь, веря, что даже самый холодный вековой лёд однажды растает под лучами чистого света.",
    poemTitle: "СЕВЕРНЫЕ ВРАТА",
    poemText:
`Мечтой живу, в душе храня огонь,
И верю: лёд растает в час желанный.
Лишь откроются ворота севера, и сон,
А там рассвет зажжёт нам свет желанный.

И реки льда расступятся вдали,
Воздвигнув мост над бездной вековой.
С двух берегов поднимутся огни,
Чтоб встретиться под аркой ледяной.

И загудит под ними древний лёд,
Как голос снов, что спал веками в бездне.
Сиянье север в небесах зажжёт,
Разрушив мрак дыханием прелестным.

И в миг, когда сойдутся два пути,
Раскроются врата в поток сиянья.
И дрогнет мир, чтоб в свете обрести
Начало дней и смысл мироздания.`,
    choices: [
      { text: "Дождаться первого луча рассвета над пиками...", nextChapter: 6 },
      { text: "Сказать самые важные слова, даже если они останутся тайной...", nextChapter: 6 },
    ],
  },
  {
    id: 6,
    tag: "ГЛАВА VI // КУЛЬМИНАЦИЯ",
    location: "ВЕРШИНЫ КАВКАЗА // 05:45 AM",
    heading: "I'd Still Come — Обещание сквозь тьму",
    art: artCaucasusPines,
    hudLeft: "📍 DAWN VECTOR // 05:45 AM",
    hudRight: "UNCONDITIONAL HARMONY",
    narrative:
      "Первые лучи рассвета прорезают туман над вершинами и горными озёрами. Наступает кристальная ясность.\n\nЛюбовь не требует обладания. Она в том, чтобы всегда быть той самой невидимой, но несокрушимой стеной за её спиной. Прикрывать в работе, беречь на каждом шагу, радоваться её счастью. И знать: что бы ни случилось в этом мире, если в два часа ночи ей понадобится помощь — преград не существует.",
    poemTitle: "I'D STILL COME",
    poemText:
`I tried to live a quieter life,
To drown your name in day and night.
But every thought still circles back,
To what we had and what I lack.
I should’ve said “Hello, let’s talk,”
Instead I ran, I watched you walk.
I lit the match, I watched it burn,
Now every silence feels like turn…

They said, "Don’t fall, it’s just a game,"
But love don’t play by rules or names.
And now I live where dreams collapse
Inside the echo of the past.

I’d still come if you called,
Even now, after all.
If you broke down at 2 a.m.,
I'd be there like I never left.
Though I lost the only war I've won,
If you asked, I’d still come.

You never saw the softer part
The one that stitched your name in heart.
I wasn't brave, I played pretend,
I wrote "forever" - pressed send, then end.
Could’ve been your shadow, your light,
But I confessed at the wrong time.
Should’ve been a friend, stayed still
Not climbed the mountain for the thrill.

Now I replay each second wrong,
Like it’s the chorus to our song.
And if this is how the story ends…
Why does it still begin again?

I’d still come if you called,
Even now, after all.
If you cried just once, no sound
I’d feel it shake me to the ground.
Though I’m frozen, though you run
If you asked, I’d still come.

I dreamed you said, "It’s not too late."
I woke to walls that just won’t break.
I laughed alone, then almost wept
You haunt the nights I never slept.

I’d still come if you called,
Even now, after all.
If you whispered through the dark,
I’d follow, even torn apart.
Though my hands are scorched and numb,
I’d still come ... if you just asked.`,
    choices: [
      { text: "Обрести главный ответ о смысле этой жизни...", nextChapter: 7 },
    ],
  },
  {
    id: 7,
    tag: "ГЛАВА VII // ЭПИЛОГ",
    location: "РАССВЕТ // ВДОХНОВЕНИЕ ВЕЧНОСТИ",
    heading: "В чём смысл жизни? // Care este sensul vieții?",
    art: artCodePeaks,
    hudLeft: "📍 TRANSCENDENCE // INFINITY CODE",
    hudRight: "THE QUIET FLAME",
    narrative:
      "Горы растворяются в потоках золотого утреннего света. Сказка подошла к своему финалу — но в реальности этот свет только начинается.\n\nПусть другие думают, что это просто красивая поэтическая новелла о далёких Северных Вратах. Лишь одно сердце знает, для кого зажжён каждый символ этой страницы, почему в Cherry Cake столько заботы и тепла, и чьё имя незримо вышито на каждой строчке этого кода.",
    poemTitle: "В ЧЁМ СМЫСЛ ЖИЗНИ?",
    poemText:
`Nu există în lume putere mai înfricoșătoare și mai frumoasă decât Iubirea.
Ea rănește, dar și dăruiește sufletului o ocrotire cerească.
Iar dacă inima nu știe pe cine să păstreze cu tandrețe,
Atunci care este rostul acestei vieți și pentru ce să mai trăiești?

Ни силы страшней, ни прекрасней нет в мире, чем Любовь,
Она ранит, но и дарит душе небесный покров.
И если сердце не знает, кого ему нежно хранить,
Тогда в чём смысл этой жизни и зачем дальше жить?`,
    choices: [
      { text: "Сохранить этот свет в сердце и вернуться в реальность ✨", nextChapter: 0 },
    ],
  },
];

export const FreyjaEasterEgg: React.FC = () => {
  const { easterEgg, language } = useTranslation();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [boxes, setBoxes] = useState<string[]>(["", "", "", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isQuestOpen, setIsQuestOpen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [typedState, setTypedState] = useState({ key: "", length: 0 });
  const typingKey = `${currentChapterIndex}:${isQuestOpen ? 1 : 0}`;
  const typedLength = typedState.key === typingKey ? typedState.length : 0;
  const [isPlaying, setIsPlaying] = useState(false);

  const activeChapters = useMemo(() => {
    return CHAPTERS.map((baseCh) => {
      const tr = easterEgg.chapters[baseCh.id];
      if (!tr) return baseCh;
      return {
        ...baseCh,
        tag: tr.tag || baseCh.tag,
        location: tr.location || baseCh.location,
        heading: tr.heading || baseCh.heading,
        hudLeft: tr.hudLeft || baseCh.hudLeft,
        hudRight: tr.hudRight || baseCh.hudRight,
        narrative: tr.narrative || baseCh.narrative,
        poemTitle: tr.poemTitle || baseCh.poemTitle,
        poemText: tr.poemText || baseCh.poemText,
        choices: tr.choices && tr.choices.length ? tr.choices : baseCh.choices,
      };
    });
  }, [easterEgg]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedMediaRef = useRef<{ el: HTMLMediaElement; vol: number }[]>([]);
  const isClosingRef = useRef(false);
  const keyBufferRef = useRef("");
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Background Audio Lifecycle & Crossfade
  useEffect(() => {
    if (isQuestOpen) {
      isClosingRef.current = false;
      const mediaList: { el: HTMLMediaElement; vol: number }[] = [];

      // Find and smoothly fade out any existing playing audio/video on the webpage
      document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((el) => {
        if (el !== audioRef.current && !el.paused) {
          mediaList.push({ el, vol: el.volume });
          let v = el.volume;
          const fadeOut = setInterval(() => {
            v = Math.max(0, v - 0.1);
            el.volume = v;
            if (v <= 0) {
              clearInterval(fadeOut);
              el.pause();
            }
          }, 35);
        }
      });
      pausedMediaRef.current = mediaList;

      // Start Mustafa Avşaroğlu track with smooth fade in
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          let v = 0;
          const fadeIn = setInterval(() => {
            v = Math.min(0.75, v + 0.08);
            if (audioRef.current) audioRef.current.volume = v;
            if (v >= 0.75) clearInterval(fadeIn);
          }, 40);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [isQuestOpen]);

  // Focus first box when key popup opens
  useEffect(() => {
    if (isKeyModalOpen) {
      const timer = setTimeout(() => {
        boxRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isKeyModalOpen]);

  // Smooth Crossfade Out on Close
  const handleSmoothClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    // Fade out Mustafa Avşaroğlu audio
    const questAudio = audioRef.current;
    if (questAudio && !questAudio.paused) {
      let qv = questAudio.volume;
      const qFade = setInterval(() => {
        qv = Math.max(0, qv - 0.08);
        questAudio.volume = qv;
        if (qv <= 0) {
          clearInterval(qFade);
          questAudio.pause();
          questAudio.currentTime = 0;
          questAudio.volume = 0.75;
          setIsQuestOpen(false);
        }
      }, 35);
    } else {
      setIsQuestOpen(false);
    }

    // Smoothly resume previously playing background audio on page
    pausedMediaRef.current.forEach(({ el, vol }) => {
      try {
        el.volume = 0;
        el.play().then(() => {
          let cv = 0;
          const rFade = setInterval(() => {
            cv = Math.min(vol, cv + 0.08);
            el.volume = cv;
            if (cv >= vol) clearInterval(rFade);
          }, 40);
        }).catch(() => {});
      } catch {}
    });
    pausedMediaRef.current = [];
  };

  // Human Typewriter Engine (natural pace ~38-48ms)
  useEffect(() => {
    if (!isQuestOpen) return;

    const targetText = activeChapters[currentChapterIndex]?.poemText || "";
    let currentIdx = 0;
    let isCancelled = false;
    let timeoutId: any = null;

    const typeNextChar = () => {
      if (isCancelled) return;
      if (currentIdx >= targetText.length) return;

      currentIdx += 1;
      setTypedState({ key: typingKey, length: currentIdx });

      if (currentIdx >= targetText.length) return;

      const prevChar = targetText[currentIdx - 1];

      // Smooth, natural reading speed (~38-48ms per character)
      let delay = Math.floor(Math.random() * 12) + 38;

      // Newline / line break: natural brief pause (240 - 380ms)
      if (prevChar === "\n") {
        delay = Math.floor(Math.random() * 140) + 240;
      }
      // Punctuation: brief thoughtful pause (140 - 240ms)
      else if (
        prevChar === "," ||
        prevChar === "." ||
        prevChar === "—" ||
        prevChar === "–" ||
        prevChar === "?" ||
        prevChar === "!" ||
        prevChar === ":" ||
        prevChar === "…"
      ) {
        delay = Math.floor(Math.random() * 100) + 140;
      }
      // Occasional human cadence touch: ~3% chance (120 - 200ms)
      else if (Math.random() < 0.03) {
        delay = Math.floor(Math.random() * 80) + 120;
      }

      timeoutId = setTimeout(typeNextChar, delay);
    };

    // Quick natural breath before typing begins
    timeoutId = setTimeout(typeNextChar, 180);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isQuestOpen, currentChapterIndex, activeChapters, typingKey]);

  // Global Keyboard listener
  useEffect(() => {
    const targetCodes = ["freyja", "фрейя"];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape handling
      if (e.key === "Escape") {
        if (isKeyModalOpen) {
          setIsKeyModalOpen(false);
          return;
        }
        if (isQuestOpen) {
          handleSmoothClose();
          return;
        }
      }

      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (isQuestOpen) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= activeChapters.length) {
          setCurrentChapterIndex(num - 1);
          return;
        }
        if (e.key === " " || e.key === "Enter") {
          const fullLen = activeChapters[currentChapterIndex]?.poemText?.length || 0;
          if (typedLength < fullLen) {
            e.preventDefault();
            setTypedState({ key: typingKey, length: fullLen });
            return;
          }
        }
        if (e.key === "ArrowRight") {
          setCurrentChapterIndex((prev) => Math.min(prev + 1, activeChapters.length - 1));
          return;
        }
        if (e.key === "ArrowLeft") {
          setCurrentChapterIndex((prev) => Math.max(prev - 1, 0));
          return;
        }
      }

      keyBufferRef.current = (keyBufferRef.current + e.key.toLowerCase()).slice(-10);
      if (targetCodes.some((code) => keyBufferRef.current.endsWith(code))) {
        setIsKeyModalOpen(false);
        setIsQuestOpen(true);
        setCurrentChapterIndex(0);
        keyBufferRef.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuestOpen, isKeyModalOpen, currentChapterIndex, typedLength, activeChapters, typingKey]);

  // Verification logic for the 6-letter cipher
  const verifyBoxes = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === "FREYJA" || cleaned === "ФРЕЙЯ") {
      setIsKeyModalOpen(false);
      setIsQuestOpen(true);
      setCurrentChapterIndex(0);
      setBoxes(["", "", "", "", "", ""]);
      setHasError(false);
      setErrorMessage("");
    } else {
      setHasError(true);
      setErrorMessage(easterEgg.keyError);
      setTimeout(() => {
        setHasError(false);
        setBoxes(["", "", "", "", "", ""]);
        boxRefs.current[0]?.focus();
      }, 900);
    }
  };

  const handleBoxChange = (index: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const nextBoxes = [...boxes];
    nextBoxes[index] = char;
    setBoxes(nextBoxes);
    if (hasError) setHasError(false);

    if (char && index < 5) {
      boxRefs.current[index + 1]?.focus();
    }

    if (char && index === 5 && nextBoxes.every((b) => b.length > 0)) {
      verifyBoxes(nextBoxes.join(""));
    }
  };

  const handleBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (boxes[index]) {
        const nextBoxes = [...boxes];
        nextBoxes[index] = "";
        setBoxes(nextBoxes);
      } else if (index > 0) {
        boxRefs.current[index - 1]?.focus();
        const nextBoxes = [...boxes];
        nextBoxes[index - 1] = "";
        setBoxes(nextBoxes);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      boxRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      boxRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      verifyBoxes(boxes.join(""));
    }
  };

  const handleBoxPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .trim()
      .toUpperCase()
      .replace(/[^A-ZА-ЯЁ]/gi, "")
      .slice(0, 6);
    if (!text) return;

    const nextBoxes = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) {
      nextBoxes[i] = text[i];
    }
    setBoxes(nextBoxes);

    const focusIdx = Math.min(text.length, 5);
    boxRefs.current[focusIdx]?.focus();

    if (text.length === 6) {
      verifyBoxes(text);
    }
  };

  const currentChapter = activeChapters[currentChapterIndex] || activeChapters[0];
  const progressPercent = ((currentChapterIndex + 1) / activeChapters.length) * 100;
  const fullPoem = currentChapter.poemText;
  const isTypingDone = typedLength >= fullPoem.length;
  const displayedPoem = fullPoem.slice(0, typedLength);

  const handleChoice = (targetChapter: number) => {
    if (targetChapter === 0) {
      handleSmoothClose();
    } else {
      setCurrentChapterIndex(targetChapter - 1);
    }
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      {/* Redesigned Noir Velvet Floating Trigger Button in Bottom-Right Corner (Icon only, no text) */}
      {!isQuestOpen && !isKeyModalOpen && (
        <button
          type="button"
          className="cc-freyja-floating-trigger"
          onClick={() => {
            setBoxes(["", "", "", "", "", ""]);
            setHasError(false);
            setErrorMessage("");
            setIsKeyModalOpen(true);
          }}
          title={easterEgg.keyTriggerTooltip || "Secret Cipher Key"}
          aria-label={easterEgg.keyTitle}
        >
          <span className="cc-freyja-trigger-icon-wrap" aria-hidden="true">
            <svg
              className="cc-freyja-trigger-key-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Antique royal skeleton key: ornate bow at top, straight vertical shaft, classic cut teeth */}
              <circle cx="12" cy="6" r="4.5" />
              <circle cx="12" cy="6" r="1.5" fill="currentColor" />
              <line x1="12" y1="10.5" x2="12" y2="21.5" />
              <line x1="12" y1="16.5" x2="16" y2="16.5" />
              <line x1="12" y1="19.5" x2="15" y2="19.5" />
            </svg>
            <span className="cc-freyja-trigger-pulse-dot" />
          </span>
        </button>
      )}

      {/* Noir Key Input Popup Modal */}
      {isKeyModalOpen && (
        <div
          className="cc-freyja-key-backdrop"
          onClick={() => setIsKeyModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cc-freyja-key-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="cc-freyja-key-close"
              onClick={() => setIsKeyModalOpen(false)}
              title={easterEgg.keyClose || "Close [Esc]"}
            >
              ✕
            </button>

            <div className="cc-freyja-key-header">
              <span className="cc-freyja-key-badge">{easterEgg.keyBadge}</span>
              <h3 className="cc-freyja-key-title">{easterEgg.keyTitle}</h3>
              <p className="cc-freyja-key-desc">
                {easterEgg.keyDesc}
              </p>
            </div>

            <div className="cc-freyja-key-field-wrap">
              <div
                className={`cc-freyja-boxes-row ${hasError ? "error" : ""}`}
                onPaste={handleBoxPaste}
              >
                {boxes.map((b, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      boxRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={b}
                    onChange={(e) => handleBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBoxKeyDown(idx, e)}
                    className={`cc-freyja-box-input ${b ? "filled" : ""}`}
                    autoComplete="off"
                    spellCheck="false"
                  />
                ))}
              </div>

              <div className="cc-freyja-key-hint">
                {errorMessage || easterEgg.keyPlaceholder}
              </div>

              <button
                type="button"
                className="cc-freyja-key-submit-btn"
                onClick={() => verifyBoxes(boxes.join(""))}
              >
                <span>{easterEgg.keySubmit}</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Quest Modal */}
      {isQuestOpen && (
        <div
          className="cc-freyja-overlay"
          onClick={handleSmoothClose}
          role="dialog"
          aria-modal="true"
        >
          {/* Background Audio */}
          <audio
            ref={audioRef}
            src="/audio/see-you-again.webm"
            preload="auto"
            loop
          />

          <div
            className="cc-freyja-terminal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chrome Header */}
            <div className="cc-freyja-header">
              <div className="cc-freyja-header-left">
                <div className="cc-freyja-window-dots">
                  <span className="cc-freyja-dot red" onClick={handleSmoothClose} title="Закрыть [Esc]" />
                  <span className="cc-freyja-dot yellow" onClick={() => setCurrentChapterIndex(0)} title="В начало" />
                  <span className="cc-freyja-dot green" />
                </div>

                <div className="cc-freyja-title">
                  СЕВЕРНЫЕ ВРАТА // THE NORTHERN GATES
                </div>
              </div>

              {/* Music Equalizer & Player */}
              <div className="cc-freyja-audio-bar">
                <button
                  className="cc-freyja-play-btn"
                  onClick={togglePlayMusic}
                  title={isPlaying ? (language === 'en' ? 'Pause' : 'Пауза') : (language === 'en' ? 'Play' : 'Воспроизвести')}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
                <div className="cc-freyja-track-info">
                  <span>Mustafa Avşaroğlu — I Know I Will See You Again</span>
                  <div className="cc-freyja-equalizer">
                    <span className={`cc-freyja-eq-bar ${isPlaying ? "playing" : ""}`} />
                    <span className={`cc-freyja-eq-bar ${isPlaying ? "playing" : ""}`} />
                    <span className={`cc-freyja-eq-bar ${isPlaying ? "playing" : ""}`} />
                  </div>
                </div>
              </div>

              <div className="cc-freyja-header-actions">
                <span className="cc-freyja-chapter-badge">
                  {language === 'en' ? 'CHAPTER' : language === 'ka' ? 'თავი' : 'ГЛАВА'} {currentChapter.id} / {activeChapters.length}
                </span>
                <button
                  className="cc-freyja-close-btn"
                  onClick={handleSmoothClose}
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="cc-freyja-progressbar">
              <div
                className="cc-freyja-progressbar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Main Body */}
            <div className="cc-freyja-body">
              {/* Cinematic Art Card (Fixed Height 270px, never crushed) */}
              <div className="cc-freyja-art-card">
                <img
                  src={currentChapter.art}
                  alt={currentChapter.heading}
                  className="cc-freyja-art-img"
                />
                <div className="cc-freyja-art-overlay" />
                <div className="cc-freyja-art-hud">
                  <span className="cc-freyja-hud-tag">{currentChapter.hudLeft}</span>
                  <span className="cc-freyja-hud-tag">{currentChapter.hudRight}</span>
                </div>
              </div>

              {/* Scene Header */}
              <div className="cc-freyja-scene-header">
                <div className="cc-freyja-subtitle">
                  {currentChapter.tag} • {currentChapter.location}
                </div>
                <h2 className="cc-freyja-heading">{currentChapter.heading}</h2>
              </div>

              {/* Narrative Story */}
              <div className="cc-freyja-narrative">
                {currentChapter.narrative}
              </div>

              {/* Typewriter Poetry Presentation Card */}
              <div
                className="cc-freyja-typewriter-card"
                onClick={() => setTypedState({ key: typingKey, length: fullPoem.length })}
                title={language === 'en' ? 'Click to show all text immediately' : language === 'ka' ? 'დააკლიკეთ მთელი ტექსტის საჩვენებლად' : 'Кликните, чтобы показать весь текст сразу'}
              >
                <div className="cc-freyja-poem-header-bar">
                  <div className="cc-freyja-poem-title">
                    {currentChapter.poemTitle}
                  </div>
                  {!isTypingDone && (
                    <button
                      className="cc-freyja-skip-type-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTypedState({ key: typingKey, length: fullPoem.length });
                      }}
                    >
                      {language === 'en' ? '⏩ Show All' : language === 'ka' ? '⏩ ყველას ჩვენება' : '⏩ Показать всё сразу'}
                    </button>
                  )}
                </div>

                <div className="cc-freyja-typewriter-text">
                  {displayedPoem}
                  {!isTypingDone && <span className="cc-freyja-cursor">|</span>}
                </div>
              </div>

              {/* Linear Action / Choices */}
              <div className="cc-freyja-actions">
                {currentChapter.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    className="cc-freyja-choice-btn"
                    onClick={() => handleChoice(choice.nextChapter)}
                  >
                    <span>{choice.text}</span>
                    <span className="cc-freyja-key-badge">
                      {choice.nextChapter === 0 ? "ESC" : `➔`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Timeline & Step Navigation */}
              <div className="cc-freyja-timeline">
                <button
                  className="cc-freyja-nav-btn"
                  disabled={currentChapterIndex === 0}
                  onClick={() => setCurrentChapterIndex((prev) => Math.max(prev - 1, 0))}
                >
                  {language === 'ru' ? '← Назад' : language === 'ka' ? '← უკან' : language === 'uz' ? '← Orqaga' : language === 'kk' ? '← Артқа' : language === 'uk' ? '← Назад' : language === 'zh' ? '← 返回' : language === 'tr' ? '← Geri' : language === 'hy' ? '← Ետ' : language === 'az' ? '← Geri' : language === 'ro' ? '← Înapoi' : language === 'et' ? '← Tagasi' : language === 'lv' ? '← Atpakaļ' : language === 'lt' ? '← Atgal' : language === 'fi' ? '← Takaisin' : language === 'sv' ? '← Tillbaka' : '← Back'}
                </button>

                <div className="cc-freyja-dots-nav">
                  {activeChapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className={`cc-freyja-step-dot ${idx === currentChapterIndex ? "active" : ""}`}
                      onClick={() => setCurrentChapterIndex(idx)}
                      title={`${language === 'ru' ? 'Глава' : language === 'ka' ? 'თავი' : language === 'uz' ? 'Bob' : language === 'kk' ? 'Тарау' : language === 'uk' ? 'Розділ' : language === 'zh' ? '第' + ch.id + '章' : language === 'tr' ? 'Bölüm' : language === 'hy' ? 'Գլուխ' : language === 'az' ? 'Fəsil' : language === 'ro' ? 'Capitolul' : language === 'et' ? 'Peatükk' : language === 'lv' ? 'Nodaļa' : language === 'lt' ? 'Skyrius' : language === 'fi' ? 'Luku' : language === 'sv' ? 'Kapitel' : 'Chapter'} ${ch.id}: ${ch.heading}`}
                    />
                  ))}
                </div>

                <button
                  className="cc-freyja-nav-btn"
                  disabled={currentChapterIndex === activeChapters.length - 1}
                  onClick={() => setCurrentChapterIndex((prev) => Math.min(prev + 1, activeChapters.length - 1))}
                >
                  {language === 'ru' ? 'Вперёд →' : language === 'ka' ? 'შემდეგი →' : language === 'uz' ? 'Oldinga →' : language === 'kk' ? 'Алға →' : language === 'uk' ? 'Уперед →' : language === 'zh' ? '下一篇 →' : language === 'tr' ? 'İleri →' : language === 'hy' ? 'Առաջ →' : language === 'az' ? 'İrəli →' : language === 'ro' ? 'Înainte →' : language === 'et' ? 'Edasi →' : language === 'lv' ? 'Uz priekšu →' : language === 'lt' ? 'Pirmyn →' : language === 'fi' ? 'Seuraava →' : language === 'sv' ? 'Nästa →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
