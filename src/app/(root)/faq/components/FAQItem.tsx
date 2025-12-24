'use client';

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {question}
          </span>
        </div>
        <div className="flex-shrink-0 ml-4">
        {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-2">
          <div className="ml-12 border-l-2 border-primary/20 pl-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
