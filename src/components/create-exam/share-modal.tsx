"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CopyLink } from "@/components/ui/copylink";

// React Icons (dilediğinizi ekleyip çıkarabilirsiniz)
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
  quizLink: string; // Paylaşılacak link
  classname?: string;
}

export default function ShareModal({ open, onClose, quizLink }: ShareModalProps) {
  // Davet mesajı (İngilizce taslak)
  const shareMessage =
    "Hey! I just created a fun quiz—want to challenge yourself? Click the link below and let’s see how you do!";

  // Paylaşım seçenekleri (Chat ve More kaldırılmış versiyon örneği)
  const shareOptions = [
    {
      name: "Telegram",
      icon: <FaTelegramPlane />,
      onClick: () =>
        window.open(
          // Telegram link
          `https://t.me/share/url?url=${encodeURIComponent(quizLink)}&text=${encodeURIComponent(
            shareMessage
          )}`,
          "_blank"
        ),
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      onClick: () =>
        window.open(
          // Twitter link
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareMessage
          )}&url=${encodeURIComponent(quizLink)}`,
          "_blank"
        ),
    },
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      onClick: () =>
        window.open(
          // Facebook link (quote parametresiyle mesaj ekleme)
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            quizLink
          )}&quote=${encodeURIComponent(shareMessage)}`,
          "_blank"
        ),
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      onClick: () =>
        alert("Instagram sharing typically requires a custom approach. :)"),
    },
    {
      name: "E-mail",
      icon: <FaEnvelope />,
      onClick: () =>
        window.open(
          // Email link
          `mailto:?subject=${encodeURIComponent("Fun Quiz Invitation")}&body=${encodeURIComponent(
            shareMessage + "\n\n" + quizLink
          )}`
        ),
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      onClick: () =>
        window.open(
          // WhatsApp link
          `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${quizLink}`)}`,
          "_blank"
        ),
    },
    {
      name: "Discord",
      icon: <FaDiscord />,
      onClick: () =>
        alert("To share on Discord, simply copy and paste the link in your server or channel."),
    },
  ];

  // QR Kodu indirme fonksiyonu
  const downloadQRCode = () => {
    const canvas = document.getElementById("quizQrCode") as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "quiz-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/*
        w-full ve belirli padding için:
        w-full p-6 -> Modal tam genişlik ve 6 birim padding
      */}
      <DialogContent className="w-full p-6 relative bg-base-white">
        {/* Kapatma butonu */}
     {/* Kapatma butonu */}
<button
  onClick={onClose}
  className="
    absolute top-4 right-4
    p-2
    text-gray-500
    hover:text-gray-700
    hover:bg-gray-100
    rounded-full
    focus:outline-none
    focus:ring-2
    focus:ring-gray-200
    transition-colors
  "
>
  <XMarkIcon className="w-6 h-6" />
</button>

        {/* Başlık */}
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Share with</DialogTitle>
        </DialogHeader>

        {/* Paylaşım ikonları */}
        <div className="flex justify-center items-center gap-5 mt-4 mb-6">
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
        <p className="text-center text-sm text-gray-500 mb-2">
          Or share with link
        </p>

        {/* CopyLink input */}
        <div className="mb-6">
          <CopyLink link={quizLink} label="Quiz link" />
        </div>

        {/* QR code + Download */}
        <div className="flex flex-col items-center gap-3">
          <QRCodeCanvas
            id="quizQrCode"
            value={quizLink}
            size={150}
            bgColor="#FFFFFF"
            level="M"
          />
          <Button variant="outline" onClick={downloadQRCode}>
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
