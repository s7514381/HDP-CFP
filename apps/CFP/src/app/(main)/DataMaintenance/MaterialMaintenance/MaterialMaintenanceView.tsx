import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { MaterialMaintenanceCategory, MaterialMaintenanceItem, MaterialMaintenanceModel, MaterialMaintenanceSource, MaterialMaintenanceYear } from '@/types/materialMaintenance';
import { Btn } from '@packages/components/bootstrap5/Btn';
import FontAwesome from '@packages/components/FontAwsome';
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
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
  onOpenSourceOpinion(sourceId: string): void;
  onOpenSecondaryData(source: MaterialMaintenanceSource): void;
  onOpenAccreditationLevel(source: MaterialMaintenanceSource): void;
  onNotifySupplier(sourceId: string): void;
}

export function MaterialMaintenanceView({
  model,
  submitting,
  onAddYear,
  onOpenSourceModal,
  onDeleteYear,
  onDeleteSource,
  onSetAccredited,
  onOpenSourceOpinion,
  onOpenSecondaryData,
  onOpenAccreditationLevel,
  onNotifySupplier,
}: MaterialMaintenanceViewProps) {
  const { translate } = useLanguage();

  return (
    <>
      <MaterialSummary model={model} />
      {!model.productSubcategoryId ? (
        <Card className="border-warning shadow-sm">
          <Card.Body className="text-warning-emphasis">
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.noPcrBinding)}
          </Card.Body>
        </Card>
      ) : model.categories.length === 0 ? (
        <EmptyMessage message={translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSubItems)} />
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
            onSetAccredited={onSetAccredited}
            onOpenSourceOpinion={onOpenSourceOpinion}
            onOpenSecondaryData={onOpenSecondaryData}
            onOpenAccreditationLevel={onOpenAccreditationLevel}
            onNotifySupplier={onNotifySupplier}
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
              {translate(LANGUAGE_KEYS.rawMaterialMaintenance.title)}
            </div>
            <h3 className="mb-1 mt-1">{model.productName || model.materialNumber || '-'}</h3>
            <div className="text-muted">
              {[model.materialNumber, model.supplierName].filter(Boolean).join(' · ') || '-'}
            </div>
          </div>
          <div className="text-md-end">
            <div className="small text-muted">{translate(LANGUAGE_KEYS.pcrPattern.template)}</div>
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
      </div>

      {category.items.length === 0 ? (
        <EmptyMessage message={translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSubItems)} />
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

function MaterialItemCard({ item, submitting, onAddYear, onOpenSourceModal, onDeleteYear, onDeleteSource, onSetAccredited, onOpenSourceOpinion, onOpenSecondaryData, onOpenAccreditationLevel, onNotifySupplier }: Omit<MaterialCategorySectionProps, 'category' | 'index'> & { item: MaterialMaintenanceItem }) {
  const [showYearModal, setShowYearModal] = useState(false);
  const { translate } = useLanguage();
  return (
    <>
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-end gap-2">
              <div>
                <h5 className="mb-0">{item.item}</h5>
              </div>
              <Btn type="button" color="primary" size="sm" outline icon="add" onClick={() => setShowYearModal(true)} disabled={submitting}>
                {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addYear)}
              </Btn>
            </div>
            <span className="badge text-bg-light border">{item.years.length}</span>
          </div>

          {item.years.length === 0 ? (
            <div className="rounded bg-light text-muted text-center py-3 small">
              {translate(LANGUAGE_KEYS.rawMaterialMaintenance.noYears)}
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
                  onSetAccredited={onSetAccredited}
                  onOpenSourceOpinion={onOpenSourceOpinion}
                  onOpenSecondaryData={onOpenSecondaryData}
                  onOpenAccreditationLevel={onOpenAccreditationLevel}
                  onNotifySupplier={onNotifySupplier}
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
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
  onOpenSourceOpinion(sourceId: string): void;
  onOpenSecondaryData(source: MaterialMaintenanceSource): void;
  onOpenAccreditationLevel(source: MaterialMaintenanceSource): void;
  onNotifySupplier(sourceId: string): void;
}

function YearCard({ year, submitting, onOpenSourceModal, onDeleteYear, onDeleteSource, onSetAccredited, onOpenSourceOpinion, onOpenSecondaryData, onOpenAccreditationLevel, onNotifySupplier }: YearCardProps) {
  const { translate } = useLanguage();
  const averageCarbonFactor = calculateAverageCarbonFactor(year.sources);

  return (
    <div className="border rounded p-3 bg-body-tertiary">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex flex-wrap align-items-baseline gap-3">
          <div className="fw-semibold">{year.year}</div>
          <div className="small text-muted">
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.averageCarbonFactor)}: <span className="fw-semibold">{formatCarbonFactor(averageCarbonFactor)}</span>
          </div>
        </div>
        <div className="d-flex gap-1">
          <Btn type="button" color="success" size="sm" outline icon="add" onClick={() => onOpenSourceModal(year)} disabled={submitting}>
            {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addSource)}
          </Btn>
          <Btn type="button" color="danger" size="sm" outline icon="delete" onClick={() => onDeleteYear(year)} disabled={submitting} aria-label={translate(LANGUAGE_KEYS.common.delete)} />
        </div>
      </div>
      {year.sources.length === 0 ? (
        <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.noSources)}</div>
      ) : (
        <SourceTable
          sources={year.sources}
          submitting={submitting}
          onDeleteSource={onDeleteSource}
          onSetAccredited={onSetAccredited}
          onOpenSourceOpinion={onOpenSourceOpinion}
          onOpenSecondaryData={onOpenSecondaryData}
          onOpenAccreditationLevel={onOpenAccreditationLevel}
          onNotifySupplier={onNotifySupplier}
        />
      )}
    </div>
  );
}

