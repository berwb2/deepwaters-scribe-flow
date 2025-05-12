
import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef }) => {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;

    const headings = contentRef.current.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6');
    
    const tocItems: TOCItem[] = Array.from(headings).map((heading) => {
      // Ensure each heading has an id for scrolling
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      }
      
      return {
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1), 10),
      };
    });

    setToc(tocItems);

    // Set up intersection observer to track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [contentRef]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (toc.length === 0) return null;

  return (
    <aside className="hidden md:block sticky top-24 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto pr-6">
      <div className="mb-4 text-lg font-serif font-medium">Table of Contents</div>
      <nav>
        <ul className="space-y-2">
          {toc.map((item) => (
            <li 
              key={item.id}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              <button
                onClick={() => scrollToSection(item.id)}
                className={`text-left w-full py-1 px-2 rounded-sm text-sm transition-colors hover:bg-muted ${
                  activeId === item.id
                    ? 'bg-water/10 text-water-deep font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default TableOfContents;
