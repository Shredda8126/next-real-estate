import 'next';

declare module 'next' {
  export interface PageProps {
    params: {
      id: string;
      [key: string]: string | string[];
    };
  }
}
