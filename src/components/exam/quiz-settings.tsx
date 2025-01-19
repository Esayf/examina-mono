"use client";

import React, { useState } from "react";

// QuizLinkProps adlı arayüzü bileşen dışında tanımlıyoruz.
// Eğer FinalQuizLink gibi bir bileşenle paylaşacaksanız, burayı "export" ile dışarıya açabilirsiniz.
interface QuizLinkProps {
  quizLink: string;
}

// İhtiyaç duyulmadığı sürece default export veya named export kullanabilirsiniz.
// Burada default export örneği verildi.
export default function QuizSettings() {
  // Kullanıcının özel slug girişini yönetmek için state.
  const [customSlug, setCustomSlug] = useState("");

  // Temel URL
  const baseURL = "https://choz.io";

  // Kullanıcının girdiği slug boş ise fallback olarak randomQuizId veya
  // başka bir ID kullanabilirsiniz.
  const finalQuizLink = customSlug ? `${baseURL}/${customSlug}` : `${baseURL}/randomQuizId`;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4 font-bold">Create Your Custom Quiz Link</h1>

      {/* Slug girişi */}
      <label htmlFor="slug" className="block font-medium mb-1">
        Custom Slug
      </label>
      <input
        id="slug"
        type="text"
        className="border rounded px-2 py-1 w-64"
        placeholder="e.g. my-fun-quiz"
        value={customSlug}
        onChange={(e) => setCustomSlug(e.target.value)}
      />

      {/* Oluşan linkin gösterimi */}
      <p className="mt-3 text-sm text-gray-600">
        Your quiz link: <strong>{finalQuizLink}</strong>
      </p>
    </div>
  );
}
