'use client';

import { useEffect, useRef } from 'react';

export function AdBanner({ 
  dataAdSlot, 
  dataAdFormat = 'auto', 
  dataFullWidthResponsive = true 
}: { 
  dataAdSlot: string, 
  dataAdFormat?: string, 
  dataFullWidthResponsive?: boolean 
}) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error', err);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden flex justify-center my-4 bg-white/5 border border-white/10 rounded-xl p-2 relative min-h-[100px]">
      <span className="text-[10px] font-mono text-slate-500 absolute top-2 left-2">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '90px' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX"}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
        ref={adRef}
      />
    </div>
  );
}
