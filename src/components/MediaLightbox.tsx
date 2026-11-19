import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, X } from 'lucide-react';
import { PortfolioProject } from '../types';
import { isEmbeddedVideoUrl } from './Portfolio';

interface MediaLightboxProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export function MediaLightbox({ project, onClose }: MediaLightboxProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, onClose]);

  if (!project) return null;

  const embedUrl =
    project.mediaType === 'video' ? isEmbeddedVideoUrl(project.mediaUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/85 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              {project.statusLabel || 'Obra Entregue'}
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold text-[#ea580c]">{project.category}</span>
            {project.location && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="text-slate-600">{project.location}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização"
            className="p-2 text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 flex-1 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[60vh]">
          {project.mediaType === 'video' ? (
            embedUrl ? (
              <iframe
                src={embedUrl}
                title={project.title}
                className="w-full h-[55vh] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={project.mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              >
                Seu navegador não suporta a reprodução deste vídeo.
              </video>
            )
          ) : !imgError && project.mediaUrl ? (
            <img
              src={project.mediaUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full max-h-[60vh] object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-slate-300">
              <Building2 className="w-12 h-12 text-[#ea580c] mb-3" aria-hidden="true" />
              <p className="text-sm">{project.title}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-200 overflow-y-auto">
          <h3
            id="lightbox-title"
            className="font-display text-xl font-bold text-[#0f172a] mb-2"
          >
            {project.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
