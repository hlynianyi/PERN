import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, Loader2 } from "lucide-react";
import { faqApi } from "@/api/faq";

const FaqItem = ({ block, isOpen, onToggle }) => {
  return (
    <div className="border rounded-lg  shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-4 flex justify-between items-start gap-4 "
      >
        <div>
          <h3 className="text-lg font-semibold">{block.subtitle}</h3>
        </div>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2">
          {block.description && (
            <p className="text-sm  my-1">{block.description}</p>
          )}
          {block.answers && block.answers.length > 0 && (
            <div className="space-y-4">
              {block.answers.map((answer, index) => (
                <div key={index} className="flex gap-2">
                  <span className="font-medium text-primary">{index + 1}.</span>
                  <span className="">{answer}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FaqPage = () => {
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBlocks, setOpenBlocks] = useState(new Set());

  useEffect(() => {
    const loadFaq = async () => {
      try {
        const data = await faqApi.getFaq();
        setFaqData(data);
      } catch (err) {
        setError("Ошибка при загрузке FAQ");
        console.error("Ошибка при загрузке FAQ:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFaq();
  }, []);

  const handleToggle = (index) => {
    setOpenBlocks((prevOpenBlocks) => {
      const newOpenBlocks = new Set(prevOpenBlocks);
      if (newOpenBlocks.has(index)) {
        newOpenBlocks.delete(index);
      } else {
        newOpenBlocks.add(index);
      }
      return newOpenBlocks;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=" max-w-3xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const description_blocks = faqData?.description_blocks || [];

  return (
    <div className=" max-w-4xl mx-auto py-4 tablet:py-8">
      <div className="text-center mb-6 tablet:mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {faqData?.title || "Часто задаваемые вопросы"}
        </h1>
        <div className="h-1 w-20 bg-primary mx-auto mb-4"></div>
        <p className="text-lg leading-relaxed">
          Найдите ответы на самые распространенные вопросы о наших продуктах и
          услугах
        </p>
      </div>

      <div className="space-y-4">
        {description_blocks.map((block, index) => (
          <FaqItem
            key={block.id || index}
            block={block}
            isOpen={openBlocks.has(index)}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>

      {description_blocks.length === 0 && (
        <div className="text-center py-12">
          В настоящее время нет доступных FAQ
        </div>
      )}
    </div>
  );
};

export default FaqPage;
