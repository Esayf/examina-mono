// ... diğer importlar
import { useState, useEffect, useRef } from "react";

interface CounterProps {
  startDate: string; // Sunucu veya başka yerden gelen başlangıç zamanı
  duration: number; // Dakika cinsinden
  quizId: string; // Hangi quize ait? Key olarak kullanırız
  onTimeout: () => void;
  mutate: () => void;
  beepOnLastMinute?: boolean;
}

export const Counter = ({
  startDate,
  duration,
  quizId,
  onTimeout,
  mutate,
  beepOnLastMinute = false,
}: CounterProps) => {
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number | null>(null);

  // Audio, user gesture vs. için ref
  const beepSoundRef = useRef<HTMLAudioElement | null>(null);
  const isUserInteractedRef = useRef(false);

  useEffect(() => {
    // 1) Önce localStorage’ta kayıtlı endTime var mı diye bak
    const storedEndTime = localStorage.getItem(`quizEndTime-${quizId}`);
    let endTime: number;

    if (storedEndTime) {
      // Kullanıcı quiz'e daha önce başlamış
      endTime = parseInt(storedEndTime, 10);
    } else {
      // Yeni başlıyorsa endTime’ı hesapla ve sakla
      endTime = new Date(startDate).getTime() + duration * 60_000;
      localStorage.setItem(`quizEndTime-${quizId}`, endTime.toString());
    }

    // Şu anki kalan süreyi hesapla
    const diffInSec = Math.floor((endTime - Date.now()) / 1000);
    setRemainingTimeSeconds(diffInSec >= 0 ? diffInSec : 0);
  }, [startDate, duration, quizId]);

  // Beep ses dosyasını yükleme
  useEffect(() => {
    if (beepOnLastMinute && !beepSoundRef.current) {
      beepSoundRef.current = new Audio("/sounds/beep.mp3");
      beepSoundRef.current.volume = 0.8;
    }
  }, [beepOnLastMinute]);

  // Kullanıcı etkileşimi takibi (beep engeli olmasın diye)
  useEffect(() => {
    function handleUserInteraction() {
      if (!isUserInteractedRef.current) {
        isUserInteractedRef.current = true;
      }
    }
    document.addEventListener("click", handleUserInteraction);
    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  // Timer
  useEffect(() => {
    // Eğer remainingTimeSeconds null veya 0 ise interval başlatmaya gerek yok
    if (remainingTimeSeconds === null || remainingTimeSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingTimeSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }

        // 60 saniyeye iniyorsa beep
        if (beepOnLastMinute && prev === 61) {
          if (isUserInteractedRef.current) {
            beepSoundRef.current?.play().catch(() => {
              // Hata loglayabilirsiniz
            });
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTimeSeconds, onTimeout, beepOnLastMinute]);

  // Dakika:saniye format
  let display = "0:00";
  if (remainingTimeSeconds !== null) {
    const m = Math.floor(remainingTimeSeconds / 60);
    const s = remainingTimeSeconds % 60;
    display = `${m}:${s.toString().padStart(2, "0")}`;
  }

  const isLastMinute =
    remainingTimeSeconds !== null && remainingTimeSeconds <= 60 && remainingTimeSeconds > 0;

  return (
    <div
      className={`flex items-center justify-center gap-2 border rounded-full
        transition-colors duration-300 max-h-[52px] min-h-[52px] mr-4 ml-6
        ${
          isLastMinute
            ? "bg-red-50 text-red-600 border-red-500 animate-pulse"
            : "bg-green-50 text-green-600 border-green-400"
        }
      `}
      style={{ minWidth: "120px", maxWidth: "120px" }}
    >
      {/* Heroicons ClockIcon vs. */}
      <p className="font-semibold text-base">{display}</p>
    </div>
  );
};

/*window.AudioContext = window.AudioContext || window.webkitAudioContext;

var context = new AudioContext();

function playSound(arr) {
  var buf = new Float32Array(arr.length)
  for (var i = 0; i < arr.length; i++) buf[i] = arr[i]
  var buffer = context.createBuffer(1, buf.length, context.sampleRate)
  buffer.copyToChannel(buf, 0)
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

function sineWaveAt(sampleNumber, to
document.addEventListener("click", ()=> {
  setTimeout(() => {
    playSound(arr)
  }, 5000);
})

// we need this one to prevent playing audio more than one time 
let isScheduled = false;

function getRemainingTime() {
	// do something to calculate remaining time
  return 5000
}

document.addEventListener("click", ()=> {
  if (isScheduled) return
	isScheduled = true
  setTimeout(() => {
    playSound(arr)
  }, getRemainingTime());
}) SWAP SORU DEĞİŞİMİ */
