/// <reference types="vite/client" />

declare module "*.png";
declare module "*.svg";
declare module "*.jpeg";
declare module "*.jpg";
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
