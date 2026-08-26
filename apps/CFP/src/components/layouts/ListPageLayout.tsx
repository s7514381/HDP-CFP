import React from 'react';
import Container from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';

interface ListPageLayoutProps {
  title?: string;
  tabs?: React.ReactNode;
  searchContent?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standard layout for authenticated list pages.
 *
 * The component owns the page-level Container fluid boundaries so tabs,
 * search, actions and the table content cannot accidentally acquire
 * different Bootstrap gutters from nested containers.
 */
export default function ListPageLayout({
  title,
  tabs,
  searchContent,
  actions,
  children,
}: ListPageLayoutProps) {
  return (
    <>
      <ActionBar title={title} />
      <WrapContent className="p-3">
        {tabs && (
          <Container fluid>
            <div className="border-bottom mb-3">
              {tabs}
            </div>
          </Container>
        )}

        {searchContent && (
          <SearchBlock title="" icon="" className="mb-3">
            {searchContent}
          </SearchBlock>
        )}

        {actions && (
          <Container fluid className="mb-3">
            {actions}
          </Container>
        )}

        <Container fluid>
          {children}
        </Container>
      </WrapContent>
    </>
  );
}
