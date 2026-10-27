import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://escalamed-b.x5med.com.br"),
  title: "EscalaMED · A Rota do Crescimento",
  description:
    "Imersão presencial para médicos donos de clínica que querem crescer com mais liberdade.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "EscalaMED · A Rota do Crescimento",
    description:
      "Três dias para começar a construir uma clínica que não depende de você para tudo.",
    url: "/",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/hero-escalamed-b-hq.png",
        width: 2041,
        height: 771,
        alt: "Mentores do EscalaMED",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EscalaMED · A Rota do Crescimento",
    description:
      "Imersão presencial para médicos donos de clínica em Alphaville.",
    images: ["/hero-escalamed-b-hq.png"],
  },
  icons: { icon: "/favicon.svg" },
};

const consentBootstrap = `(function(w,d){
w.dataLayer=w.dataLayer||[];
w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};
var match=d.cookie.match(/(?:^|; )x5med_consent=([^;]*)/);
var choice=match?decodeURIComponent(match[1]):'unknown';
var granted=choice==='accepted';
w.gtag('consent','default',{ad_storage:granted?'granted':'denied',analytics_storage:granted?'granted':'denied',ad_user_data:granted?'granted':'denied',ad_personalization:granted?'granted':'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
w.dataLayer.push({event:'consent_default',consent_choice:choice});
})(window,document);`;

const gtmBootstrap = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-M4GT66JQ');`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          id="x5med-consent-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: consentBootstrap }}
        />
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: gtmBootstrap }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M4GT66JQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
