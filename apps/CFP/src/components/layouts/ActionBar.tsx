import Container from "@packages/components/bootstrap5/Container";

type ActionBarProps = {
    readonly title?: string;
    readonly children?: React.ReactNode;
}

/**
 * 功能列元件，以及額外的操作功能
 */
export default function ActionBar({title, children}: ActionBarProps) {
  return (
    <Container className="action-bar no-print" fluid>
        <p className="action-bar-title">{title}</p>
        {children}
    </Container>
  );
}