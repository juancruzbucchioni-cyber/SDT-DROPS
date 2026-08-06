import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import favicon from "../assets/logo.png?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscás no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página no pudo cargarse
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error. Podés reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SDT DROPS - Mayorista e importador" },
      { name: "description", content: "SDT DROPS: celulares, perfumes, Stanley, relojes, accesorios, camisetas y productos mayoristas en Cordoba Capital y Villa Maria, Cordoba." },
      { name: "author", content: "SDT DROPS" },
      { property: "og:title", content: "SDT DROPS - Catálogo mayorista" },
      { property: "og:description", content: "Productos importados y mayoristas. Atención en Córdoba Capital y Villa María, Córdoba." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sdtdrops.com/" },
      { property: "og:site_name", content: "SDT DROPS" },
      { property: "og:image", content: `https://sdtdrops.com${favicon}` },
      { property: "og:image:alt", content: "Logo de SDT DROPS" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SDT DROPS - Catálogo mayorista" },
      { name: "twitter:description", content: "Productos importados y mayoristas en Cordoba Capital y Villa Maria." },
      { name: "twitter:image", content: `https://sdtdrops.com${favicon}` },
      { name: "twitter:site", content: "@santi.villalbaa_" },
    ],
    scripts: [
      {
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "SDT DROPS",
          description: "Mayorista e importador de celulares, perfumes, Stanley, relojes, accesorios y camisetas.",
          url: "https://sdtdrops.com",
          telephone: "+5493534814420",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Córdoba",
            addressRegion: "Córdoba",
            addressCountry: "AR",
          },
          sameAs: ["https://instagram.com/santi.villalbaa_"],
          priceRange: "$$",
        }),
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: favicon },
      { rel: "shortcut icon", type: "image/png", href: favicon },
      { rel: "apple-touch-icon", href: favicon },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

