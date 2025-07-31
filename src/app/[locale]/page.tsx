import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type RootPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: RootPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'RootPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function RootPage(props: RootPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootPage',
  });

  return (
    <>
      <p>{t('hello_world')}</p>
    </>
  );
};