function SourceTable({
  sources,
  submitting,
  onDeleteSource,
  onSetAccredited,
  onOpenSourceOpinion,
  onOpenSecondaryData,
  onOpenAccreditationLevel,
  onNotifySupplier,
}: {
  sources: MaterialMaintenanceSource[];
  submitting: boolean;
  onDeleteSource(sourceId: string): void;
  onSetAccredited(sourceId: string, isAccredited: boolean): void;
  onOpenSourceOpinion(sourceId: string): void;
  onOpenSecondaryData(source: MaterialMaintenanceSource): void;
  onOpenAccreditationLevel(source: MaterialMaintenanceSource): void;
  onNotifySupplier(sourceId: string): void;
}) {
  const { translate } = useLanguage();
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplier)}</th>
            <th>{translate(LANGUAGE_KEYS.rawMaterialMaintenance.productName)}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocation)}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.carbonFactor)}</th>
            <th className="text-center">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.thirdPartyCertification)}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.approvedQuantity)}</th>
            <th className="text-end">{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.title)}</th>
            <th className="text-center">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelDisplay)}</th>
            <th aria-label={translate(LANGUAGE_KEYS.common.actions)} />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id}>
              <td>{source.supplierName}</td>
              <td>{source.productName}</td>
              <td className="text-end text-nowrap">{source.allocationPercentage}%</td>
              <td className="text-end text-nowrap">{source.carbonFactor ?? '-'}</td>
              <td className="text-center">{source.thirdPartyCertification ? translate(LANGUAGE_KEYS.rawMaterialMaintenance.yes) : translate(LANGUAGE_KEYS.rawMaterialMaintenance.no)}</td>
              <td className="text-end text-nowrap">{source.approvedQuantity}</td>
              <td className="text-end text-nowrap">{source.opinionCount}</td>
              <td className={`text-center text-nowrap ${source.accreditationLevelMeetsRequirement === true ? 'text-success fw-semibold' : source.accreditationLevelMeetsRequirement === false ? 'text-danger fw-semibold' : ''}`}>
                {source.accreditationLevelSettingName || '-'} / {source.accreditationLevelName || translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelUnavailable)}
              </td>
              <td>
                <div className="d-flex justify-content-end align-items-center gap-1">
                  <Btn type="button" color={source.isAccredited ? 'success' : 'primary'} size="sm" outline onClick={() => onSetAccredited(source.id, !source.isAccredited)} disabled={submitting}>
                    {source.isAccredited
                      ? translate(LANGUAGE_KEYS.rawMaterialMaintenance.unaccredit)
                      : translate(LANGUAGE_KEYS.rawMaterialMaintenance.accredit)}
                  </Btn>
                  <SourceActionMenu
                    source={source}
                    submitting={submitting}
                    onOpenSourceOpinion={onOpenSourceOpinion}
                    onOpenSecondaryData={onOpenSecondaryData}
                    onOpenAccreditationLevel={onOpenAccreditationLevel}
                    onNotifySupplier={onNotifySupplier}
                    onDeleteSource={onDeleteSource}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceActionMenu({
  source,
  submitting,
  onOpenSourceOpinion,
  onOpenSecondaryData,
  onOpenAccreditationLevel,
  onNotifySupplier,
  onDeleteSource,
}: {
  source: MaterialMaintenanceSource;
  submitting: boolean;
  onOpenSourceOpinion(sourceId: string): void;
  onOpenSecondaryData(source: MaterialMaintenanceSource): void;
  onOpenAccreditationLevel(source: MaterialMaintenanceSource): void;
  onNotifySupplier(sourceId: string): void;
  onDeleteSource(sourceId: string): void;
}) {
  const { translate } = useLanguage();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const run = (action: () => void) => {
    setOpen(false);
    setMenuStyle(null);
    action();
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuWidth = 192;
      const menuHeight = menuRef.current?.offsetHeight ?? 176;
      const openAbove = triggerRect.bottom + menuHeight + 8 > window.innerHeight
        && triggerRect.top - menuHeight - 8 >= 0;
      const left = Math.min(
        Math.max(8, triggerRect.right - menuWidth),
        Math.max(8, window.innerWidth - menuWidth - 8),
      );
      const top = openAbove
        ? triggerRect.top - menuHeight - 4
        : triggerRect.bottom + 4;

      setMenuStyle({ left, top });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      className="dropdown-menu show source-action-menu-portal"
      style={menuStyle ?? { visibility: 'hidden' }}
    >
      <button type="button" className="dropdown-item" onClick={() => run(() => onOpenSecondaryData(source))}>
        <FontAwesome icon="fa-solid fa-database me-2" />
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.getSecondaryData)}
      </button>
      <button type="button" className="dropdown-item" onClick={() => run(() => onOpenAccreditationLevel(source))}>
        <FontAwesome icon="fa-solid fa-layer-group me-2" />
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.setAccreditationLevel)}
      </button>
      <button type="button" className="dropdown-item" onClick={() => run(() => onNotifySupplier(source.id))}>
        <FontAwesome icon="fa-regular fa-envelope me-2" />
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.notifySupplier)}
      </button>
      <button type="button" className="dropdown-item" onClick={() => run(() => onOpenSourceOpinion(source.id))}>
        <FontAwesome icon="fa-regular fa-comment-dots me-2" />
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.opinion)}
      </button>
      <button type="button" className="dropdown-item text-danger" onClick={() => run(() => onDeleteSource(source.id))}>
        <FontAwesome icon="fa-solid fa-trash-can me-2" />
        {translate(LANGUAGE_KEYS.common.delete)}
      </button>
    </div>
  ) : null;

  return (
    <div className="dropdown source-action-menu">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        ref={triggerRef}
        aria-label={translate(LANGUAGE_KEYS.common.actions)}
        aria-expanded={open}
        disabled={submitting}
        onClick={() => {
          setMenuStyle(null);
          setOpen((current) => !current);
        }}
      >
        <FontAwesome icon="fa-solid fa-ellipsis" />
      </button>
      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
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

function calculateAverageCarbonFactor(sources: MaterialMaintenanceSource[]): number | null {
  const validSources = sources.filter((source) => (
    source.carbonFactor != null
    && Number.isFinite(Number(source.carbonFactor))
    && Number.isFinite(Number(source.allocationPercentage))
    && Number(source.allocationPercentage) > 0
  ));
  const totalAllocation = validSources.reduce((sum, source) => sum + Number(source.allocationPercentage), 0);
  if (validSources.length === 0 || totalAllocation <= 0) return null;

  const weightedTotal = validSources.reduce(
    (sum, source) => sum + Number(source.carbonFactor) * Number(source.allocationPercentage),
    0,
  );
  const average = weightedTotal / totalAllocation;
  return Number.isFinite(average) ? average : null;
}

function formatCarbonFactor(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-';

  return value.toFixed(2).replace(/\.00$|(?<=\.[0-9])0$/, '');
}
