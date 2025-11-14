/**
 * Document Component - Configuração do HTML base
 * Padrão Viva Eventos com fontes Poppins e Orbitron
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Dashboard do Programa de Excelência (PEX) - Gestão de performance da rede de franquias" />
        <meta name="theme-color" content="#FF6600" />
        <link rel="icon" type="image/png" href="/images/logo_viva_V.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo_viva_V.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/images/logo_viva_V.png" sizes="192x192" />
        <link rel="icon" type="image/png" href="/images/logo_viva_V.png" sizes="512x512" />
        
        {/* Google Fonts - Poppins e Orbitron */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Poppins:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body style={{ margin: 0, padding: 0 }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
