interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_COGNITO_AUTHORITY: string;
  VITE_COGNITO_CLIENT_ID: string;
  VITE_COGNITO_REDIRECT_URI: string;
  VITE_COGNITO_DOMAIN: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png" {
  const value: string;
  export default value;
}
