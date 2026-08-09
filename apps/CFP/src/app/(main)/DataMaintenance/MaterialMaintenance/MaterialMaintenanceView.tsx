import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { MaterialMaintenanceCategory, MaterialMaintenanceItem, MaterialMaintenanceModel, MaterialMaintenanceSource, MaterialMaintenanceYear } from '@/types/materialMaintenance';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Input } from '@packages/components/bootstrap5/Input';

export interface MaterialMaintenanceViewProps {
  model: MaterialMaintenanceModel;
  yearDrafts: Record<string, string>;
  submitting: boolean;
  onYearChange(itemId: string, value: string): void;
  onAddYear(itemId: string): void;
  onOpenSourceModal(year: MaterialMaintenanceYear): void;
  onDeleteYear(year: MaterialMaintenanceYear): void;
  onDeleteSource(sourceId: string): void;
}

export function MaterialMaintenanceView({
  model,
  yearDrafts,
  submitting,
  onYearChange,
  onAddYear,
  onOpenSourceModal,
  onDeleteYear,
  onDeleteSource,
}: MaterialMaintenanceViewProps) {
  const { translate } = useLanguage();

  return (
    <>
      <MaterialSummary model={model} />
      {!model.productSubcategoryId ? (
        <Card className="border-warning shadow-sm">
          <Card.Body className="text-warning-emphasis">
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.noPcrBinding, 'No PCR template is bound to this material.')}
          </Card.Body>
        </Card>
      ) : model.categories.length === 0 ? (
        <EmptyMessage message={translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSubItems, 'No sub-items are configured.')} />
      ) : (
        model.categories.map((category, index) => (
          <MaterialCategorySection
            key={category.id}
            category={category}
            index={index}
            yearDrafts={yearDrafts}
            submitting={submitting}
            onYearChange={onYearChange}
            onAddYear={onAddYear}
            onOpenSourceModal={onOpenSourceModal}
            onDeleteYear={onDeleteYear}
            onDeleteSource={onDeleteSource}
          />
        ))
      )}
    </>
  );
}

function MaterialSummary({ model }: { model: MaterialMaintenanceModel }) {
  const { translate } = useLanguage();
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <div className="text-uppercase small text-muted fw-semibold">
              {translate(LANGUAGE_KEYS.rawMaterialMaintenance.title, 'Material maintenance')}
            </div>
            <h3 className="mb-1 mt-1">{model.productName || model.materialNumber || '-'}</h3>
            <div className="text-muted">
              {[model.materialNumber, model.supplierName].filter(Boolean).join(' · ') || '-'}
            </div>
          </div>
          <div className="text-md-end">
            <div className="small text-muted">{translate(LANGUAGE_KEYS.pcrPattern.template, 'PCR template')}</div>
            <div className="fw-semibold">{model.productSubcategoryName || '-'}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

interface MaterialCategorySectionProps extends Omit<MaterialMaintenanceViewProps, 'model'> {
  category: MaterialMaintenanceCategory;
  index: number;
}

function MaterialCategorySection({ category, index, ...props }: MaterialCategorySectionProps) {
  const { translate } = useLanguage();
  return (
    <section className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3 px-1">
        <span className="badge rounded-pill text-bg-primary">{index + 1}</span>
        <h4 className="mb-0">{category.item}</h4>
        <span className="text-muted small">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.primaryMaterials, 'Primary materials')}</span>
      </div>

      {category.items.length === 0 ? (
        <EmptyMessage message={translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSubItems, 'No sub-items are configured.')} />
      ) : (
        <Grid.Row className="g-3">
          {category.items.map((item) => (
            <Grid.Col key={item.id} col={12}>
              <MaterialItemCard item={item} {...props} />
            </Grid.Col>
          ))}
        </Grid.Row>
      )}
    </section>
  );
}

function MaterialItemCard({ item, yearDrafts, submitting, onYearChange, onAddYear, onOpenSourceModal, onDeleteYear, onDeleteSource }: Omit<MaterialCategorySectionProps, 'category' | 'index'> & { item: MaterialMaintenanceItem }) {
  const { translate } = useLanguage();
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
          <div>
            <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.subItem, 'Sub-item')}</div>
            <h5 className="mb-0">{item.item}</h5>
          </div>
          <span className="badge text-bg-light border">{item.years.length}</span>
        </div>

        <div className="d-flex gap-2 align-items-end mb-3">
          <div className="flex-grow-1">
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.addYear, 'Add year')}
              placeholder={translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearPlaceholder, 'e.g. 2025')}
              min={1900}
              max={2100}
              value={yearDrafts[item.id] || ''}
              onChange={(event) => onYearChange(item.id, event.target.value)}
            />
          </div>
          <Btn type="button" color="primary" icon="add" onClick={() => onAddYear(item.id)} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.add, 'Add')}
          </Btn>
        </div>

        {item.years.length === 0 ? (
          <div className="rounded bg-light text-muted text-center py-3 small">
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.noYears, 'No years added yet.')}
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {item.years.map((year) => (
              <YearCard
                key={year.id}
                year={year}
                submitting={submitting}
                onOpenSourceModal={onOpenSourceModal}
                onDeleteYear={onDeleteYear}
                onDeleteSource={onDeleteSource}
              />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

interface YearCardProps {
  year: MaterialMaintenanceYear;
  submitting: boolean;
  onOpenSourceModal(year: MaterialMaintenanceYear): void;
  onDeleteYear(year: MaterialMaintenanceYear): void;
  onDeleteSource(sourceId: string): void;
}

function YearCard({ year, submitting, onOpenSourceModal, onDeleteYear, onDeleteSource }: YearCardProps) {
  const { translate } = useLanguage();
  return (
    <div className="border rounded p-3 bg-body-tertiary">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
        <div className="fw-semibold">{year.year}</div>
        <div className="d-flex gap-1">
          <Btn type="button" color="success" size="sm" outline icon="add" onClick={() => onOpenSourceModal(year)} disabled={submitting}>
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addSource, 'Add source')}
          </Btn>
          <Btn type="button" color="danger" size="sm" outline icon="delete" onClick={() => onDeleteYear(year)} disabled={submitting} aria-label={translate(LANGUAGE_KEYS.common.delete, 'Delete')} />
        </div>
      </div>
      {year.sources.length === 0 ? (
        <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSources, 'No supplier sources added yet.')}</div>
      ) : (
        <SourceTable sources={year.sources} submitting={submitting} onDeleteSource={onDeleteSource} />
      )}
    </div>
  );
}

function SourceTable({ sources, submitting, onDeleteSource }: { sources: MaterialMaintenanceSource[]; submitting: boolean; onDeleteSource(sourceId: string): void }) {
  const { translate } = useLanguage();
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplier, 'Supplier')}</th>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.productName, 'Product name')}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocation, 'Allocation')}</th>
            <th aria-label={translate(LANGUAGE_KEYS.common.actions, 'Actions')} />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id}>
              <td>{source.supplierName}</td>
              <td>{source.productName}</td>
              <td className="text-end text-nowrap">{source.allocationPercentage}%</td>
              <td className="text-end">
                <Btn type="button" color="danger" size="sm" outline icon="delete" onClick={() => onDeleteSource(source.id)} disabled={submitting} aria-label={translate(LANGUAGE_KEYS.common.delete, 'Delete')} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center text-muted py-5">{message}</Card.Body>
    </Card>
  );
}
