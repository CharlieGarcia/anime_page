import { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from 'next/document';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps
} from '@mui/material-nextjs/v16-pagesRouter';
import { MODE_STORAGE_KEY } from '../constants';

export default function Document(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <InitColorSchemeScript
          attribute="class"
          defaultMode="system"
          modeStorageKey={MODE_STORAGE_KEY}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  return documentGetInitialProps(ctx);
};
