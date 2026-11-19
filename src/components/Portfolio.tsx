import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, Maximize2, Play } from 'lucide-react';
import { PortfolioProject, ProjectCategory } from '../types';

interface PortfolioProps {
  projects: PortfolioProject[];
  onOpenLightbox: (project: PortfolioProject) => void;
}

type CategoryFilter = 'Todas' | ProjectCategory;

const CATEGORIES: CategoryFilter[] = ['Todas', 'Residencial', 'Comercial', 'Reformas'];

export function isEmbeddedVideoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtu.be')
    ) {
      let videoId = '';
      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.pathname.includes('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0] ?? '';
      } else {
        videoId = parsed.searchParams.get('v') ?? '';
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function Portfolio({ projects, onOpenLightbox }: PortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Todas');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'Todas') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <section id="obras" className="py-16 sm:py-20 lg:py-24 2xl:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl 2xl:max-w-3xl">
            <p className="text-sm 2xl:text-base font-semibold text-[#ea580c] mb-2">
              Portfólio Técnico
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[#0f172a] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Obras realizadas com padrão comprovado
            </h2>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filtrar obras por categoria"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start lg:self-auto"
          >
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] ${
                    active
                      ? 'bg-[#0f172a] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0f172a]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-[#0f172a]">
              {projects.length === 0
                ? 'Portfólio em atualização'
                : 'Nenhuma obra cadastrada nesta categoria'}
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              {projects.length === 0
                ? 'As obras realizadas serão publicadas em breve. Solicite seu orçamento ou entre em contato com nossa equipe técnica.'
                : 'Selecione outra categoria acima para visualizar as obras publicadas.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-8">
            {filteredProjects.map((project) => {
              const embedUrl =
                project.mediaType === 'video'
                  ? isEmbeddedVideoUrl(project.mediaUrl)
                  : null;
              const imgFailed = failedImages[project.id];

              return (
                <article
                  key={project.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-colors duration-150 hover:border-slate-300"
                >
                  {/* Media Viewport */}
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                    {project.mediaType === 'video' ? (
                      embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={project.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={project.mediaUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover bg-slate-950"
                        >
                          Seu navegador não suporta a reprodução deste vídeo.
                        </video>
                      )
                    ) : !imgFailed && project.mediaUrl ? (
                      <img
                        src={project.mediaUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [project.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-[#0f172a] flex flex-col items-center justify-center p-6 text-center text-slate-300">
                        <Building2 className="w-10 h-10 text-[#ea580c] mb-2" aria-hidden="true" />
                        <span className="text-xs font-medium text-slate-300">
                          {project.title}
                        </span>
                      </div>
                    )}

                    {/* Expand / Lightbox button */}
                    <button
                      type="button"
                      onClick={() => onOpenLightbox(project)}
                      aria-label={`Ampliar mídia de ${project.title}`}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f172a]/85 hover:bg-[#ea580c] backdrop-blur-xs rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {project.mediaType === 'video' ? (
                        <>
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Ampliar Vídeo</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Ampliar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-2.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          {project.statusLabel || 'Obra Entregue'}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-medium text-[#ea580c]">
                          {project.category}
                        </span>
                        {project.location && (
                          <>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-slate-500">{project.location}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#0f172a] leading-snug mb-2">
                        {project.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onOpenLightbox(project)}
                        className="text-sm font-semibold text-[#0f172a] hover:text-[#ea580c] transition-colors cursor-pointer"
                      >
                        Ver detalhes da obra
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
