import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { MaterialMaintenanceCategory, MaterialMaintenanceItem, MaterialMaintenanceModel, MaterialMaintenanceSource, MaterialMaintenanceYear } from '@/types/materialMaintenance';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { MaterialMaintenanceYearModal } from './MaterialMaintenanceYearModal';

export interface MaterialMaintenanceViewProps {
  model: MaterialMaintenanceModel;
  submitting: boolean;
  onAddYear(itemId: string, year: string): Promise<boolean>;
  onOpenSourceModal(year: MaterialMaintenanceYear): void;
  onDeleteYear(year: MaterialMaintenanceYear): void;
  onDeleteSource(sourceId: string): void;
  onCheckAccreditationLevel(sourceId: string): void;
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
}

export function MaterialMaintenanceView({
  model,
  submitting,
  onAddYear,
  onOpenSourceModal,
  onDeleteYear,
  onDeleteSource,
  onCheckAccreditationLevel,
  onSetAccredited,
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
            submitting={submitting}
            onAddYear={onAddYear}
            onOpenSourceModal={onOpenSourceModal}
            onDeleteYear={onDeleteYear}
            onDeleteSource={onDeleteSource}
            onCheckAccreditationLevel={onCheckAccreditationLevel}
            onSetAccredited={onSetAccredited}
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

function MaterialItemCard({ item, submitting, onAddYear, onOpenSourceModal, onDeleteYear, onDeleteSource, onCheckAccreditationLevel, onSetAccredited }: Omit<MaterialCategorySectionProps, 'category' | 'index'> & { item: MaterialMaintenanceItem }) {
  const [showYearModal, setShowYearModal] = useState(false);
  const { translate } = useLanguage();
  return (
    <>
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-end gap-2">
              <div>
                <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.subItem, 'Sub-item')}</div>
                <h5 className="mb-0">{item.item}</h5>
              </div>
              <Btn type="button" color="primary" size="sm" outline icon="add" onClick={() => setShowYearModal(true)} disabled={submitting}>
                {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addYear, 'Add year')}
              </Btn>
            </div>
            <span className="badge text-bg-light border">{item.years.length}</span>
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
                  onCheckAccreditationLevel={onCheckAccreditationLevel}
                  onSetAccredited={onSetAccredited}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
      <MaterialMaintenanceYearModal
        show={showYearModal}
        submitting={submitting}
        onClose={() => setShowYearModal(false)}
        onSave={(year) => onAddYear(item.id, year)}
      />
    </>
  );
}

interface YearCardProps {
  year: MaterialMaintenanceYear;
  submitting: boolean;
  onOpenSourceModal(year: MaterialMaintenanceYear): void;
  onDeleteYear(year: MaterialMaintenanceYear): void;
  onDeleteSource(sourceId: string): void;
  onCheckAccreditationLevel(sourceId: string): void;
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
}

function YearCard({ year, submitting, onOpenSourceModal, onDeleteYear, onDeleteSource, onCheckAccreditationLevel, onSetAccredited }: YearCardProps) {
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
        <SourceTable
          sources={year.sources}
          submitting={submitting}
          onDeleteSource={onDeleteSource}
          onCheckAccreditationLevel={onCheckAccreditationLevel}
          onSetAccredited={onSetAccredited}
        />
      )}
    </div>
  );
}

function SourceTable({
  sources,
  submitting,
  onDeleteSource,
  onCheckAccreditationLevel,
  onSetAccredited,
}: {
  sources: MaterialMaintenanceSource[];
  submitting: boolean;
  onDeleteSource(sourceId: string): void;
  onCheckAccreditationLevel(sourceId: string): void;
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
}) {
  const { translate } = useLanguage();
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplier, 'Supplier')}</th>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.productName, 'Product name')}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocation, 'Allocation')}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.carbonFactor, 'Carbon factor (kg CO₂e)')}</th>
            <th className="text-center">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.thirdPartyCertification, 'Third-party certification')}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.approvedQuantity, 'Approved quantity')}</th>
            <th aria-label={translate(LANGUAGE_KEYS.common.actions, 'Actions')} />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id}>
              <td>{source.supplierName}</td>
              <td>{source.productName}</td>
              <td className="text-end text-nowrap">{source.allocationPercentage}%</td>
              <td className="text-end text-nowrap">{source.carbonFactor ?? '-'}</td>
              <td className="text-center">{source.thirdPartyCertification ? translate(LANGUAGE_KEYS.rawMaterialMaintenance.yes, 'Yes') : translate(LANGUAGE_KEYS.rawMaterialMaintenance.no, 'No')}</td>
              <td className="text-end text-nowrap">{source.approvedQuantity}</td>
              <td>
                <div className="d-flex flex-wrap justify-content-end gap-1">
                  <Btn type="button" color="secondary" size="sm" outline onClick={() => onCheckAccreditationLevel(source.id)} disabled={submitting}>
                    {translate(LANGUAGE_KEYS.rawMaterialMaintenance.checkAccreditationLevel, 'Determine level')}
                  </Btn>
                  <Btn type="button" color={source.isAccredited ? 'success' : 'primary'} size="sm" outline onClick={() => onSetAccredited(source.id, !source.isAccredited)} disabled={submitting}>
                    {source.isAccredited
                      ? translate(LANGUAGE_KEYS.rawMaterialMaintenance.unaccredit, 'Remove approval')
                      : translate(LANGUAGE_KEYS.rawMaterialMaintenance.accredit, 'Approve')}
                  </Btn>
                  <Btn type="button" color="info" size="sm" outline disabled title={translate(LANGUAGE_KEYS.rawMaterialMaintenance.opinionPending, 'Opinion feature is coming soon.')}>
                    {translate(LANGUAGE_KEYS.rawMaterialMaintenance.opinion, 'Opinion')}
                  </Btn>
                  <Btn type="button" color="danger" size="sm" outline icon="delete" onClick={() => onDeleteSource(source.id)} disabled={submitting} aria-label={translate(LANGUAGE_KEYS.common.delete, 'Delete')} />
                </div>
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
