import { useState, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import PageHeading from '@/components/PageHeading';

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-anthracite">{item.question}</span>
        <IconChevronDown
          size={20}
          stroke={2}
          className={`text-secondary shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-secondary text-sm leading-relaxed">{item.answer}</div>
      )}
    </div>
  );
}

export default function Faq() {
  const [faqData, setFaqData] = useState([]);
  const [openIds, setOpenIds] = useState(new Set());

  useEffect(() => {
    fetch('/data/faq.json')
      .then((res) => res.json())
      .then((data) => {
        setFaqData(data);
        setOpenIds(new Set([data[0]?.id]));
      });
  }, []);

  const toggleId = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categories = [...new Set(faqData.map((item) => item.category))];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <HeroBanner title="FAQ" subtitle="Foire aux questions" />

      <main className="flex-1 px-5 py-10 w-full max-w-2xl mx-auto">
        <PageHeading
          title="Comment pouvons-nous vous aider ?"
          description="Retrouvez les réponses aux questions les plus fréquentes sur les titres et abonnements Comutitres."
          className="mb-8"
        />

        <div className="flex flex-col gap-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-interaction mb-3">
                {category}
              </h2>
              <div className="flex flex-col gap-3">
                {faqData
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <FaqItem
                      key={item.id}
                      item={item}
                      open={openIds.has(item.id)}
                      onToggle={() => toggleId(item.id)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
