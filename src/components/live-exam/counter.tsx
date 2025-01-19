import { useEffect, useRef, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface CounterProps {
  startDate: string;
  duration: number;
  mutate: () => void;
  onTimeout: () => void;
  /**
   * Son dakikaya girildiğinde beep çalınsın mı?
   * Varsayılan: false
   */
  beepOnLastMinute?: boolean;
}

export const Counter = ({
  startDate,
  duration,
  mutate,
  onTimeout,
  beepOnLastMinute = false,
}: CounterProps) => {
  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number | null>(null);

  // Kullanıcı etkileşimini sadece 1 kez kaydetmek için
  const isUserInteractedRef = useRef(false);

  // Ses çalmak için ref
  const beepSoundRef = useRef<HTMLAudioElement | null>(null);

  // “Click” ekleyerek “user gesture” kaydetme
  useEffect(() => {
    function handleUserInteraction() {
      if (!isUserInteractedRef.current) {
        isUserInteractedRef.current = true;
        // Artık tarayıcı beep sesi çalındığında büyük olasılıkla engellemeyecek
      }
    }

    // Bir kere etkileşim aldıktan sonra engellememek için
    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  // "beep.mp3" ancak beepOnLastMinute true ise yükleniyor
  useEffect(() => {
    if (beepOnLastMinute && !beepSoundRef.current) {
      beepSoundRef.current = new Audio("/sounds/beep.mp3");
      beepSoundRef.current.volume = 0.8; // Ses şiddeti
    }
  }, [beepOnLastMinute]);

  // Bileşen ilk yüklendiğinde kalan süreyi hesapla
  useEffect(() => {
    setRemainingTimeSeconds((prev) => {
      if (prev === null) {
        setStartTimer(true);
        const now = Date.now();
        const quizEndTime = new Date(startDate).getTime() + duration * 60_000;
        const diffInSec = Math.floor((quizEndTime - now) / 1_000);
        return diffInSec >= 0 ? diffInSec : 0;
      }
      return prev - 1;
    });
  }, [startDate, duration]);

  // Timer mantığı
  useEffect(() => {
    const timer = setInterval(() => {
      if (startTimer) {
        setRemainingTimeSeconds((currentTime) => {
          if (currentTime !== null) {
            if (currentTime <= 0) {
              clearInterval(timer);
              onTimeout(); // Süre bitti
              return 0;
            }
            // 60 saniyeye indiğinde beep
            if (beepOnLastMinute && currentTime === 60) {
              // Kullanıcı en az 1 kez tıklamışsa beep çalmaya çalış
              if (isUserInteractedRef.current) {
                beepSoundRef.current?.play().catch(() => {
                  toast.error("Beep blocked by browser. Requires user gesture.");
                });
              } else {
                // Kullanıcı hiç etkileşime girmemişse sessizce geçiyor
                // (Opsiyonel) Burada “Lütfen sayfayla etkileşime girin” mesajı gösterebilirsiniz.
              }
            }
            return currentTime - 1;
          }
          return null;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTimer, onTimeout, beepOnLastMinute]);

  // Son 1 dakikada uyarı
  const isLastMinute =
    remainingTimeSeconds !== null && remainingTimeSeconds <= 60 && remainingTimeSeconds > 0;

  // Dakika:saniye
  let display = "0:00";
  if (remainingTimeSeconds !== null && remainingTimeSeconds >= 0) {
    const m = Math.floor(remainingTimeSeconds / 60);
    const s = remainingTimeSeconds % 60;
    display = `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div
      style={{ minWidth: "120px", maxWidth: "120px" }}
      className={`
        flex items-center justify-center gap-2 border rounded-full
        transition-colors duration-300 max-h-[52px] min-h-[52px] mr-4 ml-4
        ${
          isLastMinute
            ? "bg-red-50 text-red-600 border-red-500 animate-pulse"
            : "bg-green-50 text-green-600 border-green-400"
        }
      `}
    >
      <ClockIcon className={`w-5 h-5 ${isLastMinute ? "text-red-600" : "text-green-600"}`} />
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
