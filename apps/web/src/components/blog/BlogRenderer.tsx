import type { BlogBlock } from "@/lib/blogTypes";

const calloutTone = {
  sage: "border-[#315c49]/20 bg-[#dce9d7]/70 text-[#244c3a] dark:bg-emerald-950 dark:text-emerald-100",
  amber: "border-amber-500/20 bg-amber-100/70 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
  rose: "border-rose-500/20 bg-[#f1d5ca]/70 text-[#713e32] dark:bg-rose-950 dark:text-rose-100",
  violet: "border-violet-500/20 bg-[#eadcf0]/70 text-[#5c3c68] dark:bg-violet-950 dark:text-violet-100",
};

export function BlogRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((block) => {
        if (block.type === "divider") return <hr key={block.blockId} className="my-12 border-border" />;
        if (block.type === "heading-2") return <h2 key={block.blockId} className="pt-6 text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">{block.content}</h2>;
        if (block.type === "heading-3") return <h3 key={block.blockId} className="pt-3 text-2xl font-semibold leading-tight tracking-tight text-foreground">{block.content}</h3>;
        if (block.type === "quote") return <blockquote key={block.blockId} className="my-10 border-l-4 border-[#bd624b] pl-6 font-serif text-2xl italic leading-9 text-foreground">{block.content}</blockquote>;
        if (block.type === "callout") return <aside key={block.blockId} className={`my-9 rounded-[1.5rem] border p-6 text-base leading-7 ${calloutTone[block.tone]}`}><p className="font-semibold">{block.content}</p></aside>;
        if (block.type === "bulleted-list") return <ul key={block.blockId} className="ml-5 list-disc space-y-3 pl-3">{block.items.map((item, index) => <li key={`${block.blockId}-${index}`}>{item}</li>)}</ul>;
        if (block.type === "numbered-list") return <ol key={block.blockId} className="ml-5 list-decimal space-y-3 pl-3">{block.items.map((item, index) => <li key={`${block.blockId}-${index}`}>{item}</li>)}</ol>;
        return <p key={block.blockId} className="text-lg leading-9 text-muted-foreground">{block.content}</p>;
      })}
    </div>
  );
}
