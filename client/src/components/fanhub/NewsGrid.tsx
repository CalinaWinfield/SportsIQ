import React from 'react';
import { SportNewsArticle } from '../../types/sports.js';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

interface NewsGridProps {
  articles: SportNewsArticle[];
  loading: boolean;
}

export const NewsGrid: React.FC<NewsGridProps> = ({ articles, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sports-card rounded-2xl overflow-hidden animate-pulse h-80 border border-slate-200">
            <div className="h-44 bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="sports-card rounded-2xl p-10 text-center border border-slate-200 text-slate-500 shadow-2xs">
        <Newspaper className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <div className="text-sm font-semibold">No recent sports articles found.</div>
      </div>
    );
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((art, idx) => (
        <article
          key={art.id || idx}
          className="sports-card sports-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200 group shadow-xs"
        >
          <div>
            {/* Image banner */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              {art.imageUrl ? (
                <img
                  src={art.imageUrl}
                  alt={art.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <Newspaper className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-[10px] font-black uppercase text-sky-400 font-mono shadow-xs">
                {art.league.toUpperCase()}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(art.published)}</span>
                {art.byline && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{art.byline}</span>
                  </>
                )}
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                {art.headline}
              </h3>

              {art.description && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {art.description}
                </p>
              )}
            </div>
          </div>

          {/* Read Link Footer */}
          <div className="p-4 pt-0">
            <a
              href={art.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors pt-2 border-t border-slate-100 w-full"
            >
              <span>Read on ESPN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
};
