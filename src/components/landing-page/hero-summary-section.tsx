// components/HighlightsSection.tsx

import React from "react";

// Öne çıkan özellikleri temsil edecek basit bir arayüz:
interface HighlightItem {
  title: string;
  description: string;
}

// Demo verileri dizi olarak tanımlıyoruz
const highlightList: HighlightItem[] = [
  {
    title: "Fast and Secure",
    description:
      "We ensure end-to-end encryption and blazing fast response times for all users.",
  },
  {
    title: "Anonymous",
    description:
      "Users can interact with the platform without revealing their identity, ensuring privacy.",
  },
  {
    title: "Reward-Driven",
    description:
      "Quizzes and tasks come with rewards to keep everyone engaged and motivated.",
  },
];

export default function HighlightsSection() {
  return (
    <section className="py-10 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Some Highlights</h2>
        <p className="max-w-2xl mx-auto text-gray-700 mb-8">
          Here you can list various highlights or features of your product, 
          or any other content you want to emphasize.
        </p>

        {/* Grid yapısı: Mobilde tek sütun, orta boyut ve üstü (md) ekranlarda 3 sütun */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlightList.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
