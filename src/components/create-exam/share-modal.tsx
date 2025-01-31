"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CopyLink } from "@/components/ui/copylink";

// React Icons
import {
  FaTwitter,
  FaTelegramPlane,
  FaEnvelope,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaDiscord,
} from "react-icons/fa";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  quizLink: string; // Paylaşılacak tam URL
  className?: string;
}

/** Paylaşılacak metin hazırlayıcı. Linki de mesaja eklemek için en kolayı, tek bir “text”te birleştirmektir. */
function getShareMessage(quizLink: string) {
  return `Hey! I just created a fun quiz—want to challenge yourself?

Click here to join:
${quizLink}

Let's see how you do! 🚀
#ChozQuizzes`;
}

export default function ShareModal({ open, onClose, quizLink, className }: ShareModalProps) {
  // Ana metnimiz (text + link)
  const shareText = getShareMessage(quizLink);

  // Paylaşım seçenekleri
  const shareOptions = [
    // TELEGRAM
    {
      name: "Telegram",
      icon: <FaTelegramPlane />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        const url = `https://t.me/share/url?text=${text}`;
        window.open(url, "_blank");
      },
    },
    // TWITTER
    {
      name: "Twitter",
      icon: <FaTwitter />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        // "url=" parametresine gerek yok; tek param 'text'
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(twitterUrl, "_blank");
      },
    },
    // WHATSAPP
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        const whatsAppUrl = `https://api.whatsapp.com/send?text=${text}`;
        window.open(whatsAppUrl, "_blank");
      },
    },
    // FACEBOOK
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      onClick: () => {
        const text = encodeURIComponent(shareText);
        // Facebook tipik olarak "quote=" yerine link preview'ı gösterir ama yine ekliyoruz
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          quizLink
        )}&quote=${text}`;
        window.open(fbUrl, "_blank");
      },
    },
    // INSTAGRAM
    {
      name: "Instagram",
      icon: <FaInstagram />,
      onClick: () =>
        alert(
          "Instagram doesn't allow direct text link sharing. Copy the link and paste it in your bio or story."
        ),
    },
    // E-MAIL
    {
      name: "E-mail",
      icon: <FaEnvelope />,
      onClick: () => {
        const subject = encodeURIComponent("Fun Quiz Invitation");
        const body = encodeURIComponent(shareText);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoUrl);
      },
    },
    // DISCORD
    {
      name: "Discord",
      icon: <FaDiscord />,
      onClick: () => {
        alert(
          "Copy the link below and paste it in your Discord server or DM. Discord doesn't auto-share text."
        );
      },
    },
  ];

  // QR Kodu indirme fonksiyonu
  const downloadQRCode = () => {
    const canvas = document.getElementById("quizQrCode") as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "quiz-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`w-full p-6 relative bg-base-white ${className || ""}`}>
        {/* Kapatma butonu */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 p-3 rounded-full border-2 border-brand-primary-950 
            hover:bg-brand-secondary-200 text-brand-primary-900 
            hover:text-brand-primary-950 transition
          "
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Başlık */}
        <DialogHeader>
          <DialogTitle className="text-md font-bold text-brand-primary-950">
            Share with:
          </DialogTitle>
        </DialogHeader>

        {/* Paylaşım ikonları */}
        <div className="flex justify-center items-center flex-wrap gap-5 mt-4 mb-6">
          {shareOptions.map(({ name, icon, onClick }) => (
            <button
              key={name}
              onClick={onClick}
              className="
                flex flex-col items-center
                text-brand-primary-950
                hover:text-brand-primary-900
                focus:outline-none
                transition-transform duration-150
                hover:scale-105 active:scale-95
              "
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-1">
                <span className="text-xl">{icon}</span>
              </div>
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
        </div>

        {/* Or share with link */}
        <p className="text-center text-sm text-gray-500 mb-2">Or share with link</p>
        <div className="mb-6">
          <CopyLink link={quizLink} label="Quiz link" />
        </div>

        {/* QR code + Download */}
        <div className="flex flex-col items-center gap-3">
          <QRCodeCanvas id="quizQrCode" value={quizLink} size={150} bgColor="#FFFFFF" level="M" />
          <Button variant="outline" onClick={downloadQRCode}>
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
